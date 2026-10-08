"use client";

import Link from "next/link";
import { useAppData } from "@/components/providers/AppDataProvider";
import { ProgressBar, ProgressRing } from "@/components/ui/Progress";
import { computePathProgress, lessonKey, nextPathStep } from "@/lib/progress";
import { cn, formatMinutes } from "@/lib/utils";

/**
 * A single generated path: the schedule the learner was given, grouped by module,
 * plus the rationale the generator produced.
 */
export function PathDetail({ pathId }: { pathId: string }) {
  const { ready, paths, progress, toggleLessonComplete, setActivePath, activePath } = useAppData();
  const path = paths.find((item) => item.id === pathId);

  if (!ready) {
    return <p className="mx-auto max-w-4xl px-4 py-16 text-sm text-slate-400">Loading path…</p>;
  }

  if (!path) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20">
        <h1 className="section-title">Path not found</h1>
        <p className="mt-3 text-sm text-slate-400">
          Paths are stored in this browser. If you created it elsewhere, generate it again from the
          same topic.
        </p>
        <div className="mt-6 flex gap-3">
          <Link href="/paths" className="btn btn-primary">
            My paths
          </Link>
          <Link href="/create" className="btn btn-secondary">
            Generate a new path
          </Link>
        </div>
      </div>
    );
  }

  const summary = computePathProgress(path, progress);
  const next = nextPathStep(path, progress);
  const isActive = activePath?.id === path.id;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <nav className="text-xs text-slate-500">
        <Link href="/paths" className="hover:text-white">
          My paths
        </Link>
        <span className="mx-2">/</span>
        <span className="text-slate-400">{path.topic}</span>
      </nav>

      <header className="mt-4 flex flex-wrap items-start gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {isActive && <span className="chip border-brand-400/50 text-brand-100">active path</span>}
            <span className="chip">{path.weeks} weeks</span>
            <span className="chip">{path.weeklyMinutes} min/week</span>
            <span className="chip">{formatMinutes(path.estimatedMinutes)} total</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">{path.title}</h1>
          <p className="mt-2 text-[15px] leading-7 text-slate-300">{path.summary}</p>

          <div className="mt-4 rounded-xl border border-brand-400/25 bg-brand-500/[0.08] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-200">
              Why this path looks like this
            </p>
            <p className="mt-1.5 text-[13px] leading-6 text-slate-200">{path.rationale}</p>
          </div>
        </div>

        <aside className="card p-5">
          <ProgressRing value={summary.percent}>
            <div>
              <p className="text-xl font-bold text-white">{summary.percent}%</p>
              <p className="text-[10px] uppercase tracking-wider text-slate-500">complete</p>
            </div>
          </ProgressRing>
          <p className="mt-3 text-center text-xs text-slate-400">
            {summary.completedLessons}/{summary.totalLessons} lessons
          </p>
          {next ? (
            <Link
              href={`/courses/${next.courseSlug}/${next.lessonId}`}
              className="btn btn-primary mt-4 w-full"
            >
              {summary.completedLessons === 0 ? "Start path" : "Continue"} →
            </Link>
          ) : (
            <Link href="/interview" className="btn btn-secondary mt-4 w-full">
              Path finished - mock interview →
            </Link>
          )}
          {!isActive && (
            <button
              type="button"
              className="btn btn-ghost mt-2 w-full"
              onClick={() => setActivePath(path.id)}
            >
              Make this my active path
            </button>
          )}
        </aside>
      </header>

      <section className="mt-10 space-y-6">
        {path.modules.map((module) => (
          <div key={module.id}>
            <h2 className="text-lg font-semibold text-white">{module.title}</h2>
            <p className="text-xs text-slate-500">{module.summary}</p>

            <ul className="mt-3 space-y-2">
              {module.steps.map((step) => {
                const key = lessonKey(step.courseId, step.lessonId);
                const done = progress.lessons[key]?.completed ?? false;
                return (
                  <li
                    key={key}
                    className={cn(
                      "flex flex-wrap items-center gap-3 rounded-xl border p-3.5",
                      done
                        ? "border-emerald-400/25 bg-emerald-500/[0.07]"
                        : "border-white/10 bg-white/[0.03]",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => toggleLessonComplete(step.courseId, step.lessonId)}
                      aria-label={done ? "Mark as not done" : "Mark as done"}
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-full border text-xs",
                        done
                          ? "border-emerald-400/60 bg-emerald-500/30 text-emerald-100"
                          : "border-white/20 text-transparent hover:border-brand-400",
                      )}
                    >
                      ✓
                    </button>
                    <Link
                      href={`/courses/${step.courseSlug}/${step.lessonId}`}
                      className="min-w-0 flex-1"
                    >
                      <p className="text-sm font-medium text-white">{step.title}</p>
                      <p className="text-xs text-slate-500">
                        week {step.week} · {step.courseTitle} · {formatMinutes(step.minutes)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{step.focus}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </section>


      <div className="mt-10">
        <ProgressBar value={summary.percent} label="Path progress" />
      </div>
    </div>
  );
}
