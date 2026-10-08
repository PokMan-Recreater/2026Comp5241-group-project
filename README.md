# SkillForge

Mini-courses on software engineering and AI tools with **personalised learning paths**,
**interactive simulations**, **role-play mock interviews**, **in-browser coding challenges** and
**AI-narrated content**. Built for both CS and non-CS learners, and for **any topic** - including
ones that are not in the catalogue.

> COMP5241 group project. Next.js (App Router) + TypeScript + Tailwind, no database, deploys to
> Vercel with zero configuration.

---

## What it does

| Feature | How it works |
| --- | --- |
| **Personalised paths** | `/onboarding` collects background (CS / non-CS), level, goal and weekly study minutes. `src/lib/pathGenerator.ts` matches the topic against a keyword library, orders lessons into modules, and schedules them into weeks that fit the learner's budget. |
| **Custom topics** | `/create` (and the wizard) accept any free-text topic. If nothing in the catalogue matches, a **complete mini-course is synthesised** - foundations, vocabulary, a hands-on workflow, quality checks, a capstone and interview rehearsal - with the topic written into the lesson titles. |
| **Interactive simulations** | 6 labs, each a real model of the thing it teaches: Git commit graph with conflict resolution, prompt rubric lab, RAG retrieval pipeline, broken CI pipeline, mock Docker CLI, gradient-descent optimiser. |
| **Coding challenges** | 7 challenges with real tests, executed inside a **sandboxed iframe** (`allow-scripts`, opaque origin, 4s timeout). Learner code never leaves the browser. |
| **Role-play / mock interviews** | 5 scenarios (frontend screen, behavioural, stakeholder explanation, data case, ML deep dive) scored by a deterministic rubric: structure, concrete evidence, domain vocabulary, ownership, length, clarity. Optional AI coaching on top. |
| **AI narration** | Every lesson can be read aloud with the Web Speech API, with sentence-level highlighting as it speaks. No audio files, no API keys. |
| **Progress** | XP, levels, streaks, 7 badges, bookmarks, quiz best-scores and interview history - all derived from real activity and stored locally. |

## Tech stack

- **Next.js 16** (App Router, Turbopack) with **React 19** and **TypeScript** (strict)
- **Tailwind CSS v4** (CSS-first tokens in `src/app/globals.css`)
- **Vitest** for unit tests of all pure logic
- **Zero runtime dependencies** beyond Next/React: no UI kit, no state library, no database
- **AI provider abstraction** (`src/lib/ai`): offline deterministic engine by default, optional
  OpenAI-compatible provider via environment variables

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Other scripts:

```bash
npm run typecheck    # tsc --noEmit
npm run lint         # eslint (flat config)
npm test             # vitest run
npm run build        # production build
npm run verify       # typecheck + lint + tests + build
npm run hooks:install  # enable the pre-push gate (once per clone)
```

The app works with **no environment variables**. Copy `.env.example` to `.env.local` only if you
want to enable a real model:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

With `AI_PROVIDER=mock` (the default) every AI feature still works: path rationales, interview
coaching and topic explanations are produced by a deterministic template engine in
`src/lib/ai/mock.ts`. If a remote call fails at runtime, `completeWithFallback` degrades to the
offline engine, so the UI never breaks.

## Architecture

```
src/
  app/                       # routes (App Router)
    api/ai/route.ts          #   POST { task: generate-path | interview-coach | explain }
    courses/[slug]/[lessonId]#   lesson player
    onboarding/ create/ paths/ dashboard/ labs/ interview/ catalog/
  components/
    providers/AppDataProvider # localStorage state: profile, paths, progress, custom courses
    lesson/                   # lesson player, block renderer, quiz, narration
    simulations/              # 6 labs + host
    code/                     # sandboxed challenge runner
    interview/                # role-play runner + rubric feedback panel
    catalog/ course/ path/ dashboard/ labs/ onboarding/ create/
  content/                    # the curriculum, as typed data
    courses/*.ts              #   11 curated courses
    challenges.ts roleplays.ts simulations.ts
  lib/
    pathGenerator.ts          # personalisation engine (matching, scheduling, synthesis)
    topics.ts                 # topic keyword library + matcher
    progress.ts               # XP, streaks, levels, badges, completion (pure functions)
    rubric.ts                 # interview answer scoring (pure, testable)
    ai/                       # provider abstraction, prompts, mock + OpenAI implementations
    speech.ts storage.ts utils.ts
  types/index.ts              # the whole domain model
```

