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
| **Git practice** | A practice category of its own: 23 Git pages (branch and merge, the Git command line with seven whole production situations, and 21 one-command practices that each get their own page) plus **Free Git practice**, a sandbox in the style of free coding where any command can be typed and the terminal, repository state, graph and mistake review update as you go. Everything runs the commands you type, keeps the task list and explains every mistake afterwards, and Knowledge practice asks ten questions about the same ideas. |
| **Other interactive labs** | The prompt, retrieval, CI, container and gradient models are kept in the code but hidden in this build: no lesson, plan, card or listing links them, and a lesson that used one falls back to its own knowledge check. Existing software engineering scenario exercises remain available. |
| **Code quest** | A Codédex-style course in pixel style: five chapters, 21 exercises, XP, levels and badges. Choose Python, C++ or Java, type real code and run it, or fix one broken line and watch the variables change. |
| **Coding practice** | Complete 14 JavaScript challenges with behavior checks, hints and reference solutions. The free-coding playground really runs your code: JavaScript in an isolated worker, HTML/CSS/JavaScript in an isolated page preview, and C, C++ or Python through the same small interpreter as Code quest. |
| **Checks and references** | Review a 73-question revision bank and 15 syntax cards alongside lesson-level checks and worked answers. |
| **Interview practice** | Practise 11 scenarios with 33 prompts, save drafts and attempts, and review structured writing cues. Optional live AI coaching is available when configured. |
| **Learning records** | Continue recent learning, save lessons, review history, and track completion, quiz results, XP, levels, streaks and seven activity-based badges. Export local records. |
| **Language and accessibility** | Use English, Simplified Chinese or Traditional Chinese; choose interface and course languages separately. Listen to lessons with device narration and sentence highlighting, or open plain-language study guides. |
| **Instructor workspace** | Edit and publish courses, manage local classroom rosters, inspect recorded participation and export CSV summaries. |
| **Administrator workspace** | Preview catalog management and people-and-role workflows. Role switching demonstrates the three workspaces. |

## Course covers and practice icons

The catalogue used to show three generic covers shared across all sixteen courses, and every interactive lab used the same icon. Each item now carries artwork that hints at its own topic, drawn with the same palette, stroke weight and corner radii as the original covers so the grid keeps one visual language.

| Area | What changed |
| --- | --- |
| **Courses** | One cover per course: a three-stage pipeline for software development, interview bubbles for requirements, a three-tier stack for web architecture, an editor with a sparkle for AI coding, a checklist with an incident marker for testing and release, a scope list plus team cluster for product decisions, a candidate badge for interview prep, a tool box and magnifier for AI tools, a commit graph for Git, a cylinder and filter funnel for SQL, stacked layers for Docker, a looping pipeline for CI/CD, a prompt card with a target for prompt engineering, retrieval sheets feeding a model for LLM apps, and a loss curve for machine learning. |
| **Branch and merge** | It no longer shares one icon with the other labs. All seven original labs have distinct icons: a branch for Git, a merge symbol for the Git command line, a chat bubble for the prompt workshop, a database for retrieval, a wrench for CI repair, a container for the Docker lifecycle and a descending trend for gradient descent. The 21 one-command Git practices share a short set of reading, changing, branching and publishing icons. |
| **Interface** | The Explore navigation icon is a compass again; it previously repeated the book icon used by the instructor courses tab. |

Covers live in `public/course-art.js`, keyed by course id. Courses created inside the browser (self-study) still fall back to the original theme-based covers.

## Code quest: a programming game

Code quest is a chapter-based course in the learner sidebar. The course page lists five chapters (Hello World, Variables, Control Flow, Loops and a Checkpoint Project) with a progress panel, XP, a level and one badge per chapter. Each chapter mixes two kinds of exercise:

- **Write** exercises give a task and a goal output. The learner picks Python, C++ or Java, types code, presses Run (or Ctrl / Cmd + Enter) and the game checks the output. Some exercises also require a concept (a variable, `if` or `while`), so printing the answer by hand does not pass. Hints, readable error messages with line numbers and a step trace are built in.
- **Fix** exercises are the original pick-the-missing-line levels. The same program can be read in C++, Python or Java, so they teach the idea behind the code rather than one syntax.

