---
name: run-forma
description: Run, start, build, test, and screenshot the Forma Learning Lab web app. Use to launch the dev server, drive the lesson player in headless Chrome, verify course-map/player routes, or capture screenshots of Explore and lesson pages.
---

# Run Forma

Forma is a static ES-module web app (no framework) served by `scripts/serve.mjs`.
The agent path is the committed CDP driver at `.claude/skills/run-forma/driver.mjs`:
it starts its own server on a random port, launches headless Chrome, navigates
hash routes, evaluates JS, clicks/plays lessons, and writes PNG screenshots.
Paths below are relative to the repo root.

## Prerequisites

- Node `>=22.13 <23` (verified on v22.23.3).
- Dependencies installed with `npm ci`.
- Google Chrome. The driver looks for `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
  and standard Chromium names on `PATH`; point `CHROME_BIN` at the executable if yours lives elsewhere.

## Setup and build

```bash
npm ci
npm run build
```

`npm run build` copies `public/` to `dist/`. Edit files under `public/`, never `dist/`.

## Run (agent path)

The driver needs no running server and no window.

```bash
node .claude/skills/run-forma/driver.mjs --help
node .claude/skills/run-forma/driver.mjs smoke
```

Checks 58 routes (`#explore`, three theme pages, nine course routes that redirect into the
player, all forty-five lessons), asserts expected element counts derived from
`public/all-lessons.js` and `public/course-map.js` (each lesson sidebar must also show five
`.dl-lesson-group` accordion groups), fails on console errors, and writes `smoke-*.png` to
`/tmp/forma-driver`.

Course routes no longer render a card page: `#module/<courseId>` redirects to
`#learn/<firstLessonId>/0`. The player sidebar lists the course's five lessons as collapsible
groups (01–05), each expanding to its steps (01.1, 01.2…).

Drive individual routes:

```bash
node .claude/skills/run-forma/driver.mjs shot '#explore' /tmp/forma-driver/explore.png
node .claude/skills/run-forma/driver.mjs eval '#explore' "document.querySelectorAll('.cm-topic').length"
```

Inspect or play a lesson (`--lang zh-CN|en|zh-TW`, `--play` renders at the end of the step).
Lesson screenshots default to `/tmp/forma-driver`:

```bash
node .claude/skills/run-forma/driver.mjs lesson delegating-to-agents 0 /tmp/forma-driver/agent0.png --lang zh-CN --play
node .claude/skills/run-forma/driver.mjs play delegating-to-agents --seconds 25
```

`play` prints the current step, clock, and hash before and after; `--seconds 25`
crosses the 24-second narrated step and returns `#learn/delegating-to-agents/1`.

Reuse an already-running server instead of starting one:

```bash
FORMA_URL=http://127.0.0.1:4173 node .claude/skills/run-forma/driver.mjs eval '#explore' "document.querySelectorAll('.cm-topic').length"
```

## Direct invocation (no browser)

Lesson content lives in `public/course-lessons.js`. Check step counts and run the
player tests without Chrome:

```bash
node --input-type=module -e "import {delegatingLesson,problemDefinitionLesson} from './public/course-lessons.js'; console.log(delegatingLesson.id, delegatingLesson.steps.length, problemDefinitionLesson.id, problemDefinitionLesson.steps.length)"
node --test tests/lesson-player.test.mjs
```

## Run (human path)

```bash
npm run dev
# Forma preview: http://127.0.0.1:4173
PORT=4199 npm run dev
```

Serves `public/` on `127.0.0.1` and prints the URL. The driver avoids port
collisions because it starts the server with `PORT=0`.

## Test

```bash
npm test
npm run verify
```

`npm test` runs `node --test tests/*.test.mjs` (159 tests).
`npm run verify` runs typecheck, lint, tests, and build in sequence.

## Gotchas

- Headless Chrome defaults to `en-US`, so lessons render in English. Pass `--lang zh-CN`
  to the `lesson` command to check Chinese.
- Every lesson opens with the current step already at its end (art fully drawn).
  Pressing play restarts the step from `0:00`.
- Narrated steps last about 15–26 seconds. `play --seconds 3` only advances the
  clock; use a duration longer than the step to observe auto-advance.
- Headless Chrome blocks autoplay without a user gesture. The driver launches with
  `--autoplay-policy=no-user-gesture-required` so narration plays during `--play` checks.
- Each driver run uses a fresh temporary Chrome profile, so language choice and
  annotations do not carry over between invocations.
- Routes are hash routes: `#learn/<lessonId>/<step>`. `shot`, `eval`, and `lesson`
  accept either `learn/...` or `#learn/...`.
- `scripts/serve.mjs` imports `ws`, so the server does not run without `npm ci`.

## Troubleshooting

- `No Chrome/Chromium found` or `CHROME_BIN not found: <path>` — install Chrome or set
  `CHROME_BIN` to the real executable path.
- `EADDRINUSE` from `npm run dev` — start on another port with `PORT=4199 npm run dev`;
  the driver itself always uses `PORT=0`.
