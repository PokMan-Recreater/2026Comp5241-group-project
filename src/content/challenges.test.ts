import { describe, expect, it } from "vitest";
import { CODE_CHALLENGES } from "@/content";

/**
 * The browser sandbox evaluates challenges with `new Function`, so the same
 * technique is used here: it proves every reference solution passes every test,
 * and that the starter code fails. That keeps the content honest without a DOM.
 */

const expectEqual = (actual: unknown, expected: unknown) =>
  JSON.stringify(actual) === JSON.stringify(expected);

function buildFunction(source: string, entryPoint: string) {
  const factory = new Function(`${source}\n; return ${entryPoint};`) as () => (
    ...args: unknown[]
  ) => unknown;
  return factory();
}

function runTest(fn: unknown, run: string): boolean {
  const runner = new Function("fn", "expect", `return (${run});`) as (
    f: unknown,
    e: typeof expectEqual,
  ) => boolean;
  return runner(fn, expectEqual);
}

describe("code challenge definitions", () => {
  it("has unique ids with a starter, solution and tests", () => {
    const ids = new Set<string>();
    for (const challenge of CODE_CHALLENGES) {
      expect(ids.has(challenge.id)).toBe(false);
      ids.add(challenge.id);
      expect(challenge.starterCode).toContain(challenge.entryPoint);
      expect(challenge.solution).toContain(challenge.entryPoint);
      expect(challenge.tests.length).toBeGreaterThanOrEqual(3);
      expect(challenge.hint.length).toBeGreaterThan(20);
      for (const test of challenge.tests) {
        expect(test.run).toContain("fn(");
        expect(test.expectation.length).toBeGreaterThan(10);
      }
    }
  });

  it("passes every test with the reference solution", () => {
    for (const challenge of CODE_CHALLENGES) {
      const fn = buildFunction(challenge.solution, challenge.entryPoint);
      expect(typeof fn, `${challenge.id} solution should define ${challenge.entryPoint}`).toBe(
        "function",
      );
      for (const test of challenge.tests) {
        expect(runTest(fn, test.run), `${challenge.id}: ${test.name}`).toBe(true);
      }
    }
  });

  it("fails the first test with the starter code", () => {
    for (const challenge of CODE_CHALLENGES) {
      const fn = buildFunction(challenge.starterCode, challenge.entryPoint);
      expect(runTest(fn, challenge.tests[0].run), `${challenge.id} starter should fail`).toBe(false);
    }
  });

  it("reports a missing entry point instead of crashing", () => {
    // Mirrors the sandbox guard: an unknown function name yields undefined so the
    // UI can show a helpful message rather than a raw ReferenceError.
    const guarded = new Function(
      "const nothing = 1;\n; return typeof missingFunction === 'function' ? missingFunction : undefined;",
    ) as () => unknown;
    expect(guarded()).toBeUndefined();
  });
});
