import { QuranParam } from "./interfaces/param";
import { Verse } from "./interfaces/verses";
import * as R from "ramda";
import html2image from "./lib/html2image";
import { sqliteDb, fontBase64 } from "placequran-layer";
import config from "./config";

export class QuranParamError extends Error {
  constructor(m: string) {
    super(m);
  }
}

export const parseParam = (
  surah: string,
  verses: string,
  translations?: string
): QuranParam => {
  if (!surah || !verses) {
    throw new QuranParamError("Both surah and verses are required");
  }

  if (isNaN(parseInt(surah))) {
    throw new QuranParamError("Invalid surah");
  }

  if (/[^\d,-\s]/.test(verses) || /(^|[,-])\s*([,-]|$)/.test(verses)) {
    throw new QuranParamError("Invalid verses");
  }

  if (
    translations === "" ||
    /[^\w\d,\s]/.test(translations) ||
    /(^|[,])\s*([,]|$)/.test(translations)
  ) {
    throw new QuranParamError("Invalid translations");
  }

  return {
    surah: parseInt(surah),
    verses: verses
      .replace(" ", "")
      .split(",")
      .flatMap((num) => {
        if (num.includes("-")) {
          const [from, to] = num.split("-").map((num) => parseInt(num));
          if (from > to) {
            throw new QuranParamError("Invalid verses");
          }

          return Array(to - from + 1)
            .fill(0)
            .map((_, idx) => from + idx);
        }

        return parseInt(num);
      })
      .sort((a, b) => a - b),
    translations:
      translations && translations.length
        ? translations.replace(" ", "").split(",")
        : ["ar"],
  };
};

export const filterParam = (param: QuranParam): QuranParam => {
  const maxVersesBySurah = {
    1: 7,
    2: 286,
    3: 200,
    4: 176,
    5: 120,
    6: 165,
    7: 206,
    8: 75,
    9: 129,
    10: 109,
    11: 123,
    12: 111,
    13: 43,
    14: 52,
    15: 99,
    16: 128,
    17: 111,
    18: 110,
    19: 98,
    20: 135,
    21: 112,
    22: 78,
    23: 118,
    24: 64,
    25: 77,
    26: 227,
    27: 93,
    28: 88,
    29: 69,
    30: 60,
    31: 34,
    32: 30,
    33: 73,
    34: 54,
    35: 45,
    36: 83,
    37: 182,
    38: 88,
    39: 75,
    40: 85,
    41: 54,
    42: 53,
    43: 89,
    44: 59,
    45: 37,
    46: 35,
    47: 38,
    48: 29,
    49: 18,
    50: 45,
    51: 60,
    52: 49,
    53: 62,
    54: 55,
    55: 78,
    56: 96,
    57: 29,
    58: 22,
    59: 24,
    60: 13,
    61: 14,
    62: 11,
    63: 11,
    64: 18,
    65: 12,
    66: 12,
    67: 30,
    68: 52,
    69: 52,
    70: 44,
    71: 28,
    72: 28,
    73: 20,
    74: 56,
    75: 40,
    76: 31,
    77: 50,
    78: 40,
    79: 46,
    80: 42,
    81: 29,
    82: 19,
    83: 36,
    84: 25,
    85: 22,
    86: 17,
    87: 19,
    88: 26,
    89: 30,
    90: 20,
    91: 15,
    92: 21,
    93: 11,
    94: 8,
    95: 8,
    96: 19,
    97: 5,
    98: 8,
    99: 8,
    100: 11,
    101: 11,
    102: 8,
    103: 3,
    104: 9,
    105: 5,
    106: 4,
    107: 7,
    108: 3,
    109: 6,
    110: 3,
    111: 5,
    112: 4,
    113: 5,
    114: 6,
  };

  if (param.surah < 1 || param.surah > 114) {
    return {
      surah: 0,
      verses: [],
      translations: ["ar"],
    };
  }

  param.verses = param.verses
    .filter((a) => a <= maxVersesBySurah[param.surah])
    .slice(0, config.max_verses);

  param.translations = param.translations
    .filter((a) => !!config.translations[a])
    .slice(0, config.max_translation);

  return param;
};

