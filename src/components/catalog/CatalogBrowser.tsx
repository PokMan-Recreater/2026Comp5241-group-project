"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Audience, Course, CourseCategory, SkillLevel } from "@/types";
import { CATEGORY_LABELS, CATEGORY_ORDER, courseLessonsOf, searchCourses } from "@/content";
import { useAppData } from "@/components/providers/AppDataProvider";
import { ProgressBar } from "@/components/ui/Progress";
import { computeCourseProgress } from "@/lib/progress";
import { cn, formatMinutes } from "@/lib/utils";

type AudienceFilter = Audience | "all";
type LevelFilter = SkillLevel | "all";
type CategoryFilter = CourseCategory | "all";

export function CatalogBrowser() {
  const { ready, allCourses, progress, customCourses } = useAppData();
  const [query, setQuery] = useState("");
  const [audience, setAudience] = useState<AudienceFilter>("all");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");

  const results = useMemo(() => {
    const searched = searchCourses(query, allCourses);
    return searched.filter((course) => {
      if (audience !== "all" && !course.audience.includes(audience)) return false;
      if (level !== "all" && course.level !== level) return false;
      if (category !== "all" && course.category !== category) return false;
      return true;
    });
  }, [query, allCourses, audience, level, category]);

  const generated = customCourses.filter((course) =>
    results.some((candidate) => candidate.id === course.id),
  );
  const curated = results.filter((course) => course.origin === "curated");

  const renderCard = (course: Course) => {
    const summary = computeCourseProgress(course, progress);
    const lessons = courseLessonsOf(course).length;
    return (
      <Link
        key={course.id}
        href={`/courses/${course.slug}`}
        className="card card-pad card-hover flex flex-col"
      >
        <div className="flex items-start gap-3">
          <span
            className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${course.accent} text-xl`}
          >
            {course.icon}
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-5 text-white">{course.title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {CATEGORY_LABELS[course.category]} · {lessons} lessons ·{" "}
              {formatMinutes(course.estimatedMinutes)}
            </p>
          </div>
        </div>

        <p className="mt-3 flex-1 text-[13px] leading-6 text-slate-400">{course.subtitle}</p>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="chip">{course.level}</span>
          {course.audience.map((item) => (
            <span key={item} className="chip">
              {item === "cs" ? "CS" : "non-CS"}
            </span>
          ))}
          {course.origin === "custom" && (
            <span className="chip border-fuchsia-400/40 text-fuchsia-200">generated</span>
          )}
        </div>

        {ready && summary.completedLessons > 0 && (
          <div className="mt-3">
            <ProgressBar
              value={summary.percent}
              label={`${summary.completedLessons}/${summary.totalLessons} lessons`}
            />
          </div>
        )}
      </Link>
    );
  };

  return (
    <div>
      <div className="card p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="catalog-search">
              Search
            </label>
            <input
              id="catalog-search"
              className="input"
              placeholder="git, prompts, sql, testing..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="catalog-category">
              Category
            </label>
            <select
              id="catalog-category"
              className="input"
              value={category}
              onChange={(event) => setCategory(event.target.value as CategoryFilter)}
            >
              <option value="all">All categories</option>
              {CATEGORY_ORDER.map((item) => (
                <option key={item} value={item}>
                  {CATEGORY_LABELS[item]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="catalog-level">
              Level
            </label>
            <select
              id="catalog-level"
              className="input"
              value={level}
              onChange={(event) => setLevel(event.target.value as LevelFilter)}
            >
              <option value="all">Any level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <span className="label">Background</span>
            <div className="flex gap-1.5">
              {(["all", "cs", "non-cs"] as AudienceFilter[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setAudience(item)}
                  className={cn(
                    "btn btn-sm flex-1",
                    audience === item ? "btn-primary" : "btn-secondary",
                  )}
                >
                  {item === "all" ? "Any" : item === "cs" ? "CS" : "Non-CS"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-3 text-xs text-slate-500">
          {results.length} course{results.length === 1 ? "" : "s"} match. Every course works in any
          modern browser and needs no account.
        </p>
      </div>

      {generated.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-fuchsia-200">
            Generated for your topics
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {generated.map(renderCard)}
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
          Curated courses
        </h2>
        {curated.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            Nothing matched those filters. Try clearing the search, or{" "}
            <Link href="/create" className="link">
              generate a course for your topic
            </Link>
            .
          </p>
        ) : (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {curated.map(renderCard)}
          </div>
        )}
      </section>

    </div>
  );
}
