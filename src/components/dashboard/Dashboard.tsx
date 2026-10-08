"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Course, Lesson } from "@/types";
import { curatedCourses } from "@/content";
import { useAppData } from "@/components/providers/AppDataProvider";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import {
  computeCourseProgress,
  computePathProgress,
  countCompletedLessons,
  earnedBadges,
  estimateRemainingWeeks,
  levelFromXp,
  nextPathStep,
} from "@/lib/progress";
import { cn, formatMinutes } from "@/lib/utils";

/** Progress hub: level, streak, badges, bookmarks and the single next action. */
export function Dashboard() {
  const {
    ready,
    profile,
    progress,
    paths,
    activePath,
    allCourses,
    resetProgress,
  } = useAppData();

  const level = levelFromXp(progress.xp);
  const badges = useMemo(() => earnedBadges(progress, allCourses), [progress, allCourses]);
  const completedLessons = countCompletedLessons(progress);
  const passedChallenges = Object.values(progress.challenges).filter((item) => item.passed).length;
  const bestInterview = progress.interviews.reduce((best, item) => Math.max(best, item.score), 0);
  const pathSummary = activePath ? computePathProgress(activePath, progress) : null;
  const nextStep = activePath ? nextPathStep(activePath, progress) : null;

  const inProgress = useMemo(
    () =>
      allCourses
        .map((course) => ({ course, summary: computeCourseProgress(course, progress) }))
        .filter((entry) => entry.summary.completedLessons > 0 && entry.summary.percent < 100)
        .sort((a, b) => b.summary.completedLessons - a.summary.completedLessons)
        .slice(0, 4),
    [allCourses, progress],
  );

  const bookmarked = useMemo(() => {
    const entries: { course: Course; lesson: Lesson; key: string }[] = [];
    for (const key of progress.bookmarks) {
      const [courseId, lessonId] = key.split("::");
      const course = allCourses.find((item) => item.id === courseId);
      const lesson = course?.modules
        .flatMap((module) => module.lessons)
        .find((item) => item.id === lessonId);
      if (course && lesson) entries.push({ course, lesson, key });
    }
    return entries.slice(0, 6);
  }, [progress.bookmarks, allCourses]);

  const recommended = curatedCourses
    .filter((course) => {
      if (!profile) return true;
      return course.audience.includes(profile.audience);
    })
    .slice(0, 3);

  if (!ready) {
    return <p className="text-sm text-slate-400">Loading your progress…</p>;
  }

  return (
    <div className="space-y-8">
      <section className="card p-5">
        <div className="flex flex-wrap items-center gap-6">
          <ProgressRing value={level.progressPercent} size={104}>
            <div>
              <p className="text-2xl font-bold text-white">Lv{level.level}</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">{level.title}</p>
            </div>
          </ProgressRing>

          <div className="min-w-0 flex-1">
            <h2 className="text-xl font-bold text-white">
              {profile ? `Welcome back, ${profile.displayName}` : "Welcome to your dashboard"}
            </h2>
            <p className="mt-1 text-[13px] text-slate-400">
              {progress.xp} XP total · {level.xpForNextLevel - level.xpIntoLevel} XP to level{" "}
              {level.level + 1}
              {progress.streakDays > 0 ? ` · ${progress.streakDays} day streak` : ""}
            </p>
            <div className="mt-3 max-w-md">
              <ProgressBar value={level.progressPercent} />
            </div>
            {!profile && (
              <Link href="/onboarding" className="btn btn-primary btn-sm mt-4">
                Personalise my learning
              </Link>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Lessons complete", value: completedLessons, icon: "✅" },
          { label: "Challenges passed", value: passedChallenges, icon: "🐞" },
          { label: "Best interview", value: `${bestInterview}%`, icon: "🎤" },
          {
            label: "Paths generated",
            value: paths.length,
            icon: "🧭",
          },
        ].map((stat) => (
          <div key={stat.label} className="card p-4">
            <p className="text-lg">{stat.icon}</p>
            <p className="mt-1 text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-slate-500">{stat.label}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Continue learning
          </h3>
          {nextStep && activePath && pathSummary ? (
            <>
              <p className="mt-3 text-lg font-semibold text-white">{nextStep.title}</p>
              <p className="text-xs text-slate-500">from {activePath.title}</p>
              <div className="mt-3">
                <ProgressBar
                  value={pathSummary.percent}
                  label={`${pathSummary.completedLessons}/${pathSummary.totalLessons} path lessons`}
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/courses/${nextStep.courseSlug}/${nextStep.lessonId}`}
                  className="btn btn-primary btn-sm"
                >
                  Open next lesson →
                </Link>
                <Link href={`/paths/${activePath.id}`} className="btn btn-secondary btn-sm">
                  View full plan
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-[14px] leading-7 text-slate-400">
                No active path yet. Generate one from a topic and it will show up here with the next
                lesson ready to open.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/onboarding" className="btn btn-primary btn-sm">
                  Build a path
                </Link>
                <Link href="/catalog" className="btn btn-secondary btn-sm">
                  Browse courses
                </Link>
              </div>
            </>
          )}
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Courses in progress
          </h3>
          {inProgress.length === 0 ? (
            <p className="mt-3 text-[13px] text-slate-400">Nothing started yet.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {inProgress.map(({ course, summary }) => (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="text-[13px] font-medium text-white hover:text-brand-200"
                  >
                    {course.icon} {course.title}
                  </Link>
                  <div className="mt-1.5">
                    <ProgressBar
                      value={summary.percent}
                      label={`${summary.completedLessons}/${summary.totalLessons}`}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Badges</h3>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {badges.map((badge) => (
              <li
                key={badge.id}
                className={cn(
                  "rounded-xl border p-3",
                  badge.earned
                    ? "border-amber-400/40 bg-amber-500/10"
                    : "border-white/10 bg-white/[0.02] opacity-60",
                )}
              >
                <p className="text-sm font-semibold text-white">
                  {badge.icon} {badge.label}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">{badge.description}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Mock interview history
          </h3>
          {progress.interviews.length === 0 ? (
            <p className="mt-3 text-[13px] text-slate-400">
              No attempts yet.{" "}
              <Link href="/interview" className="link">
                Try one
              </Link>
              .
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {[...progress.interviews]
                .reverse()
                .slice(0, 5)
                .map((attempt) => (
                  <li
                    key={attempt.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2"
                  >
                    <span className="truncate text-[12px] text-slate-300">{attempt.scenarioTitle}</span>
                    <span
                      className={cn(
                        "ml-2 shrink-0 text-[12px] font-semibold",
                        attempt.score >= 75 ? "text-emerald-300" : "text-amber-300",
                      )}
                    >
                      {attempt.score}%
                    </span>
                  </li>
                ))}
            </ul>
          )}

          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Saved lessons
          </h3>
          {bookmarked.length === 0 ? (
            <p className="mt-2 text-[13px] text-slate-400">
              Use ☆ Save on any lesson to keep it here.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {bookmarked.map((entry) => (
                <li key={entry.key}>
                  <Link
                    href={`/courses/${entry.course.slug}/${entry.lesson.id}`}
                    className="text-[12px] text-slate-300 hover:text-white"
                  >
                    ★ {entry.lesson.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="card p-5">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
            Recommended next
          </h3>
          {activePath && pathSummary && pathSummary.percent < 100 && (
            <span className="text-xs text-slate-500">
              about {estimateRemainingWeeks(pathSummary.totalMinutes - pathSummary.completedMinutes, activePath.weeklyMinutes)}{" "}
              week(s) left at {formatMinutes(activePath.weeklyMinutes)} per week
            </span>
          )}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {recommended.map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-3 hover:bg-white/[0.06]"
            >
              <p className="text-sm font-semibold text-white">
                {course.icon} {course.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {course.level} · {formatMinutes(course.estimatedMinutes)}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
          <p className="text-xs text-slate-500">
            Progress lives in this browser only. Resetting clears lessons, XP, badges and interview
            history.
          </p>
          <button
            type="button"
            className="btn btn-ghost btn-sm ml-auto text-rose-200"
            onClick={() => {
              if (typeof window !== "undefined" && window.confirm("Reset all progress?")) {
                resetProgress();
              }
            }}
          >
            Reset progress
          </button>
        </div>
      </section>

    </div>
  );
}
