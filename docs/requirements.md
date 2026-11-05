# Project requirement coverage

Current code review: **5 November 2026**. This maps the application to the functional requirements in the course project overview; it does not replace user acceptance or the team's submission materials.

| Requirement | Implementation and scope |
| --- | --- |
| Software engineering, AI coding agents, soft/product skills | Three themes, nine mini-courses, and 45 registered lessons. |
| Varied interactive learning | Narrated illustrations/slides, Git simulation, coding challenges and playground, knowledge checks, Code Quest, and realtime voice interviews. |
| AI teaching and personalized content | Background/goal-aware AI plans, difficulty and weekly-time selection, and custom course generation from topics and source material. Complete learner-profile context is not explicitly forwarded through every courseware-generation step. |
| Non-CS beginners and CS learners preparing for work | Introductory explanations, engineering practice, AI-agent workflows, and interview practice. Learning effectiveness still needs user evaluation. |
| Instructor course customization | Editable copies of official teaching text, manual slides and questions, AI rewriting, and generated narration. Bespoke original animations/audio are not copied; Git, game, and interview rules are not editable in the studio. |
| AI creation of new mini-courses | Topic, requirements, and source-material inputs; outline and lesson generation; preview, acceptance, editing, save, and publication. |
| Import students and track engagement | Add registered students to course classrooms; record assigned-course entry, active time, completion, and graded attempts; view/export participation. General game/Git activity is not included in teacher analytics. |
| Other subjects and self-directed paths | Arbitrary-topic generation, saved plans, and account-owned personal courses. AI content still requires human review. |
| Integrated final app | Shared learner, teacher, and administrator interface integrating the Forma, SkillForge, and CodeCraft Academy proposals. |
| Public deployment | Vercel deployment with server-side account/AI APIs and an authenticated voice-interview WebSocket endpoint. Online interviews are limited to four minutes; local sessions to ten. |
| Meaningful feature variety | Course production, real account permissions, classroom activity, coding runtimes, Git simulation, game progression, and voice interview/review flows. |
| Team collaboration and contribution | Feature branches, pull requests, and contribution history are evidence; individual contribution claims require team confirmation. |
| User feedback, video, report, slides, manuals, AI Fluency reflection, peer review | The app provides a user guide and technical records. The remaining submission/process evidence must be checked separately from code. |

## Verification

`npm run verify` runs type checking, linting, tests, and build. Tests cover curriculum registration, planning, code execution, teaching/account permissions, course generation, activity recording, and interview handling. Passing these checks does not establish that all provider calls and multi-account UI flows have been tested on the production service.

## Remaining boundaries

- Extend teacher authoring if custom simulations, game levels, or interview activities are required.
- Account-owned check-ins, progress, bookmarks, profiles, plans, notes, and game/Git completion synchronize with conflict-aware merges. Interface preferences, live Git terminal sessions, and temporary generation tasks stay local.
- Instructor analytics covers assigned-course activity rather than every activity in the platform.
- Keep generated teaching content and real-user learning outcomes under human review.

See the [README](../README.md) and [user guide](user-guide.md) for current entry points. Older dated review documents describe earlier prototype versions.
