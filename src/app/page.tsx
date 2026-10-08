"use client";

import Link from "next/link";
import {
  CODE_CHALLENGES,
  ROLE_PLAY_SCENARIOS,
  SIMULATIONS,
  TOTAL_CURATED_LESSONS,
  TOTAL_CURATED_MINUTES,
  curatedCourses,
} from "@/content";
import { useI18n } from "@/components/providers/LanguageProvider";
import type { TranslationKey } from "@/lib/i18n";
import { formatMinutes } from "@/lib/utils";

const FEATURES: { icon: string; titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { icon: "🧭", titleKey: "home.feature.paths.title", bodyKey: "home.feature.paths.body" },
  { icon: "🧩", titleKey: "home.feature.custom.title", bodyKey: "home.feature.custom.body" },
  { icon: "🧪", titleKey: "home.feature.sims.title", bodyKey: "home.feature.sims.body" },
  {
    icon: "🎤",
    titleKey: "home.feature.interviews.title",
    bodyKey: "home.feature.interviews.body",
  },
  { icon: "💻", titleKey: "home.feature.code.title", bodyKey: "home.feature.code.body" },
  {
    icon: "🔊",
    titleKey: "home.feature.narration.title",
    bodyKey: "home.feature.narration.body",
  },
];

const STEPS: { step: string; titleKey: TranslationKey; bodyKey: TranslationKey }[] = [
  { step: "01", titleKey: "home.step1.title", bodyKey: "home.step1.body" },
  { step: "02", titleKey: "home.step2.title", bodyKey: "home.step2.body" },
  { step: "03", titleKey: "home.step3.title", bodyKey: "home.step3.body" },
  { step: "04", titleKey: "home.step4.title", bodyKey: "home.step4.body" },
];

export default function HomePage() {
  const { t } = useI18n();

  const stats = [
    { label: t("home.stat.courses"), value: curatedCourses.length },
    { label: t("home.stat.lessons"), value: TOTAL_CURATED_LESSONS },
    { label: t("home.stat.hours"), value: Math.round(TOTAL_CURATED_MINUTES / 60) },
    { label: t("home.stat.labs"), value: SIMULATIONS.length },
    { label: t("home.stat.interviews"), value: ROLE_PLAY_SCENARIOS.length },
    { label: t("home.stat.challenges"), value: CODE_CHALLENGES.length },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-14">
      <section className="animate-rise">
        <p className="eyebrow">{t("home.eyebrow")}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
          {t("home.titleLead")}{" "}
          <span className="bg-gradient-to-r from-brand-300 to-sky-300 bg-clip-text text-transparent">
            {t("home.titleAccent")}
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300">{t("home.intro")}</p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/onboarding" className="btn btn-primary">
            {t("home.cta.path")}
          </Link>
          <Link href="/catalog" className="btn btn-secondary">
            {t("home.cta.browse", { count: curatedCourses.length })}
          </Link>
          <Link href="/labs" className="btn btn-ghost">
            {t("home.cta.lab")}
          </Link>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-4">
              <dt className="text-xs uppercase tracking-wider text-slate-500">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16">
        <h2 className="section-title">{t("home.how.title")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <div key={item.step} className="card card-pad">
              <span className="font-mono text-xs text-brand-300">{item.step}</span>
              <h3 className="mt-2 text-base font-semibold text-white">{t(item.titleKey)}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-slate-400">{t(item.bodyKey)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="section-title">{t("home.features.title")}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.titleKey} className="card card-pad card-hover">
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-white">{t(feature.titleKey)}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-slate-400">{t(feature.bodyKey)}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-title">{t("home.startWith")}</h2>
          <Link href="/catalog" className="link text-sm">
            {t("home.seeAll", { count: curatedCourses.length })}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {curatedCourses.slice(0, 6).map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="card card-pad card-hover block"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${course.accent} text-lg`}
                >
                  {course.icon}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{course.title}</h3>
                  <p className="text-xs text-slate-500">
                    {t(course.modules.length === 1 ? "home.modules.one" : "home.modules.other", {
                      count: course.modules.length,
                    })}{" "}
                    · {formatMinutes(course.estimatedMinutes)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-6 text-slate-400">{course.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 overflow-hidden rounded-3xl border border-brand-400/25 bg-gradient-to-br from-brand-600/25 via-ink-900 to-ink-950 p-8">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {t("home.custom.title")}
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-300">
          {t("home.custom.body")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/create" className="btn btn-primary">
            {t("home.custom.cta")}
          </Link>
          <Link href="/interview" className="btn btn-secondary">
            {t("home.custom.interview")}
          </Link>
        </div>
      </section>

    </div>
  );
}
