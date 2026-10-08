import type { LearnerGoal, PathGenerationInput, SkillLevel } from "@/types";
import type { AITask, AIMessage } from "@/lib/ai/types";
import { taskMarker } from "@/lib/ai/types";

/**
 * Prompt builders. Keeping them in one place makes them testable and means the
 * mock provider and a real LLM receive identical, well-formed instructions.
 */

export interface PromptEnvelope {
  task: AITask;
  messages: AIMessage[];
}

const HOUSE_STYLE = [
  "You are SkillForge, a concise technical coach for software engineering and AI tools.",
  "Write in short paragraphs. No marketing fluff. Use plain language for non-CS learners.",
  "Never invent course URLs. Never output more than 180 words unless asked for a list.",
].join(" ");

function envelope(task: AITask, instruction: string, payload: unknown): PromptEnvelope {
  return {
    task,
    messages: [
      { role: "system", content: `${HOUSE_STYLE}\n${taskMarker(task)}\n${instruction}` },
      { role: "user", content: JSON.stringify(payload, null, 2) },
    ],
  };
}

export interface PathRationalePayload {
  topic: string;
  audience: string;
  level: SkillLevel;
  goal: LearnerGoal;
  weeklyMinutes: number;
  weeks: number;
  matchedTopics: string[];
  moduleTitles: string[];
  lessonTitles: string[];
}

export function buildPathRationalePrompt(
  input: PathGenerationInput,
  payload: Omit<PathRationalePayload, "topic" | "audience" | "level" | "goal" | "weeklyMinutes">,
): PromptEnvelope {
  return envelope(
    "path-rationale",
    "Explain in 3-4 sentences why this learning path is ordered this way, and name the single most important habit the learner should build.",
    {
      topic: input.topic,
      audience: input.audience,
      level: input.level,
      goal: input.goal,
      weeklyMinutes: input.weeklyMinutes,
      ...payload,
    },
  );
}

export interface InterviewCoachPayload {
  scenarioTitle: string;
  role: string;
  question: string;
  answer: string;
  rubricScore: number;
  weakSignals: string[];
  strongSignals: string[];
}

export function buildInterviewCoachPrompt(payload: InterviewCoachPayload): PromptEnvelope {
  return envelope(
    "interview-coach",
    "Give exactly three bullet points of coaching for the candidate's answer, then one rewritten opening sentence. Be specific to their words.",
    payload,
  );
}

export interface ExplainTopicPayload {
  topic: string;
  level: SkillLevel;
  audience: string;
  goal: LearnerGoal;
}

export function buildExplainTopicPrompt(payload: ExplainTopicPayload): PromptEnvelope {
  return envelope(
    "explain-topic",
    "Explain the topic, then list 4 key vocabulary terms with one-line definitions, then a 3-step starter exercise.",
    payload,
  );
}

export interface LessonOutlinePayload {
  topic: string;
  level: SkillLevel;
  audience: string;
}

export function buildLessonOutlinePrompt(payload: LessonOutlinePayload): PromptEnvelope {
  return envelope(
    "lesson-outline",
    "Propose a 4-module outline for a mini-course. Return one module per line as 'Module: <title> - <one line summary>'.",
    payload,
  );
}
