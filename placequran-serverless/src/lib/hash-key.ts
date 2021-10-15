import { parsePath } from "../generator";
import { filterParam, parseParam } from "../quran";
import { createHash } from "crypto";

export default (path: string) => {
  const { surah, verses, translations } = parsePath(path, "");
  const params = JSON.stringify(
    filterParam(parseParam(surah, verses, translations))
  );

  return "tmp/" + createHash("md5").update(params).digest("hex") + ".png";
};
