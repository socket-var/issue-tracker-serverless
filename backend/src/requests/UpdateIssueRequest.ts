import { IssueItem } from "../models/IssueItem";

export type UpdateIssueRequest = Omit<Partial<IssueItem>, "attachments">
