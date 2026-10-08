import { describe, expect, it } from "vitest";
import { evaluateAnswer, evaluateAttempt, scoreBand } from "@/lib/rubric";
import { ROLE_PLAY_SCENARIOS, getScenario } from "@/content";
import type { InterviewQuestion } from "@/types";

const question: InterviewQuestion = {
  id: "q1",
  prompt: "Tell me about a project you shipped.",
  keywords: ["react", "deploy", "test", "component"],
  modelOutline: ["Context", "Ownership", "Decisions", "Result"],
};

const strongAnswer = `Situation: our checkout page was losing mobile users and I owned the front end.
First I instrumented the flow, then I found the React component was re-rendering on every keystroke.
I decided to memoise the price calculation and add a test that covers the coupon path, because the
previous regression came from there. As a result the page load dropped from 3.2 seconds to 1.4
seconds, conversion improved 9% and the deploy went out on Tuesday. Next time I would measure on a
real device before shipping.`;

const weakAnswer = "I did some stuff with a website and it was fine, we like worked on it together.";

describe("answer scoring", () => {
  it("rewards a structured, quantified, owned answer", () => {
    const result = evaluateAnswer(strongAnswer, question);
    expect(result.score).toBeGreaterThanOrEqual(85);
    expect(result.improvements).toHaveLength(0);
    expect(result.signals.every((signal) => signal.hit)).toBe(true);
  });

  it("scores a vague answer low and explains why", () => {
    const result = evaluateAnswer(weakAnswer, question);
    expect(result.score).toBeLessThanOrEqual(35);
    expect(result.improvements.length).toBeGreaterThan(2);
    expect(result.improvements.join(" ")).toContain("90-200 words");
  });

  it("returns zero for an empty answer", () => {
    const result = evaluateAnswer("", question);
    expect(result.score).toBe(0);
    expect(result.wordCount).toBe(0);
    expect(result.modelOutline).toEqual(question.modelOutline);
  });

  it("penalises filler words", () => {
    const withFiller = evaluateAnswer(
      `${strongAnswer} Um, basically, you know, like, sort of.`,
      question,
    );
    const clean = evaluateAnswer(strongAnswer, question);
    expect(withFiller.score).toBeLessThan(clean.score);
  });

  it("detects a missing domain vocabulary signal", () => {
    const noVocabulary = evaluateAnswer(
      "Situation: we had a problem. First I looked at it, then I fixed it. As a result the outcome improved and we saved 4 hours a week for the users. Next time I would plan better.",
      question,
    );
    const vocabulary = noVocabulary.signals.find((signal) => signal.id === "vocabulary");
    expect(vocabulary?.hit).toBe(false);
  });
});

describe("attempt scoring", () => {
  it("averages per-question scores", () => {
    const scenario = getScenario("behavioural-teamwork")!;
    const evaluation = evaluateAttempt(
      Object.fromEntries(scenario.questions.map((item) => [item.id, strongAnswer])),
      scenario,
    );
    expect(evaluation.results).toHaveLength(scenario.questions.length);
    // The scenario's own vocabulary differs per question, so a perfect score is
    // not expected; the answer must still land in the "solid" band overall.
    expect(evaluation.overall).toBeGreaterThanOrEqual(70);
    expect(evaluation.results.every((item) => item.result.score > 0)).toBe(true);
  });

  it("handles unanswered questions without crashing", () => {
    const scenario = getScenario("frontend-intern-screen")!;
    expect(evaluateAttempt({}, scenario).overall).toBe(0);
  });
});

describe("score bands", () => {
  it("labels each band", () => {
    expect(scoreBand(90).label).toBe("Strong hire signal");
    expect(scoreBand(75).label).toBe("Solid, needs polish");
    expect(scoreBand(55).label).toBe("Developing");
    expect(scoreBand(10).label).toBe("Needs a rebuild");
  });
});

describe("scenario integrity", () => {
  it("every scenario is complete and unique", () => {
    const ids = new Set<string>();
    for (const scenario of ROLE_PLAY_SCENARIOS) {
      expect(ids.has(scenario.id)).toBe(false);
      ids.add(scenario.id);
      expect(scenario.questions.length).toBeGreaterThanOrEqual(3);
      expect(scenario.audience.length).toBeGreaterThan(0);
      for (const item of scenario.questions) {
        expect(item.keywords.length).toBeGreaterThanOrEqual(5);
        expect(item.modelOutline.length).toBeGreaterThanOrEqual(4);
      }
    }
  });
});
