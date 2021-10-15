import * as path from "path";

export default (
  filename: string,
  statusCode: number
): { "Cache-Control"?: string } => {
  const extension = path.extname(filename).toLowerCase();
  const isQuranImage = filename.startsWith("tmp/") && extension == ".png";

  // do not pass cache-control on error
  // let cloudfront handle it
  if (statusCode !== 200) {
    return {};
  }

  // Let's return default for all cases
  // max-age  : for browser cache
  // s-maxage : for cloudfront cache
  return {
    "Cache-Control": `max-age=${
      1 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */
    }, s-maxage=${
      90 /* days */ * 24 /* hours */ * 60 /* minutes */ * 60 /* seconds */
    }`,
  };
};
