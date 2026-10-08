import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "tooling/**/*.test.ts"],
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text"],
      /**
       * Only the layers that are genuinely unit-testable are measured: the pure
       * logic in `src/lib` and the typed content in `src/content`. The React
       * components are thin renderers over that logic and have no DOM harness,
       * so counting them would only dilute the signal.
       */
      include: ["src/lib/**/*.ts", "src/content/**/*.ts"],
      exclude: ["**/*.test.ts"],
      /**
       * Ratchet, not a target: a few points below what the suite currently
       * achieves, so a new untested module fails the gate while ordinary
       * refactoring does not. Raise these when coverage improves.
       */
      thresholds: {
        statements: 90,
        branches: 80,
        functions: 88,
        lines: 92,
      },
    },
  },
});