| Chapter | Ideas practised |
| --- | --- |
| **Hello World** | `print()`, text, repeating text, arithmetic |
| **Variables** | Assigning, reusing and swapping values, remainder |
| **Control Flow** | `if` / `elif` / `else`, comparison, flags |
| **Loops** | `while`, counters, accumulating a total |
| **Checkpoint Project** | Fizz Buzz, combining all of the above |

Typed code is read by two small parsers, one for Python (`public/codequest-python.js`) and one shared by C++ and Java (`public/codequest-clike.js`), into the same instruction tree the fix levels use. Every exercise and language therefore shares one interpreter, one step trace and the same step and loop-pass limits. Starter code is generated per language from the same setup variables, and an exercise counts as cleared whichever language solved it. A deliberately bad loop cannot freeze the page. XP, level and badges are worked out from the existing `cleared` map, so no extra progress is stored besides the learner's code drafts, and reset, undo and export already cover it. The game runs a teaching model, not the real compilers: int and text variables, arithmetic, comparisons, `if` / `else`, `while` and `for`, and printing. Decimals, functions, arrays and classes beyond `main` are not supported.

The course has a small story so the pictures belong together. The Beacon of Byte Island has gone dark, and Bit (a robot) and Nib (a spark) relight it one chapter at a time. Each chapter has a place, a guardian who explains its idea (Boxy the crate keeper for variables, Forky the signpost for `if`, Loopy the ring-worm for loops) and a spark that Bit collects when the chapter is finished. Every chapter has its own animated pixel scene on the left of its exercises, the course banner shows the whole island, and the Beacon lights up when the last chapter is cleared. All art is drawn from plain rectangles in the forma palette, animated with CSS only, and switched off for learners who prefer reduced motion. The story is told in English, Simplified and Traditional Chinese.

The game lives in `public/codequest.js` (interpreter, fix levels and code rendering), `public/codequest-python.js` and `public/codequest-clike.js` (Python and C++/Java parsers), `public/codequest-course.js` (chapters, exercises, XP and badges) and `public/codequest-story.js` (story, cast and every pixel scene) and `public/codequest-views.js` (course page and exercise pages).

## Git practice: 23 pages of commands you can really type

Git has a practice category of its own. All 23 Git pages sit under **Practice → Git practice**, and every one of them runs the commands the learner actually types against a simulated repository. No real repository, file or network is touched, so a wrong command is safe, and anything Git refuses is explained afterwards together with the command to use instead. The commit graph, the working tree and the index are drawn from the same state the commands change. Knowledge practice asks ten questions about the same ideas, and each one links back to the practice that shows it in a repository.

| Practice | What the learner does |
| --- | --- |
| **Branch and merge** (`lab/git`) | Create a branch, let the two histories diverge, merge them and resolve the conflict; the graph then shows the merge commit with both parents. |
| **Git command line** (`lab/git-cli`) | Type any supported command, use the preset buttons, read the repository state and the file editor, and work through seven whole production situations with a live goal checklist. |
| **21 one-command practices** (`lab/git-<command>`) | Each page holds one situation with one ordered task, a hint, a task list and the graph beside it: read the status, stage one file, commit what is staged, create a branch, switch back, read the diff, read the log, unstage a file, discard an edit, stash work, restore a stash, tag a release, delete a branch, amend a message, undo a commit while keeping the work, connect a remote, publish work, get a teammate's commit, undo a shared commit, copy a commit and preview a clean tree. |

The seven production situations in the command-line lab are diverged branches, a teammate's commit you do not have yet, a conflict you must resolve and push, a hotfix that needs a stash, a bad release that needs a revert, work started on the wrong branch, and a rebase that must be reviewed before it is published.

