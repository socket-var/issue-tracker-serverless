export type IssueStatus =
  | "TO DO"
  | "IN PROGRESS"
  | "IN REVIEW"
  | "CLOSED"
  | "RESOLVED";

export interface IssueItem {
  issueId: string;
  reporterId: string;
  assigneeId: string | null;
  title: string;
  description: string | null;
  status: IssueStatus;
  attachments: string[];
  createdAt: string;
}
