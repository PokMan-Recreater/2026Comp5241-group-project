import type {
  Audience,
  Course,
  Lesson,
  PathGenerationInput,
  PathGenerationResult,
  PathModule,
  PathStep,
  SkillLevel,
} from "@/types";
import { courseLessonsOf, getCourseById } from "@/content";
import { matchTopics, matchedLabels, type TopicMatch } from "@/lib/topics";
import { slugify, topicTitle, uid, uniq } from "@/lib/utils";

/**
 * The personalisation engine.
 *
 * Fully deterministic and offline: a learner's topic is matched against the
 * keyword library, the matching courses are ordered into a syllabus, and the
 * result is scheduled into weeks that fit the learner's study budget.
 *
 * When nothing matches, a complete course is *synthesised* for the topic so the
 * learner still receives a structured path instead of an empty state.
 */

export const DEFAULT_WEEKLY_MINUTES = 180;
export const WEEKLY_MINUTE_OPTIONS = [60, 120, 180, 300, 420] as const;
/** Keeps a generated path realistic: roughly one term of part-time study. */
export const MAX_PATH_STEPS = 14;

export function normaliseWeeklyMinutes(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_WEEKLY_MINUTES;
  return Math.min(1200, Math.max(30, Math.round(value)));
}

/** Beginners get the first lessons of each course; everyone else gets them all. */
export function selectLessonsForLevel(course: Course, level: SkillLevel): Lesson[] {
  const lessons = courseLessonsOf(course);
  if (level === "beginner") return lessons.slice(0, Math.min(2, lessons.length));
  return lessons;
}

type UnscheduledStep = Omit<PathStep, "week">;

/** Fills each week up to the learner's budget, then starts a new week. */
export function scheduleWeeks(
  steps: UnscheduledStep[],
  weeklyMinutes: number,
): PathStep[] {
  const budget = normaliseWeeklyMinutes(weeklyMinutes);
  let week = 1;
  let minutesThisWeek = 0;
  return steps.map((step) => {
    if (minutesThisWeek > 0 && minutesThisWeek + step.minutes > budget) {
      week += 1;
      minutesThisWeek = 0;
    }
    minutesThisWeek += step.minutes;
    return { ...step, week };
  });
}

export function countWeeks(steps: PathStep[]): number {
  return steps.reduce((max, step) => Math.max(max, step.week), 1);
}

function createStep(course: Course, lesson: Lesson, focus: string): UnscheduledStep {
  return {
    courseId: course.id,
    courseSlug: course.slug,
    courseTitle: course.title,
    lessonId: lesson.id,
    title: lesson.title,
    minutes: lesson.minutes,
    focus,
  };
}

