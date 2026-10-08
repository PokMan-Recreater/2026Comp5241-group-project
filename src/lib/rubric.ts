import type { InterviewQuestion, InterviewScenario } from "@/types";
import { clamp, splitSentences } from "@/lib/utils";

/**
 * Deterministic scoring of mock-interview answers.
 *
 * The rubric mirrors how real interviewers score: structure, specificity,
 * domain vocabulary, ownership, concision and clarity. Because it is rule based
 * it works offline, is instant, and is reproducible in tests.
 */

export interface RubricSignal {
  id: string;
  label: string;
  /** Points contributed when the signal is satisfied. */
  weight: number;
  hit: boolean;
  detail: string;
}

export interface RubricResult {
  /** 0-100. */
  score: number;
  wordCount: number;
  signals: RubricSignal[];
  strengths: string[];
  improvements: string[];
  modelOutline: string[];
}

export const FILLER_WORDS = [
  "um",
  "uh",
  "like",
  "basically",
  "actually",
  "sort of",
  "kind of",
  "you know",
  "stuff",
  "things",
];

const STRUCTURE_MARKERS = [
  "situation",
  "task",
  "action",
  "result",
  "first",
  "then",
  "next",
  "after that",
  "finally",
  "because",
  "so that",
  "as a result",
  "the outcome",
  "in the end",
];

const OWNERSHIP_MARKERS = [
  "i led",
  "i built",
  "i wrote",
  "i designed",
  "i decided",
  "i implemented",
  "i fixed",
  "i owned",
  "i proposed",
  "i measured",
  "i shipped",
  "i debugged",
  "i learned",
  "my role",
  "i chose",
];

const OUTCOME_MARKERS = [
  "%",
  "percent",
  "reduced",
  "increased",
  "improved",
  "saved",
  "faster",
  "fewer",
  "users",
  "customers",
  "revenue",
  "latency",
  "seconds",
  "minutes",
  "hours",
  "days",
];

function countMatches(haystack: string, needles: string[]): string[] {
  return needles.filter((needle) => haystack.includes(needle));
}

function averageSentenceLength(words: number, sentences: number): number {
  if (sentences <= 0) return words;
  return words / sentences;
}

export function evaluateAnswer(
  answer: string,
  question: InterviewQuestion,
): RubricResult {
  const text = answer.trim();
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = text.length === 0 ? 0 : words.length;
  const sentences = splitSentences(text);

  const structureHits = countMatches(lower, STRUCTURE_MARKERS);
  const ownershipHits = countMatches(lower, OWNERSHIP_MARKERS);
  const outcomeHits = countMatches(lower, OUTCOME_MARKERS);
  const keywordHits = countMatches(
    lower,
    question.keywords.map((keyword) => keyword.toLowerCase()),
  );
  const fillerHits = countMatches(lower, FILLER_WORDS);
  const hasNumbers = /\d/.test(text);
  const avgSentence = averageSentenceLength(wordCount, sentences.length);

  const structureHit = structureHits.length >= 2;
  const ownershipHit = ownershipHits.length >= 1;
  const outcomeHit = outcomeHits.length >= 2 || (outcomeHits.length >= 1 && hasNumbers);
  const keywordTarget = Math.min(3, Math.max(1, question.keywords.length - 1));
  const keywordHit = keywordHits.length >= keywordTarget;
  const concisionHit = wordCount >= 55 && wordCount <= 240;
  const clarityHit = avgSentence >= 6 && avgSentence <= 30 && fillerHits.length <= 1;

  const signals: RubricSignal[] = [
    {
      id: "structure",
      label: "Structured narrative",
      weight: 25,
      hit: structureHit,
      detail: structureHit
        ? `Signposted the answer (${structureHits.slice(0, 3).join(", ")}).`
        : "Signpost the story: situation -> task -> action -> result.",
    },
    {
      id: "specificity",
      label: "Concrete evidence",
      weight: 20,
      hit: outcomeHit,
      detail: outcomeHit
        ? `Backed claims with measurable detail (${outcomeHits.slice(0, 3).join(", ")}).`
        : "Add a measurable outcome: a %, a time saved, or a count of users/files.",
    },
    {
      id: "vocabulary",
      label: "Domain vocabulary",
      weight: 20,
      hit: keywordHit,
      detail: keywordHit
        ? `Used relevant vocabulary (${keywordHits.slice(0, 4).join(", ")}).`
        : "Name the tools and concepts the interviewer is listening for.",
    },
    {
      id: "ownership",
      label: "Personal ownership",
      weight: 15,
      hit: ownershipHit,
      detail: ownershipHit
        ? "Spoke in the first person about decisions you made."
        : "Use 'I' for your own decisions and 'we' only for team context.",
    },
    {
      id: "concision",
      label: "Right length",
      weight: 10,
      hit: concisionHit,
      detail: concisionHit
        ? `Good depth at ${wordCount} words.`
        : wordCount < 55
          ? `Too short (${wordCount} words) - aim for 90-200 words.`
          : `Too long (${wordCount} words) - aim for 90-200 words.`,
    },
    {
      id: "clarity",
      label: "Clear delivery",
      weight: 10,
      hit: clarityHit,
      detail: clarityHit
        ? "Sentences are digestible and filler-free."
        : fillerHits.length > 1
          ? `Trim filler words (${fillerHits.slice(0, 4).join(", ")}).`
          : "Break long sentences up so each one carries a single idea.",
    },
  ];

  const score = clamp(
    signals.reduce((total, signal) => total + (signal.hit ? signal.weight : 0), 0),
    0,
    100,
  );

  return {
    score,
    wordCount,
    signals,
    strengths: signals.filter((signal) => signal.hit).map((signal) => signal.detail),
    improvements: signals
      .filter((signal) => !signal.hit)
      .map((signal) => signal.detail),
    modelOutline: question.modelOutline,
  };
}

export interface AttemptEvaluation {
  overall: number;
  results: { question: InterviewQuestion; result: RubricResult }[];
}

export function evaluateAttempt(
  answers: Record<string, string>,
  scenario: InterviewScenario,
): AttemptEvaluation {
  const results = scenario.questions.map((question) => ({
    question,
    result: evaluateAnswer(answers[question.id] ?? "", question),
  }));
  const overall =
    results.length === 0
      ? 0
      : Math.round(
          results.reduce((total, item) => total + item.result.score, 0) / results.length,
        );
  return { overall, results };
}

/** Human-readable band for a rubric score. */
export function scoreBand(score: number): { label: string; tone: string } {
  if (score >= 85) return { label: "Strong hire signal", tone: "text-emerald-300" };
  if (score >= 70) return { label: "Solid, needs polish", tone: "text-sky-300" };
  if (score >= 50) return { label: "Developing", tone: "text-amber-300" };
  return { label: "Needs a rebuild", tone: "text-rose-300" };
}

