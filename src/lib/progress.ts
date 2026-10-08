import type {
  Badge,
  Course,
  LearningPath,
  Lesson,
  ProgressState,
  SkillLevel,
} from "@/types";
import { clamp, daysBetween, percent, todayKey } from "@/lib/utils";

/**
 * Pure progress rules. No React, no localStorage: the provider in
 * `src/components/providers/AppDataProvider.tsx` persists whatever these
 * functions return.
 */

export const XP_PER_LESSON = 40;
export const XP_PER_CORRECT_ANSWER = 15;
export const XP_PER_CHALLENGE = 60;
export const XP_PER_INTERVIEW = 50;
export const XP_PER_LEVEL = 250;

export const LEVEL_TITLES = [
  "Explorer",
  "Builder",
  "Engineer",
  "Specialist",
  "Architect",
  "Mentor",
] as const;

export function lessonKey(courseId: string, lessonId: string): string {
  return `${courseId}::${lessonId}`;
}

export function emptyProgress(): ProgressState {
  return {
    lessons: {},
    xp: 0,
    streakDays: 0,
    lastActiveDate: null,
    bookmarks: [],
    interviews: [],
    challenges: {},
  };
}

/**
 * Streaks advance at most once per calendar day:
 * - same day -> unchanged
 * - next day -> +1
 * - gap      -> reset to 1
 */
export function nextStreak(
  state: Pick<ProgressState, "streakDays" | "lastActiveDate">,
  today: string = todayKey(),
): number {
  if (!state.lastActiveDate) return 1;
  const gap = daysBetween(state.lastActiveDate, today);
  if (gap <= 0) return Math.max(1, state.streakDays);
  if (gap === 1) return state.streakDays + 1;
  return 1;
}

function touch(state: ProgressState, today: string): ProgressState {
  return {
    ...state,
    streakDays: nextStreak(state, today),
    lastActiveDate: today,
  };
}

export function completeLesson(
  state: ProgressState,
  courseId: string,
  lessonId: string,
  today: string = todayKey(),
): ProgressState {
  const key = lessonKey(courseId, lessonId);
  const existing = state.lessons[key];
  const alreadyDone = existing?.completed ?? false;
  return touch(
    {
      ...state,
      xp: state.xp + (alreadyDone ? 0 : XP_PER_LESSON),
      lessons: {
        ...state.lessons,
        [key]: {
          ...existing,
          completed: true,
          completedAt: existing?.completedAt ?? today,
        },
      },
    },
    today,
  );
}

export function reopenLesson(
  state: ProgressState,
  courseId: string,
  lessonId: string,
): ProgressState {
  const key = lessonKey(courseId, lessonId);
  const existing = state.lessons[key];
  if (!existing) return state;
  return {
    ...state,
    lessons: { ...state.lessons, [key]: { ...existing, completed: false } },
  };
}

/** Records the best quiz result for a lesson and awards XP for new correct answers. */
export function recordQuiz(
  state: ProgressState,
  courseId: string,
  lessonId: string,
  correct: number,
  total: number,
  today: string = todayKey(),
): ProgressState {
  const key = lessonKey(courseId, lessonId);
  const existing = state.lessons[key];
  const previousBest = existing?.quizScore ?? 0;
  const improvement = Math.max(0, correct - previousBest);
  return touch(
    {
      ...state,
      xp: state.xp + improvement * XP_PER_CORRECT_ANSWER,
      lessons: {
        ...state.lessons,
        [key]: {
          completed: existing?.completed ?? false,
          completedAt: existing?.completedAt,
          quizScore: Math.max(previousBest, correct),
          quizTotal: Math.max(existing?.quizTotal ?? 0, total),
        },
      },
    },
    today,
  );
}

export function recordChallenge(
  state: ProgressState,
  challengeId: string,
  passed: boolean,
  lastCode?: string,
  today: string = todayKey(),
): ProgressState {
  const existing = state.challenges[challengeId];
  const alreadyPassed = existing?.passed ?? false;
  return touch(
    {
      ...state,
      xp: state.xp + (passed && !alreadyPassed ? XP_PER_CHALLENGE : 0),
      challenges: {
        ...state.challenges,
        [challengeId]: {
          passed: alreadyPassed || passed,
          attempts: (existing?.attempts ?? 0) + 1,
          lastCode: lastCode ?? existing?.lastCode,
          at: today,
        },
      },
    },
    today,
  );
}

export function recordInterview(
  state: ProgressState,
  scenarioId: string,
  scenarioTitle: string,
  score: number,
  attemptId: string,
  today: string = todayKey(),
): ProgressState {
  return touch(
    {
      ...state,
      xp: state.xp + XP_PER_INTERVIEW,
      interviews: [
        ...state.interviews,
        { id: attemptId, scenarioId, scenarioTitle, score, at: today },
      ],
    },
    today,
  );
}

export function toggleBookmark(state: ProgressState, key: string): ProgressState {
  const has = state.bookmarks.includes(key);
  return {
    ...state,
    bookmarks: has
      ? state.bookmarks.filter((item) => item !== key)
      : [...state.bookmarks, key],
  };
}

export interface LevelInfo {
  level: number;
  title: string;
  xpIntoLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
}

export function levelFromXp(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.round(xp));
  const level = Math.floor(safeXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = safeXp % XP_PER_LEVEL;
  return {
    level,
    title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
    xpIntoLevel,
    xpForNextLevel: XP_PER_LEVEL,
    progressPercent: percent(xpIntoLevel, XP_PER_LEVEL),
  };
}

export interface CompletionSummary {
  completedLessons: number;
  totalLessons: number;
  completedMinutes: number;
  totalMinutes: number;
  percent: number;
}

