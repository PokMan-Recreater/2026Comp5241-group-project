"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Prompt Quality Lab.
 *
 * Scores a prompt against the six signals that make prompts reliable, then shows
 * a rewritten version with the missing parts filled in. The rubric is
 * deterministic, so learners can iterate and compare scores honestly.
 */

interface Signal {
  id: string;
  label: string;
  weight: number;
  tip: string;
  test: (text: string) => boolean;
}

const SIGNALS: Signal[] = [
  {
    id: "role",
    label: "Role & audience",
    weight: 20,
    tip: "Say who the output is for: 'You are a ... writing for ...'",
    test: (text) => /\b(you are|act as|as an? |for (a|an|the) |audience)\b/i.test(text),
  },
  {
    id: "context",
    label: "Material to work from",
    weight: 20,
    tip: "Paste or describe the source material instead of referring to it vaguely.",
    test: (text) => text.trim().split(/\s+/).filter(Boolean).length >= 25,
  },
  {
    id: "format",
    label: "Exact output format",
    weight: 20,
    tip: "Name the shape: 'exactly three bullets, max 20 words each'.",
    test: (text) =>
      /\b(json|bullet|bullets|table|list|paragraph|sentences?|words|lines|columns|markdown|headings?)\b/i.test(
        text,
      ),
  },
  {
    id: "constraints",
    label: "Constraints",
    weight: 20,
    tip: "Add a limit and a prohibition: 'no jargon, do not invent figures'.",
    test: (text) =>
      /\b(do not|don't|never|avoid|no more than|at most|maximum|only|must not)\b/i.test(text),
  },
  {
    id: "example",
    label: "Worked example",
    weight: 10,
    tip: "Give one example of a good answer to anchor the style.",
    test: (text) => /\b(for example|e\.g\.|example:|like this|sample)\b/i.test(text),
  },
  {
    id: "detail",
    label: "Enough detail",
    weight: 10,
    tip: "Prompts under about 120 characters rarely carry enough instruction.",
    test: (text) => text.trim().length >= 120,
  },
];

const TEMPLATES = [
  {
    id: "summary",
    label: "Summarise a report for a busy executive",
    draft: "Summarise this report for my boss.",
  },
  {
    id: "release",
    label: "Write release notes from a changelog",
    draft: "Write release notes from the changelog.",
  },
  {
    id: "explain",
    label: "Explain a technical idea to a non-technical team",
    draft: "Explain vector databases to the marketing team.",
  },
];

function rewrite(prompt: string, missing: string[]): string {
  const lines = [prompt.trim()];
  if (missing.includes("role")) {
    lines.push("\nYou are an experienced analyst writing for a busy executive audience.");
  }
  if (missing.includes("context")) {
    lines.push(
      "\nHere is the material to work from:\n<material>\n{{paste the text here}}\n</material>",
    );
  }
  if (missing.includes("format")) {
    lines.push(
      "\nReply with exactly three bullet points, each under 20 words, followed by one recommended next step.",
    );
  }
  if (missing.includes("constraints")) {
    lines.push(
      "\nDo not invent any figure that is not in the material. No jargon. Maximum 120 words.",
    );
  }
  if (missing.includes("example")) {
    lines.push(
      '\nExample of the style I want: "Costs rose 12% in Q3, driven by support volume. Recommend pausing the pilot until December."',
    );
  }
  if (missing.includes("detail")) {
    lines.push("\nRead the whole material before answering.");
  }
  return lines.join("\n");
}

export function PromptLabSimulator() {
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id);
  const [prompt, setPrompt] = useState(TEMPLATES[0].draft);

  const template = TEMPLATES.find((item) => item.id === templateId) ?? TEMPLATES[0];

  const { score, results, missing } = useMemo(() => {
    const evaluated = SIGNALS.map((signal) => ({ signal, passed: signal.test(prompt) }));
    return {
      score: evaluated.reduce((total, item) => total + (item.passed ? item.signal.weight : 0), 0),
      results: evaluated,
      missing: evaluated.filter((item) => !item.passed).map((item) => item.signal.id),
    };
  }, [prompt]);

  const verdict =
    score >= 90
      ? { label: "Production ready", tone: "text-emerald-300" }
      : score >= 70
        ? { label: "Solid, missing detail", tone: "text-sky-300" }
        : score >= 40
          ? { label: "Ambiguous", tone: "text-amber-300" }
          : { label: "The model will guess", tone: "text-rose-300" };

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-end gap-3">
        <div className="min-w-[16rem] flex-1">
          <label className="label" htmlFor="prompt-task">
            Task
          </label>
          <select
            id="prompt-task"
            className="input"
            value={templateId}
            onChange={(event) => {
              const next = TEMPLATES.find((item) => item.id === event.target.value);
              setTemplateId(event.target.value);
              if (next) setPrompt(next.draft);
            }}
          >
            {TEMPLATES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setPrompt(rewrite(prompt, missing))}
        >
          ✨ Apply suggested rewrite
        </button>
      </div>

      <label className="label mt-4" htmlFor="prompt-input">
        Your prompt
      </label>
      <textarea
        id="prompt-input"
        className="input min-h-36 font-mono text-[13px] leading-6"
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        spellCheck={false}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-sm text-slate-400">/ 100</span>
        <span className={cn("text-sm font-semibold", verdict.tone)}>{verdict.label}</span>
      </div>

      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {results.map(({ signal, passed }) => (
          <li
            key={signal.id}
            className={cn(
              "rounded-xl border p-3 text-[13px]",
              passed
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                : "border-white/10 bg-white/[0.03] text-slate-300",
            )}
          >
            <p className="font-semibold">
              {passed ? "✓" : "○"} {signal.label}{" "}
              <span className="text-xs font-normal opacity-70">+{signal.weight}</span>
            </p>
            {!passed && <p className="mt-1 text-slate-400">{signal.tip}</p>}
          </li>
        ))}
      </ul>

      {missing.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/10 bg-ink-900/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Suggested rewrite for: {template.label}
          </p>
          <pre className="mt-2 whitespace-pre-wrap font-mono text-[12px] leading-6 text-slate-300">
            {rewrite(prompt, missing)}
          </pre>
        </div>
      )}

      {missing.length === 0 && (
        <p className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-[13px] text-emerald-100">
          All six signals present. This prompt states the audience, supplies the material, fixes the
          format, sets constraints, anchors the style and carries enough detail.
        </p>
      )}

    </div>
  );
}
