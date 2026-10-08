import type { Audience, LearnerGoal, SkillLevel } from "@/types";

/**
 * Request builder for the server-side `explain` task (`POST /api/ai`).
 *
 * Kept as a pure function rather than inlined in the component so the defaults
 * for a learner who has not finished onboarding are unit tested, in the same
 * spirit as the other rules in `src/lib`.
 */

export interface ExplainRequest {
  task: "explain";
  topic: string;
  level: SkillLevel;
  audience: Audience;
  goal: LearnerGoal;
}

/** Used when a lesson or custom course has no usable title to explain. */
export const FALLBACK_EXPLAIN_TOPIC = "software engineering fundamentals";

/** The slice of a learner profile that shapes an explanation. */
export type ExplainProfile =
  | {
      level?: SkillLevel;
      audience?: Audience;
      goal?: LearnerGoal;
    }
  | null
  | undefined;

export function buildExplainRequest(topic: string, profile?: ExplainProfile): ExplainRequest {
  const clean = topic.trim();
  return {
    task: "explain",
    topic: clean.length > 0 ? clean : FALLBACK_EXPLAIN_TOPIC,
    level: profile?.level ?? "beginner",
    audience: profile?.audience ?? "non-cs",
    goal: profile?.goal ?? "curiosity",
  };
}
