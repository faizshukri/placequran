import { URLSearchParams } from "url";
import {
  getVerses,
  parseParam,
  prepareForHtml,
  generateHtml,
  renderImage,
} from "./quran";

export const parsePath = (path: string, query: string) => {
  path = path.replace(/^\s*\/*/, "");

  let surah: string, verses: string, translations: string, size: string;

  if (path.startsWith("size_")) {
    [size, surah, verses, translations] = path.split("/").filter(Boolean);
    size = size.replace("size_", "");
  } else {
    [surah, verses, translations] = path.split("/").filter(Boolean);
    size = "m";
  }
  const queryParams = new URLSearchParams(query);
  const type = queryParams.get("t");

  return {
    surah,
    verses,
    translations,
    type,
    size,
  };
};

const response = async (
  {
    surah,
    verses,
    translations,
  }: { surah: string; verses: string; translations: string },
  operation: string,
  size: string
): Promise<{ type: string; body: string }> => {
  const params = parseParam(surah, verses, translations);
  if (operation === "param") {
    return {
      type: "application/json",
      body: Buffer.from(JSON.stringify(params)).toString("base64"),
    };
  }

  const api = await getVerses(params);
  if (operation === "api") {
    return {
      type: "application/json",
      body: Buffer.from(JSON.stringify(api)).toString("base64"),
    };
  }

  const api2 = prepareForHtml(api);
  if (operation === "api2") {
    return {
      type: "application/json",
      body: Buffer.from(JSON.stringify(api2)).toString("base64"),
    };
  }

  const html = generateHtml(api2, size);
  if (operation === "html") {
    return {
      type: "text/html; charset=utf-8",
      body: Buffer.from(html).toString("base64"),
    };
  }

  return {
    type: "image/png",
    body: (await renderImage(html)).toString("base64"),
  };
};

export const generator = async (path: string, query: string) => {
  let { surah, verses, translations, type, size } = parsePath(path, query);

  if (!type || !["param", "api", "api2", "html", "image"].includes(type)) {
    type = "image";
  }

  return response({ surah, verses, translations }, type, size);
};
