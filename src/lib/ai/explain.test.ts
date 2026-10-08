import { describe, expect, it } from "vitest";
import { FALLBACK_EXPLAIN_TOPIC, buildExplainRequest } from "@/lib/ai/explain";

describe("buildExplainRequest", () => {
  it("targets the explain task and carries the learner's profile through", () => {
    expect(
      buildExplainRequest("Merge conflicts", {
        level: "advanced",
        audience: "cs",
        goal: "work",
      }),
    ).toEqual({
      task: "explain",
      topic: "Merge conflicts",
      level: "advanced",
      audience: "cs",
      goal: "work",
    });
  });

  it("defaults to a non-CS beginner before onboarding has run", () => {
    const request = buildExplainRequest("Vector databases");
    expect(request.level).toBe("beginner");
    expect(request.audience).toBe("non-cs");
    expect(request.goal).toBe("curiosity");
  });

  it("trims surrounding whitespace", () => {
    expect(buildExplainRequest("  RAG pipelines  ").topic).toBe("RAG pipelines");
  });

  it("falls back to a general topic when the title is blank", () => {
    expect(buildExplainRequest("   ").topic).toBe(FALLBACK_EXPLAIN_TOPIC);
    expect(buildExplainRequest("", null).topic).toBe(FALLBACK_EXPLAIN_TOPIC);
  });
});
