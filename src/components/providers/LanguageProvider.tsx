"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  detectLocale,
  isLocale,
  localeMeta,
  translate,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n";
import { STORAGE_KEYS, readString, writeString } from "@/lib/storage";

/**
 * Holds the learner's language choice (English / 简体中文 / 繁體中文) and hands
 * every component a `t()` function.
 *
 * The server always renders the default locale, so there is no hydration
 * mismatch: the stored (or browser-detected) preference is adopted immediately
 * after mount, the same way AppDataProvider adopts its localStorage state.
 */

export interface I18n {
  locale: Locale;
  /** True once the stored or browser-detected preference has been applied. */
  ready: boolean;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18n | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [ready, setReady] = useState(false);

  // One-time read of a browser-only preference, plus a sensible first guess from
  // the browser's own language list.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from localStorage */
    const stored = readString(STORAGE_KEYS.locale);
    setLocaleState(isLocale(stored) ? stored : detectLocale(navigator.language));
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (ready) writeString(STORAGE_KEYS.locale, locale);
  }, [ready, locale]);

  useEffect(() => {
    document.documentElement.lang = localeMeta(locale).htmlLang;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setLocaleState(next), []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => translate(locale, key, vars),
    [locale],
  );

  const value = useMemo<I18n>(() => ({ locale, ready, setLocale, t }), [locale, ready, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside <LanguageProvider>");
  }
  return context;
}
