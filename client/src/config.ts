// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'rdvd3p0026'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev--p19qoxc.auth0.com', // Auth0 domain
  clientId: 'B9oYmUT57ysrd748pBJ2BmMHUwEglT2T', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
