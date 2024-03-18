import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export default async (html = ""): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
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
