"use client";

import { useState } from "react";
import type { LessonBlock } from "@/types";
import { getChallenge, getScenario, getSimulation } from "@/content";
import { CodeChallengeRunner } from "@/components/code/CodeChallengeRunner";
import { RolePlayRunner } from "@/components/interview/RolePlayRunner";
import { QuizBlockView } from "@/components/lesson/QuizBlockView";
import { SimulationHost } from "@/components/simulations/SimulationHost";
import { splitSentences } from "@/lib/utils";

/**
 * Renders a lesson's content blocks. Text blocks support narration highlighting:
 * the active sentence is wrapped in a span so learners can follow the audio.
 */

export interface HighlightTarget {
  blockIndex: number;
  paraIndex: number;
  sentenceIndex: number;
}

export function LessonBlocks({
  blocks,
  highlight,
  onQuizAnswered,
  onChallengeResult,
  onInterviewFinished,
}: {
  blocks: LessonBlock[];
  highlight?: HighlightTarget | null;
  onQuizAnswered?: (correct: boolean) => void;
  onChallengeResult?: (challengeId: string, passed: boolean, code: string) => void;
  onInterviewFinished?: (score: number, title: string) => void;
}) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-5">
      {blocks.map((block, blockIndex) => {
        switch (block.kind) {
          case "text":
            return (
              <section key={blockIndex} className="lesson-prose">
                {block.heading && (
                  <h3 className="mb-2 text-lg font-semibold text-white">{block.heading}</h3>
                )}
                {block.body.map((paragraph, paraIndex) => {
                  const active =
                    highlight &&
                    highlight.blockIndex === blockIndex &&
                    highlight.paraIndex === paraIndex;
                  return (
                    <p key={paraIndex}>
                      {active
                        ? splitSentences(paragraph).map((sentence, sentenceIndex) => (
                            <span
                              key={sentenceIndex}
                              className={sentenceIndex === highlight.sentenceIndex ? "sentence-active" : undefined}
                            >
                              {sentence}{" "}
                            </span>
                          ))
                        : paragraph}
                    </p>
                  );
                })}
              </section>
            );

          case "callout": {
            const tone = {
              info: "border-sky-400/30 bg-sky-500/10 text-sky-100",
              tip: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
              warning: "border-amber-400/30 bg-amber-500/10 text-amber-100",
            }[block.tone];
            const icon = { info: "ℹ", tip: "💡", warning: "⚠" }[block.tone];
            return (
              <aside key={blockIndex} className={`rounded-xl border p-4 ${tone}`}>
                <p className="text-sm font-semibold">
                  {icon} {block.title}
                </p>
                <p className="mt-1 text-[13px] leading-6">{block.body}</p>
              </aside>
            );
          }

          case "code":
            return (
              <figure key={blockIndex} className="overflow-hidden rounded-xl border border-white/10 bg-black/50">
                <figcaption className="flex items-center gap-2 border-b border-white/10 px-3 py-2 text-xs text-slate-400">
                  <span className="chip">{block.language}</span>
                  {block.caption}
                </figcaption>
                <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-6 text-slate-200">
                  {block.code}
                </pre>
              </figure>
            );

          case "checklist":
            return (
              <div key={blockIndex} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-sm font-semibold text-white">☑ {block.title}</p>
                <ul className="mt-2 space-y-1.5">
                  {block.items.map((item) => {
                    const key = `${blockIndex}-${item}`;
                    return (
                      <li key={key}>
                        <label className="flex cursor-pointer items-start gap-2.5 text-[13px] leading-6 text-slate-300">
                          <input
                            type="checkbox"
                            checked={Boolean(checked[key])}
                            onChange={() =>
                              setChecked((previous) => ({ ...previous, [key]: !previous[key] }))
                            }
                            className="mt-1 accent-indigo-400"
                          />
                          <span className={checked[key] ? "text-slate-500 line-through" : undefined}>
                            {item}
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );

          case "quiz":
            return (
              <QuizBlockView key={blockIndex} block={block} onAnswered={onQuizAnswered} />
            );

          case "simulation": {
            const meta = getSimulation(block.simulationId);
            return (
              <div key={blockIndex} className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip">🧪 Interactive lab</span>
                  {meta && <span className="chip">{meta.skill}</span>}
                  {meta && <span className="chip">~{meta.minutes} min</span>}
                </div>
                <h3 className="text-lg font-semibold text-white">{block.title}</h3>
                <p className="text-[13px] leading-6 text-slate-400">{block.description}</p>
                <SimulationHost simulationId={block.simulationId} />
              </div>
            );
          }

          case "challenge": {
            const challenge = getChallenge(block.challengeId);
            if (!challenge) return null;
            return (
              <CodeChallengeRunner
                key={blockIndex}
                challenge={challenge}
                onResult={(passed, code) => onChallengeResult?.(challenge.id, passed, code)}
              />
            );
          }

          case "roleplay": {
            const scenario = getScenario(block.scenarioId);
            if (!scenario) return null;
            return (
              <RolePlayRunner
                key={blockIndex}
                scenarioId={scenario.id}
                onFinish={(score, finished) => onInterviewFinished?.(score, finished.title)}
              />
            );
          }

          default:
            return null;

        }
      })}
    </div>
  );
}
