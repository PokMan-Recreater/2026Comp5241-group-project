"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Audience, LearnerGoal, LearningPath, SkillLevel } from "@/types";
import { TOPIC_SUGGESTIONS } from "@/content";
import { useAppData } from "@/components/providers/AppDataProvider";
import { WEEKLY_MINUTE_OPTIONS, generateLearningPath, normaliseWeeklyMinutes } from "@/lib/pathGenerator";
import { cn, uid } from "@/lib/utils";

/**
 * Onboarding wizard. Three short steps, then the personalisation engine runs and
 * the learner lands on their generated path. The API route is used when
 * available so a real model can write the rationale; the local engine is the
 * fallback, so the flow can never break.
 */

const GOALS: { id: LearnerGoal; label: string; hint: string }[] = [
  { id: "career", label: "Get hired", hint: "Internships, graduate roles, career change" },
  { id: "work", label: "Be better at my job", hint: "Apply it at work this month" },
  { id: "project", label: "Build a project", hint: "Ship something I can show people" },
  { id: "curiosity", label: "Understand it", hint: "Know what people are talking about" },
];

const INTERESTS = [
  "git",
  "python",
  "ai tools",
  "prompting",
  "llm",
  "testing",
  "docker",
  "ci/cd",
  "sql",
  "machine learning",
  "web",
  "security",
  "interviews",
];

