import { IssueStatus } from "./IssueStatus";

export interface IssueUpdate {
    assigneeId: string | null
    title: string | null
    description: string | null
    status: IssueStatus | null
}