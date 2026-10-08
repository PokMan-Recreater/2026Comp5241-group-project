"use client";

import Link from "next/link";
import { useState } from "react";
import type { SimulationId } from "@/types";
import { SIMULATIONS } from "@/content";
import { SimulationHost } from "@/components/simulations/SimulationHost";
import { cn } from "@/lib/utils";

/**
 * Every interactive lab in one place, with the lessons that use it. Useful for a
 * quick demo and for revision when you do not remember which lesson had the
 * pipeline exercise.
 */
export function LabsBrowser() {
  const [selected, setSelected] = useState<SimulationId>(SIMULATIONS[0].id);
  const active = SIMULATIONS.find((simulation) => simulation.id === selected) ?? SIMULATIONS[0];

  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
      <aside className="space-y-2">
        {SIMULATIONS.map((simulation) => (
          <button
            key={simulation.id}
            type="button"
            onClick={() => setSelected(simulation.id)}
            className={cn(
              "w-full rounded-xl border p-3 text-left transition",
              selected === simulation.id
                ? "border-brand-400/50 bg-brand-500/10"
                : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
            )}
          >
            <p className="text-sm font-semibold text-white">{simulation.title}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {simulation.skill} · {simulation.minutes} min
            </p>
          </button>
        ))}
        <Link href="/catalog" className="btn btn-ghost btn-sm mt-2 w-full">
          Find these inside lessons →
        </Link>
      </aside>

      <div>
        <h2 className="text-xl font-bold text-white">{active.title}</h2>
        <p className="mt-1.5 max-w-2xl text-[14px] leading-7 text-slate-400">{active.description}</p>
        <div className="mt-4">
          <SimulationHost simulationId={active.id} />
        </div>
      </div>
    </div>
  );
}
