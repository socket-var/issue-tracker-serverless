# Issue tracker - Serverless

This is a very basic JIRA style issue tracker implemented using the serverless framework
Source code: https://github.com/socket-var/issue-tracker-serverless

# Functionality of the application

- This application will allow creating/removing/updating/fetching Issue items. Each Issue item can optionally have an attachment image.
- For the sake of this project every user can view all issues, sort of like every user in a particular team in JIRA can view all the tickets
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

# Postman collection

An alternative way to test this API, you can use the Postman collection that contains sample requests. You can find a Postman collection in this project. To import this collection, do the following.

Click on the import button:

![Alt text](images/import-collection-1.png?raw=true "Image 1")

Click on the "Choose Files":

![Alt text](images/import-collection-2.png?raw=true "Image 2")

Select a file to import:

![Alt text](images/import-collection-3.png?raw=true "Image 3")

Right click on the imported collection to set variables for the collection:

![Alt text](images/import-collection-4.png?raw=true "Image 4")

Provide variables for the collection (similarly to how this was done in the course):

![Alt text](images/import-collection-5.png?raw=true "Image 5")
