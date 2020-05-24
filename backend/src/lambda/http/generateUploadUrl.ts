import "source-map-support/register";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as middy from "middy";
import * as uuid from "uuid";
import { cors } from "middy/middlewares";

import { createLogger } from "../../utils/logger";
import { getImageUrl } from "../../businessLogic/issues";
import { getUserId } from "../utils";

const logger = createLogger("generate-upload-url-log");

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { issueId } = event.pathParameters;

    const attachmentId = uuid.v4();

    const userId = getUserId(event);

    try {
      const url = await getImageUrl(issueId, userId, attachmentId);
      logger.info(url);
      return {
        statusCode: 201,
        body: JSON.stringify({
          uploadUrl: url,
        }),
      };
    } catch (e) {
      logger.error(`Generate upload URL failed ${e.message}`);
    }
  }
);

handler.use(cors({ credentials: true }));
