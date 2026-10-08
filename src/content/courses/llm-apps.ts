import type { Course } from "@/types";

export const llmApps: Course = {
  id: "llm-apps",
  slug: "llm-apps",
  title: "Building LLM-Powered Apps",
  subtitle: "From a prompt in a playground to a feature users rely on.",
  description:
    "The engineering around a model is where the value is: context assembly, retrieval, streaming, retries, cost control and evaluation. Build the request loop properly, add retrieval so answers are grounded in your own documents, and set budgets before the invoice arrives.",
  icon: "🧠",
  accent: "from-indigo-500 to-cyan-400",
  category: "ai",
  tags: ["llm", "rag", "api", "production", "architecture"],
  level: "intermediate",
  audience: ["cs", "non-cs"],
  estimatedMinutes: 60,
  outcomes: [
    "Explain the full request loop of an LLM feature",
    "Add retrieval so answers are grounded in your own documents",
    "Set cost, latency and safety budgets and measure them",
  ],
  origin: "curated",
  modules: [
    {
      id: "llm-m1",
      title: "From prompt to product",
      summary: "The request loop, retrieval, and the budgets that keep it alive.",
      lessons: [
        {
          id: "request-loop",
          title: "The request loop",
          minutes: 18,
          objectives: [
            "Describe every step between a user's question and a rendered answer",
            "Batch and stream requests sensibly",
          ],
          blocks: [
            {
              kind: "text",
              heading: "What actually happens on one click",
              body: [
                "Input validation, context assembly, the model call, output validation, then rendering and logging. Most production incidents live in the two steps people skip: context assembly (what you actually sent) and output validation (what you actually got back).",
                "Log the exact prompt and the raw response for every request. When a user reports a bad answer, that log is the only way to reproduce it.",
              ],
            },
            {
              kind: "code",
              language: "typescript",
              caption: "A request loop with validation, retry and logging",
              code: `export async function answer(question: string, docs: Document[]) {
  if (!question.trim()) throw new Error("empty question");

  // 1. Assemble context: only the most relevant material, newest first
  const context = docs
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((doc) => doc.text)
    .join("\\n---\\n");

  // 2. Call the model with a hard timeout and one retry
  const raw = await callModel({ question, context, timeoutMs: 8_000 });

  // 3. Validate before rendering - never show an unvalidated answer
  const answer = raw.trim();
  if (answer.length === 0) throw new Error("empty completion");

  // 4. Log enough to reproduce the request later
  log({ question, contextLength: context.length, answerLength: answer.length });
  return answer;
}`,
            },
            {
              kind: "challenge",
              challengeId: "js-chunk-array",
            },
            {
              kind: "quiz",
              question:
                "A user reports a bad answer from last week. What must your system have stored to investigate it?",
              options: [
                "The exact assembled prompt and the raw model response",
                "Only the final answer shown to the user",
                "The model name and the request timestamp",
                "The user's session recording",
              ],
              answerIndex: 0,
              explanation:
                "Without the assembled prompt you cannot tell whether the bug was retrieval, formatting or the model itself - which is where most debugging time goes.",
            },
          ],
        },
        {
          id: "retrieval-augmented-generation",
          title: "Retrieval-augmented generation",
          minutes: 22,
          objectives: [
            "Explain chunking, embedding and ranking in one pass",
            "Debug a RAG answer that is wrong for the right reason",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Ground the answer in your own documents",
              body: [
                "A model cannot know your handbook. RAG fixes that: split documents into chunks, convert each chunk to an embedding (a list of numbers representing meaning), store them, then at question time fetch the closest chunks and put them in the prompt.",
                "When a RAG answer is wrong, the cause is almost always retrieval, not generation. Check what the retriever returned before you touch the prompt.",
              ],
            },
            {
              kind: "simulation",
              simulationId: "rag-pipeline",
              title: "RAG Retrieval Pipeline",
              description:
                "Type a question and watch which chunks are retrieved, how they are ranked, and exactly what the model ends up seeing.",
            },
            {
              kind: "text",
              heading: "The four knobs that matter",
              body: [
                "Chunk size (too big buries the answer, too small loses context), the number of chunks returned (more context costs more tokens and adds noise), whether you add keyword search alongside embeddings for exact terms, and whether you cite sources so a human can check.",
              ],
            },
            {
              kind: "quiz",
              question:
                "Your RAG assistant gives a confident wrong answer about a policy. What do you inspect first?",
              options: [
                "The chunks the retriever returned for that question",
                "The model's temperature setting",
                "The colour scheme of the chat interface",
                "The number of users currently online",
              ],
              answerIndex: 0,
              explanation:
                "If the right chunk was never retrieved, the model had no chance. Inspect retrieval quality first, then prompt and model settings.",
            },
          ],
        },
        {
          id: "cost-latency-safety",
          title: "Cost, latency and safety budgets",
          minutes: 20,
          objectives: [
            "Estimate cost per request before you ship",
            "Set the guardrails that keep a feature alive",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Three budgets, decided in advance",
              body: [
                "Cost: tokens in plus tokens out, multiplied by requests per day. A feature that costs 0.02 per request looks free until it is called 200,000 times a month.",
                "Latency: users forgive three seconds and abandon at ten. Streaming the first token early changes the experience more than a faster model does. Safety: what the feature refuses to do, and what it always escalates to a human.",
              ],
            },
            {
              kind: "checklist",
              title: "Pre-launch budget checklist",
              items: [
                "Cost per request measured on real inputs, not toy ones",
                "A cap per user per day, and a global kill switch",
                "Timeouts, one retry maximum, and a friendly degraded response",
                "Caching for repeated questions",
                "Logging that never stores personal data you do not need",
                "An evaluation set to re-run after every model or prompt change",
              ],
            },
            {
              kind: "callout",
              tone: "warning",
              title: "Design the failure path first",
              body: "What does the user see when the model times out, returns garbage, or hits the spend cap? A well-designed fallback (search results, a template, a human queue) is what separates a demo from a product.",
            },
            {
              kind: "quiz",
              question:
                "Which change reduces cost the most with the least risk to answer quality?",
              options: [
                "Cache repeated questions and send fewer, better-ranked chunks",
                "Remove all validation to save CPU time",
                "Switch to the cheapest model regardless of the task",
                "Disable logging so you store fewer bytes",
              ],
              answerIndex: 0,
              explanation:
                "Caching and tighter context attack the real cost driver - tokens per request - without sacrificing the accuracy you already validated.",
            },
          ],
        },
      ],
    },
  ],
};
