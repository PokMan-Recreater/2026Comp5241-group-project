"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Course, LearningPath } from "@/types";
import { TOPIC_SUGGESTIONS } from "@/content";
import { useAppData } from "@/components/providers/AppDataProvider";
import { WEEKLY_MINUTE_OPTIONS, normaliseWeeklyMinutes } from "@/lib/pathGenerator";
import { formatMinutes } from "@/lib/utils";

/**
 * Custom topic screen. The same engine the onboarding wizard uses, but focused:
 * type a topic, inspect the generated modules before committing, then save it.
 */
export function CustomTopicForm() {
  const router = useRouter();
  const { profile, savePath, paths } = useAppData();
  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState(profile?.level ?? "beginner");
  const [weeklyMinutes, setWeeklyMinutes] = useState(profile?.weeklyMinutes ?? 180);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<{ path: LearningPath; course: Course | null } | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    const clean = topic.trim();
    if (!clean) {
      setError("Type a topic first - anything from 'Kubernetes' to 'AI for HR teams'.");
      return;
    }
    setBusy(true);
    setError(null);
    setPreview(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          task: "generate-path",
          input: {
            topic: clean,
            audience: profile?.audience ?? "non-cs",
            level,
            weeklyMinutes: normaliseWeeklyMinutes(weeklyMinutes),
            goal: profile?.goal ?? "curiosity",
          },
        }),
      });
      const payload = (await response.json()) as {
        data?: { path: LearningPath; course: Course | null; matchedTopics: string[] };
        error?: string;
      };
      if (!payload.data?.path) throw new Error(payload.error ?? "Generation failed");

      setPreview({ path: payload.data.path, course: payload.data.course });
      setExplanation(
        payload.data.matchedTopics.length > 0
          ? `Matched curated themes: ${payload.data.matchedTopics.join(", ")}`
          : "No curated match, so a new mini-course was generated for your topic.",
      );
    } catch {
      setError("Could not generate a path just now. Try a slightly different topic.");
    } finally {
      setBusy(false);
    }
  };

  const keep = () => {
    if (!preview) return;
    savePath(preview.path, preview.course ?? undefined);
    router.push(`/paths/${preview.path.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <p className="eyebrow">Custom topic</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Learn something we have not written yet
      </h1>
      <p className="mt-3 text-[15px] leading-7 text-slate-300">
        Describe the topic in your own words. It is matched against {TOPIC_SUGGESTIONS.length}+ curated
        themes, and if nothing fits a complete mini-course is written for it: foundations, vocabulary,
        a hands-on workflow, quality checks, a capstone and interview rehearsal.
      </p>

      <div className="card mt-6 p-5">
        <label className="label" htmlFor="custom-topic">
          Your topic
        </label>
        <input
          id="custom-topic"
          className="input"
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="e.g. Vector databases, Git for designers, AI for HR teams"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {TOPIC_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="chip hover:border-brand-400/60"
              onClick={() => setTopic(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="custom-level">
              Level
            </label>
            <select
              id="custom-level"
              className="input"
              value={level}
              onChange={(event) => setLevel(event.target.value as typeof level)}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="custom-minutes">
              Minutes per week
            </label>
            <select
              id="custom-minutes"
              className="input"
              value={weeklyMinutes}
              onChange={(event) => setWeeklyMinutes(Number(event.target.value))}
            >
              {WEEKLY_MINUTE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option >= 60 ? `${Math.round(option / 60)} hour(s)` : `${option} minutes`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="btn btn-primary" onClick={generate} disabled={busy}>
            {busy ? "Generating…" : "Generate my path"}
          </button>
          {paths.length > 0 && (
            <Link href="/paths" className="btn btn-ghost">
              View my existing paths
            </Link>
          )}
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-[13px] text-rose-100">
            {error}
          </p>
        )}
      </div>

      {preview && (
        <section className="animate-rise card mt-6 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">{preview.path.weeks} week plan</span>
            <span className="chip">{preview.path.modules.length} modules</span>
            <span className="chip">
              {preview.path.modules.reduce((sum, module) => sum + module.steps.length, 0)} lessons
            </span>
            <span className="chip">{formatMinutes(preview.path.estimatedMinutes)}</span>
          </div>

          <h2 className="mt-3 text-lg font-semibold text-white">{preview.path.title}</h2>
          <p className="mt-1 text-[13px] leading-6 text-slate-400">{preview.path.rationale}</p>
          {explanation && <p className="mt-2 text-xs text-brand-200">{explanation}</p>}

          <ol className="mt-4 space-y-3">
            {preview.path.modules.map((module) => (
              <li key={module.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <p className="text-sm font-semibold text-white">{module.title}</p>
                <p className="text-xs text-slate-500">{module.summary}</p>
                <ul className="mt-2 space-y-1">
                  {module.steps.map((step) => (
                    <li
                      key={`${step.courseId}-${step.lessonId}`}
                      className="text-[12px] text-slate-400"
                    >
                      week {step.week} · {step.title} · {formatMinutes(step.minutes)}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className="btn btn-primary" onClick={keep}>
              Save and start this path
            </button>
            <button type="button" className="btn btn-secondary" onClick={generate} disabled={busy}>
              Regenerate
            </button>
          </div>
        </section>
      )}

    </div>
  );
}

