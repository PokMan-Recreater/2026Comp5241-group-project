import { uniq } from "@/lib/utils";

/**
 * Keyword library that maps a learner's free-text topic onto curated courses.
 * Kept separate from the path generator so it can grow without touching logic,
 * and so it can be unit tested on its own.
 */

export interface TopicRule {
  id: string;
  label: string;
  /** Matched as whole-word prefixes against the learner's topic. */
  keywords: string[];
  /** Curated course ids to include, most relevant first. */
  courseIds: string[];
  focus: string;
}

export const TOPIC_LIBRARY: TopicRule[] = [
  {
    id: "git",
    label: "Version control & Git",
    keywords: ["git", "version control", "github", "branch", "commit", "pull request", "code review", "merge"],
    courseIds: ["git-essentials", "cicd-pipelines"],
    focus: "Version control is the shared language of every engineering team.",
  },
  {
    id: "python",
    label: "Python & scripting",
    keywords: ["python", "scripting", "script", "pandas", "numpy", "notebook", "jupyter"],
    courseIds: ["python-first-steps", "testing-tdd"],
    focus: "Python is the fastest route from a manual task to a repeatable one.",
  },
  {
    id: "ai-tools",
    label: "AI tools at work",
    keywords: ["ai tool", "chatgpt", "copilot", "ai assistant", "generative ai", "ai literacy", "ai for", "ai at work"],
    courseIds: ["ai-toolkit", "prompt-engineering"],
    focus: "Knowing what the tools do - and where they fail - is what makes them safe to use.",
  },
  {
    id: "prompting",
    label: "Prompt engineering",
    keywords: ["prompt", "prompting", "system message", "few-shot"],
    courseIds: ["prompt-engineering", "llm-apps"],
    focus: "A prompt in production is code: it needs a contract, a format and tests.",
  },
  {
    id: "llm",
    label: "LLM applications",
    keywords: ["llm", "gpt", "rag", "retrieval", "embedding", "vector", "chatbot", "agent", "openai", "fine-tun", "language model"],
    courseIds: ["llm-apps", "prompt-engineering"],
    focus: "The value sits in the engineering around the model: context, retrieval and budgets.",
  },
  {
    id: "testing",
    label: "Testing & quality",
    keywords: ["test", "tdd", "unit test", "qa", "quality", "debug", "regression"],
    courseIds: ["testing-tdd", "git-essentials"],
    focus: "Tests are what let you change code quickly without fear.",
  },
  {
    id: "docker",
    label: "Containers & Docker",
    keywords: ["docker", "container", "kubernetes", "k8s", "devops"],
    courseIds: ["docker-containers", "cicd-pipelines"],
    focus: "Containers delete 'it works on my machine' from the team vocabulary.",
  },
  {
    id: "cicd",
    label: "CI/CD & deployment",
    keywords: ["ci/cd", "cicd", "continuous integration", "github actions", "pipeline", "deployment", "deploy", "release", "vercel", "hosting"],
    courseIds: ["cicd-pipelines", "docker-containers"],
    focus: "Automated checks are what turn shipping into a non-event.",
  },
  {
    id: "sql",
    label: "SQL & analytics",
    keywords: ["sql", "database", "query", "data analysis", "analytics", "dashboard", "table", "join", "excel", "reporting"],
    courseIds: ["data-sql", "ml-foundations"],
    focus: "SQL lets you answer your own questions instead of waiting in a queue.",
  },
  {
    id: "ml",
    label: "Machine learning",
    keywords: ["machine learning", "ml", "model training", "neural", "deep learning", "regression", "classification", "data science", "prediction"],
    courseIds: ["ml-foundations", "llm-apps"],
    focus: "Loss, validation and baselines are what stop ML projects failing quietly.",
  },
  {
    id: "web",
    label: "Web development",
    keywords: ["react", "frontend", "front end", "javascript", "typescript", "web app", "html", "css", "next.js"],
    courseIds: ["testing-tdd", "git-essentials", "cicd-pipelines"],
    focus: "Front-end work rewards the same three habits: version control, tests and a deploy pipeline.",
  },
  {
    id: "cloud",
    label: "Cloud & infrastructure",
    keywords: ["cloud", "aws", "azure", "gcp", "serverless", "infrastructure", "terraform"],
    courseIds: ["cicd-pipelines", "docker-containers"],
    focus: "Cloud work is mostly repeatable deployment plus observability.",
  },
  {
    id: "security",
    label: "Security basics",
    keywords: ["security", "secure", "owasp", "vulnerab", "auth", "encryption", "privacy"],
    courseIds: ["testing-tdd", "docker-containers"],
    focus: "Most security wins come from small habits: validate input, handle secrets well, test the edges.",
  },
  {
    id: "agile",
    label: "Agile & teamwork",
    keywords: ["agile", "scrum", "sprint", "standup", "jira", "team", "collaboration", "project management"],
    courseIds: ["git-essentials", "interview-prep"],
    focus: "Process keeps information flowing; tooling is how it becomes visible.",
  },
  {
    id: "career",
    label: "Interview & career",
    keywords: ["interview", "job", "career", "resume", "cv", "behavioural", "behavioral", "hiring", "recruit", "portfolio"],
    courseIds: ["interview-prep", "git-essentials"],
    focus: "Interviews reward structure and reflection as much as raw knowledge.",
  },
  {
    id: "api",
    label: "APIs & backends",
    keywords: ["api", "rest", "backend", "http", "server", "endpoint", "graphql"],
    courseIds: ["testing-tdd", "docker-containers"],
    focus: "Backend work is contracts and failure handling: validate input, test the edges.",
  },
  {
    id: "design",
    label: "Design & UX",
    keywords: ["ux", "design", "figma", "accessibility", "a11y", "user research", "prototyp"],
    courseIds: ["ai-toolkit", "testing-tdd"],
    focus: "Design quality is enforced by checks: contrast, keyboard access, and testing with real users.",
  },
];

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export interface TopicMatch {
  rule: TopicRule;
  score: number;
  /** Index of the earliest matched keyword in the topic (lower = mentioned first). */
  position: number;
  /** Total length of the matched keywords: longer keywords are more specific. */
  specificity: number;
  matchedKeywords: string[];
}

/** Scores every rule against a free-text topic. Deterministic and order-stable. */
export function matchTopics(topic: string, library: TopicRule[] = TOPIC_LIBRARY): TopicMatch[] {
  const haystack = ` ${topic.toLowerCase().replace(/[^a-z0-9+#/.\s-]/g, " ").replace(/\s+/g, " ")} `;
  return library
    .map((rule) => {
      const matchedKeywords = rule.keywords.filter((keyword) =>
        new RegExp(`\\b${escapeRegExp(keyword.toLowerCase())}`, "i").test(haystack),
      );
      const positions = matchedKeywords.map((keyword) => haystack.indexOf(keyword.toLowerCase()));
      return {
        rule,
        score: matchedKeywords.length,
        position: positions.length > 0 ? Math.min(...positions) : Number.MAX_SAFE_INTEGER,
        specificity: matchedKeywords.reduce((total, keyword) => total + keyword.length, 0),
        matchedKeywords,
      };
    })
    .filter((match) => match.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.position - b.position ||
        b.specificity - a.specificity ||
        a.rule.id.localeCompare(b.rule.id),
    );
}

/** Labels of the matched rules, de-duplicated, for display in the UI. */
export function matchedLabels(matches: TopicMatch[]): string[] {
  return uniq(matches.map((match) => match.rule.label));
}
