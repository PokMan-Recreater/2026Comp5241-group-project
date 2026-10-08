import { NextResponse } from "next/server";
import type { Audience, LearnerGoal, PathGenerationInput, SkillLevel } from "@/types";
import { getScenario } from "@/content";
import { completeWithFallback, getAIStatus } from "@/lib/ai";
import {
  buildExplainTopicPrompt,
  buildInterviewCoachPrompt,
  buildPathRationalePrompt,
} from "@/lib/ai/prompts";
import { generateLearningPath } from "@/lib/pathGenerator";
import { evaluateAttempt } from "@/lib/rubric";
import { clamp } from "@/lib/utils";

/**
 * Server-side "AI" endpoints.
 *
 * Every task has a deterministic core computed here (path generation, rubric
 * scoring) and an optional natural-language layer produced by the configured
 * provider. With the default `AI_PROVIDER=mock` the whole thing runs offline.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RequestBody =
  | { task: "generate-path"; input: Partial<PathGenerationInput> }
  | { task: "interview-coach"; scenarioId: string; answers: Record<string, string> }
  | {
      task: "explain";
      topic: string;
      level?: SkillLevel;
      audience?: Audience;
      goal?: LearnerGoal;
    };

const AUDIENCES: Audience[] = ["cs", "non-cs"];
const LEVELS: SkillLevel[] = ["beginner", "intermediate", "advanced"];
const GOALS: LearnerGoal[] = ["career", "work", "project", "curiosity"];

function pick<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return typeof value === "string" && (allowed as string[]).includes(value)
    ? (value as T)
    : fallback;
}

function text(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.slice(0, 2000) : fallback;
}

export async function GET() {
  return NextResponse.json({ status: getAIStatus() });
}

export async function POST(request: Request) {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = getAIStatus();

  try {
    switch (body.task) {
      case "generate-path": {
        const input: PathGenerationInput = {
          topic: text(body.input?.topic).trim() || "Software engineering fundamentals",
          audience: pick(body.input?.audience, AUDIENCES, "non-cs"),
          level: pick(body.input?.level, LEVELS, "beginner"),
          weeklyMinutes: clamp(Number(body.input?.weeklyMinutes) || 180, 30, 1200),
          goal: pick(body.input?.goal, GOALS, "career"),
        };

        const result = generateLearningPath(input);
        const { text: rationale, degraded } = await completeWithFallback(
          buildPathRationalePrompt(input, {
            weeks: result.path.weeks,
            matchedTopics: result.matchedTopics,
            moduleTitles: result.path.modules.map((module) => module.title),
            lessonTitles: result.path.modules.flatMap((module) =>
              module.steps.map((step) => step.title),
            ),
          }).messages,
          { maxTokens: 300 },
        );

        return NextResponse.json({
          ok: true,
          provider: degraded ? "mock" : status.provider,
          degraded,
          data: {
            path: { ...result.path, rationale },
            course: result.course ?? null,
            matchedTopics: result.matchedTopics,
          },
        });
      }

      case "interview-coach": {
        const scenario = getScenario(text(body.scenarioId));
        if (!scenario) {
          return NextResponse.json({ error: "Unknown scenario" }, { status: 404 });
        }
        const answers = body.answers ?? {};
        const evaluation = evaluateAttempt(answers, scenario);
        const first = evaluation.results[0];
        const { text: coach, degraded } = await completeWithFallback(
          buildInterviewCoachPrompt({
            scenarioTitle: scenario.title,
            role: scenario.role,
            question: first?.question.prompt ?? scenario.questions[0]?.prompt ?? "",
            answer: answers[first?.question.id ?? ""] ?? "",
            rubricScore: evaluation.overall,
            weakSignals: first?.result.improvements ?? [],
            strongSignals: first?.result.strengths ?? [],
          }).messages,
          { maxTokens: 400 },
        );

        return NextResponse.json({
          ok: true,
          provider: degraded ? "mock" : status.provider,
          degraded,
          data: { evaluation, coach },
        });
      }

      case "explain": {
        const payload = {
          topic: text(body.topic).trim() || "software engineering",
          level: pick(body.level, LEVELS, "beginner"),
          audience: pick(body.audience, AUDIENCES, "non-cs"),
          goal: pick(body.goal, GOALS, "curiosity"),
        };
        const { text: explanation, degraded } = await completeWithFallback(
          buildExplainTopicPrompt(payload).messages,
          { maxTokens: 400 },
        );
        return NextResponse.json({
          ok: true,
          provider: degraded ? "mock" : status.provider,
          degraded,
          data: { explanation },
        });
      }

      default:
        return NextResponse.json({ error: "Unknown task" }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: "AI task failed",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
