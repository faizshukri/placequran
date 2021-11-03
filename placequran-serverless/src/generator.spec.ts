import test from "ava";
import { parsePath } from "./generator";

test("Parse path should work correctly", (t) => {
  t.deepEqual(parsePath("/2/1-2", ""), {
    surah: "2",
    verses: "1-2",
    translations: undefined,
    type: null,
    size: "m",
  });

  t.deepEqual(parsePath("/s/2/1-2", ""), {
    surah: "2",
    verses: "1-2",
    translations: undefined,
    type: null,
    size: "s",
  });
});
