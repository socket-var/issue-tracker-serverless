import * as uuid from "uuid";

import { IssueItem } from "../models/IssueItem";
import { IssueAccess } from "../dataLayer/IssueAccess";
import { CreateIssueRequest } from "../requests/CreateIssueRequest";
import { UpdateIssueRequest } from "../requests/UpdateIssueRequest";

const issueAccess = new IssueAccess();

export async function getAllIssues(userId: string): Promise<IssueItem[]> {
  return await issueAccess.getAllIssues(userId);
}

export async function getAllIssuesByReporterId(
  userId: string
): Promise<IssueItem[]> {
  return await issueAccess.getAllIssuesByReporterId(userId);
}

export async function getAllIssuesByAssigneeId(
  userId: string
): Promise<IssueItem[]> {
  return await issueAccess.getAllIssuesByAssigneeId(userId);
}

export async function createIssue(
  createIssueRequest: CreateIssueRequest,
  userId: string
): Promise<IssueItem> {
  const issueId = uuid.v4();

  return await issueAccess.createIssue({
    issueId,
    ...createIssueRequest,
    reporterId: userId,
    createdAt: new Date().toISOString(),
    status: "TO DO",
  });
}

export async function updateIssue(
  issueId: string,
  userId: string,
  updateIssueRequest: UpdateIssueRequest
) {
  return issueAccess.updateIssue(issueId, userId, updateIssueRequest);
}

export async function deleteIssue(issueId: string, userId: string) {
  return issueAccess.deleteIssue(issueId, userId);
}

export async function getImageUrl(
  issueId: string,
  userId: string,
  attachmentId: string
): Promise<string> {
  return await issueAccess.getUploadUrl(issueId, userId, attachmentId);
}
