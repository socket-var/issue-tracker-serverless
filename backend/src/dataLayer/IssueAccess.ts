import * as AWS from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";

const XAWS = AWSXRay.captureAWS(AWS);

import { IssueItem } from "../models/IssueItem";
import { UpdateIssueRequest } from "../requests/UpdateIssueRequest";

import { createLogger } from "../utils/logger";

const logger = createLogger("access-logger");

export class IssueAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly issuesTable = process.env.ISSUES_TABLE,
    private readonly reporterId = process.env.REPORTER_ID_INDEX,
    private readonly assigneeId = process.env.ASSIGNEE_ID_INDEX,
    private readonly s3 = new XAWS.S3({ signatureVersion: "v4" }),
    private readonly bucketName = process.env.ATTACHMENTS_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  async getAllIssues(userId: string): Promise<IssueItem[]> {
    return [
      ...(await this.getAllIssuesByAssigneeId(userId)),
      ...(await this.getAllIssuesByReporterId(userId)),
    ];
  }
  async getAllIssuesByReporterId(reporterId: string): Promise<IssueItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.issuesTable,
        IndexName: this.reporterId,
        KeyConditionExpression: "reporterId = :reporterId",
        ExpressionAttributeValues: {
          ":reporterId": reporterId,
        },
      })
      .promise();
    return result.Items as IssueItem[];
  }

  async getAllIssuesByAssigneeId(assigneeId: string): Promise<IssueItem[]> {
    const result = await this.docClient
      .query({
        TableName: this.issuesTable,
        IndexName: this.assigneeId,
        KeyConditionExpression: "assigneeId = :assigneeId",
        ExpressionAttributeValues: {
          ":assigneeId": assigneeId,
        },
      })
      .promise();
    return result.Items as IssueItem[];
  }

  async getIssueByUserId(issueId: string, userId: string): Promise<IssueItem> {
    const result = await this.docClient
      .query({
        TableName: this.issuesTable,
        KeyConditionExpression: "issueId = :issueId",
        ExpressionAttributeValues: {
          ":issueId": issueId,
        },
      })
      .promise();

    if (
      result.Items[0].assigneeId === userId ||
      result.Items[0].reporterId === userId
    )
      return result.Items[0] as IssueItem;

    logger.error(`Issue corresponding to the given user id does not exist`);
  }

  async createIssue(issueItem: IssueItem): Promise<IssueItem> {
    await this.docClient
      .put({
        TableName: this.issuesTable,
        Item: issueItem,
      })
      .promise();

    return issueItem;
  }

  async updateIssue(
    issueId: string,
    userId: string,
    updatedIssue: UpdateIssueRequest
  ) {
    const item = await this.getIssueByUserId(issueId, userId);

    if (item) {
      const { createdAt, title, description, status, assigneeId } = item;

      const result = await this.docClient
        .update({
          TableName: this.issuesTable,
          Key: {
            issueId,
            createdAt,
          },
          UpdateExpression:
            "set title = :title, description = :description, #statusKey = :statusValue, assigneeId = :assigneeId",
          ExpressionAttributeValues: {
            ":title":
              updatedIssue.title !== undefined ? updatedIssue.title : title,
            ":description":
              updatedIssue.description !== undefined
                ? updatedIssue.description
                : description || "",
            ":statusValue":
              updatedIssue.status !== undefined ? updatedIssue.status : status,
            ":assigneeId": updatedIssue.assigneeId
              ? updatedIssue.assigneeId
              : assigneeId,
          },
          ExpressionAttributeNames: {
            "#statusKey": "status",
          },
          ReturnValues: "UPDATED_NEW",
        })
        .promise();

      return result.Attributes as IssueItem;
    } else {
      logger.warn(`${issueId}, ${userId}, ${item}`);
    }
  }

  async deleteIssue(issueId: string, userId: string) {
    const item = await this.getIssueByUserId(issueId, userId);

    if (item && item.reporterId === userId) {
      const { createdAt } = item;
      const result = await this.docClient
        .delete({
          TableName: this.issuesTable,
          Key: {
            issueId,
            createdAt,
          },
          ReturnValues: "ALL_OLD",
        })
        .promise();
      return result.Attributes as IssueItem;
    } else {
      logger.warn(`${issueId}, ${userId}, ${item}`);
      throw new Error("Item not found or user is not authorized to delete");
    }
  }

  async getUploadUrl(issueId: string, userId: string, attachmentId: string) {
    const item = await this.getIssueByUserId(issueId, userId);

    if (item) {
      const { createdAt } = item;
      const signedUrl = this.s3.getSignedUrl("putObject", {
        Bucket: this.bucketName,
        Key: `${item.issueId}/${attachmentId}`,
        Expires: Number(this.urlExpiration),
      });

      const result = await this.docClient
        .update({
          TableName: this.issuesTable,
          Key: { issueId, createdAt },
          UpdateExpression:
            "set attachments = list_append(if_not_exists(attachments, :empty_list), :newAttachment) ",
          ExpressionAttributeValues: {
            ":newAttachment": [signedUrl.split("?")[0]],
            ":empty_list": [],
          },
          ReturnValues: "UPDATED_NEW",
        })
        .promise();

      logger.info(result.Attributes);

      return signedUrl;
    } else {
      logger.warn(`${issueId}, ${userId}, ${item}`);
    }
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log("Creating a local DynamoDB instance");
    return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}
