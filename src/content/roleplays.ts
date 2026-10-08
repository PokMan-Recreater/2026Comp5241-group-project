import type { InterviewScenario } from "@/types";

/**
 * Role-play / mock-interview scenarios.
 *
 * Each question carries the vocabulary a strong answer uses (scored by the
 * rubric in `src/lib/rubric.ts`) plus a model outline shown as feedback.
 */
export const ROLE_PLAY_SCENARIOS: InterviewScenario[] = [
  {
    id: "frontend-intern-screen",
    title: "Junior Frontend Engineer - phone screen",
    role: "Frontend Engineer (graduate / intern)",
    company: "Northwind Labs",
    difficulty: "beginner",
    audience: ["cs", "non-cs"],
    brief:
      "A 20-minute screening call. The interviewer wants evidence you can ship small features and explain your thinking, not that you memorised algorithms.",
    interviewerPersona: "Warm but time-poor; asks one follow-up per answer.",
    questions: [
      {
        id: "q1",
        prompt:
          "Walk me through the last thing you built. What was your role and what did you actually ship?",
        keywords: ["component", "responsive", "react", "css", "deploy", "test", "git"],
        modelOutline: [
          "One sentence of context: what the product was and who used it.",
          "Your specific ownership: which parts you wrote yourself.",
          "The technical decisions you made and why (state, styling, API calls).",
          "A measurable result: load time, users, review comments, bug count.",
        ],
      },
      {
        id: "q2",
        prompt:
          "Tell me about a bug that took you a long time to fix. How did you find it?",
        keywords: ["debug", "console", "network", "logs", "reproduce", "test", "hypothesis"],
        modelOutline: [
          "How you reproduced it reliably first.",
          "The hypothesis you formed and how you tested it.",
          "The tool you used (dev tools, logs, breakpoints, git bisect).",
          "The fix, plus the test or guard you added so it cannot happen again.",
        ],
      },
      {
        id: "q3",
        prompt: "You disagree with a code review comment. What do you do?",
        keywords: ["review", "trade-off", "document", "team", "ask", "explain", "standard"],
        modelOutline: [
          "Assume good intent and ask for the reasoning behind the comment.",
          "Explain your trade-off with evidence (performance, readability, deadline).",
          "Escalate to a written team standard when it is a preference, not a fact.",
          "State the outcome: what was decided and what you learned.",
        ],
      },
    ],
  },
  {
    id: "behavioural-teamwork",
    title: "Behavioural round - teamwork & conflict",
    role: "Software Engineer",
    company: "Helios Retail",
    difficulty: "intermediate",
    audience: ["cs", "non-cs"],
    brief:
      "Classic STAR round. The interviewer scores structure and self-awareness more than the drama of the story.",
    interviewerPersona: "Methodical; interrupts with 'what exactly did you do?'.",
    questions: [
      {
        id: "q1",
        prompt:
          "Tell me about a time you disagreed with a teammate or a manager. How did it end?",
        keywords: ["disagree", "evidence", "listen", "compromise", "escalate", "outcome", "learned"],
        modelOutline: [
          "Situation: the decision, the deadline, and who was involved.",
          "Your position and the evidence you brought.",
          "How you listened and what you conceded.",
          "Result: what shipped, and the relationship afterwards.",
        ],
      },
      {
        id: "q2",
        prompt: "Describe a project that slipped. What did you do about it?",
        keywords: ["scope", "estimate", "risk", "communicate", "stakeholder", "prioritise", "recovery"],
        modelOutline: [
          "The original commitment and the estimate it was based on.",
          "The earliest signal that it was slipping.",
          "The trade-offs you proposed: cut scope, add people, or move the date.",
          "The outcome, including what you changed in your process afterwards.",
        ],
      },
      {
        id: "q3",
        prompt: "How do you keep learning when nobody is telling you what to learn?",
        keywords: ["practice", "project", "reading", "feedback", "habit", "routine", "mentor"],
        modelOutline: [
          "A concrete routine: when, how long, and what you do in that time.",
          "One artefact you produced recently.",
          "How you get feedback (code review, mentor, community, users).",
          "How you decide what to drop when you fall behind.",
        ],
      },
    ],
  },
  {
    id: "explain-ai-stakeholder",
    title: "Explain an AI tool to a non-technical stakeholder",
    role: "AI Solutions Analyst",
    company: "Civic Health Trust",
    difficulty: "beginner",
    audience: ["non-cs", "cs"],
    brief:
      "The stakeholder is smart but not technical, and is nervous about AI. Your job is clarity and honesty about limits.",
    interviewerPersona: "Busy operations director; asks 'so can we trust it?'.",
    questions: [
      {
        id: "q1",
        prompt:
          "In plain language, what does an AI assistant actually do when it answers a question?",
        keywords: ["pattern", "training data", "predict", "tokens", "context", "probabilistic", "search"],
        modelOutline: [
          "It predicts a likely next piece of text from patterns in training data.",
          "It is not a database and it is not a search engine.",
          "It can be confidently wrong, so anything consequential needs checking.",
          "Use an analogy: a very well-read intern who never says 'I do not know'.",
        ],
      },
      {
        id: "q2",
        prompt:
          "We want to use it to draft patient letters. What risks do you raise, and what controls do you put in place?",
        keywords: ["privacy", "review", "audit", "bias", "hallucination", "consent", "template"],
        modelOutline: [
          "Data handling: what leaves the organisation, and under which agreement.",
          "Human in the loop: who signs off before anything reaches a patient.",
          "Guardrails: fixed templates, restricted fields, no free-form medical advice.",
          "Measurement: sample audits and a way for staff to report bad output.",
        ],
      },
      {
        id: "q3",
        prompt: "How would you measure whether this tool is helping, one month in?",
        keywords: ["baseline", "time saved", "quality", "error rate", "survey", "metric", "pilot"],
        modelOutline: [
          "Pick a baseline before launch (minutes per letter, rework rate).",
          "Run a small pilot group and compare against a control.",
          "Watch quality signals, not just speed: corrections and complaints.",
          "Decide the kill criterion in advance.",
        ],
      },
    ],
  },
  {
    id: "data-analyst-case",
    title: "Data analyst case - drop-off investigation",
    role: "Data Analyst",
    company: "Kestrel Marketplace",
    difficulty: "intermediate",
    audience: ["cs", "non-cs"],
    brief:
      "A take-home style case read out loud. The interviewer cares about how you frame the question and defend your metric choice.",
    interviewerPersona: "Detail-hungry; will push on definitions.",
    questions: [
      {
        id: "q1",
        prompt:
          "Checkout drop-off jumped from 12% to 19% last week. How do you investigate?",
        keywords: ["segment", "funnel", "cohort", "instrumentation", "release", "hypothesis", "sql"],
        modelOutline: [
          "Confirm the metric is real: is it a tracking change or a release?",
          "Segment by device, geography, channel and new vs returning users.",
          "Write the query that narrows it to the segment where the change lives.",
          "Form one hypothesis and the data that would confirm or kill it.",
        ],
      },
      {
        id: "q2",
        prompt: "Write the query you would start with, and tell me what each part is doing.",
        keywords: ["select", "where", "group by", "count", "join", "date", "filter"],
        modelOutline: [
          "Filter to the comparison windows first so both periods are like for like.",
          "Group by the dimension you suspect, then compute the rate per group.",
          "Use counts as well as rates so small samples do not mislead you.",
          "Say what result would change your mind.",
        ],
      },
      {
        id: "q3",
        prompt:
          "You find the cause is a payment provider change. How do you report it to a non-technical audience?",
        keywords: ["impact", "revenue", "recommendation", "chart", "plain language", "next step", "risk"],
        modelOutline: [
          "Lead with the impact in money or customers, not with the query.",
          "One chart that makes the change obvious.",
          "State the cause with your confidence level.",
          "End with a specific recommendation and the decision you need from them.",
        ],
      },
    ],
  },
  {
    id: "ml-project-review",
    title: "AI/ML project deep dive",
    role: "Machine Learning Engineer",
    company: "Atlas Logistics",
    difficulty: "advanced",
    audience: ["cs"],
    brief:
      "A portfolio review. The interviewer probes data leakage, evaluation and production reality.",
    interviewerPersona: "Sceptical practitioner; asks 'what broke in production?'.",
    questions: [
      {
        id: "q1",
        prompt:
          "Take me through your model end to end: data, training, evaluation, deployment.",
        keywords: ["split", "feature", "baseline", "metric", "validation", "deploy", "monitor"],
        modelOutline: [
          "Data provenance, size, and how you avoided leakage in the split.",
          "A trivial baseline you beat, and the metric that mattered to the business.",
          "Training details: architecture, hyperparameters, how you chose them.",
          "Serving: latency budget, monitoring, and the rollback path.",
        ],
      },
      {
        id: "q2",
        prompt:
          "Your offline metric was excellent but production performance dropped. What happened?",
        keywords: ["drift", "distribution shift", "leakage", "latency", "feedback loop", "logging", "retrain"],
        modelOutline: [
          "Compare training distribution with live traffic; look for drift.",
          "Check for leakage or a metric that did not match the product goal.",
          "Inspect serving differences: preprocessing, latency-driven truncation.",
          "Fix: retrain cadence, better logging, shadow deployment, guardrail metrics.",
        ],
      },
      {
        id: "q3",
        prompt: "How would you cut inference cost by 50% without losing accuracy?",
        keywords: ["quantisation", "distillation", "caching", "batching", "smaller model", "prompt", "evaluation"],
        modelOutline: [
          "Measure first: cost per request, split by endpoint.",
          "Cheap wins: caching, shorter prompts, batching, smaller model for easy cases.",
          "Model-level: quantisation or distillation with an accuracy check.",
          "Prove it with an A/B evaluation before rolling out.",
        ],
      },
    ],
  },
];

export function getScenario(id: string): InterviewScenario | undefined {
  return ROLE_PLAY_SCENARIOS.find((scenario) => scenario.id === id);
}

export function scenariosForAudience(audience: "cs" | "non-cs"): InterviewScenario[] {
  return ROLE_PLAY_SCENARIOS.filter((scenario) => scenario.audience.includes(audience));
}
