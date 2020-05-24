import dateFormat from "dateformat";
import { History } from "history";
import update from "immutability-helper";
import * as React from "react";
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Dropdown,
  DropdownProps,
} from "semantic-ui-react";

import { getAllIssues, getIssuesByFilter } from "../api/issues-api";
import Auth from "../auth/Auth";
import { IssueItem } from "../types/Issue";
import { CreateIssueRequest } from "../types/CreateIssueRequest";

interface IssuesProps {
  auth: Auth;
  history: History;
  issues: IssueItem[];
  loadingAllIssues: boolean;
  saveIssues: (issues: IssueItem[]) => void;
  onIssueCreate: (event: React.ChangeEvent<HTMLButtonElement>) => void;
  onIssueDelete: (issueId: string) => void;
  onEditButtonClick: (issueId: string) => void;
  handleTitleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

type filterOptions = "All" | "Assigned to me" | "Reported by me";

interface IssuesState {
  filterBy: filterOptions;
}

export class Issues extends React.PureComponent<IssuesProps, IssuesState> {
  public state = {
    filterBy: "All" as filterOptions,
  };

  public async componentDidMount() {
    try {
      const issues = await getAllIssues(this.props.auth.getIdToken());

      this.props.saveIssues(issues);
    } catch (e) {
      alert(`Failed to fetch issues: ${e.message}`);
    }
  }

  handleFilterChange = async (
    event: React.SyntheticEvent<HTMLElement, Event>,
    { value }: DropdownProps
  ) => {
    let issues;
    if (value === "Assigned to me") {
      issues = await getIssuesByFilter(
        this.props.auth.getIdToken(),
        "assignee"
      );
    } else if (value === "Reported by me") {
      issues = await getIssuesByFilter(
        this.props.auth.getIdToken(),
        "reporter"
      );
    } else {
      issues = await getAllIssues(this.props.auth.getIdToken());
    }
    this.props.saveIssues(issues);

    this.setState({ filterBy: value as filterOptions });
  };

  public render() {
    return (
      <div>
        <Header as="h1">Issues</Header>

        {this.renderCreateIssueInput()}

        {this.renderAllIssues()}
      </div>
    );
  }

  private renderCreateIssueInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: "teal",
              labelPosition: "left",
              icon: "add",
              content: "New Issue",
              onClick: this.props.onIssueCreate,
            }}
            fluid
            actionPosition="left"
            placeholder="Title of your issue goes here"
            onChange={this.props.handleTitleChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    );
  }

  private renderAllIssues() {
    if (this.props.loadingAllIssues) {
      return this.renderLoading();
    }

    return this.renderIssuesList();
  }

  private renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading issues
        </Loader>
      </Grid.Row>
    );
  }

  private renderIssuesList() {
    const filterOptions = ["All", "Assigned to me", "Reported by me"].map(
      (option) => ({
        key: option,
        text: option,
        value: option as filterOptions,
      })
    );

    return (
      <>
        <Dropdown
          selection
          options={filterOptions}
          onChange={this.handleFilterChange}
          value={this.state.filterBy}
        />
        {(!this.props.issues || this.props.issues.length === 0) && (
          <Grid.Row>
            <Grid.Column width={16} style={{ textAlign: "center" }}>
              No issues found yet
            </Grid.Column>
          </Grid.Row>
        )}

        <Grid padded>
          {this.props.issues.map((issue, pos) => {
            console.log(issue.reporterId, this.props.auth.getIdToken());
            return (
              <Grid.Row key={issue.issueId}>
                <Grid.Column width={3} verticalAlign="middle">
                  {issue.status}
                </Grid.Column>
                <Grid.Column width={5} verticalAlign="middle">
                  <div>{issue.title}</div>
                  <div>{issue.description}</div>
                </Grid.Column>
                <Grid.Column width={3} floated="right">
                  {issue.reporterId.split("|")[1]}
                </Grid.Column>
                <Grid.Column width={3} floated="right">
                  {issue.assigneeId
                    ? issue.assigneeId.split("|")[1]
                    : "Unassigned"}
                </Grid.Column>
                <Grid.Column width={1} floated="right">
                  <Button
                    icon
                    color="blue"
                    onClick={() => this.props.onEditButtonClick(issue.issueId)}
                  >
                    <Icon name="pencil" />
                  </Button>
                </Grid.Column>
                <Grid.Column width={1} floated="right">
                  <Button
                    icon
                    color="red"
                    onClick={() => this.props.onIssueDelete(issue.issueId)}
                  >
                    <Icon name="delete" />
                  </Button>
                </Grid.Column>
                <Grid.Column width={16}>
                  {`${
                    issue.attachments ? issue.attachments.length : 0
                  } attachment${
                    issue.attachments && issue.attachments.length === 1
                      ? ""
                      : "s"
                  }`}
                </Grid.Column>
                <Grid.Column width={16}>
                  {issue.attachments &&
                    issue.attachments.map((attachmentUrl) => (
                      <Image src={attachmentUrl} size="small" wrapped />
                    ))}
                </Grid.Column>
                <Grid.Column width={16}>
                  <Divider />
                </Grid.Column>
              </Grid.Row>
            );
          })}
        </Grid>
      </>
    );
  }
}
