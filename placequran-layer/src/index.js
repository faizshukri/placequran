const path = require("path");
const sqlite3 = require("better-sqlite3");
const fs = require("fs");

const loadFont = (filename, format) => () => {
  const base64Font = fs
    .readFileSync(path.resolve(__dirname, `data/${filename}`))
    .toString("base64");

  return {
    data: `data:font/${format};charset=utf-8;base64,${base64Font}`,
    format,
  };
};

module.exports = {
  sqliteDb: new sqlite3(path.resolve(__dirname, "data/sqlite")),
  fontBase64: {
    MeQuran: loadFont("me_quran.ttf", "truetype"),
    NotoNaskhArabic: loadFont("NotoNaskhArabic-Regular.ttf", "truetype"),
    OpenSans: loadFont("OpenSans-Regular.ttf", "truetype"),
    Scheherazade: loadFont("ScheherazadeNew-Regular.ttf", "truetype"),
    KFGQPCUthmanTahaNaskh: loadFont(
      "KFGQPC Uthman Taha Naskh Regular.ttf",
      "truetype"
    ),
    KFGQPCUthmanScriptHafs: loadFont(
      "KFGQPC Uthmanic Script HAFS Regular.otf",
      "opentype"
    ),
    JameelNooriUrdu: loadFont("Jameel Noori Nastaleeq Regular.ttf", "truetype"),
    Mangal: loadFont("Mangal Regular.ttf", "truetype"),
  },
};
