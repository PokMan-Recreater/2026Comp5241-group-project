import { en, type TranslationKey } from "./en";
import { zhHans } from "./zh-Hans";
import { zhHant } from "./zh-Hant";

export type { TranslationKey } from "./en";

/**
 * UI localisation.
 *
 * Three languages ship today and all of them are offline: no API, no runtime
 * dependency, no build step. Every dictionary is a plain object, which is what
 * lets the test suite compare them key-for-key and keep them in sync.
 */

export type Locale = "en" | "zh-Hans" | "zh-Hant";

export interface LocaleMeta {
  code: Locale;
  /** Full name, written in the language itself. */
  label: string;
  /** Compact label for the segmented switcher. */
  short: string;
  /** Value written to <html lang>. */
  htmlLang: string;
}

export const LOCALES: LocaleMeta[] = [
  { code: "en", label: "English", short: "EN", htmlLang: "en" },
  { code: "zh-Hans", label: "简体中文", short: "简", htmlLang: "zh-Hans" },
  { code: "zh-Hant", label: "繁體中文", short: "繁", htmlLang: "zh-Hant" },
];

export const SUPPORTED_LOCALES: Locale[] = LOCALES.map((item) => item.code);

export const DEFAULT_LOCALE: Locale = "en";

/** Exposed for the dictionary-parity test. */
export const DICTIONARY_ENTRIES: Record<Locale, Record<TranslationKey, string>> = {
  en,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.includes(value as Locale);
}

export function localeMeta(locale: Locale): LocaleMeta {
  return LOCALES.find((item) => item.code === locale) ?? LOCALES[0];
}

/** Maps a browser language tag onto one of the supported locales. */
export function detectLocale(tag: string): Locale {
  const lower = tag.trim().toLowerCase();
  if (!lower.startsWith("zh")) return "en";
  // zh-TW / zh-HK / zh-MO and anything explicitly tagged Hant are traditional.
  return /(hant|tw|hk|mo)/.test(lower) ? "zh-Hant" : "zh-Hans";
}

/** Replaces `{name}` placeholders; unknown placeholders are left untouched. */
export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match,
  );
}

/**
 * Looks a key up in the given locale, degrading to English (and finally to the
 * key itself) so a missing translation can never blank out the UI.
 */
export function translate(
  locale: Locale,
  key: TranslationKey,
  vars?: Record<string, string | number>,
): string {
  const dictionary = DICTIONARY_ENTRIES[locale] ?? DICTIONARY_ENTRIES[DEFAULT_LOCALE];
  const template = dictionary[key] ?? DICTIONARY_ENTRIES[DEFAULT_LOCALE][key] ?? key;
  return interpolate(template, vars);
}

/**
 * Level titles are produced by `levelFromXp` in src/lib/progress.ts (English).
 * This maps them onto dictionary keys so the header can show them translated.
 */
const LEVEL_TITLE_KEY: Record<string, TranslationKey> = {
  explorer: "level.explorer",
  builder: "level.builder",
  engineer: "level.engineer",
  specialist: "level.specialist",
  architect: "level.architect",
  mentor: "level.mentor",
};

export function levelTitleKey(title: string): TranslationKey | null {
  return LEVEL_TITLE_KEY[title.trim().toLowerCase()] ?? null;
}
