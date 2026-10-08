"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CodeChallenge } from "@/types";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";
import { cn, uid } from "@/lib/utils";

/**
 * Runs learner code inside a sandboxed iframe.
 *
 * The iframe has `allow-scripts` only, which gives it an opaque origin: it cannot
 * read this app's storage, cookies or DOM, and nothing is ever sent to a server.
 * Results come back over postMessage with a timeout, so an infinite loop in
 * learner code cannot hang the page.
 */

interface TestResult {
  name: string;
  pass: boolean;
  error?: string;
}

interface SandboxMessage {
  type: "result" | "ready";
  id?: string;
  results?: TestResult[];
  setupError?: string | null;
}

const SANDBOX_HTML = `<!doctype html>
<html><head><meta charset="utf-8" /></head>
<body>
<script>
  var expect = function (actual, expected) {
    try {
      return JSON.stringify(actual) === JSON.stringify(expected);
    } catch (error) {
      return false;
    }
  };

  window.addEventListener("message", function (event) {
    var msg = event.data;
    if (!msg || msg.type !== "run") return;

    var results = [];
    var setupError = null;
    var fn = null;

    try {
      var factory = new Function(
        msg.code + "\\n; return typeof " + msg.entryPoint + " === 'function' ? " + msg.entryPoint + " : undefined;"
      );
      fn = factory();
      if (typeof fn !== "function") {
        setupError = "No function named '" + msg.entryPoint + "' was defined.";
      }
    } catch (error) {
      setupError = String(error);
    }

    if (!setupError) {
      for (var i = 0; i < msg.tests.length; i += 1) {
        var test = msg.tests[i];
        try {
          var runner = new Function("fn", "expect", "return (" + test.run + ");");
          results.push({ name: test.name, pass: Boolean(runner(fn, expect)) });
        } catch (error) {
          results.push({ name: test.name, pass: false, error: String(error) });
        }
      }
    }

    parent.postMessage({ type: "result", id: msg.id, results: results, setupError: setupError }, "*");
  });

  parent.postMessage({ type: "ready" }, "*");
</script>
</body></html>`;

export function CodeChallengeRunner({
  challenge,
  onResult,
}: {
  challenge: CodeChallenge;
  onResult?: (passed: boolean, code: string) => void;
}) {
  const storageKey = `${STORAGE_KEYS.challengeCode}:${challenge.id}`;
  const [code, setCode] = useState(challenge.starterCode);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const frameRef = useRef<HTMLIFrameElement>(null);
  const pendingRef = useRef<Map<string, (payload: SandboxMessage) => void>>(new Map());

  // Restore any saved attempt for this challenge (one-time browser-store read).
  useEffect(() => {
    const saved = readJSON<{ code?: string } | null>(storageKey, null);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of saved code
    if (saved?.code) setCode(saved.code);
  }, [storageKey]);

  useEffect(() => {
    const handler = (event: MessageEvent<SandboxMessage>) => {
      const payload = event.data;
      if (!payload || payload.type !== "result" || !payload.id) return;
      const resolve = pendingRef.current.get(payload.id);
      if (resolve) {
        pendingRef.current.delete(payload.id);
        resolve(payload);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const runTests = useCallback(() => {
    const frame = frameRef.current;
    if (!frame?.contentWindow) return;

    setRunning(true);
    setTimedOut(false);
    setResults(null);
    setSetupError(null);
    writeJSON(storageKey, { code });

    const id = uid("run");
    const timeout = window.setTimeout(() => {
      pendingRef.current.delete(id);
      setRunning(false);
      setTimedOut(true);
    }, 4000);

    pendingRef.current.set(id, (payload) => {
      window.clearTimeout(timeout);
      setRunning(false);
      setSetupError(payload.setupError ?? null);
      const nextResults = payload.results ?? [];
      setResults(nextResults);
      const passed = nextResults.length > 0 && nextResults.every((result) => result.pass);
      onResult?.(passed, code);
    });

    frame.contentWindow.postMessage(
      {
        type: "run",
        id,
        code,
        entryPoint: challenge.entryPoint,
        tests: challenge.tests.map((test) => ({ name: test.name, run: test.run })),
      },
      "*",
    );
  }, [challenge.entryPoint, challenge.tests, code, onResult, storageKey]);

  const passed = results !== null && results.every((result) => result.pass);

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="chip">💻 Coding challenge</span>
        <span className="chip">{challenge.difficulty}</span>
        <span className="chip">{challenge.tests.length} tests</span>
        {passed && <span className="chip border-emerald-400/40 text-emerald-200">all passing</span>}
      </div>

      <h4 className="mt-3 text-base font-semibold text-white">{challenge.title}</h4>
      <p className="mt-1.5 text-[14px] leading-7 text-slate-300">{challenge.prompt}</p>

      <label className="label mt-4" htmlFor={`code-${challenge.id}`}>
        Your solution (JavaScript)
      </label>
      <textarea
        id={`code-${challenge.id}`}
        className="input min-h-56 font-mono text-[13px] leading-6"
        value={code}
        spellCheck={false}
        onChange={(event) => setCode(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            event.preventDefault();
            const target = event.currentTarget;
            const start = target.selectionStart;
            const next = `${code.slice(0, start)}  ${code.slice(target.selectionEnd)}`;
            setCode(next);
            requestAnimationFrame(() => {
              target.selectionStart = start + 2;
              target.selectionEnd = start + 2;
            });
          }
        }}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-primary btn-sm" onClick={runTests} disabled={running}>
          {running ? "Running…" : "▶ Run tests"}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => setShowHint((value) => !value)}
        >
          💡 {showHint ? "Hide hint" : "Hint"}
        </button>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => {
            setCode(challenge.starterCode);
            setResults(null);
            setSetupError(null);
          }}
        >
          ↺ Reset code
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setShowSolution((value) => !value)}
        >
          {showSolution ? "Hide" : "Show"} reference solution
        </button>
      </div>

      {showHint && (
        <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-[13px] text-amber-100">
          {challenge.hint}
        </p>
      )}

      {showSolution && (
        <pre className="mt-3 overflow-x-auto rounded-xl border border-white/10 bg-ink-900/70 p-3 font-mono text-[12px] leading-6 text-slate-300">
          {challenge.solution}
        </pre>
      )}

      {setupError && (
        <p className="mt-3 rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 font-mono text-[12px] text-rose-100">
          {setupError}
        </p>
      )}

      {timedOut && (
        <p className="mt-3 rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-[13px] text-rose-100">
          The tests did not finish within four seconds. That usually means an infinite loop - check
          your loop conditions.
        </p>
      )}

      {results && (
        <ul className="mt-3 space-y-1.5">
          {results.map((result, index) => (
            <li
              key={`${result.name}-${index}`}
              className={cn(
                "rounded-lg border px-3 py-2 text-[13px]",
                result.pass
                  ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
                  : "border-rose-400/40 bg-rose-500/10 text-rose-100",
              )}
            >
              <span className="mr-2">{result.pass ? "✓" : "✗"}</span>
              {result.name}
              {!result.pass && (
                <span className="mt-1 block text-xs opacity-80">
                  {result.error ?? challenge.tests[index]?.expectation}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <iframe
        ref={frameRef}
        title={`Sandbox for ${challenge.title}`}
        sandbox="allow-scripts"
        srcDoc={SANDBOX_HTML}
        className="hidden"
      />

    </div>
  );
}
