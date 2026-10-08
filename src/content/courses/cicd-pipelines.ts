import type { Course } from "@/types";

export const cicdPipelines: Course = {
  id: "cicd-pipelines",
  slug: "cicd-pipelines",
  title: "CI/CD with GitHub Actions",
  subtitle: "Automate the boring checks so shipping is a non-event.",
  description:
    "Continuous integration runs your tests on every push; continuous delivery puts the result in front of users. Learn what each stage is for, how to read a failing build log, and how to deploy to Vercel from a workflow with secrets handled properly.",
  icon: "🔁",
  accent: "from-teal-500 to-emerald-400",
  category: "engineering",
  tags: ["ci/cd", "github actions", "deployment", "vercel", "automation"],
  level: "intermediate",
  audience: ["cs", "non-cs"],
  estimatedMinutes: 50,
  outcomes: [
    "Explain what each pipeline stage protects you from",
    "Debug a failing build from its logs",
    "Deploy to Vercel from a workflow without leaking secrets",
  ],
  origin: "curated",
  modules: [
    {
      id: "cicd-m1",
      title: "Pipelines that ship",
      summary: "Stages, failure debugging, and deployment.",
      lessons: [
        {
          id: "what-a-pipeline-does",
          title: "What a pipeline actually does",
          minutes: 15,
          objectives: [
            "Name the stages and the risk each one removes",
            "Explain why the pipeline must run on a clean machine",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Five stages, five risks",
              body: [
                "Install (does it build from a clean checkout?), lint (are we keeping to the agreed style?), test (does the behaviour still hold?), build (does the artefact exist?), deploy (can it reach users?).",
                "The point of running on a clean machine is that your laptop hides problems: a global tool, an uncommitted file, a cached dependency. If the pipeline passes, a colleague can reproduce it.",
              ],
            },
            {
              kind: "code",
              language: "yaml",
              caption: ".github/workflows/ci.yml",
              code: `name: CI
on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci            # install exactly what package-lock says
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test`,
            },
            {
              kind: "quiz",
              question: "Why must the pipeline install dependencies with a lockfile (npm ci)?",
              options: [
                "So the build uses exactly the versions you tested with, not newer ones",
                "Because it is faster than any other command",
                "Because npm install cannot run on a server",
                "To avoid writing a package.json file",
              ],
              answerIndex: 0,
              explanation:
                "A lockfile build is reproducible. Without it a patch release can break the build on a day when nobody changed any code.",
            },
          ],
        },
        {
          id: "debug-failing-pipeline",
          title: "Debug a failing pipeline",
          minutes: 18,
          objectives: [
            "Find the first real error in a long log",
            "Fix a failure at its source instead of retrying",
          ],
          blocks: [
            {
              kind: "simulation",
              simulationId: "pipeline-runner",
              title: "Broken CI Pipeline",
              description:
                "Push a commit and watch the stages run. One fails: read the log, choose a fix and re-run until the build is green.",
            },
            {
              kind: "text",
              heading: "Read logs like a detective",
              body: [
                "Work from the first error, not the last. Later lines are usually consequences: a failed test can produce a cascade of noise. Jump to the failing step, read the first error, and reproduce it locally with the same command.",
                "Never fix a red build by re-running it. If it passes on the second attempt, you have found a flaky test or a race condition - which is a bug worth recording, not a victory.",
              ],
            },
            {
              kind: "checklist",
              title: "Failing build triage",
              items: [
                "Which step failed? Open only that step's log",
                "What is the first error line, not the last?",
                "Does it reproduce locally with the same command and versions?",
                "Is it my change, a flaky test, or a dependency that moved?",
                "Add the guard that stops this class of failure returning",
              ],
            },
            {
              kind: "quiz",
              question:
                "A build fails on the test step. You re-run it and it passes. What is the correct response?",
              options: [
                "Treat it as flaky, record it, and fix the underlying race or shared state",
                "Move on - green is green",
                "Disable the test to keep the pipeline fast",
                "Add a retry loop to the workflow and forget about it",
              ],
              answerIndex: 0,
              explanation:
                "Intermittent failures destroy trust in the pipeline. A retry hides the symptom and the same flake will hit production at the worst moment.",
            },
          ],
        },
        {
          id: "deploy-to-vercel",
          title: "Deploy to Vercel from CI",
          minutes: 17,
          objectives: [
            "Separate preview and production deployments",
            "Handle secrets without leaking them",
          ],
          blocks: [
            {
              kind: "text",
              heading: "Preview first, then promote",
              body: [
                "Every pull request gets its own preview URL, so reviewers click the real thing instead of reading a diff. Production is promoted only after the checks pass on main.",
                "Secrets live in the platform's encrypted store and are referenced by name. Never echo a secret into a log: masked values still end up in build artefacts and error reports.",
              ],
            },
            {
              kind: "code",
              language: "yaml",
              caption: "Deploy step with the official Vercel CLI",
              code: `deploy:
  needs: verify            # never deploy a red build
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: npm ci
    - run: npx vercel pull --yes --environment=production --token=\${{ secrets.VERCEL_TOKEN }}
    - run: npx vercel build --prod --token=\${{ secrets.VERCEL_TOKEN }}
    - run: npx vercel deploy --prebuilt --prod --token=\${{ secrets.VERCEL_TOKEN }}`,
            },
            {
              kind: "callout",
              tone: "tip",
              title: "Set environment variables in both places",
              body: "Vercel needs them at build time (for static pages) and at runtime (for API routes). Mirror .env.example into the project settings so a fresh deploy never starts with a missing key.",
            },
            {
              kind: "quiz",
              question: "Where should VERCEL_TOKEN be stored?",
              options: [
                "As an encrypted repository or environment secret, referenced by name",
                "In the workflow file so it is easy to find",
                "In the README so the team can reuse it",
                "In a commit on a private branch",
              ],
              answerIndex: 0,
              explanation:
                "Secrets belong in the platform's encrypted store. Anything committed to the repository is readable by everyone with access to the history - including after you delete it.",
            },
          ],
        },
      ],
    },
  ],
};
