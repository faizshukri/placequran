import test from "ava";
import {
  generateHtml,
  getVerses,
  parseParam,
  prepareForHtml,
  QuranParamError,
  romanToArabic,
} from "./quran";

let config;

test.beforeEach(async (t) => {
  config = (await import("./config")).default;
});

test("Parse expected param correctly", (t) => {
  t.deepEqual(parseParam("1", "1"), {
    surah: 1,
    verses: [1],
    translations: ["ar"],
  });

  t.deepEqual(parseParam("1", "1", "ar"), {
    surah: 1,
    verses: [1],
    translations: ["ar"],
  });

  t.deepEqual(parseParam("1", "1,3", "ar"), {
    surah: 1,
    verses: [1, 3],
    translations: ["ar"],
  });

  t.deepEqual(parseParam("1", "1, 3", "ar"), {
    surah: 1,
    verses: [1, 3],
    translations: ["ar"],
  });

  t.deepEqual(parseParam("1", "1,3,5-7", "ar"), {
    surah: 1,
    verses: [1, 3, 5, 6, 7],
    translations: ["ar"],
  });

  t.deepEqual(parseParam("1", "5-7,3,1", "ar"), {
    surah: 1,
    verses: [1, 3, 5, 6, 7],
    translations: ["ar"],
  });

  t.deepEqual(parseParam("1", "9-11,3,1", "ar,ms"), {
    surah: 1,
    verses: [1, 3, 9, 10, 11],
    translations: ["ar", "ms"],
  });

  t.deepEqual(parseParam("1", "1", "ar, ms"), {
    surah: 1,
    verses: [1],
    translations: ["ar", "ms"],
  });

  t.deepEqual(parseParam("1", "1", "ar,ms,23"), {
    surah: 1,
    verses: [1],
    translations: ["ar", "ms", "23"],
  });
});

test("Trim request when over limit", async (t) => {
  config.max_verses = 2;
  config.max_translation = 2;

  t.deepEqual(
    await getVerses({
      surah: 2,
      verses: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      translations: ["ar", "22", "ms", "en"],
    }),
    {
      ar: [
        {
          aya: 1,
          sura: 2,
          text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ الٓمٓ",
        },
        {
          aya: 2,
          sura: 2,
          text: "ذَٰلِكَ ٱلْكِتَٰبُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ",
        },
      ],
      ms: [
        {
          aya: 1,
          sura: 2,
          text: "Alif, Laam, Miim.",
        },
        {
          aya: 2,
          sura: 2,
          text: "Kitab Al-Quran ini, tidak ada sebarang syak padanya (tentang datangnya dari Allah dan tentang sempurnanya); ia pula menjadi petunjuk bagi orang-orang yang (hendak) bertaqwa;",
        },
      ],
    }
  );
});

test("Throw error due to unexpected param", (t) => {
  t.throws(() => parseParam("", ""), { instanceOf: QuranParamError });

  t.throws(() => parseParam("1", ""), { instanceOf: QuranParamError });
  t.throws(() => parseParam("", "1"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("a", "1"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", "1,a"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", "1,-2"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", "3-1"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", "1--2"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", "1-,2"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", "1,,2"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", "1,"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", ",1"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", "1-"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", ",1"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", "1", ""), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", "1", "aa,"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", "1", ",aa"), { instanceOf: QuranParamError });
  t.throws(() => parseParam("1", "1", "aa,,bb"), {
    instanceOf: QuranParamError,
  });
  t.throws(() => parseParam("1", "1", "aa-bb"), {
    instanceOf: QuranParamError,
  });
});

test("Get verses correctly", async (t) => {
  const result = await getVerses({
    surah: 1,
    verses: [1, 2],
    translations: ["ar", "ms"],
  });

  t.deepEqual(result, {
    ar: [
      {
        aya: 1,
        sura: 1,
        text: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      },
      {
        aya: 2,
        sura: 1,
        text: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
      },
    ],
    ms: [
      {
        aya: 1,
        sura: 1,
        text: "Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani.",
      },
      {
        aya: 2,
        sura: 1,
        text: "Segala puji tertentu bagi Allah, Tuhan yang memelihara dan mentadbirkan sekalian alam.",
      },
    ],
  });
});

test("Get missing verses correctly", async (t) => {
  let result = await getVerses({
    surah: 1,
    verses: [1],
    translations: ["da", "ms"],
  });

  t.deepEqual(result, {
    ms: [
      {
        aya: 1,
        sura: 1,
        text: "Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani.",
      },
    ],
  });

  result = await getVerses({
    surah: 115,
    verses: [1],
    translations: ["ar"],
  });

  t.deepEqual(result, {
    ar: [],
  });

  result = await getVerses({
    surah: 1,
    verses: [10],
    translations: ["ar"],
  });

  t.deepEqual(result, {
    ar: [],
  });

  result = await getVerses({
    surah: 1,
    verses: [7, 8, 9, 10],
    translations: ["ar"],
  });

  t.deepEqual(result, {
    ar: [
      {
        aya: 7,
        sura: 1,
        text: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
      },
    ],
  });
});

test("Prepare html", async (t) => {
  const result = prepareForHtml({
    ar: [
      {
        sura: 2,
        aya: 1,
        text: "a",
      },
      {
        sura: 2,
        aya: 2,
        text: "b",
      },
      {
        sura: 2,
        aya: 4,
        text: "c",
      },
      {
        sura: 2,
        aya: 6,
        text: "d",
      },
      {
        sura: 2,
        aya: 7,
        text: "e",
      },
    ],
    en: [
      {
        sura: 2,
        aya: 1,
        text: "a",
      },
      {
        sura: 2,
        aya: 2,
        text: "b",
      },
      {
        sura: 2,
        aya: 4,
        text: "c",
      },
      {
        sura: 2,
        aya: 6,
        text: "d",
      },
      {
        sura: 2,
        aya: 7,
        text: "e",
      },
    ],
  });

  t.deepEqual(result, [
    {
      translation: "ar",
      verses: [
        {
          sura: 2,
          aya: 1,
          text: "a",
        },
        {
          sura: 2,
          aya: 2,
          text: "b",
        },
      ],
    },
    {
      translation: "en",
      verses: [
        {
          sura: 2,
          aya: 1,
          text: "a",
        },
        {
          sura: 2,
          aya: 2,
          text: "b",
        },
      ],
    },
    {
      translation: "ar",
      verses: [
        {
          sura: 2,
          aya: 4,
          text: "c",
        },
      ],
    },
    {
      translation: "en",
      verses: [
        {
          sura: 2,
          aya: 4,
          text: "c",
        },
      ],
    },
    {
      translation: "ar",
      verses: [
        {
          sura: 2,
          aya: 6,
          text: "d",
        },
        {
          sura: 2,
          aya: 7,
          text: "e",
        },
      ],
    },
    {
      translation: "en",
      verses: [
        {
          sura: 2,
          aya: 6,
          text: "d",
        },
        {
          sura: 2,
          aya: 7,
          text: "e",
        },
      ],
    },
  ]);
});

test("GenerateHtml should works properly", async (t) => {
  t.throws(() => generateHtml([]), { instanceOf: QuranParamError });
  t.true(
    generateHtml([
      {
        translation: "test",
        verses: [
          {
            aya: 1,
            sura: 1,
            text: "test",
          },
        ],
      },
    ])
      .trim()
      .startsWith("<!DOCTYPE html>")
  );
});

test("Convert roman to arabic correctly", async (t) => {
  t.is(romanToArabic(0), ".");
  t.is(romanToArabic(25), "٢٥");
  t.is(romanToArabic(139), "١٣٩");
});
