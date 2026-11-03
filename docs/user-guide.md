# Prototype user guide

## Getting started

English is the default language. Use the language selector to choose English, Simplified Chinese or Traditional Chinese; the choice is saved. The role selector previews the learner, instructor and administrator workspaces.

Application records are stored in the current browser. Clearing site data removes them. A real account system is not connected.

## Learner

1. Open **Learning profile** and select your experience, goals and content depth. Course language can follow the interface or be selected separately.
2. Open **Learning path** to view the recommended sequence. Use the up/down controls to reorder it.
3. Select a course in **My learning** or **Explore courses**. Review its description, prerequisites, lessons and expected outcomes before opening a lesson.
4. Read the lesson, move through its demonstration stages, optionally play device narration, and complete the case or exercise. Each assignment has three prompts and saves as you type. Expand reference answers, mark self-check criteria and download the course assignments as needed. Narration uses device text-to-speech.
5. In **Five minutes to launch**, choose actions within the budget, open registration, inspect the outcome and try another strategy.
6. In **Code lab**, edit `uniqueBookings` and select **Run checks**. Execution has a time limit. The testing course starts with a faulty `Map` implementation and offers a reference solution for comparison.
7. Select **Complete & continue** to save completion and move on. Completion records the learner's confirmation; it is not an automatic mastery assessment.
8. Use **Create a learning path** to create a personal course manually or generate a draft when AI is configured. Edit and publish the result.

## Instructor

1. Switch to **Instructor** and open **My courses**.
2. Select **Create course**, enter a topic and source material, and create a course manually or request an AI draft.
3. In **Course studio**, choose the content language and edit the title, description and lessons. Each lesson has an activity-type setting.
4. Select **Save changes**, **Preview** or **Publish course** as needed. Publishing adds the course to the current browser's prototype catalog.
5. In **Classrooms**, create a class, select its course and import a CSV roster with `name,email` columns. Duplicate email addresses are skipped. Invitations are not sent.
6. Open **Engagement** to view learning activity actually recorded in the current browser and export it as CSV. Imported students do not have shared cross-account activity data.

## Administrator

1. Open **Overview** to inspect local prototype records.
2. Use **People & roles** to add user records and change their roles or status. These records do not create real accounts or enforce production permissions.
3. Use **Course management** to publish courses or return them to draft.

## AI features

Courses, preset hints and rule-based activities work without an AI connection. AI controls explain when configuration is needed. A maintainer must set server-side environment variables in Vercel and redeploy to connect a provider.

Instructors should review generated course drafts. Learners should check AI suggestions against the course material and evidence.

## Added learner tools

- **Learning path:** enter a topic, level and weekly time budget, preview the schedule, then save it. Several plans can be kept; use **Make active** to choose the current one. Use **Guided setup** for the three-step profile flow. New subjects use an explicitly labelled study template when no catalog course matches.
- **Practice:** three categories: **Knowledge practice**, **Coding practice** and **AI interview**. Knowledge practice holds the revision questions and, under **Git**, all 23 Git pages (branch and merge, the Git command line with seven production situations, and 21 one-command practices that each get their own page); a Git practice page shows one task at a time with a hint and a task list, and every refused command is explained with the command to use instead. Coding practice holds fourteen JavaScript challenges plus the free-coding playground. The other five labs (prompt, retrieval, CI, containers, gradient descent) and the written interview scenarios open from the course lessons and plans that introduce them. Challenge code saves locally; **Run checks** shows actual test results.
- **Reference:** search 30 programming topics, filter by language, inspect syntax examples, keep observation notes and send examples to the playground.
- **Playground:** C/C++ and Python run in your browser by default. First load downloads the environment; subsequent runs reuse it. Enter complete programs and optional stdin; use Stop to cancel. Remote backup uploads source/input only when explicitly selected. JS and HTML retain their local sandbox/preview. See [execution details](code-execution.md).
- **Lesson toolbar:** save a bookmark, open a lesson-based explanation, or read the complete lesson text. Narration supports speed/voice selection, sentence highlighting and pause/resume. Previously completed lessons can be reopened.
- **My learning:** view active-plan progress and saved lessons. Expand **Learning record and achievements** for quiz results, interviews, rewards, progress download and reset. A reset preserves courses, classrooms, profile and saved plans; **Undo reset** is available until the page reloads.
- **Course studio:** select course-level/audience metadata for catalog filters. **Start from a study template** works without a live model. If live generation fails, the editor labels its fallback template for review.
# Navigation preview

The local review version uses five learner destinations: My learning, Courses, Study plan, Practice and My records. Profile settings are opened through the avatar. Choose Programming foundations within Courses for the 30 mini lessons; use My records for bookmarks and badges. Practice has separate lab, knowledge-check, coding, interview and free-coding tabs. See [the preview record](navigation-preview.md) for the complete flow and validation. This review version has not been deployed.


## Peer integration preview (20 October 2026)

Within **Courses**, select **AI & developer tools** for nine subject courses. Existing testing and career courses each have a new fifth lesson. **Practice → Knowledge checks** provides 71 questions with links back to the lesson and shares its check history. **Courses → Programming foundations → Syntax reference** opens 15 searchable syntax cards. Lab pages now show their intermediate evidence and diagnosis. Review each interview answer before proceeding; saved historical attempts can be reopened under **My records → Learning history**. See [peer integration preview](peer-integration-preview.md) for the complete local review record and boundaries.
