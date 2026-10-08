"use client";

import Link from "next/link";
import { TOTAL_CURATED_LESSONS, TOTAL_CURATED_MINUTES, curatedCourses } from "@/content";
import { useI18n } from "@/components/providers/LanguageProvider";
import { formatMinutes } from "@/lib/utils";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="mt-16 border-t border-white/10 bg-ink-950/60">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-sm font-bold text-white">SkillForge</p>
          <p className="mt-2 text-sm text-slate-400">{t("footer.tagline")}</p>
          <p className="mt-3 text-xs text-slate-500">
            {t("footer.stats", {
              courses: curatedCourses.length,
              lessons: TOTAL_CURATED_LESSONS,
              time: formatMinutes(TOTAL_CURATED_MINUTES),
            })}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("footer.learn")}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <Link className="hover:text-white" href="/catalog">
                {t("footer.catalog")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/labs">
                {t("footer.labs")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/interview">
                {t("footer.interviews")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/create">
                {t("footer.create")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {t("footer.project")}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <Link className="hover:text-white" href="/onboarding">
                {t("footer.onboarding")}
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/dashboard">
                {t("footer.dashboard")}
              </Link>
            </li>
            <li className="text-slate-500">{t("footer.credit")}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-4 text-center text-xs text-slate-500">
        {t("footer.privacy")}
      </div>
    </footer>
  );
}
