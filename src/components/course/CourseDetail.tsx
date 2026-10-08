"use client";

import Link from "next/link";
import { CATEGORY_LABELS } from "@/content";
import { useAppData } from "@/components/providers/AppDataProvider";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { computeCourseProgress, lessonKey, nextLessonInCourse } from "@/lib/progress";
import { cn, formatMinutes } from "@/lib/utils";

/**
 * Course overview: syllabus, progress and one obvious next action. Works for
 * curated courses and for courses generated from a custom topic.
 */
export function CourseDetail({ slug }: { slug: string }) {
  const { ready, findCourse, progress, toggleLessonComplete } = useAppData();
  const course = findCourse(slug);

  if (!course) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="section-title">Course not found</h1>
        <p className="mt-3 text-sm text-slate-400">
          If this was a generated course, it lives in the browser profile that created it.
        </p>
        <Link href="/catalog" className="btn btn-primary mt-6">
          Back to the catalogue
        </Link>
      </div>
    );
  }

  const summary = computeCourseProgress(course, progress);
  const next = nextLessonInCourse(course, progress);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <nav className="text-xs text-slate-500">
        <Link href="/catalog" className="hover:text-white">
          Catalogue
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-400">{CATEGORY_LABELS[course.category]}</span>
      </nav>

      <header className="mt-4 flex flex-wrap items-start gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <span
              className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${course.accent} text-2xl`}
            >
              {course.icon}
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {course.title}
              </h1>
              <p className="mt-1 text-sm text-slate-400">{course.subtitle}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            <span className="chip">{course.level}</span>
            <span className="chip">{formatMinutes(course.estimatedMinutes)}</span>
            <span className="chip">{summary.totalLessons} lessons</span>
            {course.audience.map((item) => (
              <span key={item} className="chip">
                {item === "cs" ? "CS learners" : "non-CS learners"}
              </span>
            ))}
            {course.origin === "custom" && (
              <span className="chip border-fuchsia-400/40 text-fuchsia-200">
                generated for your topic
              </span>
            )}
          </div>

          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300">
            {course.description}
          </p>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {course.outcomes.map((outcome) => (
              <li key={outcome} className="text-[13px] leading-6 text-slate-400">
                ✓ {outcome}
              </li>
            ))}
          </ul>
        </div>

        <aside className="card p-5">
          <ProgressRing value={ready ? summary.percent : 0}>
            <div>
              <p className="text-xl font-bold text-white">{ready ? summary.percent : 0}%</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">complete</p>
            </div>
          </ProgressRing>
          <p className="mt-3 text-center text-xs text-slate-400">
            {summary.completedLessons} of {summary.totalLessons} lessons ·{" "}
            {formatMinutes(summary.completedMinutes)} done
          </p>
          {next ? (
            <Link
              href={`/courses/${course.slug}/${next.lesson.id}`}
              className="btn btn-primary mt-4 w-full"
            >
              {summary.completedLessons === 0 ? "Start course" : "Continue"} →
            </Link>
          ) : (
            <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center text-xs text-emerald-100">
              Course complete. Try a mock interview to turn it into a story.
            </p>
          )}
        </aside>
      </header>

      <section className="mt-10 space-y-6">
        {course.modules.map((module) => (
          <div key={module.id}>
            <div className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-lg font-semibold text-white">{module.title}</h2>
              <p className="text-xs text-slate-500">{module.summary}</p>
            </div>

            <ul className="mt-3 space-y-2">
              {module.lessons.map((lesson) => {
                const key = lessonKey(course.id, lesson.id);
                const record = progress.lessons[key];
                const done = record?.completed ?? false;
                return (
                  <li
                    key={lesson.id}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-xl border p-3.5",
                      done
                        ? "border-emerald-400/25 bg-emerald-500/[0.07]"
                        : "border-white/10 bg-white/[0.03]",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleLessonComplete(course.id, lesson.id)}
                      aria-label={
                        done
                          ? `Mark ${lesson.title} as not done`
                          : `Mark ${lesson.title} as done`
                      }
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs",
                        done
                          ? "border-emerald-400/60 bg-emerald-500/30 text-emerald-100"
                          : "border-white/20 text-transparent hover:border-brand-400",
                      )}
                    >
                      ✓
                    </button>

                    <Link href={`/courses/${course.slug}/${lesson.id}`} className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-white">{lesson.title}</p>
                      <p className="text-xs text-slate-500">
                        {formatMinutes(lesson.minutes)} · {lesson.blocks.length} blocks
                        {record?.quizTotal
                          ? ` · quiz best ${record.quizScore}/${record.quizTotal}`
                          : ""}
                      </p>
                    </Link>

                    {done && (
                      <span className="chip border-emerald-400/40 text-emerald-200">done</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>

      <div className="mt-10">
        <ProgressBar value={summary.percent} label="Course progress" />
      </div>

    </div>
  );
}
