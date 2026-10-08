import { describe, expect, it } from "vitest";
import {
  DEFAULT_WEEKLY_MINUTES,
  MAX_PATH_STEPS,
  buildCustomCourse,
  generateLearningPath,
  normaliseWeeklyMinutes,
  scheduleWeeks,
  selectLessonsForLevel,
} from "@/lib/pathGenerator";
import { getCourseById, curatedCourses } from "@/content";
import type { PathGenerationInput, PathStep } from "@/types";

const baseInput: PathGenerationInput = {
  topic: "git for beginners",
  audience: "non-cs",
  level: "beginner",
  weeklyMinutes: 120,
  goal: "career",
};

const step = (index: number, minutes: number): Omit<PathStep, "week"> => ({
  courseId: "c",
  courseSlug: "c",
  courseTitle: "C",
  lessonId: `l${index}`,
  title: `L${index}`,
  focus: "",
  minutes,
});

describe("weekly minutes", () => {
  it("defaults and clamps nonsensical values", () => {
    expect(normaliseWeeklyMinutes(Number.NaN)).toBe(DEFAULT_WEEKLY_MINUTES);
    expect(normaliseWeeklyMinutes(0)).toBe(30);
    expect(normaliseWeeklyMinutes(5000)).toBe(1200);
    expect(normaliseWeeklyMinutes(184.6)).toBe(185);
  });
});

describe("week scheduling", () => {
  it("never exceeds the weekly budget", () => {
    const scheduled = scheduleWeeks([0, 1, 2, 3, 4].map((index) => step(index, 20)), 60);
    expect(scheduled.map((item) => item.week)).toEqual([1, 1, 1, 2, 2]);
    for (let week = 1; week <= 2; week += 1) {
      const minutes = scheduled
        .filter((item) => item.week === week)
        .reduce((total, item) => total + item.minutes, 0);
      expect(minutes).toBeLessThanOrEqual(60);
    }
  });

  it("keeps a single oversized lesson in its own week", () => {
    expect(scheduleWeeks([step(0, 90)], 60)[0].week).toBe(1);
  });
});

describe("level trimming", () => {
  it("gives beginners the first two lessons of a course", () => {
    const course = getCourseById("interview-prep")!;
    expect(selectLessonsForLevel(course, "beginner")).toHaveLength(2);
    expect(selectLessonsForLevel(course, "advanced").length).toBeGreaterThanOrEqual(3);
  });
});

describe("curated path generation", () => {
  it("leads with the matched course and always ends with rehearsal", () => {
    const result = generateLearningPath(baseInput);
    expect(result.matchedTopics.length).toBeGreaterThan(0);
    expect(result.path.modules[0].title).toBe("Git & Version Control Essentials");
    expect(result.path.modules.at(-1)?.title).toContain("interview");
    expect(result.course).toBeUndefined();
    expect(result.path.customCourseId).toBeUndefined();
  });

  it("respects the weekly budget in the schedule", () => {
    const result = generateLearningPath({ ...baseInput, weeklyMinutes: 60 });
    const steps = result.path.modules.flatMap((module) => module.steps);
    const byWeek = new Map<number, number>();
    for (const item of steps) {
      byWeek.set(item.week, (byWeek.get(item.week) ?? 0) + item.minutes);
    }
    for (const minutes of byWeek.values()) {
      expect(minutes).toBeLessThanOrEqual(60);
    }
    expect(result.path.weeks).toBe(Math.max(...steps.map((item) => item.week)));
  });

  it("never repeats a lesson", () => {
    const result = generateLearningPath({ ...baseInput, topic: "testing and docker and ci/cd" });
    const keys = result.path.modules.flatMap((module) =>
      module.steps.map((item) => `${item.courseId}::${item.lessonId}`),
    );
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("caps the path at a realistic number of steps", () => {
    const result = generateLearningPath({
      ...baseInput,
      topic: "git testing docker ci/cd sql machine learning web api",
      level: "advanced",
    });
    expect(result.path.modules.flatMap((module) => module.steps).length).toBeLessThanOrEqual(
      MAX_PATH_STEPS,
    );
  });

  it("produces a rationale that mentions the pacing", () => {
    const result = generateLearningPath(baseInput);
    expect(result.path.rationale).toContain("120 minutes per week");
    expect(result.path.rationale.length).toBeGreaterThan(80);
  });
});

describe("custom topic generation", () => {
  it("synthesises a course when nothing matches", () => {
    const result = generateLearningPath({ ...baseInput, topic: "marine biology field trips" });
    expect(result.matchedTopics).toHaveLength(0);
    expect(result.course?.origin).toBe("custom");
    expect(result.course?.slug).toBe("custom-marine-biology-field-trips");
    expect(result.path.customCourseId).toBe(result.course?.id);
    expect(result.path.rationale).toContain("not in the curated catalogue");
    expect(result.path.modules.length).toBeGreaterThanOrEqual(2);
  });

  it("writes the topic into the lesson titles", () => {
    const course = buildCustomCourse("vector databases", { ...baseInput, topic: "vector databases" });
    const titles = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.title));
    expect(titles.some((title) => title.includes("Vector Databases"))).toBe(true);
    expect(course.modules.flatMap((module) => module.lessons).length).toBeGreaterThanOrEqual(3);
  });

  it("skips the capstone for beginners but keeps it for intermediates", () => {
    const ids = (course: ReturnType<typeof buildCustomCourse>) =>
      course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));
    expect(ids(buildCustomCourse("kafka", { ...baseInput, topic: "kafka", level: "beginner" }))).not.toContain(
      "custom-capstone",
    );
    expect(
      ids(buildCustomCourse("kafka", { ...baseInput, topic: "kafka", level: "intermediate" })),
    ).toContain("custom-capstone");
  });

  it("resolves every curated course referenced by the topic library", () => {
    for (const course of curatedCourses) {
      expect(getCourseById(course.id)).toBeDefined();
    }
  });
});

