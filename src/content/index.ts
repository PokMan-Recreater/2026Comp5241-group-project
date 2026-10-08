import type { Audience, Course, CourseCategory, Lesson, SkillLevel } from "@/types";
import { aiToolkit } from "./courses/ai-toolkit";
import { cicdPipelines } from "./courses/cicd-pipelines";
import { dataSql } from "./courses/data-sql";
import { dockerContainers } from "./courses/docker-containers";
import { gitEssentials } from "./courses/git-essentials";
import { interviewPrep } from "./courses/interview-prep";
import { llmApps } from "./courses/llm-apps";
import { mlFoundations } from "./courses/ml-foundations";
import { promptEngineering } from "./courses/prompt-engineering";
import { pythonFirstSteps } from "./courses/python-first-steps";
import { testingTdd } from "./courses/testing-tdd";

export { CODE_CHALLENGES, getChallenge } from "./challenges";
export {
  ROLE_PLAY_SCENARIOS,
  getScenario,
  scenariosForAudience,
} from "./roleplays";
export { SIMULATIONS, SIMULATION_IDS, getSimulation } from "./simulations";

/** Every course that ships with the repository. */
export const curatedCourses: Course[] = [
  gitEssentials,
  pythonFirstSteps,
  aiToolkit,
  promptEngineering,
  llmApps,
  testingTdd,
  dockerContainers,
  cicdPipelines,
  dataSql,
  interviewPrep,
  mlFoundations,
];

export const CATEGORY_LABELS: Record<CourseCategory, string> = {
  foundations: "Foundations",
  ai: "AI & LLMs",
  engineering: "Engineering practice",
  data: "Data",
  career: "Career",
};

export const CATEGORY_ORDER: CourseCategory[] = [
  "foundations",
  "ai",
  "engineering",
  "data",
  "career",
];

export function getCourseBySlug(slug: string): Course | undefined {
  return curatedCourses.find((course) => course.slug === slug);
}

export function getCourseById(id: string): Course | undefined {
  return curatedCourses.find((course) => course.id === id);
}

export function courseLessonsOf(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export interface LessonLocation {
  course: Course;
  lesson: Lesson;
  moduleId: string;
  moduleTitle: string;
  /** Index within the course's flat lesson list. */
  index: number;
  total: number;
}

export function findLesson(course: Course, lessonId: string): LessonLocation | undefined {
  const lessons = courseLessonsOf(course);
  const index = lessons.findIndex((lesson) => lesson.id === lessonId);
  if (index === -1) return undefined;
  const lesson = lessons[index];
  const parent = course.modules.find((module) =>
    module.lessons.some((candidate) => candidate.id === lessonId),
  );
  return {
    course,
    lesson,
    moduleId: parent?.id ?? "",
    moduleTitle: parent?.title ?? "",
    index,
    total: lessons.length,
  };
}

export function getLessonBySlug(
  slug: string,
  lessonId: string,
): LessonLocation | undefined {
  const course = getCourseBySlug(slug);
  if (!course) return undefined;
  return findLesson(course, lessonId);
}

export function totalMinutes(course: Course): number {
  return courseLessonsOf(course).reduce((sum, lesson) => sum + lesson.minutes, 0);
}

export const TOTAL_CURATED_LESSONS = curatedCourses.reduce(
  (sum, course) => sum + courseLessonsOf(course).length,
  0,
);

export const TOTAL_CURATED_MINUTES = curatedCourses.reduce(
  (sum, course) => sum + totalMinutes(course),
  0,
);

export function coursesForAudience(audience: Audience): Course[] {
  return curatedCourses.filter((course) => course.audience.includes(audience));
}

export function coursesByLevel(level: SkillLevel): Course[] {
  return curatedCourses.filter((course) => course.level === level);
}

export function coursesByCategory(category: CourseCategory): Course[] {
  return curatedCourses.filter((course) => course.category === category);
}

/** Simple relevance search across title, subtitle, tags and description. */
export function searchCourses(query: string, courses: Course[] = curatedCourses): Course[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return courses;
  const terms = needle.split(/\s+/).filter(Boolean);
  return courses
    .map((course) => {
      const haystack = [
        course.title,
        course.subtitle,
        course.description,
        course.tags.join(" "),
        course.category,
      ]
        .join(" ")
        .toLowerCase();
      const score = terms.reduce(
        (total, term) => total + (haystack.includes(term) ? 1 : 0),
        0,
      );
      return { course, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.course);
}

/** Topic ideas offered on the custom-topic screen. */
export const TOPIC_SUGGESTIONS: string[] = [
  "Git for designers",
  "Vector databases",
  "Kubernetes basics",
  "Move from Excel to Python",
  "AI for marketing teams",
  "Prompt injection and defence",
  "Reading a research paper",
  "Accessibility testing",
  "Cloud costs for beginners",
  "No-code automation",
  "Data ethics at work",
  "Debugging with browser dev tools",
];
