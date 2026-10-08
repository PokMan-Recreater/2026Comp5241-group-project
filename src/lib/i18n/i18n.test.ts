import { describe, expect, it } from "vitest";
import { LEVEL_TITLES } from "@/lib/progress";
import {
  DEFAULT_LOCALE,
  DICTIONARY_ENTRIES,
  LOCALES,
  detectLocale,
  isLocale,
  levelTitleKey,
  localeMeta,
  translate,
} from "@/lib/i18n";
import { en } from "@/lib/i18n/en";

const englishKeys = Object.keys(en).sort();

describe("dictionaries", () => {
  it("define exactly the same keys in every locale", () => {
    for (const locale of LOCALES) {
      expect(Object.keys(DICTIONARY_ENTRIES[locale.code]).sort(), locale.code).toEqual(englishKeys);
    }
  });

  it("never ship an empty translation", () => {
    for (const locale of LOCALES) {
      for (const [key, value] of Object.entries(DICTIONARY_ENTRIES[locale.code])) {
        expect(value.trim(), `${locale.code}:${key}`).not.toBe("");
      }
    }
  });
});

describe("translate", () => {
  it("returns the string for the requested locale", () => {
    expect(translate("en", "nav.courses")).toBe("Courses");
    expect(translate("zh-Hans", "nav.courses")).toBe("课程");
    expect(translate("zh-Hant", "nav.courses")).toBe("課程");
  });

  it("interpolates placeholders", () => {
    expect(translate("en", "home.cta.browse", { count: 11 })).toBe("Browse 11 courses");
    expect(translate("zh-Hans", "home.seeAll", { count: 11 })).toBe("查看全部 11 门 →");
    expect(translate("zh-Hant", "footer.stats", { courses: 11, lessons: 54, time: "9h" })).toBe(
      "11 門精選課程 · 54 節課 · 9h 學習材料",
    );
  });

  it("leaves unknown placeholders untouched", () => {
    expect(translate("en", "home.cta.browse")).toBe("Browse {count} courses");
  });

  it("degrades to the key itself when nothing matches", () => {
    const missing = "does.not.exist" as unknown as Parameters<typeof translate>[1];
    expect(translate("en", missing)).toBe("does.not.exist");
  });
});

describe("locale helpers", () => {
  it("recognises only supported locales", () => {
    expect(isLocale("zh-Hans")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("zh")).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale("toString")).toBe(false);
  });

  it("maps browser language tags onto a supported locale", () => {
    expect(detectLocale("en-GB")).toBe("en");
    expect(detectLocale("zh-CN")).toBe("zh-Hans");
    expect(detectLocale("zh")).toBe("zh-Hans");
    expect(detectLocale("zh-Hans")).toBe("zh-Hans");
    expect(detectLocale("zh-TW")).toBe("zh-Hant");
    expect(detectLocale("zh-HK")).toBe("zh-Hant");
    expect(detectLocale("zh-Hant")).toBe("zh-Hant");
    expect(detectLocale("fr-FR")).toBe("en");
  });

  it("describes every locale it advertises", () => {
    for (const locale of LOCALES) {
      expect(localeMeta(locale.code).code).toBe(locale.code);
      expect(localeMeta(locale.code).htmlLang.length).toBeGreaterThan(0);
    }
  });

  it("has a translated key for every level title in progress.ts", () => {
    for (const title of LEVEL_TITLES) {
      const key = levelTitleKey(title);
      expect(key, title).not.toBeNull();
      if (key) expect(en[key]).toBe(title);
    }
    expect(levelTitleKey("Wizard")).toBeNull();
  });

  it("uses English as the default locale", () => {
    expect(DEFAULT_LOCALE).toBe("en");
  });
});
