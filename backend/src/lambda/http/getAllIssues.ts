import "source-map-support/register";

import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { getUserId } from "../utils";
import { createLogger } from "../../utils/logger";
import { cors } from "middy/middlewares";
import * as middy from "middy";
import { getAllIssues } from "../../businessLogic/issues";
import { IssueItem } from "../../models/IssueItem";

const logger = createLogger("get-issues-log");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const currentUserId = getUserId(event);

    try {
      const issues: IssueItem[] = await getAllIssues(currentUserId);

      return {
        statusCode: 200,
        body: JSON.stringify({
          items: issues,
        }),
      };
    } catch (e) {
      logger.error(`Get issues failed ${e.message}`);
      return {
        statusCode: 500,
        body: JSON.stringify({}),
      };
    }
  }
);

handler.use(cors({ credentials: true }));
