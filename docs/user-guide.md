# Forma user guide

[Open Forma](https://2026comp5241-group11-project.vercel.app/).

## Sign in

Register a username and password, or use an existing account. Public registration creates a student account. A teacher or administrator uses an account assigned that role by an authorized administrator. The interface supports English, Simplified Chinese, and Traditional Chinese.

## Learners

| Destination | Steps |
| --- | --- |
| Learning profile | Set your development experience, learning goal, and content language. |
| Courses | Choose an engineering, AI-agent, or product-skills course. Play the narrated illustrations, change speed, read the document view, or annotate a step. |
| Study plan | Enter a topic, difficulty, weekly time, and optional requirements. Preview a matched plan or ask AI to plan. Save it, then open its lessons or generate personal courseware. |
| Courses → My custom courses | Create a personal course or adapt an official course. Edit, generate, preview, and study its lessons. Personal courses save to your account. |
| Assigned courses | Open a teacher-assigned course, answer its questions, and mark lessons complete. This activity is available to that teacher. |
| Practice → Knowledge practice | Choose a topic, answer questions, and review feedback. |
| Practice → Coding practice | Try coding challenges or open free coding. JavaScript and HTML run locally; C/C++/Python use browser runtimes by default. Select remote backup explicitly if needed. |
| Practice → Git Simulator | Complete the command lessons and team project. Use the terminal, file editor, graph, hints, and simulated GitHub. The full-screen option opens the same simulator in another tab. |
| Coding game | Complete Code Quest's five chapters. The game supports a bounded teaching subset of Python, C++, and Java, with hints and execution traces. |
| AI mock interview | Select a role, difficulty, language, and interviewer style, give consent, and start. In the room, tap **Enable microphone and start**, then allow microphone access. Camera preview is optional. End the session to view feedback and save/download the transcript. |
| My learning / My records | Check in on My learning; review bookmarks, learning history, achievements, and interview records in My records. |

Realtime interviews currently allow **4 minutes online** and **10 minutes locally**. Moving the interview tab to the background ends the call. Refreshing the room requires starting again from preparation. If saving fails, download the transcript or retry before leaving.

## Instructors

1. Open **My courses** and create a course or adapt one from the official library.
2. Enter a title, language, requirements, and source material. Edit manually, or generate an AI outline and accept it.
3. Generate or write each lesson, then review its slides, examples, and questions. AI output remains a proposal until accepted.
4. Add or reorder slides, adjust questions and answer explanations, and generate narration for ready lessons. Drafts save automatically; wait for the server-save confirmation.
5. Publish the course. Each lesson needs at least one slide. Its classroom is created automatically.
6. In **My classrooms**, select registered students to add. You can rename a class or remove students.
7. In **Class participation**, inspect completion, active time, quiz attempts, and last activity; export CSV if needed.

Official-course adaptation copies teaching text into an editable course. Original bespoke animations and recordings are not copied. The studio edits slides and multiple-choice activities; Git tasks, game levels, and interview rules are configured in code.

## Administrators

Use the administrator workspace to inspect account/course totals, search users, assign roles, ban or unban accounts, manage courses, and review learning summaries. The server verifies administrator access.

## What is saved

Courses, accounts, classroom records, saved interviews, and learning records use cloud storage. Check-ins, learning progress, profiles, plans, bookmarks, annotations, Code Quest, and Git completion merge across signed-in devices. XP and badges follow those records. Existing local data is imported without replacing other devices’ achievements. Visible pages refresh about every 15 seconds and when returning to the tab; the sidebar shows sync status. Offline changes remain locally and retry after reconnecting. Interface language, in-progress Git terminal sessions, and temporary AI-generation tasks stay in the current browser.

AI generation may take several minutes. You can move between app pages while a task runs, but reloading or closing the tab can interrupt it. Generated material and feedback should be reviewed; activity and completion are participation signals, not proof of mastery.

If the phone does not show a microphone prompt, tap the microphone-start button in the room. If access is blocked, allow microphone permission in the browser’s website settings; an in-app browser may require opening the site in Safari or Chrome. Denial or timeout leaves a retry button.
