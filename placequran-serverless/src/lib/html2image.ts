import chromium from "chrome-aws-lambda";

export default async (html = ""): Promise<Buffer> => {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  });

  const page = await browser.newPage();
  await page.setContent(html);

  const content = await page.$("body");
  if (!content) {
    throw new Error("Body is empty");
  }
  const imageBuffer = await content.screenshot();

  // await page.goto("https://placequran.com");
  // const imageBuffer = await page.screenshot();

  await page.close();
  await browser.close();

  return imageBuffer as Buffer;
};
