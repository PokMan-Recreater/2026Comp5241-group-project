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
- **Practice:** open the six labs, seven JavaScript challenges, five interview scenarios or existing course activities. Challenge code saves locally; **Run checks** shows actual test results. Interview cues are review aids, not grades.
- **Reference:** search 30 programming topics, filter by language, inspect syntax examples, keep observation notes and send examples to the playground.
- **Playground:** run JavaScript in isolation or preview HTML/CSS. The C/C++ and Python modes only trace supported literal assignments/output and reject unsupported constructs. Use the mode's example menu, reset or clear controls as needed.
- **Lesson toolbar:** save a bookmark, open a lesson-based explanation, or read the complete lesson text. Narration supports speed/voice selection, sentence highlighting and pause/resume. Previously completed lessons can be reopened.
- **My learning:** view active-plan progress and saved lessons. Expand **Learning record and achievements** for quiz results, interviews, rewards, progress download and reset. A reset preserves courses, classrooms, profile and saved plans; **Undo reset** is available until the page reloads.
- **Course studio:** select course-level/audience metadata for catalog filters. **Start from a study template** works without a live model. If live generation fails, the editor labels its fallback template for review.
