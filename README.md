# Forma Learning Lab

**The team's selected integrated prototype for the COMP5241 group project.**

Forma is a web learning platform for software development, software engineering and AI tools. It brings courses, study plans, practical exercises and learning records into one consistent interface, supporting both non-CS beginners and CS learners preparing for employment.

<p>
  <a href="https://forma-learning-lab.vercel.app/">
    <img src="docs/open-forma.svg" alt="Open Forma website" width="184" height="40">
  </a>
</p>

[Live demo](https://forma-learning-lab.vercel.app/) · [Team repository](https://github.com/PokMan-Recreater/2026Comp5241-group-project)

## From three prototypes to one application

Our three team members developed **SkillForge**, **Forma** and **CodeCraft Academy**. After comparing their designs and functionality, we selected Forma's interface as the basis for our final application and incorporated useful learning and practice features from the other two prototypes.

| Initial prototype | Main contribution to the integrated design |
| --- | --- |
| **Forma** | Visual design, software engineering lessons, learner profiles, and learner, instructor and administrator workspaces. |
| **SkillForge** | Personalized study paths, interactive developer-tool labs, interview practice, narration and progress rewards. |
| **CodeCraft Academy** | Multi-language programming topics, code examples, free coding, syntax references and revision activities. |

These contributions describe the design and features brought together; the integrated implementation adapts them to Forma's interface and learning flow. The integrated Forma prototype is maintained on `main`. The earlier prototypes remain available through the repository's commit history. Use feature branches and pull requests for further changes.

## Main features

| Area | What learners and teachers can do |
| --- | --- |
| **Courses** | Explore 16 courses with 66 lessons on software engineering and AI/developer tools. Search and filter content by topic, level and background. |
| **Programming foundations** | Study 30 mini lessons covering C, C++, Python, JavaScript and HTML/CSS, with examples, explanations, notes and knowledge checks. |
| **Personalized study plans** | Choose topics, background, level and weekly study time; preview and save plans that connect lessons with practice and interview rehearsal. Mixed-topic plans support programming and developer tools together. |
| **Interactive labs** | Explore six models: Git branching and merging, prompt structure, document retrieval, CI repair, container lifecycle and gradient descent. Existing software engineering scenario exercises remain available. |
| **Coding practice** | Complete 14 JavaScript challenges with behavior checks, hints and reference solutions. Use a free JavaScript playground or HTML/CSS/JavaScript page preview. |
| **Checks and references** | Review a 73-question revision bank and 15 syntax cards alongside lesson-level checks and worked answers. |
| **Interview practice** | Practise 11 scenarios with 33 prompts, save drafts and attempts, and review structured writing cues. Optional live AI coaching is available when configured. |
| **Learning records** | Continue recent learning, save lessons, review history, and track completion, quiz results, XP, levels, streaks and seven activity-based badges. Export local records. |
| **Language and accessibility** | Use English, Simplified Chinese or Traditional Chinese; choose interface and course languages separately. Listen to lessons with device narration and sentence highlighting, or open plain-language study guides. |
| **Instructor workspace** | Edit and publish courses, manage local classroom rosters, inspect recorded participation and export CSV summaries. |
| **Administrator workspace** | Preview catalog management and people-and-role workflows. Role switching demonstrates the three workspaces. |

## What makes Forma distinctive

- **A connected learning flow:** move from a course to a relevant exercise, explain the result in interview practice, and review progress in one place.
- **Different starting points:** background, learning goals, content depth and study time shape recommendations without excluding learners from courses.
- **Useful without a live AI model:** authored lessons, planning rules, simulations and local feedback remain available. Optional AI assistance complements these activities.
- **One consistent design:** the integrated prototype combines the three proposals within Forma's shared navigation and visual style.

## Current progress and next steps

The team has selected the integrated prototype as the basis for the final application. Classmates have tested Forma and provided feedback on navigation, visual design, course depth and feature visibility. We have used that feedback to simplify controls, remove duplicate profile access and improve the learning activities.

Next, we will divide further development tasks among members and collaborate through feature branches and pull requests, reviewing changes before merging into `main`. We will continue testing the main workflows, collecting feedback and improving the documentation before the final deployment.

The live demo may show an earlier revision until the selected branch is deployed. See the [integration review record](docs/peer-completion-preview.md) for the latest local integration checks and scope.

## Run locally

Use **Node.js 22**. The main application has no third-party runtime packages to install.

```sh
npm run dev
```

Open [the local preview](http://127.0.0.1:4173). To use another port:

```sh
PORT=4176 npm run dev
```

Run the automated checks and create the static build:

```sh
npm test
npm run build
```

The most recent integration check passed **63 automated tests** and the production build. GitHub Actions runs the tests and build for pushes to `main` and `dev`, and for pull requests targeting those branches. Browser review also covered mixed-topic planning, interactive page previews, saved interview attempts, language switching and lab interactions. See the [verification notes](docs/peer-completion-preview.md).

An optional browser-check script is available at `scripts/browser-check.mjs`; it requires Playwright and a compatible browser. Set `PLAYWRIGHT_MODULE_PATH` and `CHROME_PATH` to use existing installations.

## Deploy to Vercel

Use `main` as the production branch when deploying the integrated Forma prototype. This application uses a different build configuration from the earlier Next.js prototype:

| Setting | Value |
| --- | --- |
| Framework preset | Other |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js | 22.x |

These build settings are declared in `vercel.json`. Check the Vercel project's existing settings when switching from the earlier prototype. The optional server-side AI endpoint is `api/ai.js`.

For live AI, configure these environment variables on the server and redeploy:

| Variable | Purpose |
| --- | --- |
| `AI_API_KEY` | Provider API key. |
| `AI_BASE_URL` | HTTPS Chat Completions-compatible base URL; defaults to `https://api.deepseek.com`. |
| `AI_MODEL` | Model identifier supported by the selected provider. |

Keep credentials out of the repository. The application does not ask learners to enter API keys in the browser.

## Prototype scope and remaining work

- **Storage and accounts:** records are saved in the current browser's `localStorage`. Shared storage, cross-device synchronization, production authentication and server-side authorization are pending. Role switching previews workflows; it is not account authentication.
- **Classrooms:** roster import and engagement views operate on local records. Importing names does not send invitations or create genuine student activity.
- **Code execution:** JavaScript challenges use isolated execution with a timeout. HTML page previews use an opaque-origin sandbox with restricted resources; they do not have the same execution-time guarantees. C/C++ and Python examples provide limited output traces, not full language runtimes.
- **AI and content:** live AI requires server-side configuration and end-to-end validation. New-topic study templates guide source-led learning; they do not establish verified facts about arbitrary subjects. Local interview cues are practice aids, not hiring or mastery assessments.
- **Teaching tools:** media uploads, fully configurable activity parameters, shared analytics and generative audio/animations need further development. Current narration uses device text-to-speech.

## Project structure

| Directory | Contents |
| --- | --- |
| `public/` | Interface, translations, courses, learning logic and self-hosted assets. |
| `api/` | Server-side AI endpoint for Vercel. |
| `scripts/` | Local preview, build and optional browser checks. |
| `tests/` | Automated checks for curriculum, plans, progress, APIs, simulations and practice. |
| `docs/` | User guide, course design, requirements and dated review records. |
| `course-authoring/` | Optional course-authoring sources and generation dependencies. |
| `dist/` | Generated build output, excluded from Git. |

## Documentation and team contributions

- [User guide](docs/user-guide.md)
- [Course design](docs/course-design.md)
- [Integration review and verification](docs/peer-completion-preview.md)
- [Earlier feature comparison](docs/feature-upgrade.md)

Some earlier review documents describe previous prototype stages; use the current README and latest dated review record for the integrated version.

This is a shared team project. Each team member developed an initial prototype, and our final application combines contributions from all three proposals. Preserve individual work and contribution history when reviewing and merging changes.

Course drafts and parts of the implementation were developed with AI assistance. Teaching content and generated suggestions still require human review.
