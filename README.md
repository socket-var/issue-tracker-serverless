# Issue tracker - Serverless

This is a very basic JIRA style issue tracker implemented using the serverless framework

Source code: https://github.com/socket-var/issue-tracker-serverless

# Functionality of the application

- This application allows creating/removing/updating/fetching Issue items. Each Issue item can optionally have an attachment image.
- Every user can view all the issues they are involved with either as a reporter or as an assignee
- Users can filter issues by "Assigned to me" and "Reported by me"
- Any user can update the issue's title, description, status and add attachments
- Only users who reported the issue can delete it
- User can attach multiple attachments to an issue

# Technical requirements:

This application

- implements all CRUD operations
- allows uploading multiple attachments per issue to S3
- only displays records when logged in
- uses Winston logger
- does authentication and authorization using Auth0
- has monitoring setup using Distributed tracing
- has validators on the Gateway level and application code
- data is stored using composite keys with both partition and sort keys and queried using query()

# Frontend

The only file that you need to edit is the `config.ts` file in the `client` folder. This file configures your client application just as it was done in the course and contains an API endpoint and Auth0 configuration:

```ts
const apiId = '...' API Gateway id
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: '...',    // Domain from Auth0
  clientId: '...',  // Client id from an Auth0 application
  callbackUrl: 'http://localhost:3000/callback'
}
```

# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

## Frontend

To run a client application first edit the `client/src/config.ts` file to set correct parameters. And then run the following commands:

```
cd client
npm install
npm run start
```

This should start a development server with the React application that will interact with the serverless Issue tracker application.
