# Feature comparison audit

Baseline reviewed on 20 October 2026, before implementation. The user later authorized the feature upgrade; current coverage and verification are in [Feature upgrade](feature-upgrade.md). The tables below preserve the earlier comparison, not the current list of missing features.

## Versions and scope

- Forma: source in `prototype/forma`, including `public/app.js`, `public/learning-studio.js`, `public/engine.js` and `api/ai.js`.
- SkillForge: shared-repository `main` at `a2e5c65668d543ff1a01ed389bc3eeb19f94b94c`; the remote head was checked again during this audit. User-facing components, state providers, progress rules, AI templates and route logic were inspected.
- CodeCraft Academy: the supplied `codecraft_academy_complete_single_file.html`. Its source was inspected; this audit does not claim browser execution testing of that file.
- The comparison concerns learner-facing and teaching-platform behavior. Framework choice, source-file organization, decorative styling and unexposed internal helper functions are not counted as independent product features. It does not cover unprovided versions or other branches.

## Differences: SkillForge compared with Forma

| Feature or detail | SkillForge implementation | Forma status |
| --- | --- | --- |
| Weekly schedule | Matches topics to lessons and groups them into weeks using available study minutes. Shows total time and estimated remaining weeks. | Experience/goal-based ordering and manual reordering exist; weekly scheduling does not. |
| Guided setup and interests | Three-step setup, interest tags, topic suggestions and three skill levels. | A single profile form and two content depths exist; interest tags and topic-led setup are absent. |
| Multiple independent paths | Stores multiple paths, switches the active path, deletes paths and shows each path's next lesson. | One reorderable learning sequence; custom courses can be added, but there is no equivalent multi-plan manager. |
| Generation without model credentials | Matches existing courses or constructs a topic-named course from deterministic templates. | Manual creation works; automatic course generation requires a configured AI provider. |
| Generation preview | Shows generated modules, lessons and weekly placement before saving; allows regeneration. | Course-editor preview exists, but no equivalent pre-save generated-plan preview. |
| Plain-language explanation | A lesson button requests an explanation; the default provider returns a generic deterministic template. Remote-provider failures can fall back to that provider. | Saved hints and foundation/advanced readings exist. A fresh explanation through Ask AI requires configuration and does not have the same template fallback. |
| Lesson narration | Reads the lesson's text blocks, highlights the current sentence, offers four speeds and a voice selector. | Reads the current slide/demonstration text, at a fixed rate; no equivalent full-lesson highlighting, speed selector or voice selector. Both use device text-to-speech. |
| Catalog filters | Combines search, category, skill level and CS/non-CS audience filters. | Course search and topic filters exist; level/audience catalog filters do not. |
| Independent lab entry | A separate page selects and opens the labs. | Activities are mostly reached through lessons; the launch game also has its own entry. |
| Additional simulation models | Git branching/conflicts, prompt quality, RAG retrieval, CI debugging, mock Docker commands and gradient descent. | Different activities already exist: access-control rules, scope budgeting, launch decisions and staged demonstrations. The six SkillForge models are absent. |
| Distinct coding tasks | Seven challenges with separate contracts and tests. | Two lessons share a deduplication contract; coding itself is already implemented. |
| Coding feedback and keyboard editing | Reports setup exceptions and test-specific failure details; Tab inserts spaces in the editor. | Per-test pass/fail output, code reset, saved code and reference implementations exist; exception feedback is more generic and there is no custom Tab indentation. |
| Structured interview workflow | Five selectable scenarios, question-by-question scoring, answer feedback, overall scorecard, retry and optional provider coaching. | Authored case interviews, written mock-interview prompts, reference responses and self-review exist; live dialogue needs configured AI. The local automatic scorecard workflow is absent. |
| Best quiz results | Records a lesson's best correct-answer count and displays it in course records. | Comprehension checks retain selected/checked answers and feedback; no aggregate best-score record. |
| Learner dashboard | Aggregates course/path completion, completed study minutes, passed challenges, best interview score, attempt dates/scores, next steps and recommendations. | Course progress and saved assignments/notes/code exist; the learner page does not aggregate these into an equivalent dashboard. The instructor activity page is not a learner dashboard. |
| Bookmarks | Saves lesson bookmarks and lists them on the dashboard. | Absent. |
| Activity-based rewards | XP, levels, daily streaks and seven badges calculated from stored activity. | Completion progress exists; these reward systems are absent. |
| Undo lesson completion | Course/path views can mark completed lessons as not done. | Completion can be recorded but has no corresponding undo control. |
| Reset learning progress | A confirmed dashboard action resets progress, XP, bookmarks and interview records. | No equivalent global progress-reset control. Code/game resets are separate and already exist. |

