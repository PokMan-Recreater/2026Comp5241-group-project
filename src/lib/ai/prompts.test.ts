import { describe, expect, it } from "vitest";
import {
  buildExplainTopicPrompt,
  buildInterviewCoachPrompt,
  buildLessonOutlinePrompt,
  buildPathRationalePrompt,
} from "@/lib/ai/prompts";
import { readPayload, readTask, taskMarker } from "@/lib/ai/types";

describe("task markers", () => {
  it("round-trip through the system prompt", () => {
    expect(taskMarker("explain-topic")).toBe("TASK:explain-topic");
    expect(readTask([{ role: "system", content: "be nice TASK:interview-coach ok" }])).toBe(
      "interview-coach",
    );
    // Only the system turn is searched.
    expect(readTask([{ role: "user", content: "TASK:explain-topic" }])).toBeNull();
    expect(readTask([])).toBeNull();
  });

  it("read the JSON payload back out of the user turn", () => {
    const payload = { topic: "git", level: "beginner" };
    const messages = [
      { role: "system" as const, content: "prose" },
      { role: "user" as const, content: `here:\n${JSON.stringify(payload, null, 2)}\nthanks` },
    ];
    expect(readPayload<Record<string, unknown>>(messages)).toEqual(payload);
  });

  it("return null when the user turn carries no usable JSON", () => {
    expect(readPayload<unknown>([{ role: "user", content: "no braces here" }])).toBeNull();
    expect(readPayload<unknown>([{ role: "user", content: "{ broken" }])).toBeNull();
    expect(readPayload<unknown>([])).toBeNull();
  });
});

describe("prompt builders", () => {
  it("tag the task and carry the payload", () => {
    const path = buildPathRationalePrompt(
      { topic: "git", audience: "cs", level: "advanced", weeklyMinutes: 300, goal: "work" },
      {
        weeks: 3,
        matchedTopics: ["Version control"],
        moduleTitles: ["Git"],
        lessonTitles: ["Commits"],
      },
    );
    expect(path.task).toBe("path-rationale");
    expect(readTask(path.messages)).toBe("path-rationale");
    expect(readPayload<Record<string, unknown>>(path.messages)).toMatchObject({
      topic: "git",
      weeklyMinutes: 300,
    });

    const coach = buildInterviewCoachPrompt({
      scenarioTitle: "Frontend screen",
      role: "Frontend engineer",
      question: "Tell me about a project",
      answer: "I built a thing.",
      rubricScore: 60,
      weakSignals: ["add a metric"],
      strongSignals: ["answered the question"],
    });
    expect(coach.task).toBe("interview-coach");
    expect(readPayload<Record<string, unknown>>(coach.messages)).toMatchObject({ rubricScore: 60 });

    const explain = buildExplainTopicPrompt({
      topic: "RAG",
      level: "beginner",
      audience: "non-cs",
      goal: "curiosity",
    });
    expect(explain.task).toBe("explain-topic");
    expect(readPayload<Record<string, unknown>>(explain.messages)).toMatchObject({ topic: "RAG" });

    const outline = buildLessonOutlinePrompt({
      topic: "Docker",
      level: "intermediate",
      audience: "cs",
    });
    expect(outline.task).toBe("lesson-outline");
    expect(readPayload<Record<string, unknown>>(outline.messages)).toMatchObject({ topic: "Docker" });
  });

  it("keep the house style and the instruction in the system turn", () => {
    const { messages } = buildExplainTopicPrompt({
      topic: "RAG",
      level: "beginner",
      audience: "non-cs",
      goal: "curiosity",
    });
    expect(messages[0].role).toBe("system");
    expect(messages[0].content).toContain("SkillForge");
    expect(messages[0].content).toContain("plain language");
    expect(messages[0].content).toContain("TASK:explain-topic");
    expect(messages[1].role).toBe("user");
  });
});
