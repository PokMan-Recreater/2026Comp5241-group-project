/**
 * Core domain model for SkillForge.
 *
 * Everything here is plain data so that it can be serialised to localStorage,
 * sent over the wire to API routes, and unit tested without a DOM.
 */

/* -------------------------------------------------------------------------- */
/* Learner                                                                    */
/* -------------------------------------------------------------------------- */

/** Who the learner is. Non-CS learners get different framing and pacing. */
export type Audience = "cs" | "non-cs";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

/** What the learner wants out of the platform. */
export type LearnerGoal = "career" | "work" | "project" | "curiosity";

export interface LearnerProfile {
  id: string;
  displayName: string;
  audience: Audience;
  level: SkillLevel;
  goal: LearnerGoal;
  /** Self reported study budget, in minutes per week. */
  weeklyMinutes: number;
  /** Free-form interest tags, e.g. ["ai", "web", "data"]. */
  interests: string[];
  createdAt: string;
}

/* -------------------------------------------------------------------------- */
/* Lesson content                                                             */
/* -------------------------------------------------------------------------- */

export type SimulationId =
  | "git-branching"
  | "prompt-lab"
  | "rag-pipeline"
  | "pipeline-runner"
  | "container-lifecycle"
  | "gradient-descent";

export interface TextBlock {
  kind: "text";
  heading?: string;
  body: string[];
}

export interface CalloutBlock {
  kind: "callout";
  tone: "info" | "tip" | "warning";
  title: string;
  body: string;
}

export interface CodeBlock {
  kind: "code";
  language: string;
  caption?: string;
  code: string;
}

export interface ChecklistBlock {
  kind: "checklist";
  title: string;
  items: string[];
}

export interface QuizBlock {
  kind: "quiz";
  question: string;
  options: string[];
  /** Index into `options` of the correct answer. */
  answerIndex: number;
  explanation: string;
}

export interface SimulationBlock {
  kind: "simulation";
  simulationId: SimulationId;
  title: string;
  description: string;
}

export interface ChallengeBlock {
  kind: "challenge";
  challengeId: string;
}

export interface RolePlayBlock {
  kind: "roleplay";
  scenarioId: string;
}

export type LessonBlock =
  | TextBlock
  | CalloutBlock
  | CodeBlock
  | ChecklistBlock
  | QuizBlock
  | SimulationBlock
  | ChallengeBlock
  | RolePlayBlock;

/* -------------------------------------------------------------------------- */
/* Learning paths                                                             */
/* -------------------------------------------------------------------------- */

export interface PathStep {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  lessonId: string;
  title: string;
  minutes: number;
  /** One-line reason this step is in the path. */
  focus: string;
  /** 1-based week number the step is scheduled into. */
  week: number;
}

export interface PathModule {
  id: string;
  title: string;
  summary: string;
  steps: PathStep[];
}

export type PathSource = "curated" | "rule-based" | "ai";

export interface LearningPath {
  id: string;
  title: string;
  /** The topic the learner typed (or the curated theme name). */
  topic: string;
  summary: string;
  /** Why the generator produced this ordering. */
  rationale: string;
  source: PathSource;
  audience: Audience;
  level: SkillLevel;
  weeklyMinutes: number;
  /** Total planned weeks. */
  weeks: number;
  estimatedMinutes: number;
  modules: PathModule[];
  /** Set when the topic required a synthesised course. */
  customCourseId?: string;
  createdAt: string;
}

export interface PathGenerationInput {
  topic: string;
  audience: Audience;
  level: SkillLevel;
  weeklyMinutes: number;
  goal: LearnerGoal;
}

export interface PathGenerationResult {
  path: LearningPath;
  /** Present when a new course had to be synthesised for the topic. */
  course?: Course;
  /** Topic keywords the generator matched, useful for explaining the result. */
  matchedTopics: string[];
}

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

export interface LessonProgress {
  completed: boolean;
  completedAt?: string;
  /** Best quiz result for this lesson. */
  quizScore?: number;
  quizTotal?: number;
}

export interface InterviewAttempt {
  id: string;
  scenarioId: string;
  scenarioTitle: string;
  /** Percentage score from the rubric, 0-100. */
  score: number;
  at: string;
}

export interface ChallengeAttempt {
  passed: boolean;
  attempts: number;
  lastCode?: string;
  at: string;
}

export interface ProgressState {
  /** Keyed by `lessonKey(courseId, lessonId)`. */
  lessons: Record<string, LessonProgress>;
  xp: number;
  streakDays: number;
  /** Local `YYYY-MM-DD` of the last activity. */
  lastActiveDate: string | null;
  bookmarks: string[];
  interviews: InterviewAttempt[];
  challenges: Record<string, ChallengeAttempt>;
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: string;
  earned: boolean;
}

/* -------------------------------------------------------------------------- */
/* Code challenges                                                            */
/* -------------------------------------------------------------------------- */

export interface CodeTest {
  name: string;
  /**
   * JavaScript expression evaluated inside the sandbox with two variables in
   * scope: `fn` (the learner's function) and `expect` (a tiny assertion helper).
   * It must evaluate to a truthy value when the test passes.
   */
  run: string;
  /** Shown when the test fails, so learners know what was expected. */
  expectation: string;
}

export interface CodeChallenge {
  id: string;
  title: string;
  difficulty: SkillLevel;
  /** The task statement. */
  prompt: string;
  /** Name of the function the tests will call. */
  entryPoint: string;
  starterCode: string;
  hint: string;
  /** Reference solution, revealed on demand. */
  solution: string;
  tests: CodeTest[];
}

/* -------------------------------------------------------------------------- */
/* Role play / mock interviews                                                */
/* -------------------------------------------------------------------------- */

export interface InterviewQuestion {
  id: string;
  prompt: string;
  /** Words that signal a strong answer for this question. */
  keywords: string[];
  /** What an excellent answer covers, shown as model guidance. */
  modelOutline: string[];
}

export interface InterviewScenario {
  id: string;
  title: string;
  role: string;
  company: string;
  difficulty: SkillLevel;
  /** Whether the scenario is aimed at non-CS candidates. */
  audience: Audience[];
  brief: string;
  interviewerPersona: string;
  questions: InterviewQuestion[];
}

/* -------------------------------------------------------------------------- */
/* Simulations                                                                */
/* -------------------------------------------------------------------------- */

export interface SimulationMeta {
  id: SimulationId;
  title: string;
  description: string;
  /** The skill the learner practises. */
  skill: string;
  minutes: number;
}

export interface Lesson {
  id: string;
  title: string;
  minutes: number;
  objectives: string[];
  blocks: LessonBlock[];
}

export interface CourseModule {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
}

export type CourseCategory =
  | "foundations"
  | "ai"
  | "engineering"
  | "data"
  | "career";

export interface Course {
  id: string;
  /** URL friendly identifier, used by /courses/[slug]. */
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  /** Emoji used as a lightweight icon. */
  icon: string;
  /** Tailwind gradient classes, e.g. "from-indigo-500 to-sky-400". */
  accent: string;
  category: CourseCategory;
  tags: string[];
  level: SkillLevel;
  audience: Audience[];
  estimatedMinutes: number;
  outcomes: string[];
  modules: CourseModule[];
  /** "curated" ships with the repo, "custom" is generated for a learner topic. */
  origin: "curated" | "custom";
}
