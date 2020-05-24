import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { CreateIssueRequest } from "../../requests/CreateIssueRequest";

import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { createIssue } from "../../businessLogic/issues";

const logger = createLogger("create-log");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newIssue: CreateIssueRequest = JSON.parse(event.body);

    const userId = getUserId(event);

    try {
      const item = await createIssue(newIssue, userId);
      return {
        statusCode: 201,
        body: JSON.stringify({
          item,
        }),
      };
    } catch (e) {
      logger.error(`Create issue error ${e.message}`);
      return {
        statusCode: 500,
        body: JSON.stringify({}),
      };
    }
  }
);

handler.use(
  cors({
    credentials: true,
  })
);