Relevant SkillForge sources: `components/onboarding/OnboardingWizard.tsx`, `components/create/CustomTopicForm.tsx`, `components/path/PathList.tsx`, `components/path/PathDetail.tsx`, `components/catalog/CatalogBrowser.tsx`, `components/lesson/{LessonView,NarrateButton,ExplainButton,QuizBlockView}.tsx`, `components/code/CodeChallengeRunner.tsx`, `components/interview/{InterviewBrowser,RolePlayRunner,FeedbackPanel}.tsx`, `components/dashboard/Dashboard.tsx`, `components/providers/AppDataProvider.tsx`, and `lib/{pathGenerator,progress}.ts` / `lib/ai/mock.ts`, under `src/`.

## Differences: CodeCraft compared with Forma

| Feature or detail | CodeCraft implementation | Forma status |
| --- | --- | --- |
| Programming-language tutorial library | Thirty modules across C, C++, Python, JavaScript and HTML/CSS. | Courses focus on software engineering, AI-assisted development and product/communication practice. This is a content-coverage difference. |
| Lesson-level discovery | Searches tutorial titles, summaries and language labels; filters by programming language. | Searches course titles/descriptions and filters by topic, not lesson titles/summaries. |
| Syntax reference area | Five separate cheat-sheet cards. | No dedicated syntax-reference area. |
| General playground | Editable examples, direct JavaScript execution, HTML preview, language/template selection, example-to-editor transfer, reset and clear-output controls. | Task-specific JavaScript editing/testing, reset and saved code exist. No general HTML-preview playground or multi-language preset menu. |
| Undo lesson completion | Can toggle completion on and off during the current session. | No undo-completion control. |

The playground controls are parts of one feature, not separate claims that Forma lacks basic code editing or reset. CodeCraft's C/C++ and Python modes parse a few output patterns; they are not full compilers/interpreters. Its JavaScript runs in the page, without the isolation/time-limit design used by Forma. Initial XP, streak, completions and badges include preset demo values; the file does not persist progress across reloads.

## Existing Forma features that must not be counted as missing

- Course search, topic filtering, course descriptions, prerequisites/outcomes, outlines, completion indicators and resume links.
- Background/goal settings, foundation/advanced readings and a reorderable path.
- Comprehension checks with feedback, saved answers and the ability to revise selections.
- Written assignments, reference responses, persistent self-review checklists, notes and downloads.
- JavaScript editing, behavior checks, saved code, code reset, time-limited isolated execution and reference implementations.
- A standalone launch game, access-control and scope exercises, case materials, written mock interviews and a live-AI dialogue adapter.
- Slide narration and staged demonstrations.
- Manual custom-course creation, instructor editing/publishing, roster import, local activity export, administrator records and multilingual course bodies.

## Capability boundaries

- Template output is not equivalent to a live language model or demonstrated topic understanding. SkillForge's explanation template is generic; its interview score uses word/phrase and length rules, not a validated assessment of ability.
- A mock Docker CLI and the C/C++/Python output simulators must be described as simulations.
- Working accounts, a shared classroom database, cross-device synchronization and generative narration were not established in any of the three reviewed versions. These remain shared gaps, not exclusive peer features missing from Forma.
- Some refinements (interest chips, filtering, editor indentation, reset controls) are implementation details within larger features. This inventory separates them so they are not overlooked, without treating every control as a new major feature.

The audit itself made no application changes. The subsequent authorized implementation is documented separately in [Feature upgrade](feature-upgrade.md).
