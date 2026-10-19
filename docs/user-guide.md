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
