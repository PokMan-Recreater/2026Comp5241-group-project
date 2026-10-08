"use client";

import { useState } from "react";
import type { InterviewScenario } from "@/types";
import { ROLE_PLAY_SCENARIOS, getScenario } from "@/content";
import { FeedbackPanel } from "@/components/interview/FeedbackPanel";
import { evaluateAnswer, scoreBand, type RubricResult } from "@/lib/rubric";
import { cn } from "@/lib/utils";

/**
 * Role-play / mock interview.
 *
 * Answers are scored locally by the deterministic rubric, so feedback is instant
 * and works offline. The optional "AI coaching" call hits /api/ai, which uses the
 * configured provider (offline template engine by default).
 */

type Phase = "answering" | "feedback" | "summary";

export function RolePlayRunner({
  scenarioId,
  onFinish,
}: {
  scenarioId?: string;
  onFinish?: (score: number, scenario: InterviewScenario) => void;
}) {
  const [selectedId, setSelectedId] = useState(scenarioId ?? ROLE_PLAY_SCENARIOS[0].id);
  const scenario = scenarioId ? getScenario(scenarioId) : getScenario(selectedId);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, RubricResult>>({});
  const [phase, setPhase] = useState<Phase>("answering");
  const [coach, setCoach] = useState<string | null>(null);
  const [loadingCoach, setLoadingCoach] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);

  if (!scenario) {
    return <p className="text-sm text-slate-400">That scenario is not available.</p>;
  }

  const question = scenario.questions[index];
  const currentResult = results[question.id];
  const answered = Object.keys(results).length;
  const overall =
    answered === 0
      ? 0
      : Math.round(
          Object.values(results).reduce((total, result) => total + result.score, 0) / answered,
        );

  const submit = () => {
    const result = evaluateAnswer(draft, question);
    setResults((previous) => ({ ...previous, [question.id]: result }));
    setAnswers((previous) => ({ ...previous, [question.id]: draft }));
    setPhase("feedback");
  };

  const next = () => {
    setCoach(null);
    if (index + 1 < scenario.questions.length) {
      setIndex(index + 1);
      setDraft("");
      setPhase("answering");
      return;
    }
    setPhase("summary");
    const finalAnswers = { ...answers, [question.id]: draft };
    const scores = scenario.questions.map(
      (item) => results[item.id]?.score ?? evaluateAnswer(finalAnswers[item.id] ?? "", item).score,
    );
    const finalScore = Math.round(scores.reduce((total, value) => total + value, 0) / scores.length);
    onFinish?.(finalScore, scenario);
  };

  const requestCoach = async () => {
    setLoadingCoach(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ task: "interview-coach", scenarioId: scenario.id, answers }),
      });
      const data = (await response.json()) as {
        provider?: string;
        data?: { coach?: string };
        error?: string;
      };
      setCoach(data.data?.coach ?? data.error ?? "No coaching returned.");
      setProvider(data.provider ?? null);
    } catch {
      setCoach("Coaching is unavailable right now. The rubric feedback above still applies.");
    } finally {
      setLoadingCoach(false);
    }
  };

  const restart = (id: string) => {
    setSelectedId(id);
    setIndex(0);
    setDraft("");
    setAnswers({});
    setResults({});
    setPhase("answering");
    setCoach(null);
  };

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip">🎤 {scenario.role}</span>
        <span className="chip">{scenario.company}</span>
        <span className="chip">{scenario.difficulty}</span>
        {answered > 0 && <span className="chip">running score: {overall}/100</span>}
        {!scenarioId && (
          <select
            className="input ml-auto max-w-xs text-xs"
            value={selectedId}
            onChange={(event) => restart(event.target.value)}
            aria-label="Choose a scenario"
          >
            {ROLE_PLAY_SCENARIOS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className="mt-3 text-[13px] leading-6 text-slate-400">{scenario.brief}</p>
      <p className="mt-1 text-xs text-slate-500">Interviewer: {scenario.interviewerPersona}</p>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400 transition-all"
          style={{ width: `${Math.round((answered / scenario.questions.length) * 100)}%` }}
        />
      </div>

      {phase !== "summary" && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Question {index + 1} of {scenario.questions.length}
          </p>
          <p className="mt-2 text-[15px] font-semibold text-white">{question.prompt}</p>

          {phase === "answering" ? (
            <>
              <label className="label mt-3" htmlFor={`answer-${question.id}`}>
                Your answer
              </label>
              <textarea
                id={`answer-${question.id}`}
                className="input min-h-40 text-[14px] leading-7"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Answer out loud first, then type what you said. 90 seconds is the target."
              />
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={submit}
                  disabled={draft.trim().length === 0}
                >
                  Submit answer for scoring
                </button>
                <span className="text-xs text-slate-500">
                  {draft.trim().split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
            </>
          ) : (
            <div className="mt-3 space-y-3">
              <div className="rounded-xl border border-white/10 bg-ink-900/70 p-3">
                <p className="text-xs uppercase tracking-wider text-slate-500">What you said</p>
                <p className="mt-1 text-[13px] leading-6 text-slate-300">{answers[question.id]}</p>
              </div>
              {currentResult && <FeedbackPanel result={currentResult} />}
              <button type="button" className="btn btn-primary btn-sm" onClick={next}>
                {index + 1 < scenario.questions.length ? "Next question →" : "See my scorecard →"}
              </button>
            </div>
          )}
        </div>
      )}

      {phase === "summary" && (
        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-white">{overall}</span>
            <span className="text-sm text-slate-400">/ 100 overall</span>
            <span className={cn("text-sm font-semibold", scoreBand(overall).tone)}>
              {scoreBand(overall).label}
            </span>
          </div>

          <ul className="mt-4 space-y-3">
            {scenario.questions.map((item) => {
              const result = results[item.id];
              if (!result) return null;
              return (
                <li key={item.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <p className="text-[13px] font-semibold text-slate-200">{item.prompt}</p>
                  <p className="mt-1 text-xs text-slate-400">Score {result.score}/100</p>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={requestCoach}
              disabled={loadingCoach}
            >
              {loadingCoach ? "Thinking…" : "✨ Get AI coaching"}
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => restart(selectedId)}>
              ↺ Try again
            </button>
          </div>

          {coach && (
            <div className="mt-3 rounded-xl border border-brand-400/30 bg-brand-500/10 p-4">
              <p className="text-xs uppercase tracking-wider text-brand-200">
                Coaching{provider ? ` (${provider} provider)` : ""}
              </p>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-[13px] leading-6 text-slate-200">
                {coach}
              </pre>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
