# Forma Learning Lab

**COMP5241 group project — Forma prototype**

Author: [Cicicrr](https://github.com/Cicicrr) · Branch: `prototype/forma`

[Live demo](https://forma-learning-lab.vercel.app/) · [Group repository](https://github.com/PokMan-Recreater/2026Comp5241-group-project)

This branch contains Forma as an independent prototype for the group to compare with the other proposals. SkillForge remains on `main`. Select `prototype/forma` when viewing, checking out or deploying this version.

Forma is a working learning-platform prototype for a software engineering course project. English is the default language; Simplified Chinese and Traditional Chinese are also supported. Learners can choose their interface and course languages separately.

## Implemented features

- Learner, instructor and administrator workspaces, with role switching for demonstrations.
- Seven courses and 28 lessons in three languages: software development, requirements interviews, web architecture, AI-assisted programming, testing and deployment, product collaboration, and technical interviews.
- A rule-based learning sequence based on experience and goals. Advanced content adds analysis while keeping the introductory explanations available.
- Structured readings, worked examples, written interviews, step-by-step demonstrations, access-control and scope exercises, a launch simulation, and two JavaScript coding lessons with isolated execution.
- A three-part assignment for every lesson, with saved drafts, reference answers, self-check criteria and course-assignment downloads.
- Comprehension checks with explanations in selected lessons. Open assignments do not receive artificial mastery scores.
- A “Five minutes to launch” game with an eight-point budget, investigation/development/testing choices, deterministic outcomes and replay.
- Browser-local progress, notes, code and game records that survive language changes.
- An instructor course editor for creating and editing multilingual courses, adding or removing lessons, previewing and publishing.
- Classroom creation, CSV roster import with duplicate detection, recorded activity views and CSV export.
- Administrator controls for course status and local user/role records.
- A server-side AI adapter for course generation, course questions and role-play when configured. An unconfigured service displays an explicit message.
- Vercel configuration, local preview and a static build without runtime package dependencies.

## Prototype limitations

Application records are stored in the current browser's `localStorage`. Role switching is a demonstration feature; real authentication, server-side authorization, a shared database and cross-device synchronization are pending. Importing a roster does not send invitations or create student activity records.

Narration uses the device's text-to-speech service. Generative AI audio, full animations and media uploads in the course editor are pending. Instructors can edit activity descriptions; game parameters and coding test cases are not yet configurable through the editor.

The prototype supports review and user feedback. It does not represent completion of every final-project requirement. See [requirements and remaining work](docs/requirements.md).

## Run locally

Use Node.js 22. No dependency installation is needed.

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
| `tests/` | API, course-content, game, recommendation and CSV checks. |
| `docs/` | Requirements, user guide, course design and verification records. |
| `course-authoring/` | Course-authoring source and optional generation dependencies. |
| `dist/` | Generated static build; excluded from Git. |

## Course design and verification

See the [course design notes](docs/course-design.md), [user guide](docs/user-guide.md) and [verification record](docs/course-verification.md).

The course drafts use cases, worked examples, practice and feedback informed by open teaching resources. They were written with AI assistance and are not presented as instructor-reviewed material. Live AI interactions require server-side configuration; device narration is text-to-speech.
