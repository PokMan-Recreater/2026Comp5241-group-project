"use client";

import { useState } from "react";
import type { Audience } from "@/types";
import { useAppData } from "@/components/providers/AppDataProvider";
import { buildExplainRequest } from "@/lib/ai/explain";

/**
 * "Explain this simply" - asks the server-side AI endpoint (the deterministic
 * offline engine by default) for a plain-language explanation of the current
 * topic, written for the learner's own level and background.
 *
 * Built for beginners who hit jargon. It reuses the existing `explain` task, so
 * there is no new API surface, no extra keys and no extra cost.
 *
 * Rendered inside a flex-wrap row: the trigger sits inline with its neighbours
 * and the answer panel wraps onto its own full-width line.
 */

const AUDIENCE_LABEL: Record<Audience, string> = { cs: "CS", "non-cs": "non-CS" };

export function ExplainButton({
  topic,
  label = "Explain this simply",
}: {
  topic: string;
  label?: string;
}) {
  const { profile } = useAppData();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [explanation, setExplanation] = useState("");
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ask = async () => {
    if (state === "loading") return;
    setState("loading");
    setError(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(buildExplainRequest(topic, profile)),
      });
      if (!response.ok) throw new Error("Request failed");

      const payload = (await response.json()) as {
        provider?: string;
        data?: { explanation?: string };
      };
      const text = payload.data?.explanation?.trim();
      if (!text) throw new Error("No explanation returned");

      setExplanation(text);
      setProvider(payload.provider ?? null);
      setState("done");
    } catch {
      setError("Could not build an explanation just now. Please try again.");
      setState("error");
    }
  };

  const level = profile?.level ?? "beginner";
  const audience = AUDIENCE_LABEL[profile?.audience ?? "non-cs"];

  return (
    <>
      <button
        type="button"
        className="btn btn-sm btn-secondary"
        onClick={ask}
        disabled={state === "loading"}
        aria-expanded={state === "done"}
      >
        {state === "loading"
          ? "💡 Thinking…"
          : state === "done"
            ? "💡 Explain again"
            : `💡 ${label}`}
      </button>

      {state === "done" && (
        <div className="basis-full rounded-xl border border-brand-400/30 bg-brand-500/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-200">
            In plain language
          </p>
          <p className="mt-2 whitespace-pre-line text-[13px] leading-6 text-slate-200">
            {explanation}
          </p>
          <p className="mt-3 text-[11px] text-slate-400">
            Written for a {level} · {audience} learner
            {provider === "mock" ? " · generated offline by the built-in engine" : ""}.
          </p>
        </div>
      )}

      {state === "error" && <p className="basis-full text-xs text-rose-200">{error}</p>}
    </>
  );
}
