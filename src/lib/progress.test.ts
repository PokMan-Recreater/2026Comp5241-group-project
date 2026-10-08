import { describe, expect, it } from "vitest";
import {
  XP_PER_CHALLENGE,
  XP_PER_CORRECT_ANSWER,
  XP_PER_LESSON,
  completeLesson,
  computeCompletion,
  countCompletedLessons,
  earnedBadges,
  emptyProgress,
  estimateRemainingWeeks,
  levelFromXp,
  lessonKey,
  nextLessonInCourse,
  nextStreak,
  recordChallenge,
  recordInterview,
  recordQuiz,
  reopenLesson,
  toggleBookmark,
} from "@/lib/progress";
import type { Course, Lesson } from "@/types";

const lessons: Lesson[] = [
  { id: "l1", title: "One", minutes: 10, objectives: [], blocks: [] },
  { id: "l2", title: "Two", minutes: 20, objectives: [], blocks: [] },
];

const course: Course = {
  id: "c1",
  slug: "c1",
  title: "Test course",
  subtitle: "",
  description: "",
  icon: "🧪",
  accent: "from-x to-y",
  category: "foundations",
  tags: [],
  level: "beginner",
  audience: ["cs"],
  estimatedMinutes: 30,
  outcomes: [],
  modules: [{ id: "m1", title: "M", summary: "", lessons }],
  origin: "curated",
};

describe("streaks", () => {
  it("starts at 1 with no history", () => {
    expect(nextStreak({ streakDays: 0, lastActiveDate: null }, "2026-10-08")).toBe(1);
  });

  it("does not double count the same day", () => {
    expect(nextStreak({ streakDays: 4, lastActiveDate: "2026-10-08" }, "2026-10-08")).toBe(4);
  });

  it("increments on consecutive days", () => {
    expect(nextStreak({ streakDays: 4, lastActiveDate: "2026-10-07" }, "2026-10-08")).toBe(5);
  });

  it("resets after a missed day", () => {
    expect(nextStreak({ streakDays: 9, lastActiveDate: "2026-10-05" }, "2026-10-08")).toBe(1);
  });
});

describe("lesson completion", () => {
  it("awards XP once per lesson", () => {
    const first = completeLesson(emptyProgress(), "c1", "l1", "2026-10-08");
    const second = completeLesson(first, "c1", "l1", "2026-10-08");
    expect(first.xp).toBe(XP_PER_LESSON);
    expect(second.xp).toBe(XP_PER_LESSON);
    expect(second.lessons[lessonKey("c1", "l1")].completed).toBe(true);
  });

  it("can be reopened without losing the record", () => {
    const done = completeLesson(emptyProgress(), "c1", "l1", "2026-10-08");
    const reopened = reopenLesson(done, "c1", "l1");
    expect(reopened.lessons[lessonKey("c1", "l1")].completed).toBe(false);
    expect(reopened.lessons[lessonKey("c1", "l1")].completedAt).toBe("2026-10-08");
  });
});

describe("quiz and challenge rewards", () => {
  it("only pays for improvement over the previous best", () => {
    const one = recordQuiz(emptyProgress(), "c1", "l1", 1, 3, "2026-10-08");
    expect(one.xp).toBe(XP_PER_CORRECT_ANSWER);
    const two = recordQuiz(one, "c1", "l1", 3, 3, "2026-10-08");
    expect(two.xp).toBe(XP_PER_CORRECT_ANSWER * 3);
    const three = recordQuiz(two, "c1", "l1", 2, 3, "2026-10-08");
    expect(three.xp).toBe(XP_PER_CORRECT_ANSWER * 3);
    expect(three.lessons[lessonKey("c1", "l1")].quizScore).toBe(3);
  });

  it("counts challenge attempts but rewards the first pass only", () => {
    const fail = recordChallenge(emptyProgress(), "js-fizzbuzz", false, "code", "2026-10-08");
    expect(fail.xp).toBe(0);
    expect(fail.challenges["js-fizzbuzz"].attempts).toBe(1);
    const pass = recordChallenge(fail, "js-fizzbuzz", true, "better", "2026-10-08");
    expect(pass.xp).toBe(XP_PER_CHALLENGE);
    const again = recordChallenge(pass, "js-fizzbuzz", true, "best", "2026-10-08");
    expect(again.xp).toBe(XP_PER_CHALLENGE);
    expect(again.challenges["js-fizzbuzz"].attempts).toBe(3);
  });

  it("records interview attempts", () => {
    const state = recordInterview(emptyProgress(), "s1", "Screen", 82, "a1", "2026-10-08");
    expect(state.interviews).toHaveLength(1);
    expect(state.interviews[0].score).toBe(82);
  });
});

describe("bookmarks", () => {
  it("toggles on and off", () => {
    const on = toggleBookmark(emptyProgress(), "c1::l1");
    expect(on.bookmarks).toContain("c1::l1");
    expect(toggleBookmark(on, "c1::l1").bookmarks).toHaveLength(0);
  });
});

describe("levels", () => {
  it("maps XP onto levels and progress", () => {
    expect(levelFromXp(0).level).toBe(1);
    expect(levelFromXp(0).title).toBe("Explorer");
    expect(levelFromXp(250).level).toBe(2);
    expect(levelFromXp(260).progressPercent).toBe(4);
    expect(levelFromXp(5000).title).toBe("Mentor");
  });
});

describe("completion summaries", () => {
  it("counts completed lessons and minutes", () => {
    const state = completeLesson(emptyProgress(), "c1", "l1", "2026-10-08");
    const summary = computeCompletion(lessons, "c1", state);
    expect(summary).toMatchObject({
      completedLessons: 1,
      totalLessons: 2,
      completedMinutes: 10,
      totalMinutes: 30,
      percent: 50,
    });
    expect(countCompletedLessons(state)).toBe(1);
  });

  it("points at the first uncompleted lesson", () => {
    expect(nextLessonInCourse(course, emptyProgress())?.lesson.id).toBe("l1");
    const state = completeLesson(emptyProgress(), "c1", "l1", "2026-10-08");
    expect(nextLessonInCourse(course, state)?.lesson.id).toBe("l2");
    const allDone = completeLesson(state, "c1", "l2", "2026-10-08");
    expect(nextLessonInCourse(course, allDone)).toBeNull();
  });
});

describe("badges", () => {
  it("unlocks from real progress only", () => {
    const fresh = earnedBadges(emptyProgress(), [course]);
    expect(fresh.every((badge) => !badge.earned)).toBe(true);

    let state = completeLesson(emptyProgress(), "c1", "l1", "2026-10-08");
    state = recordQuiz(state, "c1", "l1", 3, 3, "2026-10-08");
    state = recordChallenge(state, "js-fizzbuzz", true, "", "2026-10-08");
    state = recordInterview(state, "s1", "Screen", 90, "a1", "2026-10-08");
    const ids = earnedBadges(state, [course])
      .filter((badge) => badge.earned)
      .map((badge) => badge.id);
    expect(ids).toContain("first-lesson");
    expect(ids).toContain("quiz-ace");
    expect(ids).toContain("debugger");
    expect(ids).toContain("interview-ready");
    expect(ids).not.toContain("five-lessons");
  });
});

describe("remaining time", () => {
  it("rounds up to whole weeks and never divides by zero", () => {
    expect(estimateRemainingWeeks(200, 180)).toBe(2);
    expect(estimateRemainingWeeks(0, 180)).toBe(1);
    expect(estimateRemainingWeeks(200, 0)).toBe(0);
  });
});

