import { describe, expect, it } from "vitest";
import {
  CODE_CHALLENGES,
  ROLE_PLAY_SCENARIOS,
  SIMULATIONS,
  TOTAL_CURATED_LESSONS,
  courseLessonsOf,
  curatedCourses,
  getChallenge,
  getCourseBySlug,
  getLessonBySlug,
  getScenario,
  getSimulation,
  searchCourses,
  totalMinutes,
} from "@/content";

describe("catalogue integrity", () => {
  it("has unique course ids and slugs", () => {
    const ids = curatedCourses.map((course) => course.id);
    const slugs = curatedCourses.map((course) => course.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has unique lesson ids inside each course", () => {
    for (const course of curatedCourses) {
      const ids = courseLessonsOf(course).map((lesson) => lesson.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it("describes every course with real metadata", () => {
    for (const course of curatedCourses) {
      expect(course.title.length).toBeGreaterThan(5);
      expect(course.description.length).toBeGreaterThan(80);
      expect(course.outcomes.length).toBeGreaterThanOrEqual(3);
      expect(course.tags.length).toBeGreaterThanOrEqual(3);
      expect(course.audience.length).toBeGreaterThan(0);
      expect(course.modules.length).toBeGreaterThan(0);
      expect(totalMinutes(course)).toBeGreaterThan(0);
    }
  });

  it("gives every lesson objectives, minutes and blocks", () => {
    for (const course of curatedCourses) {
      for (const lesson of courseLessonsOf(course)) {
        expect(lesson.objectives.length).toBeGreaterThanOrEqual(2);
        expect(lesson.minutes).toBeGreaterThanOrEqual(5);
        expect(lesson.blocks.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("keeps every quiz answerable", () => {
    for (const course of curatedCourses) {
      for (const lesson of courseLessonsOf(course)) {
        for (const block of lesson.blocks) {
          if (block.kind !== "quiz") continue;
          expect(block.options.length).toBeGreaterThanOrEqual(3);
          expect(block.answerIndex).toBeGreaterThanOrEqual(0);
          expect(block.answerIndex).toBeLessThan(block.options.length);
          expect(block.explanation.length).toBeGreaterThan(20);
          expect(new Set(block.options).size).toBe(block.options.length);
        }
      }
    }
  });

  it("only references blocks that exist", () => {
    for (const course of curatedCourses) {
      for (const lesson of courseLessonsOf(course)) {
        for (const block of lesson.blocks) {
          if (block.kind === "simulation") expect(getSimulation(block.simulationId)).toBeDefined();
          if (block.kind === "challenge") expect(getChallenge(block.challengeId)).toBeDefined();
          if (block.kind === "roleplay") expect(getScenario(block.scenarioId)).toBeDefined();
        }
      }
    }
  });

  it("uses every simulation and challenge at least once", () => {
    const usedSimulations = new Set<string>();
    const usedChallenges = new Set<string>();
    for (const course of curatedCourses) {
      for (const lesson of courseLessonsOf(course)) {
        for (const block of lesson.blocks) {
          if (block.kind === "simulation") usedSimulations.add(block.simulationId);
          if (block.kind === "challenge") usedChallenges.add(block.challengeId);
        }
      }
    }
    for (const simulation of SIMULATIONS) expect(usedSimulations.has(simulation.id)).toBe(true);
    for (const challenge of CODE_CHALLENGES) expect(usedChallenges.has(challenge.id)).toBe(true);
  });

  it("reports the advertised totals", () => {
    expect(curatedCourses.length).toBeGreaterThanOrEqual(10);
    expect(TOTAL_CURATED_LESSONS).toBe(
      curatedCourses.reduce((sum, course) => sum + courseLessonsOf(course).length, 0),
    );
  });
});

describe("lookups", () => {
  it("finds courses and lessons by slug", () => {
    expect(getCourseBySlug("git-essentials")?.title).toContain("Git");
    expect(getLessonBySlug("git-essentials", "why-version-control")?.lesson.title).toBe(
      "Why version control exists",
    );
    expect(getLessonBySlug("git-essentials", "nope")).toBeUndefined();
    expect(getCourseBySlug("nope")).toBeUndefined();
  });

  it("reports lesson positions for navigation", () => {
    const location = getLessonBySlug("git-essentials", "first-commit-workflow");
    expect(location?.index).toBe(1);
    expect(location?.total).toBe(courseLessonsOf(getCourseBySlug("git-essentials")!).length);
  });

  it("searches across titles, tags and descriptions", () => {
    expect(searchCourses("docker").map((course) => course.id)).toContain("docker-containers");
    expect(searchCourses("prompt").length).toBeGreaterThan(0);
    expect(searchCourses("").length).toBe(curatedCourses.length);
    expect(searchCourses("zzzz")).toHaveLength(0);
  });
});

describe("scenario coverage", () => {
  it("offers at least one non-CS friendly scenario", () => {
    expect(ROLE_PLAY_SCENARIOS.some((scenario) => scenario.audience.includes("non-cs"))).toBe(true);
  });
});
