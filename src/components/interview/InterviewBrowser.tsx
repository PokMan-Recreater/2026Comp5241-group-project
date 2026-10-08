"use client";

import { useState } from "react";
import { ROLE_PLAY_SCENARIOS } from "@/content";
import { RolePlayRunner } from "@/components/interview/RolePlayRunner";
import { useAppData } from "@/components/providers/AppDataProvider";
import { cn } from "@/lib/utils";

/** Scenario picker plus the role-play runner. Attempts are stored for the dashboard. */
export function InterviewBrowser() {
  const { recordInterview } = useAppData();
  const [selectedId, setSelectedId] = useState(ROLE_PLAY_SCENARIOS[0].id);

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <aside className="space-y-2">
        {ROLE_PLAY_SCENARIOS.map((scenario) => (
          <button
            key={scenario.id}
            type="button"
            onClick={() => setSelectedId(scenario.id)}
            className={cn(
              "w-full rounded-xl border p-3 text-left transition",
              selectedId === scenario.id
                ? "border-rose-400/50 bg-rose-500/10"
                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
            )}
          >
            <p className="text-sm font-semibold text-white">{scenario.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {scenario.role} · {scenario.difficulty}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {scenario.questions.length} questions ·{" "}
              {scenario.audience.includes("non-cs") ? "non-CS friendly" : "CS focus"}
            </p>
          </button>
        ))}
      </aside>

      <div>
        <RolePlayRunner
          key={selectedId}
          scenarioId={selectedId}
          onFinish={(score, scenario) => recordInterview(scenario.id, scenario.title, score)}
        />
      </div>
    </div>
  );
}
