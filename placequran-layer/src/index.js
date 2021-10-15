const path = require("path");
const sqlite3 = require("better-sqlite3");
const fs = require("fs");

const loadFontBase64 = (path) => {
  const base64Font = fs.readFileSync(path).toString("base64");
  return `data:font/truetype;charset=utf-8;base64,${base64Font}`;
};

module.exports = {
  sqliteDb: new sqlite3(path.resolve(__dirname, "data/sqlite")),
  fontBase64: {
    MeQuran: loadFontBase64(path.resolve(__dirname, "data/me_quran.ttf")),
  },
};
