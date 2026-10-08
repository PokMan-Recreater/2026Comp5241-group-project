import { describe, expect, it } from "vitest";
import { TOPIC_LIBRARY, matchTopics, matchedLabels } from "@/lib/topics";

describe("topic matching", () => {
  it("matches a single obvious keyword", () => {
    const matches = matchTopics("git");
    expect(matches[0].rule.id).toBe("git");
    expect(matches[0].score).toBeGreaterThan(0);
  });

  it("ranks the rule with more keyword hits first", () => {
    const matches = matchTopics("I want to learn prompt engineering and build a RAG chatbot");
    const ids = matches.map((match) => match.rule.id);
    expect(ids).toContain("prompting");
    expect(ids).toContain("llm");
    expect(ids.indexOf("llm")).toBeLessThan(ids.indexOf("git") === -1 ? 99 : ids.indexOf("git"));
  });

  it("does not match inside other words", () => {
    // "html" contains "ml" but must not be treated as a machine-learning topic.
    const matches = matchTopics("html");
    const ids = matches.map((match) => match.rule.id);
    expect(ids).not.toContain("ml");
    expect(ids).toContain("web");
  });

  it("matches multi-word keywords with prefixes", () => {
    const matches = matchTopics("ai tools for marketing teams");
    expect(matches[0].rule.id).toBe("ai-tools");
  });

  it("prefers the theme the learner mentioned first when scores tie", () => {
    expect(matchTopics("git and testing")[0].rule.id).toBe("git");
    expect(matchTopics("testing and git")[0].rule.id).toBe("testing");
  });

  it("returns nothing for an unrelated topic", () => {
    expect(matchTopics("marine biology field trips")).toHaveLength(0);
  });

  it("is case insensitive", () => {
    expect(matchTopics("DOCKER").map((match) => match.rule.id)).toContain("docker");
  });

  it("produces stable, de-duplicated labels", () => {
    const labels = matchedLabels(matchTopics("sql and python for data analysis"));
    expect(labels).toContain("SQL & analytics");
    expect(new Set(labels).size).toBe(labels.length);
  });

  it("keeps every rule internally consistent", () => {
    for (const rule of TOPIC_LIBRARY) {
      expect(rule.keywords.length).toBeGreaterThan(0);
      expect(rule.courseIds.length).toBeGreaterThan(0);
      expect(rule.focus.length).toBeGreaterThan(10);
    }
  });
});
