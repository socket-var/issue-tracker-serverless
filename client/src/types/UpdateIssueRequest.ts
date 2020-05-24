import { IssueItem } from "./Issue";

export type UpdateIssueRequest = Omit<Partial<IssueItem>, "attachments">