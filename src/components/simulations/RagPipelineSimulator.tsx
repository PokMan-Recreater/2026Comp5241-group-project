"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * RAG Retrieval Pipeline.
 *
 * Shows the half of retrieval-augmented generation people never see: which
 * chunks a retriever picks for a question, why they rank where they do, and how
 * much context the model actually receives. Deterministic keyword scoring keeps
 * the demo reproducible and explainable.
 */

interface Chunk {
  id: string;
  source: string;
  text: string;
}

const CORPUS: Chunk[] = [
  {
    id: "chunk-1",
    source: "handbook/expenses.md",
    text: "Expense claims must be submitted within 30 days of the purchase date. Receipts are required for anything above 25 GBP. Claims above 500 GBP need director approval before booking.",
  },
  {
    id: "chunk-2",
    source: "handbook/remote-work.md",
    text: "Employees may work remotely from another country for up to 20 working days per calendar year, with manager approval at least two weeks in advance. Tax residency rules may apply.",
  },
  {
    id: "chunk-3",
    source: "handbook/security.md",
    text: "Report suspected phishing to security@example.com within one hour. Never reuse your work password. Multi-factor authentication is mandatory for all production systems.",
  },
  {
    id: "chunk-4",
    source: "handbook/parental-leave.md",
    text: "Parental leave entitlement is 26 weeks at full pay for the primary carer, plus 13 weeks at statutory pay. Notify HR at least 8 weeks before the intended start date.",
  },
  {
    id: "chunk-5",
    source: "handbook/onboarding.md",
    text: "New starters receive a laptop on day one and complete security training within the first week. Your first 30 days focus on shipping one small change to production.",
  },
  {
    id: "chunk-6",
    source: "handbook/hours.md",
    text: "Core hours are 10:00 to 16:00 local time. Flexible hours outside core time are encouraged. Overtime must be agreed in advance and recorded in the timesheet system.",
  },
];

const STOP_WORDS = new Set([
  "the", "a", "an", "is", "are", "can", "i", "my", "to", "of", "for", "in", "on", "at", "and",
  "or", "how", "many", "much", "do", "does", "what", "when", "where", "with", "from", "it",
  "be", "am", "another", "per",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOP_WORDS.has(token));
}

function stem(token: string): string {
  return token.replace(/(ing|ed|es|s)$/, "");
}

export function RagPipelineSimulator() {
  const [query, setQuery] = useState("How many days can I work from another country?");
  const [topK, setTopK] = useState(3);
  const [hybrid, setHybrid] = useState(true);

  const { ranked, context, tokens } = useMemo(() => {
    const queryTerms = Array.from(new Set(tokenize(query).map(stem)));
    const scored = CORPUS.map((chunk) => {
      const chunkTokens = tokenize(chunk.text).map(stem);
      const hits = queryTerms.filter((term) => chunkTokens.includes(term));
      const density = chunkTokens.length > 0 ? hits.length / Math.sqrt(chunkTokens.length) : 0;
      // Hybrid search adds an exact-match boost: what keyword search contributes
      // on top of pure embedding similarity.
      const exact = hybrid && queryTerms.some((term) => chunk.text.toLowerCase().includes(term));
      const score = hits.length * 2 + density * 3 + (exact ? 1 : 0);
      return { chunk, score: Number(score.toFixed(2)), hits };
    }).sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id));

    const selected = scored.slice(0, topK).filter((item) => item.score > 0);
    const joined = selected.map((item) => item.chunk.text).join("\n---\n");
    return { ranked: scored, context: joined, tokens: Math.round(joined.length / 4) };
  }, [query, topK, hybrid]);

  const maxScore = Math.max(1, ...ranked.map((item) => item.score));
  const best = ranked[0];

  return (
    <div className="card p-5">
      <label className="label" htmlFor="rag-query">
        Question
      </label>
      <input
        id="rag-query"
        className="input"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-xs text-slate-400" htmlFor="rag-topk">
          Chunks returned: <span className="font-mono text-slate-200">{topK}</span>
          <input
            id="rag-topk"
            type="range"
            min={1}
            max={5}
            value={topK}
            onChange={(event) => setTopK(Number(event.target.value))}
            className="w-28 accent-indigo-400"
          />
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-400" htmlFor="rag-hybrid">
          <input
            id="rag-hybrid"
            type="checkbox"
            checked={hybrid}
            onChange={(event) => setHybrid(event.target.checked)}
            className="accent-indigo-400"
          />
          Hybrid search (embeddings + keyword boost)
        </label>
      </div>

      <div className="mt-4 space-y-2">
        {ranked.map((item, index) => {
          const selected = index < topK && item.score > 0;
          return (
            <div
              key={item.chunk.id}
              className={cn(
                "rounded-xl border p-3",
                selected
                  ? "border-brand-400/40 bg-brand-500/10"
                  : "border-white/10 bg-white/[0.02] opacity-70",
              )}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-mono text-slate-400">{item.chunk.source}</span>
                <span className={cn("font-semibold", selected ? "text-brand-200" : "text-slate-500")}>
                  score {item.score}
                </span>
                {item.hits.length > 0 && (
                  <span className="text-slate-400">matched: {item.hits.join(", ")}</span>
                )}
                {selected && <span className="chip ml-auto">retrieved</span>}
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={cn("h-full rounded-full", selected ? "bg-brand-400" : "bg-slate-600")}
                  style={{ width: `${Math.round((item.score / maxScore) * 100)}%` }}
                />
              </div>
              <p className="mt-2 text-[13px] leading-6 text-slate-300">{item.chunk.text}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-white/10 bg-ink-900/70 p-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span className="font-semibold uppercase tracking-wider">What the model receives</span>
          <span className="chip">~{tokens} tokens of context</span>
          {best && best.score > 0 && <span className="chip">top source: {best.chunk.source}</span>}
        </div>
        <pre className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap font-mono text-[12px] leading-6 text-slate-300">
          {context ||
            "No chunk passed the relevance threshold. The model would answer from memory - which is exactly when it invents policy."}
        </pre>
      </div>

      <p className="mt-3 text-[13px] text-slate-400">
        Try lowering the number of chunks returned, or turning hybrid search off, and watch the
        retrieved context change. Most wrong RAG answers come from a chunk that never made it into
        this box.
      </p>

    </div>
  );
}
