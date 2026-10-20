# Forma Learning Lab

<p>
  <a href="https://forma-learning-lab.vercel.app/">
    <img src="docs/open-forma.svg" alt="Open Forma website" width="184" height="40">
  </a>
</p>

**COMP5241 group project — Forma prototype**

Author: [Cicicrr](https://github.com/Cicicrr) · Branch: `prototype/forma`

[Group repository](https://github.com/PokMan-Recreater/2026Comp5241-group-project)

This branch contains Forma as an independent prototype for the group to compare with the other proposals. SkillForge remains on `main`. Select `prototype/forma` when viewing, checking out or deploying this version.

Forma is a working learning-platform prototype for a software engineering course project. English is the default language; Simplified Chinese and Traditional Chinese are also supported. Learners can choose their interface and course languages separately.

## Implemented features

- Learner, instructor and administrator workspaces; course editing and publication; classroom roster import and local activity export.
- Seven software-engineering courses with 30 lessons, assignments, reference responses and saved notes in English, Simplified Chinese and Traditional Chinese.
- Nine AI/developer-tool courses with 36 more lessons covering Git, SQL, Docker, CI/CD, prompts, LLM applications, ML, everyday AI and Python data scripts.
- Three-step learner setup, interest tags, weekly scheduling, generation previews and multiple saved learning plans with an active-plan selector.
- Topic matching against published courses and source-led study templates for new topics, available without model credentials. Templates are explicitly distinguished from verified subject teaching or live AI generation.
- A practice center with six new models: Git branches and merges, prompt structure, document retrieval, CI repair, container lifecycle and gradient descent. Existing launch, access-control and scope exercises remain available.
- Fourteen standalone JavaScript challenges with real behavior checks, saved code, hints, reference implementations, detailed failure output and isolated, time-limited execution. The two existing coding lessons are retained.
- Five interview scenarios with saved drafts, per-question review cues, overall review, attempt history and optional live AI coaching. Local phrase-based cues are not mastery or hiring assessments.
- A learner dashboard with active-plan progress, estimated completed lesson time, bookmarks, quiz best results, challenge and interview records, XP, levels, streaks and seven activity-based badges.
- Full lesson-text narration with sentence highlighting, voice and speed selection, pause/resume and stop. Narration uses device text-to-speech.
- Course and lesson search, level/audience filters, lesson bookmarks, undo completion, progress export, confirmed progress reset and same-session undo.
- A programming-foundations collection with 30 multilingual mini lessons across C, C++, Python, JavaScript and HTML/CSS: worked examples, pitfalls, knowledge checks, worked answers, notes and inline JavaScript/HTML practice.
- A general JavaScript playground and sandboxed HTML/CSS preview, with example transfer, template selection, keyboard indentation, reset and clear-output controls. C/C++ and Python provide explicitly limited literal-output traces, not full compilers or interpreters.
- Lesson-based plain-language study guides and server-side AI adapters for live course generation, questions and role-play when a provider is configured.

The current local review also adds a 71-question revision bank, 15 syntax cards, detailed lab diagnosis and question-specific interview review. See [the peer integration preview](docs/peer-integration-preview.md) for coverage, entry points and verification.

See [the comparison checklist and verification](docs/feature-upgrade.md) and [the local navigation and learning-flow preview](docs/navigation-preview.md).

## Prototype limitations

Application records are stored in the current browser's `localStorage`. Role switching is a demonstration feature; real authentication, server-side authorization, a shared database and cross-device synchronization are pending. Importing a roster does not send invitations or create student activity records.

Narration uses the device's text-to-speech service. Generative AI audio, full animations and media uploads in the course editor are pending. Instructors can edit activity descriptions; game parameters and coding test cases are not yet configurable through the editor.

The prototype supports review and user feedback. It does not represent completion of every final-project requirement. See [requirements and remaining work](docs/requirements.md).

## Run locally

Use Node.js 22. No dependency installation is needed. The automated suite currently contains 49 tests.

```sh
npm run dev
```

Open [the local preview](http://127.0.0.1:4173).

```sh
npm test
npm run build
```

The optional browser check requires Playwright and a compatible browser:

```sh
node scripts/browser-check.mjs
```

Use `PLAYWRIGHT_MODULE_PATH` and `CHROME_PATH` to select existing installations if needed.

## Deploy to Vercel

Import this branch as a separate Vercel project. Select **Other** as the framework, use `npm run build` as the build command, and set the output directory to `dist`. These settings are declared in `vercel.json`. The server-side AI endpoint is `api/ai.js`.

To enable AI, configure the following server-side environment variables in Vercel and redeploy:

| Variable | Purpose |
| --- | --- |
| `AI_API_KEY` | API key for the configured provider. |
| `AI_BASE_URL` | HTTPS endpoint compatible with Chat Completions; defaults to `https://api.deepseek.com`. |
| `AI_MODEL` | A model identifier supported by the provider and account. |

Keep credentials out of source files and the public repository. The application does not ask users to enter API keys in the browser.

## Project structure

| Directory | Contents |
| --- | --- |
| `public/` | Interface, translations, courses, rules and self-hosted assets. |
| `api/` | Server-side AI endpoint for Vercel. |
| `scripts/` | Local preview, build and optional browser checks. |
| `tests/` | API, curriculum, plans, state migration, rewards, simulations, challenge contracts and CSV checks. |
| `docs/` | Requirements, user guide, course design and verification records. |
| `course-authoring/` | Course-authoring source and optional generation dependencies. |
| `dist/` | Generated static build; excluded from Git. |

## Course design and verification

See the [course design notes](docs/course-design.md), [user guide](docs/user-guide.md) and [verification record](docs/course-verification.md).

The course drafts use cases, worked examples, practice and feedback informed by open teaching resources. They were written with AI assistance and are not presented as instructor-reviewed material. Live AI interactions require server-side configuration; device narration is text-to-speech.
