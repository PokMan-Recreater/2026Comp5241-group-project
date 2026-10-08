"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Broken CI Pipeline.
 *
 * Runs the five stages a real workflow runs, fails on a genuine assertion error,
 * and asks the learner to diagnose it from the log. Only one fix addresses the
 * cause; the others are the shortcuts people actually take.
 */

type StageStatus = "pending" | "running" | "passed" | "failed";

interface Stage {
  id: string;
  label: string;
  command: string;
  success: string;
}

const STAGES: Stage[] = [
  { id: "install", label: "Install", command: "npm ci", success: "added 412 packages in 8s" },
  { id: "lint", label: "Lint", command: "npm run lint", success: "✔ 0 problems (34 files checked)" },
  { id: "test", label: "Test", command: "npm test", success: "Tests: 24 passed, 24 total" },
  { id: "build", label: "Build", command: "npm run build", success: "Compiled successfully" },
  {
    id: "deploy",
    label: "Deploy",
    command: "vercel deploy --prod",
    success: "Production: https://skillforge.vercel.app",
  },
];

const FAILURE_LOG = [
  "FAIL src/lib/pricing.test.ts",
  "  ✕ applies the discount before tax",
  "    Expected: 19.99",
  "    Received: 20.00",
  "      at Object.<anonymous> (pricing.test.ts:14:21)",
  "",
  "Tests: 1 failed, 23 passed, 24 total",
];

interface Fix {
  id: string;
  label: string;
  correct: boolean;
  outcome: string;
}

const FIXES: Fix[] = [
  {
    id: "fix-code",
    label: "Fix the rounding order in pricing.ts, then push",
    correct: true,
    outcome:
      "Root cause addressed: the discount is applied before tax and the total is rounded once at the end. The test passes on the first run.",
  },
  {
    id: "fix-test",
    label: "Update the test to expect 20.00",
    correct: false,
    outcome:
      "The pipeline goes green, but you have encoded the bug as expected behaviour. Customers are still charged the wrong amount - the most expensive shortcut in the list.",
  },
  {
    id: "rerun",
    label: "Re-run the job without changing anything",
    correct: false,
    outcome:
      "It fails again with the identical assertion. This failure is deterministic, not flaky: re-running only delays the fix and burns CI minutes.",
  },
];

export function PipelineRunnerSimulator() {
  const [statuses, setStatuses] = useState<Record<string, StageStatus>>({});
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [failed, setFailed] = useState(false);
  const [green, setGreen] = useState(false);
  const [chosen, setChosen] = useState<Fix | null>(null);
  const [attempts, setAttempts] = useState(0);

  const run = async (skipTest: boolean) => {
    setRunning(true);
    setFailed(false);
    setGreen(false);
    setStatuses({});
    setLog(["$ git push origin main", "→ workflow 'CI' started"]);

    for (const stage of STAGES) {
      setStatuses((previous) => ({ ...previous, [stage.id]: "running" }));
      setLog((previous) => [...previous, `\n[${stage.label}] $ ${stage.command}`]);
      await new Promise((resolve) => setTimeout(resolve, 450));

      if (stage.id === "test" && !skipTest) {
        setStatuses((previous) => ({ ...previous, [stage.id]: "failed" }));
        setLog((previous) => [...previous, ...FAILURE_LOG]);
        setRunning(false);
        setFailed(true);
        return;
      }

      setStatuses((previous) => ({ ...previous, [stage.id]: "passed" }));
      setLog((previous) => [...previous, stage.success]);
    }

    setRunning(false);
    setGreen(true);
  };

  const applyFix = (fix: Fix) => {
    setChosen(fix);
    setAttempts((value) => value + 1);
    setLog((previous) => [...previous, `\n# ${fix.label}`, fix.outcome]);
    if (fix.correct) {
      void run(true);
    } else {
      setFailed(true);
    }
  };

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip">workflow: CI</span>
        <span className="chip">branch: main</span>
        <span className="chip">attempts: {attempts}</span>
        <button
          type="button"
          className="btn btn-primary btn-sm ml-auto"
          onClick={() => run(false)}
          disabled={running}
        >
          {running ? "Running…" : "▲ Push commit"}
        </button>
      </div>

      <ol className="mt-4 space-y-2">
        {STAGES.map((stage) => {
          const status = statuses[stage.id] ?? "pending";
          return (
            <li
              key={stage.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-sm",
                status === "passed" && "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
                status === "failed" && "border-rose-400/40 bg-rose-500/10 text-rose-100",
                status === "running" && "border-brand-400/40 bg-brand-500/10 text-brand-100",
                status === "pending" && "border-white/10 bg-white/[0.02] text-slate-400",
              )}
            >
              <span className="w-5 text-center">
                {status === "passed"
                  ? "✓"
                  : status === "failed"
                    ? "✗"
                    : status === "running"
                      ? "•"
                      : "○"}
              </span>
              <span className="font-semibold">{stage.label}</span>
              <code className="font-mono text-xs opacity-70">{stage.command}</code>
              {status === "failed" && <span className="ml-auto text-xs">failed</span>}
            </li>
          );
        })}
      </ol>

      {failed && (
        <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4">
          <p className="text-sm font-semibold text-rose-100">
            The Test stage failed. What do you do?
          </p>
          <div className="mt-3 grid gap-2">
            {FIXES.map((fix) => (
              <button
                key={fix.id}
                type="button"
                className="btn btn-secondary btn-sm justify-start text-left"
                onClick={() => applyFix(fix)}
                disabled={running}
              >
                {fix.label}
              </button>
            ))}
          </div>
          {chosen && !chosen.correct && (
            <p className="mt-3 text-[13px] text-rose-100/90">{chosen.outcome}</p>
          )}
        </div>
      )}

      {green && (
        <div className="mt-4 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-[13px] text-emerald-100">
          Pipeline green and deployed. The fix that mattered was correcting the cause in the code -
          not editing the assertion, and not re-running a deterministic failure.
        </div>
      )}

      <div className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[12px] leading-6 text-slate-300">
        {log.map((line, index) => (
          <p
            key={`${index}-${line.slice(0, 12)}`}
            className={cn(line.startsWith("$") && "text-white")}
          >
            {line || "\u00a0"}
          </p>
        ))}
      </div>

    </div>
  );
}
