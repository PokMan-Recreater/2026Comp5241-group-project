"use client";

import { useState } from "react";
import type { QuizBlock } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Lesson quiz. Reveals the explanation immediately after answering and reports
 * the result upwards so progress (and XP) can be recorded.
 */
export function QuizBlockView({
  block,
  onAnswered,
}: {
  block: QuizBlock;
  onAnswered?: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const revealed = selected !== null;
  const correct = selected === block.answerIndex;

  const choose = (index: number) => {
    if (revealed) return;
    setSelected(index);
    onAnswered?.(index === block.answerIndex);
  };

  return (
    <div className="card p-5">
      <div className="flex items-start gap-2">
        <span className="chip">Check your understanding</span>
      </div>
      <p className="mt-3 text-[15px] font-semibold text-white">{block.question}</p>

      <ul className="mt-3 space-y-2">
        {block.options.map((option, index) => {
          const isAnswer = index === block.answerIndex;
          const isChosen = index === selected;
          return (
            <li key={option}>
              <button
                type="button"
                onClick={() => choose(index)}
                disabled={revealed}
                className={cn(
                  "w-full rounded-xl border px-3.5 py-2.5 text-left text-sm transition",
                  !revealed && "border-white/10 bg-white/[0.03] hover:border-brand-400/50 hover:bg-white/[0.07]",
                  revealed && isAnswer && "border-emerald-400/50 bg-emerald-500/10 text-emerald-100",
                  revealed && isChosen && !isAnswer && "border-rose-400/50 bg-rose-500/10 text-rose-100",
                  revealed && !isAnswer && !isChosen && "border-white/5 bg-white/[0.02] text-slate-500",
                )}
              >
                <span className="mr-2 font-mono text-xs text-slate-500">
                  {String.fromCharCode(65 + index)}
                </span>
                {option}
                {revealed && isAnswer && <span className="ml-2">✓</span>}
                {revealed && isChosen && !isAnswer && <span className="ml-2">✗</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {revealed && (
        <div
          className={cn(
            "mt-4 rounded-xl border p-3.5 text-sm",
            correct
              ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
              : "border-amber-400/30 bg-amber-500/10 text-amber-100",
          )}
        >
          <p className="font-semibold">{correct ? "Correct" : "Not quite"}</p>
          <p className="mt-1 text-[13px] leading-6">{block.explanation}</p>
        </div>
      )}
    </div>
  );
}
