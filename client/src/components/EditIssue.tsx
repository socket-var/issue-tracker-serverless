import * as React from "react";
import {
  Form,
  Button,
  Input,
  Select,
  Dropdown,
  DropdownProps,
} from "semantic-ui-react";
import Auth from "../auth/Auth";
import { getUploadUrl, uploadFile, patchIssue } from "../api/issues-api";
import { IssueStatus, IssueItem } from "../types/Issue";
import { SyntheticEvent } from "react";

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditIssueProps {
  match: {
    params: {
      issueId: string;
    };
  };
  auth: Auth;
  issues: IssueItem[];
}

interface EditIssueState {
  file: any;
  title: string;
  description: string;
  status: string;
  assigneeId: string;
  uploadState: UploadState;
}

export default class EditIssue extends React.PureComponent<
  EditIssueProps,
  EditIssueState
> {
  state: EditIssueState = {
    file: undefined,
    title: "",
    description: "",
    status: "",
    assigneeId: "",
    uploadState: UploadState.NoUpload,
  };

  handleInputChange = (
    key: "title" | "description" | "assigneeId" | "status"
  ) => (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [key]: event.target.value } as Pick<
      EditIssueState,
      "title" | "description" | "assigneeId" | "status"
    >);
  };

  handleStatusChange = (
    event: SyntheticEvent<HTMLElement, Event>,
    { value }: DropdownProps
  ) => {
    this.setState({ status: value as string });
  };

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    this.setState({
      file: files[0],
    });
  };

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();
    const { title, description, status, assigneeId } = this.state;
    const { issueId } = this.props.match.params;

    const matchedIssue: IssueItem = this.getCurrentIssue() || ({} as IssueItem);

    try {
      if (this.state.file) {
        this.setUploadState(UploadState.FetchingPresignedUrl);
        const uploadUrl = await getUploadUrl(
          this.props.auth.getIdToken(),
          this.props.match.params.issueId
        );

        this.setUploadState(UploadState.UploadingFile);
        await uploadFile(uploadUrl, this.state.file);
      }

      await patchIssue(this.props.auth.getIdToken(), issueId, {
        title: title || matchedIssue.title || "",
        description: description || matchedIssue.description || "",
        status: (status as IssueStatus) || matchedIssue.status || "",
        assigneeId: assigneeId || matchedIssue.assigneeId || "",
      });

      alert("Issue has been updated!");
    } catch (e) {
      alert("Could not upload a file: " + e.message);
    } finally {
      this.setUploadState(UploadState.NoUpload);
    }
  };

  getCurrentIssue = () => {
    const { issues, match } = this.props;
    const { issueId } = match.params;

    return issues.find((issue) => issue.issueId === issueId);
  };

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState,
    });
  }

  render() {
    const statusOptions = [
      "TO DO",
      "CLOSED",
      "IN PROGRESS",
      "IN REVIEW",
      "RESOLVED",
    ].map((option) => ({
      key: option,
      value: option as IssueStatus,
      text: option,
    }));

    const currentIssue: IssueItem = this.getCurrentIssue() || ({} as IssueItem);

    return (
      <div>
        <h1>Update the issue</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <Input
              fluid
              label={"Title"}
              onChange={this.handleInputChange("title")}
              value={this.state.title || currentIssue.title || ""}
            />
          </Form.Field>
          <Form.Field>
            <Input
              fluid
              label={"Description"}
              onChange={this.handleInputChange("description")}
              value={this.state.description || currentIssue.description || ""}
            />
          </Form.Field>
          <Form.Field>
            <Input
              fluid
              label={"Assignee ID"}
              onChange={this.handleInputChange("assigneeId")}
              value={this.state.assigneeId || currentIssue.assigneeId || ""}
            />
          </Form.Field>
          <Form.Field>
            <Dropdown
              selection
              options={statusOptions}
              onChange={this.handleStatusChange}
              value={this.state.status || currentIssue.status || ""}
              header={<h3>Status</h3>}
            />
          </Form.Field>
          <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    );
  }

  renderButton() {
    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && (
          <p>Uploading image metadata</p>
        )}
        {this.state.uploadState === UploadState.UploadingFile && (
          <p>Uploading file</p>
        )}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Update Issue
        </Button>
      </div>
    );
  }
}
