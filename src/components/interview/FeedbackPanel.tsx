"use client";

import type { RubricResult } from "@/lib/rubric";
import { scoreBand } from "@/lib/rubric";
import { cn } from "@/lib/utils";

/** Rubric feedback for a single interview answer. */
export function FeedbackPanel({ result }: { result: RubricResult }) {
  const band = scoreBand(result.score);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl font-bold text-white">{result.score}</span>
        <span className="text-xs text-slate-400">/ 100</span>
        <span className={cn("text-sm font-semibold", band.tone)}>{band.label}</span>
        <span className="ml-auto text-xs text-slate-500">{result.wordCount} words</span>
      </div>

      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {result.signals.map((signal) => (
          <li
            key={signal.id}
            className={cn(
              "rounded-lg border p-2.5 text-[12px] leading-5",
              signal.hit
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                : "border-amber-400/30 bg-amber-500/10 text-amber-100",
            )}
          >
            <span className="mr-1">{signal.hit ? "✓" : "→"}</span>
            <span className="font-semibold">{signal.label}:</span> {signal.detail}
          </li>
        ))}
      </ul>

      {result.improvements.length > 0 && (
        <div className="mt-3 rounded-lg border border-white/10 bg-ink-900/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Model answer would cover
          </p>
          <ul className="mt-1.5 space-y-1 text-[12px] leading-5 text-slate-300">
            {result.modelOutline.map((line) => (
              <li key={line}>• {line}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
