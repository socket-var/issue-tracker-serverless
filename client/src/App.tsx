import React, { Component } from "react";
import { Link, Route, Router, Switch } from "react-router-dom";
import { Grid, Menu, Segment } from "semantic-ui-react";

import Auth from "./auth/Auth";
import EditIssue from "./components/EditIssue";
import { LogIn } from "./components/LogIn";
import { NotFound } from "./components/NotFound";
import { Issues } from "./components/Issues";
import { IssueItem } from "./types/Issue";
import { createIssue, deleteIssue } from "./api/issues-api";

export interface AppProps {
  auth: Auth;
  history: any;
}

export interface AppState {
  issues: IssueItem[];
  newIssueTitle: string;
  loadingAllIssues: boolean;
}

export default class App extends Component<AppProps, AppState> {
  state = {
    issues: [],
    newIssueTitle: "",
    loadingAllIssues: true,
  };
  constructor(props: AppProps) {
    super(props);

    this.handleLogin = this.handleLogin.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.onIssueCreate = this.onIssueCreate.bind(this);
    this.onIssueDelete = this.onIssueDelete.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.saveIssues = this.saveIssues.bind(this);
    this.onEditButtonClick = this.onEditButtonClick.bind(this);
  }

  handleLogin() {
    this.props.auth.login();
  }

  handleLogout() {
    this.props.auth.logout();
  }

  private async onIssueCreate(event: React.ChangeEvent<HTMLButtonElement>) {
    try {
      const newIssue = await createIssue(this.props.auth.getIdToken(), {
        title: this.state.newIssueTitle,
      });

      this.setState({
        issues: [...this.state.issues, newIssue],
        newIssueTitle: "",
      });
    } catch {
      alert("IssueItem creation failed");
    }
  }

  private async onIssueDelete(issueId: string) {
    try {
      await deleteIssue(this.props.auth.getIdToken(), issueId);
      this.setState((state) => ({
        issues: state.issues.filter((issue) => issue.issueId != issueId),
      }));
    } catch (err) {
      alert(err.message);
    }
  }

  private saveIssues(issues: IssueItem[]) {
    this.setState({ issues, loadingAllIssues: false });
  }

  private handleTitleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ newIssueTitle: event.target.value });
  }

  private onEditButtonClick(issueId: string) {
    this.props.history.push(`/issues/${issueId}/edit`);
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: "8em 0em" }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    );
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>

        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    );
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      );
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      );
    }
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />;
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={(props) => {
            return (
              <Issues
                {...props}
                auth={this.props.auth}
                loadingAllIssues={this.state.loadingAllIssues}
                issues={this.state.issues}
                saveIssues={this.saveIssues}
                onIssueCreate={this.onIssueCreate}
                onIssueDelete={this.onIssueDelete}
                onEditButtonClick={this.onEditButtonClick}
                handleTitleChange={this.handleTitleChange}
              />
            );
          }}
        />

        <Route
          path="/issues/:issueId/edit"
          exact
          render={(props) => {
            return (
              <EditIssue
                {...props}
                auth={this.props.auth}
                issues={this.state.issues}
              />
            );
          }}
        />

        <Route component={NotFound} />
      </Switch>
    );
  }
}