export function computeCompletion(
  lessons: Lesson[],
  courseId: string,
  state: ProgressState,
): CompletionSummary {
  let completedLessons = 0;
  let completedMinutes = 0;
  let totalMinutes = 0;
  for (const lesson of lessons) {
    totalMinutes += lesson.minutes;
    if (state.lessons[lessonKey(courseId, lesson.id)]?.completed) {
      completedLessons += 1;
      completedMinutes += lesson.minutes;
    }
  }
  return {
    completedLessons,
    totalLessons: lessons.length,
    completedMinutes,
    totalMinutes,
    percent: percent(completedLessons, lessons.length),
  };
}

export function courseLessons(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function computeCourseProgress(
  course: Course,
  state: ProgressState,
): CompletionSummary {
  return computeCompletion(courseLessons(course), course.id, state);
}

export function computePathProgress(
  path: LearningPath,
  state: ProgressState,
): CompletionSummary {
  const steps = path.modules.flatMap((module) => module.steps);
  let completedSteps = 0;
  let completedMinutes = 0;
  let totalMinutes = 0;
  for (const step of steps) {
    totalMinutes += step.minutes;
    if (state.lessons[lessonKey(step.courseId, step.lessonId)]?.completed) {
      completedSteps += 1;
      completedMinutes += step.minutes;
    }
  }
  return {
    completedLessons: completedSteps,
    totalLessons: steps.length,
    completedMinutes,
    totalMinutes,
    percent: percent(completedSteps, steps.length),
  };
}

/** The next uncompleted step of a path, or null when the path is finished. */
export function nextPathStep(
  path: LearningPath,
  state: ProgressState,
): { courseSlug: string; lessonId: string; title: string } | null {
  for (const pathModule of path.modules) {
    for (const step of pathModule.steps) {
      if (!state.lessons[lessonKey(step.courseId, step.lessonId)]?.completed) {
        return {
          courseSlug: step.courseSlug,
          lessonId: step.lessonId,
          title: step.title,
        };
      }
    }
  }
  return null;
}

export interface NextLessonPointer {
  course: Course;
  lesson: Lesson;
  moduleTitle: string;
}

/** First uncompleted lesson of a course, walking modules in order. */
export function nextLessonInCourse(
  course: Course,
  state: ProgressState,
): NextLessonPointer | null {
  for (const courseModule of course.modules) {
    for (const lesson of courseModule.lessons) {
      if (!state.lessons[lessonKey(course.id, lesson.id)]?.completed) {
        return { course, lesson, moduleTitle: courseModule.title };
      }
    }
  }
  return null;
}

export function levelUpOccurred(before: number, after: number): boolean {
  return levelFromXp(after).level > levelFromXp(before).level;
}

const LEVEL_ORDER: SkillLevel[] = ["beginner", "intermediate", "advanced"];

export function levelRank(level: SkillLevel): number {
  return Math.max(0, LEVEL_ORDER.indexOf(level));
}

export function levelAtLeast(value: SkillLevel, floor: SkillLevel): boolean {
  return levelRank(value) >= levelRank(floor);
}

/** Gamification badges, all derived from progress (no extra storage needed). */
export function earnedBadges(state: ProgressState, courses: Course[]): Badge[] {
  const completedCount = countCompletedLessons(state);
  const perfectQuiz = Object.values(state.lessons).some(
    (lesson) =>
      lesson.quizTotal !== undefined &&
      lesson.quizTotal > 0 &&
      lesson.quizScore === lesson.quizTotal,
  );
  const passedChallenges = Object.values(state.challenges).filter(
    (attempt) => attempt.passed,
  ).length;
  const bestInterview = state.interviews.reduce(
    (best, attempt) => Math.max(best, attempt.score),
    0,
  );
  const finishedCourse = courses.some(
    (course) => computeCourseProgress(course, state).percent === 100,
  );

  return [
    {
      id: "first-lesson",
      label: "First Steps",
      description: "Complete your very first lesson.",
      icon: "🌱",
      earned: completedCount >= 1,
    },
    {
      id: "five-lessons",
      label: "Momentum",
      description: "Complete 5 lessons.",
      icon: "🚀",
      earned: completedCount >= 5,
    },
    {
      id: "quiz-ace",
      label: "Quiz Ace",
      description: "Get every question right in a lesson quiz.",
      icon: "🎯",
      earned: perfectQuiz,
    },
    {
      id: "debugger",
      label: "Debugger",
      description: "Pass a coding challenge.",
      icon: "🐞",
      earned: passedChallenges >= 1,
    },
    {
      id: "streak-3",
      label: "Habit Forming",
      description: "Study 3 days in a row.",
      icon: "🔥",
      earned: state.streakDays >= 3,
    },
    {
      id: "interview-ready",
      label: "Interview Ready",
      description: "Score 75% or higher in a mock interview.",
      icon: "🎤",
      earned: bestInterview >= 75,
    },
    {
      id: "course-complete",
      label: "Course Finisher",
      description: "Finish every lesson in a course.",
      icon: "🏆",
      earned: finishedCourse,
    },
  ];
}

export function countCompletedLessons(state: ProgressState): number {
  return Object.values(state.lessons).filter((lesson) => lesson.completed).length;
}

export function estimateRemainingWeeks(
  minutesRemaining: number,
  weeklyMinutes: number,
): number {
  if (weeklyMinutes <= 0) return 0;
  const safe = clamp(minutesRemaining, 0, Number.MAX_SAFE_INTEGER);
  return Math.max(1, Math.ceil(safe / weeklyMinutes));
}


