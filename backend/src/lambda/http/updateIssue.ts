import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { getUserId } from "../utils";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { createLogger } from "../../utils/logger";
import { UpdateIssueRequest } from "../../requests/UpdateIssueRequest";
import { updateIssue } from "../../businessLogic/issues";

const logger = createLogger("update-log");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const issueId = event.pathParameters.issueId;
    const updatedIssue: UpdateIssueRequest = JSON.parse(event.body);

    logger.info(event.headers);
    const userId = getUserId(event);
    try {
      const result = await updateIssue(issueId, userId, updatedIssue);
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(result),
      };
    } catch (e) {
      logger.info(`${issueId}, ${userId}, ${updatedIssue}`);
      logger.error(`Update issue error ${e.message}`);

      return {
        statusCode: 500,
        body: JSON.stringify({}),
      };
    }
  }
);

handler.use(cors());
