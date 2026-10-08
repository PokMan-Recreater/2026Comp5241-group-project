"use client";

import { LOCALES } from "@/lib/i18n";
import { useI18n } from "@/components/providers/LanguageProvider";
import { cn } from "@/lib/utils";

/**
 * Compact language switcher, rendered as a segmented control so the active
 * language is obvious at a glance and the control stays keyboard accessible.
 */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div
      role="group"
      aria-label={t("a11y.language")}
      className="flex items-center gap-0.5 rounded-full border border-white/10 bg-white/5 p-0.5"
    >
      {LOCALES.map((item) => {
        const active = item.code === locale;
        return (
          <button
            key={item.code}
            type="button"
            lang={item.htmlLang}
            title={item.label}
            aria-pressed={active}
            onClick={() => setLocale(item.code)}
            className={cn(
              "rounded-full px-2 py-1 text-[11px] font-semibold transition",
              active ? "bg-brand-500 text-white" : "text-slate-400 hover:text-white",
            )}
          >
            {item.short}
          </button>
        );
      })}
    </div>
  );
}
