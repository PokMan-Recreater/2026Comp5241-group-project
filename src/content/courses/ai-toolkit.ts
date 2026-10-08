import type { Course } from "@/types";

export const aiToolkit: Course = {
  id: "ai-toolkit",
  slug: "ai-toolkit",
  title: "AI Tools for Everyday Work",
  subtitle: "Use assistants well, and know when not to trust them.",
  description:
    "Built for people who are not programmers. Learn what these tools actually do, how to ask for output you can use, and the checks that stop a confident-sounding answer from becoming a confident-sounding mistake.",
  icon: "🤖",
  accent: "from-violet-500 to-fuchsia-400",
  category: "ai",
  tags: ["ai", "productivity", "ai literacy", "non-cs", "prompting"],
  level: "beginner",
  audience: ["non-cs", "cs"],
  estimatedMinutes: 45,
  outcomes: [
    "Explain in one sentence what a language model is doing",
    "Write a request that produces usable output on the first try",
    "Spot the four failure modes that matter at work",
    "Set a personal rule for when human review is mandatory",
  ],
  origin: "curated",
  modules: [
    {
      id: "ai-toolkit-m1",
      title: "Working with AI assistants",
      summary: "What they are, how to ask, and how to check the answer.",
      lessons: [
        {
          id: "what-ai-tools-do",
          title: "What these tools actually do",
          minutes: 12,
          objectives: [
            "Describe next-word prediction in plain language",
            "Separate what the model knows from what it was given",
          ],
          blocks: [
            {
              kind: "text",
              heading: "A very well-read intern who never says 'I do not know'",
              body: [
                "A language model predicts the most likely next piece of text given everything it has seen so far: your instructions plus its training data. It is not looking anything up in a database and it is not reasoning like a person checking facts.",
                "That single sentence explains almost every strength and weakness. It is superb at reshaping text you provide (summarise, translate, reformat, rewrite). It is unreliable for facts you have not supplied, because a fluent wrong answer looks exactly like a fluent right one.",
              ],
            },
            {
              kind: "callout",
              tone: "info",
              title: "The practical rule",
              body: "Give the model the facts, ask it to transform them. The more of the source material you paste in, the less it has to guess.",
            },
            {
              kind: "quiz",
              question: "Which task is the best fit for a chat assistant on its own?",
              options: [
                "Rewriting a policy document you have pasted in, in plain English",
                "Telling you the exact current price of your competitor's product",
                "Guaranteeing that a legal clause is compliant in your country",
                "Remembering your private client list between sessions",
              ],
              answerIndex: 0,
              explanation:
                "Transforming text you supplied plays to the model's strength. Live facts, legal guarantees and private memory are exactly where it fails.",
            },
          ],
        },
        {
          id: "prompting-for-output",
          title: "Asking for output you can actually use",
          minutes: 18,
          objectives: [
            "Use the five-part request structure",
            "Test a prompt before trusting it with real work",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Five parts of a request that works",
              body: [
                "Role and audience, the material to work from, the exact output format, the constraints, and one example of a good answer. Most disappointing results come from leaving out the format and the constraints.",
              ],
            },
            {
              kind: "simulation",
              simulationId: "prompt-lab",
              title: "Prompt Quality Lab",
              description:
                "Write a prompt for a real task and watch a rubric score it on role, context, format, constraints and examples - then see the rewritten version.",
            },
            {
              kind: "checklist",
              title: "Before you send a prompt",
              items: [
                "Did I say who the output is for?",
                "Did I paste the material instead of describing it?",
                "Did I specify the format (table, bullets, word limit)?",
                "Did I state what must not appear (jargon, invented figures)?",
                "Did I ask for the answer, or just a draft to edit?",
              ],
            },
            {
              kind: "quiz",
              question:
                "Your assistant keeps producing a 600-word essay when you want three bullets. What is the most effective fix?",
              options: [
                "State the format explicitly: 'Reply with exactly three bullet points, max 20 words each'",
                "Ask it again in capital letters",
                "Start a brand-new chat and hope for a shorter answer",
                "Accept the essay and cut it down by hand every time",
              ],
              answerIndex: 0,
              explanation:
                "Constraints are instructions. Saying exactly what 'short' means - three bullets, 20 words - is the difference between guessing and specifying.",
            },
          ],
        },
        {
          id: "verifying-output",
          title: "Verifying output and avoiding traps",
          minutes: 15,
          objectives: [
            "Name the four failure modes that matter at work",
            "Decide when human review is mandatory",
          ],
          blocks: [
            {
              kind: "text",
              heading: "The four failure modes",
              body: [
                "Hallucination: confident, fluent and false - citations, statistics, names, dates. Prompt injection: text you pasted contains instructions that hijack your request. Bias and drift: the output mirrors the patterns in its training data rather than your context. Confidentiality: anything you paste leaves your control.",
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Write your own rule before you need it",
              body: "Decide in advance what always needs a human check: money, legal text, medical or safety advice, anything customer-facing, and any number that ends up in a report.",
            },
            {
              kind: "checklist",
              title: "Sixty-second review of any AI output",
              items: [
                "Every factual claim: does it come from material I supplied?",
                "Every number: can I trace it to a source I trust?",
                "Every name, quote and citation: does it exist?",
                "Anything that would be expensive to be wrong about: second pair of eyes",
                "Anything confidential: should it have been pasted at all?",
              ],
            },
            {
              kind: "quiz",
              question:
                "You asked for a summary of a market report and the output includes a statistic you cannot find in the source. What is the safest response?",
              options: [
                "Remove the statistic or verify it from an authoritative source before using it",
                "Keep it, since the model was trained on many reports",
                "Ask the model whether the number is correct",
                "Add a footnote saying the figure is AI-generated",
              ],
              answerIndex: 0,
              explanation:
                "Numbers that are not in your source are the classic hallucination. Asking the model to confirm its own claim is not verification - it will happily agree.",
            },
          ],
        },
      ],
    },
  ],
};
