import log from "./lib/log";
import { S3 } from "aws-sdk";
import { generator } from "./generator";
import { URLSearchParams } from "url";
import getCacheHeader from "./lib/cache-header";
import get404 from "./lib/get404";
import getHashKey from "./lib/hash-key";
import {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
  Context,
} from "aws-lambda";

export async function handler(
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResultV2> {
  log(event.rawPath);

  const regex = /^\/?(?:size_[s|m|l]\/)?(\d+)(?:\/|$)/gm;
  const isImageRequest = regex.test(event.rawPath);
  const typeParam = new URLSearchParams(event.rawQueryString).get("t");
  const shouldReturnImageFormat = !typeParam || typeParam == "image";
  const key = await (async () => {
    if (!isImageRequest) {
      return event.rawPath.replace(/^\/?/gm, "") || "index.html";
    }

    return getHashKey(event.rawPath);
  })();

  let body = "";
  let contentType = "image/png";
  let statusCode = 200;
  const client = new S3();

  try {
    if (
      process.env.IS_OFFLINE ||
      (isImageRequest && !shouldReturnImageFormat)
    ) {
      throw new Error("Skip get file");
    }

    // get file from s3
    console.log("111: get file from s3");
    const { Body, ContentType } = await client
      .getObject({
        Bucket: process.env.WEBSITE_BUCKET as string,
        Key: key,
      })
      .promise();

    if (!ContentType || !Body) {
      contentType = "text/plain";
      body = Buffer.from("body or content-type empty", "utf8").toString(
        "base64"
      );
    } else {
      contentType = ContentType;
      body = Body.toString("base64");
    }
  } catch {
    if (isImageRequest) {
      try {
        // generate image
        console.log("222: generate image");
        const result = await generator(event.rawPath, event.rawQueryString);
        body = result.body;
        contentType = result.type;

        if (!process.env.IS_OFFLINE && shouldReturnImageFormat) {
          await client
            .putObject({
              Bucket: process.env.WEBSITE_BUCKET as string,
              Key: key,
              Body: Buffer.from(body, "base64"),
              ContentType: contentType,
            })
            .promise();
        }
      } catch (err) {
        console.log("333: generate error");
        console.log(err);

        // we serve body with 200 instead of throwing 404 here because
        // custom error page was set to have short cache time, meant for website.
        body = get404();
      }
    } else {
      // serve 404
      console.log("444: serve error");

      // throw 404 here to let cloudfront use custom error page
      statusCode = 404;
      contentType = "text/plain";
      body = Buffer.from("Not found").toString("base64");
    }
  }

  // log({ event });
  // log({ context });
  return {
    statusCode,
    isBase64Encoded: true,
    body,
    headers: Object.assign(
      {
        "Content-Type": contentType,
      },
      isImageRequest
        ? {
            "Access-Control-Allow-Origin": "*",
            "Cross-Origin-Resource-Policy": "cross-origin",
          }
        : {},
      getCacheHeader(key, statusCode)
    ),
  };
}
