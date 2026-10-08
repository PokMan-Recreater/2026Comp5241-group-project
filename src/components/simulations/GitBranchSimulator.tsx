"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Branch & Merge Sandbox.
 *
 * A real (if tiny) Git model: commits have parents, branches are pointers, and
 * merging a diverged branch produces a conflict the learner must resolve before
 * the merge commit is created. The history is drawn as SVG lanes.
 */

interface Commit {
  id: string;
  label: string;
  parents: string[];
  lane: number;
  order: number;
  merge?: boolean;
}

interface GitState {
  commits: Commit[];
  branches: Record<string, string>;
  lanes: Record<string, number>;
  current: string;
}

const ROOT: Commit = { id: "c1", label: "Initial commit", parents: [], lane: 0, order: 0 };
const INITIAL: GitState = {
  commits: [ROOT],
  branches: { main: "c1" },
  lanes: { main: 0 },
  current: "main",
};
const X0 = 52;
const DX = 84;
const DY = 58;

export function GitBranchSimulator() {
  const [state, setState] = useState<GitState>(INITIAL);
  const [message, setMessage] = useState("Fix coupon rounding");
  const [branchName, setBranchName] = useState("feature/coupon");
  const [target, setTarget] = useState("main");
  const [log, setLog] = useState<string[]>(["$ git init", "$ git commit -m 'Initial commit'"]);
  const [conflict, setConflict] = useState<string | null>(null);

  const head = state.branches[state.current];
  const nodeAt = (id: string) => state.commits.find((commit) => commit.id === id);
  const x = (order: number) => X0 + order * DX;
  const y = (lane: number) => 30 + lane * DY;

  const commit = () => {
    const next: Commit = {
      id: `c${state.commits.length + 1}`,
      label: message.trim() || "Update",
      parents: head ? [head] : [],
      lane: state.lanes[state.current] ?? 0,
      order: state.commits.length,
    };
    setState({
      ...state,
      commits: [...state.commits, next],
      branches: { ...state.branches, [state.current]: next.id },
    });
    setLog((previous) => [
      ...previous,
      `$ git commit -m "${next.label}"`,
      `[${state.current} ${next.id}] 1 file changed`,
    ]);
  };

  const createBranch = () => {
    const name = branchName.trim();
    if (!name || state.branches[name]) return;
    const nextLane = Math.max(-1, ...Object.values(state.lanes)) + 1;
    setState({
      ...state,
      branches: { ...state.branches, [name]: head },
      lanes: { ...state.lanes, [name]: nextLane },
      current: name,
    });
    setTarget(name);
    setLog((previous) => [
      ...previous,
      `$ git switch -c ${name}`,
      `Switched to a new branch '${name}'`,
    ]);
  };

  const checkout = (name: string) => {
    setState({ ...state, current: name });
    setLog((previous) => [...previous, `$ git switch ${name}`, `Switched to branch '${name}'`]);
  };

  const isAncestor = (candidate: string, from: string): boolean => {
    const stack = [from];
    const seen = new Set<string>();
    while (stack.length > 0) {
      const id = stack.pop() as string;
      if (id === candidate) return true;
      if (seen.has(id)) continue;
      seen.add(id);
      stack.push(...(nodeAt(id)?.parents ?? []));
    }
    return false;
  };

  const merge = (incoming: string) => {
    if (!state.branches[incoming] || incoming === state.current) return;
    const theirs = state.branches[incoming];
    if (isAncestor(theirs, head)) {
      setLog((previous) => [...previous, `$ git merge ${incoming}`, "Already up to date."]);
      return;
    }
    if (isAncestor(head, theirs)) {
      setState({ ...state, branches: { ...state.branches, [state.current]: theirs } });
      setLog((previous) => [...previous, `$ git merge ${incoming}`, "Fast-forward"]);
      return;
    }
    setLog((previous) => [
      ...previous,
      `$ git merge ${incoming}`,
      "CONFLICT (content): merge conflict in pricing.js",
    ]);
    setConflict(incoming);
  };

  const resolve = (strategy: string) => {
    if (!conflict) return;
    const next: Commit = {
      id: `c${state.commits.length + 1}`,
      label: `Merge ${conflict} (${strategy})`,
      parents: [head, state.branches[conflict]],
      lane: state.lanes[state.current] ?? 0,
      order: state.commits.length,
      merge: true,
    };
    setState({
      ...state,
      commits: [...state.commits, next],
      branches: { ...state.branches, [state.current]: next.id },
    });
    setLog((previous) => [
      ...previous,
      `# resolved with: ${strategy}`,
      "$ git add pricing.js && git commit",
      `[${state.current} ${next.id}] merge complete`,
    ]);
    setConflict(null);
  };

  const reset = () => {
    setState(INITIAL);
    setConflict(null);
    setLog(["$ git init", "$ git commit -m 'Initial commit'"]);
  };

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip">branch: {state.current}</span>
        <span className="chip">{state.commits.length} commits</span>
        <button type="button" className="btn btn-ghost btn-sm ml-auto" onClick={reset}>
          ↺ Reset
        </button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-ink-900/70 p-3">
        <svg
          width={96 + state.commits.length * DX}
          height={60 + (Object.keys(state.lanes).length + 1) * DY}
          role="img"
          aria-label="Commit graph"
        >
          {state.commits.flatMap((commit) =>
            commit.parents.map((parentId) => {
              const parent = nodeAt(parentId);
              if (!parent) return null;
              return (
                <path
                  key={`${commit.id}-${parentId}`}
                  d={`M ${x(parent.order)} ${y(parent.lane)} C ${x(parent.order) + 40} ${y(parent.lane)}, ${x(commit.order) - 40} ${y(commit.lane)}, ${x(commit.order)} ${y(commit.lane)}`}
                  fill="none"
                  stroke="rgba(148,163,184,0.45)"
                  strokeWidth={2}
                  strokeDasharray={commit.merge ? "5 4" : undefined}
                />
              );
            }),
          )}

          {Object.entries(state.lanes).map(([name, lane]) => (
            <text key={name} x={6} y={y(lane) + 4} fontSize={11} className="fill-slate-400">
              {name}
            </text>
          ))}

          {state.commits.map((commit) => (
            <g key={commit.id}>
              <circle
                cx={x(commit.order)}
                cy={y(commit.lane)}
                r={state.branches[state.current] === commit.id ? 11 : 8}
                className={commit.merge ? "fill-fuchsia-400" : "fill-brand-400"}
              />
              <text
                x={x(commit.order)}
                y={y(commit.lane) + 28}
                textAnchor="middle"
                fontSize={10}
                className="fill-slate-400"
              >
                {commit.id}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="sim-commit">
            Commit message
          </label>
          <div className="flex gap-2">
            <input
              id="sim-commit"
              className="input"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
            />
            <button type="button" className="btn btn-primary btn-sm" onClick={commit}>
              Commit
            </button>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="sim-branch">
            New branch
          </label>
          <div className="flex gap-2">
            <input
              id="sim-branch"
              className="input"
              value={branchName}
              onChange={(event) => setBranchName(event.target.value)}
            />
            <button type="button" className="btn btn-secondary btn-sm" onClick={createBranch}>
              Create
            </button>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="sim-checkout">
            Checkout branch
          </label>
          <select
            id="sim-checkout"
            className="input"
            value={state.current}
            onChange={(event) => checkout(event.target.value)}
          >
            {Object.keys(state.branches).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="sim-merge">
            Merge into {state.current}
          </label>
          <div className="flex gap-2">
            <select
              id="sim-merge"
              className="input"
              value={target}
              onChange={(event) => setTarget(event.target.value)}
            >
              {Object.keys(state.branches).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => merge(target)}
            >
              Merge
            </button>
          </div>
        </div>
      </div>

      {conflict && (
        <div className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 p-4">
          <p className="text-sm font-semibold text-rose-100">
            Merge conflict in <code className="font-mono">pricing.js</code>
          </p>
          <p className="mt-1 text-[13px] text-rose-100/80">
            Both branches changed the same lines. Choose how to resolve it - this is the decision
            Git cannot make for you.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {["keep ours", "take theirs", "keep both"].map((strategy) => (
              <button
                key={strategy}
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => resolve(strategy)}
              >
                {strategy}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 max-h-44 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-3 font-mono text-[12px] leading-6 text-emerald-200">
        {log.map((line, index) => (
          <p key={`${index}-${line}`} className={cn(line.startsWith("$") && "text-slate-200")}>
            {line}
          </p>
        ))}
      </div>

    </div>
  );
}
