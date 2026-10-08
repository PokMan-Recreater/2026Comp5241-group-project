"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAppData } from "@/components/providers/AppDataProvider";
import { useI18n } from "@/components/providers/LanguageProvider";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { levelTitleKey, type TranslationKey } from "@/lib/i18n";
import { levelFromXp } from "@/lib/progress";
import { cn } from "@/lib/utils";

const NAV: { href: string; key: TranslationKey }[] = [
  { href: "/catalog", key: "nav.courses" },
  { href: "/paths", key: "nav.paths" },
  { href: "/labs", key: "nav.labs" },
  { href: "/interview", key: "nav.interviews" },
  { href: "/create", key: "nav.customTopic" },
  { href: "/dashboard", key: "nav.dashboard" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { ready, profile, progress } = useAppData();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const level = levelFromXp(progress.xp);
  const titleKey = levelTitleKey(level.title);
  const levelTitle = titleKey ? t(titleKey) : level.title;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-950/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-sky-400 text-lg font-black text-white">
            S
          </span>
          <span className="text-base font-bold tracking-tight text-white">
            Skill<span className="text-brand-300">Forge</span>
          </span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitcher />

          {ready && (
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 sm:flex"
            >
              <span className="text-amber-300">⚡ {t("header.xp", { xp: progress.xp })}</span>
              <span className="text-slate-500">|</span>
              <span>{t("header.level", { level: level.level, title: levelTitle })}</span>
              {progress.streakDays > 0 && (
                <>
                  <span className="text-slate-500">|</span>
                  <span className="text-orange-300">
                    🔥 {t("header.streak", { days: progress.streakDays })}
                  </span>
                </>
              )}
            </Link>
          )}

          {ready && !profile && (
            <Link href="/onboarding" className="btn btn-primary btn-sm">
              {t("header.startFree")}
            </Link>
          )}

          <button
            type="button"
            className="btn btn-secondary btn-sm lg:hidden"
            aria-expanded={open}
            aria-label={t("header.toggleNav")}
            onClick={() => setOpen((value) => !value)}
          >
            ☰
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-white/10 bg-ink-950/95 px-4 py-2 lg:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
