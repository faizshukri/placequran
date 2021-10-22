import { QuranParam } from "./interfaces/param";
import { Verse } from "./interfaces/verses";
import * as R from "ramda";
import html2image from "./lib/html2image";
import { sqliteDb, fontBase64 } from "placequran-layer";
import config from "./config";
import { Sura } from "./lib/quran-data";

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
  if (param.surah < 1 || param.surah > 114) {
    return {
      surah: 0,
      verses: [],
      translations: ["ar"],
    };
  }

  const maxVerses = Sura[param.surah][1];

  param.verses = param.verses
    .filter((a) => a <= maxVerses)
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
}): { translation: string; meta?: string; verses: Verse[] }[] => {
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
  const metadata = {};
  const getMeta = (verses) => {
    return {
      translation: "meta",
      meta: `${Sura[verses[0].sura][5]}: ${verses[0].aya}${
        verses.length > 1 ? `-${R.last(verses).aya}` : ""
      }`,
      verses: [],
    };
  };

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
        const metaKey = `meta-${acc[lastTranslationIndex].verses[0].aya}`;
        if (!metadata[metaKey]) {
          metadata[metaKey] = true;
          acc.push(getMeta(R.last(acc).verses));
        }
        const { translation, ...others } = verse;

        acc.push({
          translation,
          verses: [others],
        });
      }

      return acc;
    }, []),
    (val) => {
      val.push(getMeta(R.last(val).verses));
      return val;
    }
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
  translations: { translation: string; meta?: string; verses: Verse[] }[]
): string => {
  if (!translations || translations.length == 0) {
    throw new QuranParamError("Data not available");
  }

  const fonts = {
    MeQuran: fontBase64.MeQuran(),
    NotoNaskhArabic: fontBase64.NotoNaskhArabic(),
    OpenSans: fontBase64.OpenSans(),
  };

  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <title>Place Quran</title>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
      <style>
      @font-face {
        font-family: me_quran;
        font-style: normal;
        font-weight: normal;
        src: url(${fonts.MeQuran.data}) format('${fonts.MeQuran.format}');
      }

      @font-face {
        font-family: "Noto Naskh Arabic";
        font-style: normal;
        font-weight: normal;
        src: url(${fonts.NotoNaskhArabic.data}) format('${
    fonts.NotoNaskhArabic.format
  }');
      }

      @font-face {
        font-family: 'Open Sans';
        font-style: normal;
        font-weight: normal;
        src: url(${fonts.OpenSans.data}) format('${fonts.OpenSans.format}');
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
        line-height: 50px;
        font-style: normal;
        font-size: 22px;
        margin-top: 10px;
      }

      .translation-ar .berhenti {
        position: relative;
        font-size: 26px;
        font-weight: bold;
        color: darkgreen;
      }

      .translation-ar .berhenti .no_ayat {
        font-family: 'Noto Naskh Arabic', sans-serif;
        position: absolute;
        left: 6px;
        bottom: -14px;
        font-size: 16px;
        width: 40px;
        text-align: center;
        font-weight: normal;
      }

      .translation-ar .berhenti.last .no_ayat {
        left: 2px;
      }

      .translation-meta {
        font-style: normal;
        text-align: right;
        padding-bottom: 10px;
        font-weight: bold;
      }

      .no_ayat {
        color: darkgreen;
      }

      .footer {
        font-family: 'Open Sans', sans-serif;
        font-size: 18px;
        color: lightgrey;
        padding-bottom: 10px;
        text-align: left;
        letter-spacing: 3px;
        margin-top: -42px;
      }

      body {
        width: 640px;
        padding: 1px 15px;
        margin: 0px;
      }
      </style>
    </head>
    <body>
      ${translations
        .map(({ translation, meta, verses }) => {
          return `
        <div class="translation-general translation-${translation}">
          ${
            translation == "meta"
              ? `&mdash; ${meta}`
              : verses
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
                  .join("&nbsp;&nbsp;")
          }
        </div>
        `;
        })
        .join("")}
      <div class="footer">placequran.com</div>
    </body>
  </html>`;
};

export const renderImage = html2image;
