# Peer integration — local review, 20 October 2026

This change implements the gaps recorded in `forma-peer-recheck-2026-10-20.md` in the course workspace. It builds on the earlier navigation preview. The user reviewed the local preview and approved a Git commit. This submission does not include a push, merge or deployment.

The comparison sources were the group's SkillForge prototype (`main`, inspected source snapshot) and the supplied CodeCraft Academy single-file prototype. Teaching cases and explanations were adapted to Forma's existing learning flow rather than replacing its interface or learner records. These are AI-assisted course drafts, not instructor-reviewed material.

## Where to review

| Area | Local URL | Result |
| --- | --- | --- |
| New subject courses | `http://localhost:4174/#explore/tools` | Nine courses, 36 lessons: everyday AI, Git, SQL, Docker, CI/CD, prompts, LLM applications, ML and Python scripts/data files. |
| Existing course extensions | `#learn/testing-release/4`, `#learn/career/4` | Test-first red/green/refactor and a STAR story bank with spoken/live-coding preparation. |
| Programming foundations | `#explore/programming` | Existing 30 mini lessons remain available, with their own drafts, checks and worked solutions. |
| Coding | `#practice/coding` | Fourteen tasks: seven original tasks plus even sum, reverse words, batching, average repair, FizzBuzz, ASCII slugs and JSON lines. |
| Revision bank | `#practice/checks` | 71 topic-grouped questions. Course and revision checks share canonical IDs and rewards. Context-dependent programming questions include their example code. |
| Syntax | `#reference` | Fifteen searchable cards across five languages, including integer limits, memory, ownership, collections, exceptions, async, layout and accessible forms. |
| Records | `#records/history` | Partly completed courses, estimated completed lesson minutes, individual quiz attempts/latest status and version-comparable interview writing-cue coverage. Historical interview answers can be reopened and revised. |

There are now 16 catalog courses with 66 lessons, plus the 30 programming mini lessons. Software engineering and developer-tool courses occupy separate collection tabs. All built-in courses declare difficulty and audience; filters now distinguish them. English remains the default; new teaching, checks and interface labels include Simplified and Traditional Chinese.

## Subject coverage against SkillForge

| Peer course | Forma coverage |
| --- | --- |
| Everyday AI tools | `ai-toolkit` |
| Git essentials | `git-essentials` + Git history lab |
| Beginner Python | `python-first-steps` + six programming mini lessons |
| Prompt engineering | `prompt-engineering` + three prompt-lab scenarios |
| LLM applications | `llm-apps` + retrieval lab |
| Testing and TDD | Existing `testing-release` + new fifth lesson + average/FizzBuzz tasks |
| Containers | `docker-containers` + Docker lab |
| CI/CD | `cicd-pipelines` + pipeline diagnosis |
| SQL | `data-sql` |
| ML foundations | `ml-foundations` + gradient lab |
| Interview preparation | Existing `career` + fifth lesson + five three-question scenarios |

## Practice changes and repaired defects

- **Git:** a branch-lane commit graph displays first and second parent edges. Ancestry walks both parents. Repeating a resolved merge no longer creates another conflict. Unresolved conflicts block new history operations. Divergence is deliberately treated as conflict in this teaching model; real Git can merge independent changes automatically.
- **Prompts:** executive-summary, release-notes and non-technical explanation presets; six weighted structure cues; specific missing-item advice; scenario scaffolds and a restore-previous-draft action. Empty labels/placeholders cannot complete the lab. The local review does not score model-answer quality.
- **Retrieval:** candidate rankings include source names, matched terms, phrase boost, ranking bars and selection status. Selected chunks assemble into inspectable model context, with an approximate token count. Empty/whitespace/punctuation-only queries return no evidence, including with phrase weighting enabled.
- **CI:** install/lint/test/build/deploy stages expose logs and blocked states. Learners choose repairs. Unchanged reruns, changed expected answers and repairs for the wrong stage cannot advance the pipeline. Correct repairs reach a simulated deployment smoke check.
- **Docker:** named images/containers, detached runs, validated port mappings, conflict checks, ps/ps -a, start/stop/rm/rmi, logs, two bounded exec inspection commands, help and clear. Layer/cache output explains invalidation; image deletion has its own reachable command parser.
- **Gradient:** fixed observations, reference line, fitted line, loss curve, total optimiser steps and learning-rate controls show convergence and divergence. Extreme coordinates are clipped and divergent runs stop.
- **Interviews:** scenario context, question-specific expected content, topic cues, model outlines and follow-ups. Each question has a feedback stage before advancing. Structure, evidence, personal contribution, sequence and length are local writing cues, not hiring or mastery measures. Drafts and complete historical answers remain saved.
- **Plans:** Git, Docker, RAG, SQL, ML, GitHub Actions and other supported subjects use actual catalog lessons. Plans include rationale, connected practice and a final explanation rehearsal within weekly budgets. Practice completion follows actual lab/challenge/interview records. Unknown subjects get a labelled six-part source-led study process with exercises, source/counterexample checks and explanation rehearsal; unrelated profile interests cannot turn an unknown topic into a misleading software course.

## Verification

- 49 automated tests passed, covering teaching completeness/translations, existing workflows and regressions for all three reproduced defects.
- All seven added challenge references ran in the actual browser sandbox: 30 checks passed, zero failed.
- A batching implementation that mutates its input fails the stated contract with a clear diagnostic; an infinite loop is terminated by the execution timeout.
- Browser walkthroughs exercised Git divergence/resolution/repeated merge; blank and valid RAG retrieval; prompt blank labels/scaffolds; wrong and correct CI diagnoses; named Docker image/run/log commands; gradient updates; subject filters; SQL plans; shared revision records; three-question interviews and reopening historical answers; syntax search; English/Simplified/Traditional Chinese pages.
- The static build, JavaScript parsing and whitespace checks pass. Existing profile/course/classroom state is preserved additively. Browser QA uses a separate disposable `127.0.0.1:4174` origin; the user-facing `localhost:4174` preview is kept free of seeded test activity.

## Boundaries retained

Labs remain local teaching simulations. Retrieval is keyword overlap, not embeddings. No provider credentials or live generation were configured or tested. JavaScript uses an isolated, network-disabled, time-limited worker; HTML preview disables scripts and network. C/C++/Python tracing remains deliberately limited; Python file examples require a real local Python environment. Docker Compose and SQL examples are reading/exercise material, not real infrastructure execution. Authentication, shared backend/database, cross-device classroom storage and generative media remain outside this local parity update.