export const getVerses = async (
  param: QuranParam
): Promise<{ [key: string]: Verse[] }> => {
  const { surah, verses, translations } = filterParam(param);
  const results = await Promise.all(
    translations.map(async (translation) => {
      return sqliteDb
        .prepare(
          `SELECT aya, sura, text FROM ${
            config.translations[translation]
          } WHERE sura = ? AND aya IN (${verses
            .slice(0, config.max_verses)
            .map(() => "?")
            .join(", ")})`
        )
        .all(surah, ...verses.slice(0, config.max_verses));
    })
  );

  const response = {};
  translations.forEach((translation, index) => {
    response[translation] = results[index];
  });

  return response;
};

export const prepareForHtml = (translations: {
  [key: string]: Verse[];
}): { translation: string; verses: Verse[] }[] => {
  const merged = Object.keys(translations).flatMap((translation) => {
    return translations[translation].map((verse) => ({
      ...verse,
      translation,
    }));
  });

  // const debug = (a) => {
  //   console.log(util.inspect(a, false, null, true /* enable colors */));
  //   return a;
  // };

  return R.pipe(
    R.sort(R.ascend(R.prop("aya"))),
    R.reduce((acc, verse) => {
      const lastTranslationIndex = R.findLastIndex(
        R.propEq("translation", verse.translation)
      )(acc);

      if (lastTranslationIndex < 0) {
        const { translation, ...others } = verse;
        acc.push({
          translation,
          verses: [others],
        });
        return acc;
      }

      const { translation, verses } = acc[lastTranslationIndex];
      const lastVerse = verses[verses.length - 1];

      if (
        verse.translation === translation &&
        verse.aya === lastVerse.aya + 1
      ) {
        delete verse.translation;
        acc[lastTranslationIndex].verses.push(verse);
      } else {
        const { translation, ...others } = verse;
        acc.push({
          translation,
          verses: [others],
        });
      }

      return acc;
    }, [])
  )(merged);
};

export const romanToArabic = (number: number): string => {
  const numeral = [".", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return number
    .toString()
    .split("")
    .map((a) => numeral[a])
    .join("");
};

export const generateHtml = (
  translations: { translation: string; verses: Verse[] }[]
): string => {
  if (!translations || translations.length == 0) {
    throw new QuranParamError("Data not available");
  }

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>Place Quran</title>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic&family=Open+Sans&display=swap" rel="stylesheet">
      <style>
      @font-face {
        font-family: me_quran;
        font-style: normal;
        font-weight: normal;
        src: url(${fontBase64.MeQuran}) format('truetype');
      }

      .translation-general {
        font-family: 'Open Sans', sans-serif;
        font-style: italic;
        font-size: 15px;
        word-spacing: 3px;
        line-height: 22px;
        margin-top: 10px;
        margin-bottom: 10px;
        font-weight: lighter;
      }

      .translation-ar {
        font-family: me_quran;
        text-align: right;
        line-height: 60px;
        font-style: normal;
        font-size: 24px;
        margin-top: 10px;
      }

      .translation-ar .berhenti {
        position: relative;
        font-size: 26px;
        font-weight: bold;
        color: darkgreen;
      }

      .translation-ar .berhenti .no_ayat {
        font-family: 'Noto Sans Arabic', sans-serif;
        position: absolute;
        left: 6px;
        bottom: -19px;
        font-size: 16px;
        width: 40px;
        text-align: center;
        font-weight: normal;
      }

      .translation-ar .berhenti.last .no_ayat {
        left: 2px;
      }

      .no_ayat {
        color: darkgreen;
      }

      .footer {
        font-family: 'Open Sans', sans-serif;
        font-size: 20px;
        color: lightgrey;
        padding-bottom: 10px;
        text-align: center;
        letter-spacing: 3px;
        margin-top: 20px;
      }

      body {
        width: 600px;
        padding: 1px 15px;
        margin: 0px;
      }
      </style>
    </head>
    <body>
      ${translations
        .map(({ translation, verses }) => {
          return `
        <div class="translation-general translation-${translation}">
          ${verses
            .map((verse, index) => {
              const isLast = index == verses.length - 1;
              return `${verse.text}${
                translation === "ar"
                  ? `<span class="berhenti ${
                      isLast ? "last" : ""
                    }">&nbsp;&nbsp;۝&nbsp;<span class="no_ayat">${romanToArabic(
                      verse.aya
                    )}</span></span>`
                  : ` <strong><span class="no_ayat">[${verse.aya}]</span></strong>`
              }`;
            })
            .join("&nbsp;&nbsp;")}
        </div>
        `;
        })
        .join("")}
      <div class="footer">placequran.com</div>
    </body>
  </html>`;
};

export const renderImage = html2image;
