import type {
  AICompletionOptions,
  AIMessage,
  AIProvider,
  AITask,
} from "@/lib/ai/types";
import { readPayload, readTask } from "@/lib/ai/types";
import type {
  ExplainTopicPayload,
  InterviewCoachPayload,
  PathRationalePayload,
} from "@/lib/ai/prompts";

/**
 * Offline provider.
 *
 * It is not a language model: it is a deterministic template engine keyed on the
 * task marker in the system prompt. That keeps the demo free, instant, testable
 * and identical on every run - while producing output that is genuinely useful
 * because the structured payload (built by our own engines) carries the facts.
 */

const GOAL_HABITS: Record<string, string> = {
  career:
    "protect two fixed 45-minute slots per week and keep a public log of what you build",
  work: "apply one concept at work the same week you learn it, then write down the outcome",
  project: "keep a single side project open and add one small feature after every lesson",
  curiosity: "teach each idea back to someone in three sentences before moving on",
};

function bulletList(items: string[], limit = 4): string {
  return items
    .slice(0, limit)
    .map((item) => `- ${item}`)
    .join("\n");
}

function pathRationale(payload: PathRationalePayload | null): string {
  if (!payload) {
    return "This path moves from vocabulary to hands-on practice, then into applied work, so every new term is used within a week of learning it.";
  }
  const matched =
    payload.matchedTopics.length > 0
      ? `It is anchored on your topic's core themes (${payload.matchedTopics.slice(0, 3).join(", ")})`
      : "It starts from first principles because the topic is outside our curated catalogue";
  const pace = `${payload.weeks} week${payload.weeks === 1 ? "" : "s"} at ${payload.weeklyMinutes} minutes per week`;
  return [
    `${matched}, then widens into adjacent tooling you will be expected to know.`,
    `The sequence runs: ${payload.moduleTitles.slice(0, 4).join(" -> ")}.`,
    `It is paced at ${pace}, so each module finishes inside your study budget.`,
    `Most important habit: ${GOAL_HABITS[payload.goal] ?? GOAL_HABITS.curiosity}.`,
  ].join(" ");
}

function interviewCoach(payload: InterviewCoachPayload | null): string {
  if (!payload) return "- Structure the answer as situation, action, result.\n- Quantify the outcome.\n- Name the tools you used.";
  const weak = payload.weakSignals.length > 0 ? payload.weakSignals : ["add one measurable result"];
  const strong = payload.strongSignals.length > 0 ? payload.strongSignals : ["answered the question asked"];
  const opening = payload.answer.trim().split(/(?<=[.!?])\s+/)[0] ?? "";
  return [
    `Score ${payload.rubricScore}/100 for "${payload.question}".`,
    "",
    bulletList([
      `Fix first: ${weak[0]}`,
      weak[1] ? `Then: ${weak[1]}` : "Then: rehearse the 90-second version out loud once.",
      `Keep doing: ${strong[0]}`,
      "Close with what you would do differently next time - interviewers score reflection highly.",
    ]),
    "",
    `Stronger opening: "In my last project I owned ${
      payload.role.toLowerCase().includes("frontend") ? "the interface" : "this problem"
    } end to end, and the change moved the metric we cared about. ${opening.replace(/^["']|["']$/g, "")}"`,
  ].join("\n");
}

function explainTopic(payload: ExplainTopicPayload | null): string {
  const topic = payload?.topic ?? "this topic";
  const audience = payload?.audience === "non-cs" ? "a non-technical colleague" : "a developer";
  return [
    `${topic}, in one paragraph for ${audience}: it is a repeatable way of getting a specific outcome from a system, and the value comes from doing it the same way every time. Learn the vocabulary first, then practise on a tiny example, then connect it to a real task you already have.`,
    "",
    "Key vocabulary",
    bulletList([
      `${topic} basics - the smallest unit of work you can repeat.`,
      "Input / output - what you give the system and what you must check afterwards.",
      "Constraint - the rule that keeps the output usable (format, length, cost, safety).",
      "Feedback loop - how you measure whether the output was actually good.",
    ]),
    "",
    "Starter exercise",
    "1. Write down the outcome you want in one sentence. 2. Produce the smallest working example. 3. Compare it against your sentence and note one thing to change.",
  ].join("\n");
}

function lessonOutline(payload: { topic?: string; level?: string } | null): string {
  const topic = payload?.topic ?? "your topic";
  return [
    `Module: ${topic} foundations - vocabulary, mental model and where it fits`,
    `Module: ${topic} in practice - guided walkthrough with a tiny example`,
    `Module: ${topic} applied - build something end to end`,
    `Module: ${topic} interview & review - explain your work and defend trade-offs`,
  ].join("\n");
}

const RENDERERS: Record<AITask, (payload: never) => string> = {
  "path-rationale": pathRationale as (payload: never) => string,
  "interview-coach": interviewCoach as (payload: never) => string,
  "explain-topic": explainTopic as (payload: never) => string,
  "lesson-outline": lessonOutline as (payload: never) => string,
};

export const mockProvider: AIProvider = {
  id: "mock",
  label: "Offline engine",
  remote: false,
  async complete(
    messages: AIMessage[],
    _options?: AICompletionOptions,
  ): Promise<string> {
    const task = readTask(messages) ?? "explain-topic";
    const payload = readPayload(messages);
    const render = RENDERERS[task] ?? RENDERERS["explain-topic"];
    return render(payload as never);
  },
};