export function OnboardingWizard() {
  const router = useRouter();
  const { savePath, setProfile, profile } = useAppData();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [audience, setAudience] = useState<Audience>(profile?.audience ?? "non-cs");
  const [level, setLevel] = useState<SkillLevel>(profile?.level ?? "beginner");
  const [goal, setGoal] = useState<LearnerGoal>(profile?.goal ?? "career");
  const [weeklyMinutes, setWeeklyMinutes] = useState(profile?.weeklyMinutes ?? 180);
  const [interests, setInterests] = useState<string[]>(profile?.interests ?? []);
  const [topic, setTopic] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleInterest = (value: string) => {
    setInterests((previous) =>
      previous.includes(value) ? previous.filter((item) => item !== value) : [...previous, value],
    );
  };

  const generate = async () => {
    setBusy(true);
    setError(null);

    const cleanTopic =
      topic.trim() ||
      (interests.length > 0 ? interests.slice(0, 2).join(" and ") : "software engineering fundamentals");

    const nextProfile = {
      id: profile?.id ?? uid("learner"),
      displayName: displayName.trim() || "Learner",
      audience,
      level,
      goal,
      weeklyMinutes: normaliseWeeklyMinutes(weeklyMinutes),
      interests,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ task: "generate-path", input: { ...nextProfile, topic: cleanTopic } }),
      });
      if (!response.ok) throw new Error("Path generation failed");
      const payload = (await response.json()) as {
        data?: { path: LearningPath; course: import("@/types").Course | null };
      };
      if (!payload.data?.path) throw new Error("No path returned");

      setProfile(nextProfile);
      savePath(payload.data.path, payload.data.course ?? undefined);
      router.push(`/paths/${payload.data.path.id}`);
    } catch {
      // Offline-safe fallback: the deterministic engine runs entirely locally.
      try {
        const local = generateLearningPath({
          topic: cleanTopic,
          audience,
          level,
          weeklyMinutes: normaliseWeeklyMinutes(weeklyMinutes),
          goal,
        });
        setProfile(nextProfile);
        savePath(local.path, local.course);
        router.push(`/paths/${local.path.id}`);
      } catch {
        setError("Could not build a path. Please try a different topic.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <p className="eyebrow">Step {step + 1} of 3</p>
      <div className="mt-3 flex gap-1.5">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              index <= step ? "bg-brand-400" : "bg-white/10",
            )}
          />
        ))}
      </div>

      {step === 0 && (
        <section className="animate-rise mt-6">
          <h1 className="section-title">Where are you starting from?</h1>
          <p className="mt-2 text-sm text-slate-400">
            This changes the framing, the pace and how much vocabulary we explain. Nothing is locked
            in - you can change it later.
          </p>

          <label className="label mt-6" htmlFor="onboarding-name">
            What should we call you?
          </label>
          <input
            id="onboarding-name"
            className="input"
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Optional"
          />

          <span className="label mt-5">Background</span>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                { id: "cs", title: "Computer science", body: "I study or work in software already" },
                {
                  id: "non-cs",
                  title: "Outside computer science",
                  body: "I am new to code and tooling",
                },
              ] as { id: Audience; title: string; body: string }[]
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setAudience(option.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition",
                  audience === option.id
                    ? "border-brand-400/60 bg-brand-500/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                )}
              >
                <p className="text-sm font-semibold text-white">{option.title}</p>
                <p className="mt-1 text-xs text-slate-400">{option.body}</p>
              </button>
            ))}
          </div>

          <span className="label mt-5">Current level in these topics</span>
          <div className="flex gap-2">
            {(["beginner", "intermediate", "advanced"] as SkillLevel[]).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setLevel(option)}
                className={cn("btn flex-1", level === option ? "btn-primary" : "btn-secondary")}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button type="button" className="btn btn-primary" onClick={() => setStep(1)}>
              Continue →
            </button>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="animate-rise mt-6">
          <h1 className="section-title">What are you aiming for?</h1>
          <p className="mt-2 text-sm text-slate-400">
            Your goal changes the closing module of the path and the habit we recommend.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {GOALS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setGoal(option.id)}
                className={cn(
                  "rounded-xl border p-4 text-left transition",
                  goal === option.id
                    ? "border-brand-400/60 bg-brand-500/10"
                    : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]",
                )}
              >
                <p className="text-sm font-semibold text-white">{option.label}</p>
                <p className="mt-1 text-xs text-slate-400">{option.hint}</p>
              </button>
            ))}
          </div>

          <span className="label mt-5">Study time per week</span>
          <div className="flex flex-wrap gap-2">
            {WEEKLY_MINUTE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setWeeklyMinutes(option)}
                className={cn("btn btn-sm", weeklyMinutes === option ? "btn-primary" : "btn-secondary")}
              >
                {option >= 60 ? `${Math.round(option / 60)}h` : `${option}m / week`}
              </button>
            ))}
          </div>

          <span className="label mt-5">Anything you already care about?</span>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleInterest(item)}
                className={cn(
                  "chip",
                  interests.includes(item) && "border-brand-400/60 text-brand-100",
                )}
              >
                {interests.includes(item) ? "✓ " : "+ "}
                {item}
              </button>
            ))}
          </div>

          <div className="mt-6 flex justify-between">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(0)}>
              ← Back
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="animate-rise mt-6">
          <h1 className="section-title">What do you want to learn?</h1>
          <p className="mt-2 text-sm text-slate-400">
            Type anything. If it matches our catalogue you get curated lessons; if not, a complete
            mini-course is generated for it.
          </p>

          <label className="label mt-5" htmlFor="onboarding-topic">
            Your topic
          </label>
          <input
            id="onboarding-topic"
            className="input"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            placeholder="e.g. Git for designers, vector databases, AI for marketing"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {TOPIC_SUGGESTIONS.slice(0, 8).map((suggestion) => (
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

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-[13px] leading-6 text-slate-400">
            <p className="font-semibold text-slate-200">What happens next</p>
            <p className="mt-1">
              We match your topic against {`${TOPIC_SUGGESTIONS.length}+`} curated themes, order the
              lessons into modules, spread them across the weeks your study time allows, and always
              finish with interview rehearsal.
            </p>
          </div>

          <div className="mt-6 flex justify-between">
            <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
              ← Back
            </button>
            <button type="button" className="btn btn-primary" onClick={generate} disabled={busy}>
              {busy ? "Building your path…" : "Build my learning path"}
            </button>
          </div>
        </section>
      )}



      {error && (
        <p className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-[13px] text-rose-100">
          {error}
        </p>
      )}
    </div>
  );
}
