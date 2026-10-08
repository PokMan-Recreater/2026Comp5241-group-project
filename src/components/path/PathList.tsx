"use client";

import Link from "next/link";
import { useAppData } from "@/components/providers/AppDataProvider";
import { ProgressBar } from "@/components/ui/Progress";
import { computePathProgress, nextPathStep } from "@/lib/progress";
import { cn, formatMinutes } from "@/lib/utils";

/** All generated paths, with the next step of each one ready to click. */
export function PathList() {
  const { ready, paths, progress, activePath, setActivePath, deletePath, profile } = useAppData();

  if (!ready) {
    return <p className="text-sm text-slate-400">Loading your paths…</p>;
  }

  if (paths.length === 0) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-white">No paths yet</h2>
        <p className="mt-2 text-[14px] leading-7 text-slate-400">
          A path turns a topic into a schedule: lessons ordered into modules, spread across the weeks
          your study time allows, ending with interview rehearsal.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/onboarding" className="btn btn-primary">
            Build my first path
          </Link>
          <Link href="/create" className="btn btn-secondary">
            Start from a custom topic
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {profile && (
        <p className="text-sm text-slate-400">
          {profile.displayName}, you have {paths.length} path{paths.length === 1 ? "" : "s"} ·{" "}
          {profile.weeklyMinutes} minutes a week · {profile.audience === "cs" ? "CS" : "non-CS"}{" "}
          background
        </p>
      )}

      {paths.map((path) => {
        const summary = computePathProgress(path, progress);
        const next = nextPathStep(path, progress);
        const isActive = activePath?.id === path.id;
        return (
          <article
            key={path.id}
            className={cn(
              "card p-5",
              isActive && "border-brand-400/40 bg-brand-500/[0.07]",
            )}
          >
            <div className="flex flex-wrap items-center gap-2">
              {isActive && <span className="chip border-brand-400/50 text-brand-100">active</span>}
              <span className="chip">{path.weeks} weeks</span>
              <span className="chip">{path.weeklyMinutes} min/week</span>
              <span className="chip">{formatMinutes(path.estimatedMinutes)}</span>
              <span className="chip">{path.level}</span>
              <span className="chip">{path.source === "curated" ? "curated" : "generated"}</span>
            </div>

            <h2 className="mt-3 text-lg font-semibold text-white">{path.title}</h2>
            <p className="mt-1 text-[13px] leading-6 text-slate-400">{path.summary}</p>

            <div className="mt-4">
              <ProgressBar
                value={summary.percent}
                label={`${summary.completedLessons}/${summary.totalLessons} lessons complete`}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {next ? (
                <Link
                  href={`/courses/${next.courseSlug}/${next.lessonId}`}
                  className="btn btn-primary btn-sm"
                >
                  {summary.completedLessons === 0 ? "Start" : "Continue"}: {next.title} →
                </Link>
              ) : (
                <span className="chip border-emerald-400/40 text-emerald-200">path complete</span>
              )}
              <Link href={`/paths/${path.id}`} className="btn btn-secondary btn-sm">
                View plan
              </Link>
              {!isActive && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setActivePath(path.id)}
                >
                  Make active
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm ml-auto text-rose-200"
                onClick={() => deletePath(path.id)}
              >
                Delete
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
