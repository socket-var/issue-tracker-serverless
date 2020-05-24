import { apiEndpoint } from "../config";
import { IssueItem } from "../types/Issue";
import { CreateIssueRequest } from "../types/CreateIssueRequest";
import Axios from "axios";
import { UpdateIssueRequest } from "../types/UpdateIssueRequest";
import * as uuid from "uuid";

export async function getIssuesByFilter(
  idToken: string,
  userType: "reporter" | "assignee"
): Promise<IssueItem[]> {
  const response = await Axios.post(
    `${apiEndpoint}/issues`,
    JSON.stringify({ userType }),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  console.log("Issues:", response.data);
  return response.data.items;
}

export async function getAllIssues(idToken: string): Promise<IssueItem[]> {
  console.log("Fetching issues");

  const response = await Axios.get(`${apiEndpoint}/issues`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  console.log("Issues:", response.data);
  return response.data.items;
}

export async function createIssue(
  idToken: string,
  newIssue: CreateIssueRequest
): Promise<IssueItem> {
  const response = await Axios.post(
    `${apiEndpoint}/issues/new`,
    JSON.stringify(newIssue),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  return response.data.item;
}

export async function patchIssue(
  idToken: string,
  issueId: string,
  updatedIssue: UpdateIssueRequest
): Promise<void> {
  await Axios.patch(
    `${apiEndpoint}/issues/${issueId}`,
    JSON.stringify(updatedIssue),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
}

export async function deleteIssue(
  idToken: string,
  issueId: string
): Promise<void> {
  try {
    await Axios.delete(`${apiEndpoint}/issues/${issueId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });
  } catch (err) {
    throw new Error(
      "User is not authorized to delete this issue or item does not exist"
    );
  }
}

export async function getUploadUrl(
  idToken: string,
  issueId: string
): Promise<string> {
  const attachmentId = uuid.v4();
  const response = await Axios.post(
    `${apiEndpoint}/issues/${issueId}/attachment`,
    "",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  return response.data.uploadUrl;
}

export async function uploadFile(
  uploadUrl: string,
  file: Buffer
): Promise<void> {
  await Axios.put(uploadUrl, file);
}
