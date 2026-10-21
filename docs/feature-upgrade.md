# Forma feature upgrade

Implemented and verified on 20 October 2026, following authorization to add the missing features identified in the [three-prototype comparison](feature-comparison-audit.md). This record describes Forma on `prototype/forma`; it does not change SkillForge on `main` or claim completion of every final-project requirement.

## Comparison checklist

| Baseline difference | Implemented in Forma | Entry point |
| --- | --- | --- |
| Weekly scheduling and remaining time | Time-budgeted weeks, session splits for longer lessons, completion-based remaining weeks and lesson time estimates | Study plan |
| Guided setup, interests and three skill levels | Three-step setup; profile interest tags, weekly minutes and beginner/intermediate/advanced settings | Build a plan; Profile |
| Multiple independent paths | Save, view, activate and delete separate plans, with each plan's next unfinished lesson | Study plan |
| Generation without provider credentials | Match published lessons; create explicitly labelled, source-led study templates for unknown topics | Study plan; instructor Create course |
| Generation preview and regeneration | Inspect lesson placement and estimated time before saving; regenerate from the form | Study plan |
| Plain-language explanation and fallback | Lesson-grounded local study guide; optional live explanation when AI is configured | Lesson toolbar |
| Full-text narration | Sentence highlighting, voice/speed selection, pause/resume and stop, using device speech synthesis | Lesson toolbar |
| Level/audience catalog filters | Combine course and lesson search with topic, level and audience selection; instructor metadata fields | Explore; course editor |
| Independent lab entry | Dedicated practice center, retaining existing launch, scope and access exercises | Practice |
| Six additional simulation models | Git branches/merge conflicts, prompt checklist, token-overlap retrieval, CI fixes, mock container lifecycle and gradient descent | Practice → Interactive labs |
| Seven distinct coding challenges | Seven contracts and reference solutions; actual JavaScript behavior checks | Practice → Coding challenges |
| Detailed coding feedback and keyboard support | Exceptions, expected/received values, failing cases, saved code, reset and Tab indentation | Challenge editors; Playground; existing lesson editors |
| Structured interviews | Five scenarios with three questions each, saved drafts, live per-question review cues, full review, revision, attempt history and optional AI coaching | Practice → Interview practice |
| Best quiz results | Preserve the best correct/incorrect result for each existing single-question lesson check | My learning → Learning record |
| Learner dashboard | Active-plan progress and next lesson, completed lesson time estimates, passed challenges, recent interview reviews and learning activity | My learning |
| Bookmarks | Save/unsave a lesson; persistent dashboard links | Lesson toolbar; My learning |
| Activity rewards | XP, levels, daily streaks and seven badges derived from unique completed activities | My learning → Learning record |
| Undo completion | Reopen a completed lesson or reference topic | Lessons; plan details; reference topics |
| Progress reset | Confirmation, downloadable record and same-session undo; retain profile, courses, classrooms and plans | My learning → Learning record |
| Thirty programming tutorials | Thirty translated reference topics with explanations, examples, exercises, notes and completion controls | Reference |
| Lesson-level search and language filtering | Search lesson titles/summaries in the catalog; filter reference topics by language | Explore; Reference |
| Five syntax-reference cards | C, C++, Python, JavaScript and HTML/CSS examples | Reference |
| General playground | Real JavaScript execution, sandboxed HTML/CSS preview, language presets, example transfer, saved drafts, reset and clear output | Playground; reference examples |

The additional library contains 30 reference topics. These are separate from the seven existing software-engineering courses and their 28 lessons, and are not described as 30 full courses.

## Persistence and execution

- Existing `forma.workspace.v1` browser data is migrated additively. Existing custom courses, classroom rosters, notes, assignments and language preferences remain in place.
- Repeated state access preserves object identity. A regression test covers bookmark removal, reference completion and plan deletion; browser reload verified bookmark persistence.
- New JavaScript checks run in an isolated, network-disabled worker with a time limit. Test comparison ignores object-key order while preserving array order and value types. The existing coding lessons remain available.
- The C/C++ and Python modes trace only the stated literal assignments and output patterns. Unsupported statements report a limitation instead of producing invented execution results.
- New interface labels, reference teaching, interview questions and challenge descriptions support English, Simplified Chinese and Traditional Chinese. Programming examples and language keywords retain their original syntax.

## Verification

The complete Node test suite passed: **30 tests, zero failures**. Coverage includes additive migration, stable state identity, weekly budgets, plan matching/progress, rewards/streaks, six simulation models, bilingual interview heuristics, seven challenge contracts, all reference translations, limited output tracing, AI endpoint validation, existing curriculum checks, roster CSV handling, draft persistence and markup escaping.

Browser checks used a disposable profile on a separate localhost origin. Production learner records were not reset or populated with test activity. Verified workflows included:

- Preview/save a catalog-matched plan, generate a clearly labelled unknown-subject template, save a second plan, delete it and complete guided setup.
- Bookmark/unbookmark persistence across reload; saved lesson notes across language changes; completion and reopening; English, Simplified Chinese and Traditional Chinese lesson controls.
- Full-lesson narration, active-sentence highlighting, pause/resume and stop; local explanation fallback.
- All seven challenge reference solutions through the actual isolated browser runner: 17 behavior cases passed; an infinite loop timed out without blocking the page.
- Actual JavaScript output, sandboxed HTML preview, reference keyword search, lesson-level catalog search and all six interactive lab workflows.
- Interview drafts, question progression, review, revision and saved attempt records.
- Instructor template creation/publication, level metadata and a two-member roster import with case-insensitive duplicate rejection.
- Confirmed progress reset and undo: cleared progress/rewards, then restored the previous challenge and activity records.

The final build, JavaScript syntax checks and whitespace validation also passed. This record does not reuse the older course-verification document's browser counts as checks performed for this upgrade.

## Capability boundaries and remaining work

These features provide the interaction types identified in the comparison, with explicit implementation boundaries:

- Unknown-topic templates teach a study process; they require reliable subject sources and instructor review before use as subject teaching.
- Prompt/interview review uses fallible phrase-based rules. Its coverage percentage is not a grade, employment assessment or proof of mastery. Retrieval uses token overlap, not embeddings or a language model.
- Git, CI and Docker activities are local teaching models, not real repositories, deployment pipelines or container engines. Gradient descent is a working numeric model for a small stated fitting problem.
- Narration uses device speech synthesis. Voice availability depends on the browser/device; this is not generated AI audio.
- A live AI provider still needs credentials and end-to-end validation. Real accounts, server-side permissions, shared classroom storage, cross-device sync, generative media and instructor editing of test contracts remain outside this peer-feature upgrade. See [remaining work](future-work.md).