/** Drops steps that appear twice (a course can be matched by two rules). */
function dedupeSteps(steps: UnscheduledStep[]): UnscheduledStep[] {
  const seen = new Set<string>();
  const result: UnscheduledStep[] = [];
  for (const step of steps) {
    const key = `${step.courseId}::${step.lessonId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(step);
  }
  return result;
}

export interface RationaleContext {
  topic: string;
  matchedTopics: string[];
  courseTitles: string[];
  weeks: number;
  weeklyMinutes: number;
  level: SkillLevel;
  custom: boolean;
}

const LEVEL_NOTE: Record<SkillLevel, string> = {
  beginner: "Because you are starting out, each course is trimmed to its first two lessons so you see progress fast.",
  intermediate: "At your level the full lesson list is included, with an emphasis on applied practice.",
  advanced: "You get the applied and evaluation lessons first; the introductory material is there for reference.",
};

export function buildRationale(context: RationaleContext): string {
  const parts: string[] = [];
  if (context.custom) {
    parts.push(
      `"${context.topic}" is not in the curated catalogue yet, so a mini-course was generated for it and paired with interview practice.`,
    );
  } else {
    parts.push(
      `Matched your topic to ${context.matchedTopics.slice(0, 3).join(", ")}, then ordered the material from vocabulary to applied work.`,
    );
  }
  if (context.courseTitles.length > 0) {
    parts.push(`Sequence: ${context.courseTitles.slice(0, 4).join(" -> ")}.`);
  }
  parts.push(
    `Paced at ${context.weeklyMinutes} minutes per week across ${context.weeks} week${context.weeks === 1 ? "" : "s"}.`,
  );
  parts.push(LEVEL_NOTE[context.level]);
  return parts.join(" ");
}

/**
 * Builds a complete mini-course for a topic the catalogue does not cover.
 * Every lesson is written against the topic name, so the result is specific
 * enough to study from while staying factually safe (it teaches process rather
 * than unverifiable facts about the topic).
 */
export function buildCustomCourseLessons(
  topic: string,
  level: SkillLevel,
  audience: Audience,
): Lesson[] {
  const label = topicTitle(topic);
  const labName = `${slugify(topic) || "topic"}-lab`;
  const nonCs = audience === "non-cs";

  const lessons: Lesson[] = [
    {
      id: "custom-foundations",
      title: `${label} in plain language`,
      minutes: 12,
      objectives: [
        `Explain what ${label} is in one sentence`,
        "Describe where it is used and where it is not",
      ],
      blocks: [
        {
          kind: "text",
          heading: "Start with the outcome, not the tooling",
          body: [
            `${label} is best understood by what it lets you produce. Before learning any commands or interfaces, write down the outcome you need: what should exist at the end, and how you will know it is correct.`,
            nonCs
              ? "Everything in this course is written for people coming from outside computer science: no assumed background, and every new term is defined the first time it appears."
              : `This course assumes you can use a terminal and edit files; everything specific to ${label} is introduced from scratch.`,
          ],
        },
        {
          kind: "callout",
          tone: "info",
          title: "Two sentences that unlock the topic",
          body: `${label} is a repeatable way of turning a described goal into a working result. The skill is not memorising the tool - it is knowing what to check when the result is wrong.`,
        },
        {
          kind: "quiz",
          question: `You are starting your very first ${label} task. What is the best first step?`,
          options: [
            "Write the outcome you need in one sentence, and how you will know it worked",
            "Pick the most popular tool you have heard of and start clicking",
            "Copy the longest tutorial you can find and follow it exactly",
            "Wait until you have completed formal training in the topic",
          ],
          answerIndex: 0,
          explanation:
            "Naming the outcome first tells you which tool and which steps matter. Without it, every tutorial looks equally relevant and you learn nothing transferable.",
        },
      ],
    },
    {
      id: "custom-vocabulary",
      title: "The vocabulary you must be able to use",
      minutes: 15,
      objectives: [
        `Define the five terms you will hear constantly about ${label}`,
        "Ask a precise question when something is unclear",
      ],
      blocks: [
        {
          kind: "text",
          heading: "Vocabulary is the barrier, not the difficulty",
          body: [
            "Most people who 'cannot get into' a topic are missing five or six definitions, not ability. Write your own definitions in your own words; if you cannot, you do not yet understand the term.",
          ],
        },
        {
          kind: "checklist",
          title: `Definitions to write in your own words for ${label}`,
          items: [
            "The smallest unit of work you can repeat",
            "The input you provide and the output you must verify",
            "The constraint that makes output usable: format, length, cost, safety",
            "How you would measure whether the result was good",
            "The failure mode that would make you stop and ask for help",
          ],
        },
        {
          kind: "quiz",
          question: `You find two tutorials that describe ${label} differently. What do you do?`,
          options: [
            "Check which matches the official documentation, then test it on the smallest possible example",
            "Follow the longer tutorial because it must be more thorough",
            "Follow the newer one because dates are everything",
            "Assume the topic is ambiguous and move on",
          ],
          answerIndex: 0,
          explanation:
            "Documentation is the tie-breaker, and a tiny experiment settles arguments faster than more reading. Doing this once teaches you how to resolve every future conflict.",
        },
      ],
    },
    {
      id: "custom-workflow",
      title: `Your first hands-on ${label} workflow`,
      minutes: 20,
      objectives: [
        "Complete one small task end to end",
        "Keep a working baseline you can return to",
      ],
      blocks: [
        {
          kind: "text",
          heading: "One small loop, five steps",
          body: [
            "Work in an isolated folder so experiments cannot damage anything real. Aim for the smallest possible result that you can actually inspect, then improve it one change at a time.",
          ],
        },
        {
          kind: "code",
          language: "bash",
          caption: `The loop that works for any ${label} task`,
          code: `# 1. Isolate the experiment
mkdir ${labName} && cd ${labName}

# 2. Write the goal before you touch any tool
printf "Goal: <one sentence>\\nDone when: <observable result>\\n" > README.md

# 3. Produce the smallest possible result and inspect it
# 4. Change exactly one thing, run again, compare
# 5. Save the version that worked
git init && git add . && git commit -m "Working baseline"`,
        },
        {
          kind: "checklist",
          title: "Hands-on checklist",
          items: [
            "The goal is written down before the tool is opened",
            "The first attempt is deliberately tiny",
            "You inspected the output instead of assuming it worked",
            "Exactly one thing changed between attempts",
            "The working version is committed or copied before the next experiment",
          ],
        },
        {
          kind: "quiz",
          question: `Your first attempt at a ${label} task fails. What is the most useful next step?`,
          options: [
            "Reduce it to the smallest example that still fails, then change one thing at a time",
            "Add more advanced settings and try again",
            "Start over with a completely different tool",
            "Ask someone else to do it and watch them",
          ],
          answerIndex: 0,
          explanation:
            "Shrinking the failing case is the most transferable debugging skill there is. Bigger changes hide causes; smaller ones expose them.",
        },
      ],
    },
    {
      id: "custom-quality",
      title: "Debugging and quality checks",
      minutes: 18,
      objectives: [
        "Turn a vague 'it is broken' into a specific failure",
        "Add one check that stops the failure returning",
      ],
      blocks: [
        {
          kind: "text",
          heading: "Three questions, in order",
          body: [
            `When something about ${label} is wrong, answer in this order: what did I expect, what actually happened, and what is the smallest input that reproduces it? Most of the time the answer is visible in the gap between the first two.`,
            "Then add a check - a test, a validation rule, a note in your README - so the same failure cannot silently return.",
          ],
        },
        {
          kind: "callout",
          tone: "warning",
          title: "Never fix by guessing",
          body: "If you cannot explain why a fix worked, you have not fixed anything - you have moved the failure somewhere less visible.",
        },
        {
          kind: "quiz",
          question: "You cannot explain why your fix worked. What should you do?",
          options: [
            "Keep investigating until you can explain it, then add a check that locks in the behaviour",
            "Move on, since it works now",
            "Revert the fix and try a different approach at random",
            "Assume it was a temporary glitch",
          ],
          answerIndex: 0,
          explanation:
            "An unexplained fix is an unfixed bug. Understanding plus a regression check is what turns a lucky change into a solved problem.",
        },
      ],
    },
    {
      id: "custom-capstone",
      title: "Capstone: build something small end to end",
      minutes: 25,
      objectives: [
        "Ship one complete, small result",
        "Write a README a stranger could follow",
      ],
      blocks: [
        {
          kind: "text",
          heading: "Small and finished beats large and abandoned",
          body: [
            `Choose a task that touches every part of ${label} you have met so far, and that you can finish in one sitting. The point is the complete loop: goal, build, verify, explain.`,
          ],
        },
        {
          kind: "checklist",
          title: "Capstone definition of done",
          items: [
            "It runs from a clean start using only what the README says",
            "One paragraph explains what it does and who it is for",
            "The exact commands to run it are listed in order",
            "A section records what you tried that did not work, and why",
            "You can demo it in under two minutes without notes",
          ],
        },
        {
          kind: "quiz",
          question: "What is the best size for this capstone?",
          options: [
            "Small enough to finish in one sitting, complete and documented",
            "As large as possible so it looks impressive",
            "A copy of an existing product, feature for feature",
            "Whatever the longest tutorial in the topic builds",
          ],
          answerIndex: 0,
          explanation:
            "A finished small project proves the whole loop and gives you something to talk about in an interview. An unfinished large one proves nothing.",
        },
      ],
    },
    {
      id: "custom-explain",
      title: "Explain your work and defend trade-offs",
      minutes: 15,
      objectives: [
        "Describe your work in 90 seconds",
        "Answer 'why did you do it that way?' with evidence",
      ],
      blocks: [
        {
          kind: "text",
          heading: "If you cannot explain it, you do not own it",
          body: [
            `Interviewers and colleagues rarely ask about ${label} in the abstract; they ask what you built and what you decided. Rehearse a 90-second version of your capstone: what it does, the one decision that mattered, and the result.`,
          ],
        },
        {
          kind: "roleplay",
          scenarioId: "behavioural-teamwork",
        },
        {
          kind: "quiz",
          question: "You are asked why you chose one approach over another. What scores best?",
          options: [
            "Name the trade-off and the evidence you had at the time, then what you would change now",
            "Say it was the only option that worked",
            "Say you followed a tutorial",
            "Say it does not matter which approach you use",
          ],
          answerIndex: 0,
          explanation:
            "Interviews and reviews reward visible reasoning. Naming trade-offs and evidence shows you understand the problem rather than memorising a solution.",
        },
      ],
    },
  ];

  return lessons.filter((lesson) => shouldIncludeCustomLesson(lesson.id, level));
}

/** Beginners skip the quality and capstone lessons until they have the basics. */
export function shouldIncludeCustomLesson(lessonId: string, level: SkillLevel): boolean {
  if (level === "beginner") {
    return !["custom-quality", "custom-capstone"].includes(lessonId);
  }
  return true;
}

export function buildCustomCourse(topic: string, input: PathGenerationInput): Course {
  const label = topicTitle(topic);
  const slug = `custom-${slugify(topic) || "topic"}`;
  const lessons = buildCustomCourseLessons(topic, input.level, input.audience);
  const foundationIds = ["custom-foundations", "custom-vocabulary"];
  const appliedIds = ["custom-workflow", "custom-quality", "custom-capstone", "custom-explain"];

  return {
    id: slug,
    slug,
    title: `${label}: a course built for you`,
    subtitle: `Generated mini-course for "${label}"`,
    description: `Generated because "${label}" is not in the curated catalogue yet. It follows the same structure as every SkillForge course: understand the outcome, learn the vocabulary, run one small workflow, then verify and explain your work.`,
    icon: "🧩",
    accent: "from-fuchsia-500 to-indigo-500",
    category: "foundations",
    tags: [label.toLowerCase(), "custom", input.audience],
    level: input.level,
    audience: [input.audience],
    estimatedMinutes: lessons.reduce((sum, lesson) => sum + lesson.minutes, 0),
    outcomes: [
      `Explain ${label} in plain language`,
      "Use the core vocabulary precisely",
      `Complete a small ${label} task end to end`,
      "Verify your own work and explain your decisions",
    ],
    modules: [
      {
        id: "custom-m1",
        title: "Foundations & vocabulary",
        summary: "What it is, where it is used, and the words you need.",
        lessons: lessons.filter((lesson) => foundationIds.includes(lesson.id)),
      },
      {
        id: "custom-m2",
        title: "Hands-on and applied",
        summary: "Build something small, check it, then explain it.",
        lessons: lessons.filter((lesson) => appliedIds.includes(lesson.id)),
      },
    ],
    origin: "custom",
  };
}

/**
 * The single entry point used by the API route, the onboarding wizard and the
 * custom-topic screen. Deterministic: the same input always produces the same
 * path, which is what makes it testable and explainable to the learner.
 */
export function generateLearningPath(
  input: PathGenerationInput,
): PathGenerationResult {
  const topic = input.topic.trim() || "Software engineering fundamentals";
  const weeklyMinutes = normaliseWeeklyMinutes(input.weeklyMinutes);
  const matches: TopicMatch[] = matchTopics(topic);
  const isCustom = matches.length === 0;
  const customCourse = isCustom ? buildCustomCourse(topic, { ...input, topic }) : undefined;

  const courses: Course[] = customCourse
    ? [customCourse]
    : uniq(matches.slice(0, 3).flatMap((match) => match.rule.courseIds))
        .map((id) => getCourseById(id))
        .filter((course): course is Course => Boolean(course));

  const steps: UnscheduledStep[] = [];
  const moduleDrafts: { title: string; summary: string; count: number }[] = [];

  if (customCourse) {
    for (const courseModule of customCourse.modules) {
      if (courseModule.lessons.length === 0) continue;
      steps.push(
        ...courseModule.lessons.map((lesson) =>
          createStep(customCourse, lesson, `Generated for your topic: ${topic}`),
        ),
      );
      moduleDrafts.push({
        title: courseModule.title,
        summary: courseModule.summary,
        count: courseModule.lessons.length,
      });
    }
  } else {
    for (const course of courses) {
      const rule =
        matches.find((match) => match.rule.courseIds[0] === course.id)?.rule ??
        matches.find((match) => match.rule.courseIds.includes(course.id))?.rule;
      const lessons = selectLessonsForLevel(course, input.level);
      if (lessons.length === 0) continue;
      steps.push(
        ...lessons.map((lesson) => createStep(course, lesson, rule?.focus ?? course.subtitle)),
      );
      moduleDrafts.push({ title: course.title, summary: course.subtitle, count: lessons.length });
    }
  }

  // Always finish with rehearsal: the learner must be able to talk about the work.
  const interviewCourse = getCourseById("interview-prep");
  if (interviewCourse && !courses.some((course) => course.id === interviewCourse.id)) {
    const interviewLessons = selectLessonsForLevel(interviewCourse, input.level).filter((lesson) =>
      ["star-stories", "live-coding"].includes(lesson.id),
    );
    if (interviewLessons.length > 0) {
      steps.push(
        ...interviewLessons.map((lesson) =>
          createStep(
            interviewCourse,
            lesson,
            "Rehearse how you will explain this work to someone else.",
          ),
        ),
      );
      moduleDrafts.push({
        title: "Prove it: interview rehearsal",
        summary: "Turn everything you built into stories you can tell under pressure.",
        count: interviewLessons.length,
      });
    }
  }

  const scheduled = scheduleWeeks(dedupeSteps(steps).slice(0, MAX_PATH_STEPS), weeklyMinutes);

  // Slice the scheduled steps back into modules, in the order they were drafted.
  const modules: PathModule[] = [];
  let cursor = 0;
  for (const draft of moduleDrafts) {
    const slice = scheduled.slice(cursor, cursor + draft.count);
    cursor += draft.count;
    if (slice.length === 0) continue;
    modules.push({ id: uid("module"), title: draft.title, summary: draft.summary, steps: slice });
  }
  if (cursor < scheduled.length) {
    modules.push({
      id: uid("module"),
      title: "More practice",
      summary: "Remaining lessons from the matched courses.",
      steps: scheduled.slice(cursor),
    });
  }

  const weeks = countWeeks(scheduled);
  const estimatedMinutes = scheduled.reduce((sum, step) => sum + step.minutes, 0);
  const matchedTopicLabels = isCustom ? [] : matchedLabels(matches);

  return {
    path: {
      id: uid("path"),
      title: `${topicTitle(topic)} path`,
      topic,
      summary: isCustom
        ? `A generated mini-course on ${topicTitle(topic)}, followed by interview rehearsal.`
        : `A ${weeks}-week path across ${courses.length} mini-course${courses.length === 1 ? "" : "s"}, matched to "${topic}".`,
      rationale: buildRationale({
        topic,
        matchedTopics: matchedTopicLabels,
        courseTitles: courses.map((course) => course.title),
        weeks,
        weeklyMinutes,
        level: input.level,
        custom: isCustom,
      }),
      source: isCustom ? "rule-based" : "curated",
      audience: input.audience,
      level: input.level,
      weeklyMinutes,
      weeks,
      estimatedMinutes,
      modules,
      customCourseId: customCourse?.id,
      createdAt: new Date().toISOString(),
    },
    course: customCourse,
    matchedTopics: matchedTopicLabels,
  };
}