### Design decisions worth knowing

- **Pure logic, thin components.** Scheduling, scoring, progress and topic matching live in
  `src/lib` as pure functions with no React or browser dependencies. That is why they are unit
  tested, and why the same engine can power both the API route and the offline fallback.
- **Content is data.** Lessons are typed objects (a `LessonBlock` union), not JSX, so the content
  layer cannot break the app and any host can render a lesson (lesson player, labs page, generated
  course).
- **No database.** Everything a learner creates lives in `localStorage` behind one provider, which
  removes auth, migrations and hosting cost from a graded group project while keeping the door open
  for a real backend later.
- **Safety first for learner code.** Challenges run in a sandboxed iframe with a timeout, rather
  than `eval` on the main thread.

## Testing

`npm test` runs 8 Vitest suites covering:

- progress rules: XP idempotence, streak day maths, best-quiz scoring, levels, badges
- the topic matcher, including false-positive guards (`html` must not match `ml`)
- path generation: weekly budget compliance, no duplicate lessons, step caps, custom-course
  synthesis and level-based trimming
- the interview rubric: strong vs vague answers, filler penalty, missing vocabulary
- content integrity: unique ids, valid quiz answers, every referenced simulation / challenge /
  scenario exists, and every lab and challenge is used by some lesson
- **every reference challenge solution is executed against its own tests**, and every starter code
  is proven to fail - using the same `new Function` harness the browser sandbox uses
- the delivery pipeline itself: the workflow, the pre-push hook and `package.json` must keep agreeing
  on the same scripts (see [Continuous integration](#continuous-integration))

## Continuous integration

`.github/workflows/ci.yml` runs `npm ci` followed by `npm run typecheck`, `npm run lint`,
`npm run test` and `npm run build` on Node 24 - the same four checks as `npm run verify` - for every
pull request into `main` or `dev`, and for every push to either branch. A failing run shows up as a
red cross on the pull request.

To make that a hard requirement instead of a warning, protect the branch once per repository:

1. **Settings -> Branches -> Add branch protection rule** (or **Settings -> Rules -> Rulesets** if your
   repository shows the newer UI - the check name below is the same either way).
2. **Branch name pattern**: `main`.
3. Tick **Require status checks to pass before merging**.
4. Type `Verify` in the search box, click the **Verify (typecheck, lint, test, build)** entry, then
   click the **+** button beside it. Adding a check is a two-step process and the **+** is easy to
   miss - without it no check is actually attached, and GitHub refuses to save with **"Rule is
   invalid"**. The check must show up as a chip before you save.
5. **Create** / **Save changes**.

The check only appears in that search box after `.github/workflows/ci.yml` has run at least once on
the branch, so push first and configure afterwards. A red pull request can then no longer be merged.

### Catch failures before they leave your machine

CI is the authority, but a round trip through GitHub is a slow way to find a typo. The repository
ships a `pre-push` hook in `.githooks/` that runs `npm run verify` and aborts the push whenever a
push targets `main`:

```bash
npm run hooks:install   # git config core.hooksPath .githooks - once per clone
```

Git never versions `.git/hooks`, which is why the hook lives in `.githooks/` and has to be switched
on explicitly. Pushes to other branches are left alone. In a genuine emergency, `git push --no-verify`
skips the hook.

## Deploying to Vercel

1. Push the repository to GitHub.
2. In Vercel: **Add New -> Project -> import the repo**. The Next.js preset is detected; no build
   settings need changing.
3. (Optional) Add `AI_PROVIDER` / `OPENAI_API_KEY` under **Settings -> Environment Variables**.
   Without them the app deploys in offline mode, which is the intended demo configuration.
4. Deploy. Preview deployments are created for every pull request automatically.

`src/app/api/ai/route.ts` runs on the Node.js runtime and is marked `force-dynamic`, so it works on
Vercel's serverless functions without extra configuration.

## Known limitations

- Progress and generated courses are **per browser profile**: there is no account system or sync.
- Narration depends on the browser's Web Speech API (Chrome, Edge, Safari); other browsers see a
  short explanatory note instead of a play button.
- The offline AI engine is a deterministic template engine, not a language model. It only states
  what the structured payload has already computed.
- Generated custom courses teach **process** (goal, vocabulary, workflow, verification, explanation)
  rather than asserting facts about a topic we cannot verify.


