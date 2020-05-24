import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";
import * as middy from "middy";
import { cors } from "middy/middlewares";
import { deleteIssue } from "../../businessLogic/issues";

const logger = createLogger("delete-todo");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const issueId = event.pathParameters.issueId;
    const userId = getUserId(event);

    try {
      const record = await deleteIssue(issueId, userId);
      return {
        statusCode: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify(record),
      };
    } catch (e) {
      logger.error(`delete issue error ${e.message}`);

      return {
        statusCode: 500,
        body: JSON.stringify({}),
      };
    }
  }
);

handler.use(cors({ credentials: true }));
