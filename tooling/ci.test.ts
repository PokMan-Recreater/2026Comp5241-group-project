import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Guards the delivery pipeline itself.
 *
 * The workflow, the pre-push hook and `package.json` have to agree on the same
 * set of npm scripts. Without this test a rename (say `npm run verify` ->
 * `npm run check`) would silently disarm the gate that protects `main`.
 */

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** The scripts the pipeline is built out of. */
const GATE_SCRIPTS = ["typecheck", "lint", "audit", "test", "build", "verify"] as const;

function readText(relativePath: string): string {
  const absolute = resolve(REPO_ROOT, relativePath);
  if (!existsSync(absolute)) {
    throw new Error(`Expected ${relativePath} to exist at the repository root.`);
  }
  return readFileSync(absolute, "utf8");
}

function readJson<T>(relativePath: string): T {
  return JSON.parse(readText(relativePath)) as T;
}

describe("CI integrity", () => {
  it("declares every script the pipeline depends on", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");

    for (const script of GATE_SCRIPTS) {
      expect(pkg.scripts[script], `package.json is missing the "${script}" script`).toBeTruthy();
    }
  });

  it("keeps the workflow in step with those scripts", () => {
    const workflow = readText(".github/workflows/ci.yml");

    // A pull request into the protected branch must trigger the gate.
    expect(workflow).toMatch(/pull_request:/);
    expect(workflow).toMatch(/branches:\s*\[?\s*main\b/);

    // ...and it must actually run each check, not just build.
    for (const script of ["typecheck", "lint", "audit", "test", "build"] as const) {
      expect(workflow, `ci.yml never runs "npm run ${script}"`).toContain(`npm run ${script}`);
    }

    // A clean, lockfile-exact install, as opposed to a mutating `npm install`.
    expect(workflow).toContain("npm ci");
  });

  it("gates the production deploy behind the verify job", () => {
    const workflow = readText(".github/workflows/ci.yml");

    // A deploy job must exist...
    expect(workflow, "ci.yml has no deploy job").toMatch(/^ {2}deploy:/m);

    // ...it must run only for a push to main - never for a pull request or `dev`...
    expect(workflow).toMatch(
      /if: github\.event_name == 'push' && github\.ref == 'refs\/heads\/main'/,
    );

    // ...and it must wait for the gate above it, so unverified code cannot ship.
    expect(workflow).toMatch(/needs:\s*verify/);

    // It authenticates with the token secret and deploys straight to production.
    expect(workflow).toContain("secrets.VERCEL_TOKEN");
    expect(workflow).toContain("vercel deploy --prod");
  });

  it("blocks a direct push to main until the whole gate passes", () => {
    const hook = readText(".githooks/pre-push");

    expect(hook.startsWith("#!"), "the hook needs a shebang to be executable").toBe(true);
    expect(hook).toMatch(/\bmain\b/);
    expect(hook).toContain("npm run verify");
    expect(hook).toContain("--no-verify");
  });

  it("wires git to the committed hooks directory", () => {
    const pkg = readJson<{ scripts: Record<string, string> }>("package.json");

    // Hooks in .git/hooks are never versioned, so the repo must opt in.
    expect(pkg.scripts["hooks:install"]).toContain("core.hooksPath .githooks");
  });
});