The sandbox understands 29 commands: `init`, `clone`, `config`, `status`, `add`, `rm`, `mv`, `restore`, `reset`, `commit`, `log`, `diff`, `show`, `branch`, `switch`, `checkout`, `merge`, `rebase`, `cherry-pick`, `revert`, `tag`, `stash`, `remote`, `fetch`, `pull`, `push`, `clean`, `reflog` and `help`. `git help <command>` prints the forms the sandbox accepts, and `rebase`, `cherry-pick` and `revert` stop instead of guessing when they would conflict.

The Git course (`git-essentials`) sends each lesson into these practices, and a study plan for a Git topic links the course with `lab/git`, so the reading and the command line stay connected.

The Git work lives in `public/git-sim.js` (repository state, the 21 practices, the seven production situations and the command usage) and `public/git-lab.js` (terminal, graph, task list, state and mistake review).

**Free Git practice** is the free-coding playground's Git twin: one command prompt, a terminal, the working-tree editor, the index and working-tree state and the commit graph, with eleven example commands to load and a reset that starts a fresh repository. There is no task list and nothing to complete, and the same engine keeps every refusal explained. It lives in `public/git-sandbox.js` and reuses the lab's state, graph, editor and review renderers.

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

Use **Node.js 22.13 or newer within Node 22**. Run `npm ci` to install the development tools for type checking and linting; the application itself has no third-party runtime dependencies.

```sh
npm run dev
```

Open [the local preview](http://127.0.0.1:4173). To use another port:

```sh
PORT=4176 npm run dev
```

Run the automated checks and create the static build:

```sh
npm run verify
```

The most recent integration check passed **121 automated tests** and the production build. GitHub Actions runs type checking, linting, tests and the build for pushes to `main` and `dev`, and for pull requests targeting those branches. Browser review also covered mixed-topic planning, interactive page previews, saved interview attempts, language switching and lab interactions. See the [verification notes](docs/peer-completion-preview.md).

Type checking uses TypeScript `checkJs` on learning/planning logic, simulations, challenge execution, interview review, linked content, the AI endpoint and build/preview scripts (including their imported modules). UI event handlers and view templates are not yet included in type checking. ESLint recommended rules cover all application JavaScript and test scripts. These are separate checks: type checking detects incompatible values in checked modules; linting detects issues such as undefined names and duplicate declarations.

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
- **Code execution:** JavaScript challenges use isolated execution with a timeout, and HTML page previews use an opaque-origin sandbox with restricted resources. C/C++ and Python in the playground run in the browser by default (Clang/WASI for C/C++, Pyodide for Python); the first load downloads the runtime and later runs reuse it, with loading/elapsed status, Stop and timeouts. Remote Wandbox is an explicit backup that uploads source and input, never an automatic fallback. Code quest keeps its own bounded teaching interpreter for a stated subset, so statements outside that subset are refused with a line number instead of printing invented output. See [execution details](docs/code-execution.md).
- **AI and content:** live AI requires server-side configuration and end-to-end validation. New-topic study templates guide source-led learning; they do not establish verified facts about arbitrary subjects. Local interview cues are practice aids, not hiring or mastery assessments.
- **Teaching tools:** media uploads, fully configurable activity parameters, shared analytics and generative audio/animations need further development. Current narration uses device text-to-speech.

## Project structure

| Directory | Contents |
| --- | --- |
| `public/` | Interface, translations, courses, learning logic and self-hosted assets. |
| `public/course-art.js` | One flat SVG cover per course, plus the generic fallback covers. |
| `public/icons.js` | Lucide icon set for the interface, including a distinct icon per lab. |
| `public/codequest.js` | Code quest fix levels, the instruction interpreter and the C++/Python/Java renderer. |
| `public/codequest-python.js` | Code quest parser for the Python subset learners type. |
| `public/codequest-clike.js` | Code quest parser for the C++ and Java subsets learners type. |
| `public/codequest-course.js` | Code quest chapters, exercises, XP, levels and badges. |
| `public/codequest-story.js` | Code quest story world, characters and animated pixel scenes. |
| `public/codequest-views.js` | Code quest course page and exercise pages. |
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
