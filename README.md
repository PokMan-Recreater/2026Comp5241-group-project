# Forma Learning Lab

An AI-assisted learning platform for software engineering, AI coding agents, and product skills. Built for COMP5241, it supports both learners new to software development and experienced learners preparing for related roles.

**[Open the live app](https://2026comp5241-group11-project.vercel.app/)** · [User guide](docs/user-guide.md) · [Setup](docs/supabase-setup.md)

## Features

| Area | What you can do |
| --- | --- |
| Software engineering courses | Study 45 lessons across 9 mini-courses: engineering foundations, AI coding agents, and product and people skills. Lessons include step-by-step illustrations, Mandarin/English narration, notes, and a document view. |
| Personalized learning | Set your experience, learning goal, and language. Choose a topic, difficulty, and weekly study time; preview a plan or ask AI to propose one. Generate personal courseware for your own subject. |
| Practice | Complete knowledge checks and coding challenges. Run JavaScript and interactive HTML/CSS previews, or use browser-based C/C++/Python runtimes with an optional remote backup. |
| Git Simulator | Open **Practice → Git Simulator** for 31 command lessons and a team project, with a simulated terminal, editor, commit graph, and GitHub workflow. |
| Coding game | Work through Code Quest's five chapters with programming tasks, hints, step traces, XP, and badges. |
| AI mock interview | Choose a role, difficulty, language, and interviewer style. Tap **Enable microphone and start**, have a live voice conversation, then save the transcript and review. Camera preview is optional and stays on your device. |
| Instructor tools | Adapt existing courses or create new ones. Edit slides and questions manually or with AI, generate narration, publish courses, add students, and export participation summaries. |
| Administrator tools | Manage accounts and roles, inspect courses and classrooms, and review learning activity. Access is checked on the server. |
| Learning records | Bookmark courses, review progress and achievements, and keep a daily check-in calendar. The interface supports English, Simplified Chinese, and Traditional Chinese. |

## How to use

### Learners

1. Register or sign in. Public registration creates a student account.
2. Set your background and goal in **Learning profile**.
3. Open **Courses** to learn, or **Study plan** to choose a topic and generate a personal path.
4. Use **Practice**, **AI mock interview**, and the coding game to apply what you learn.
5. Use **My learning** for daily check-ins and **My records** for bookmarks, progress, achievements, and interview history.

### Instructors

1. Sign in with a teacher account and open **My courses**.
2. Create a course or adapt an existing one. Enter your topic, requirements, and source material.
3. Edit manually or generate an AI outline, accept it, then generate and review each lesson. Add narration if needed.
4. Publish the course. Its classroom is created automatically; add registered students from **My classrooms**.
5. Students open the assigned course. View completion, active time, and quiz attempts in **Class participation**, or export CSV.

### Administrators

Sign in with an administrator account to view account roles and learning summaries, manage courses, and disable or re-enable accounts. Public registration creates student accounts.

## Run locally

Requires **Node.js 22.13–22.x** and npm.

```sh
npm ci
cp .env.example .env.local
# Fill in the database and provider settings in .env.local.
npm run dev
```

Open **http://127.0.0.1:4173**. Set `PORT` to use another port.

A working Supabase configuration is required for sign-in. For a new database, apply the SQL files in `supabase/migrations/` in filename order, recording which have already run. See [database setup](docs/supabase-setup.md) for account provisioning and configuration.

| Environment variables | Purpose |
| --- | --- |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` | Accounts, course storage, classroom activity, and interview records. |
| `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` | AI planning, teaching assistance, and course generation. Use a matching provider URL and model. |
| `DOUBAO_REALTIME_API_KEY`, optional `DOUBAO_REALTIME_VOICE` | Realtime voice interviews, generated narration, and voice-based interview review. |
| `CRON_SECRET` | Authorizes the scheduled interview-review recovery job. |
| `GROQ_API_KEY`, `INTERVIEW_API_KEY`, `INTERVIEW_BASE_URL`, `INTERVIEW_MODEL` | Optional transcription and text-interview configuration; see `.env.example`. |

Keep keys in server environment variables. Do not commit `.env.local` or put secrets in `public/`.

## Verify and deploy

```sh
npm run verify
```

This runs type checking, linting, automated tests, and the production build. GitHub Actions runs the same checks for pull requests to `main` and for pushes to `main`.

For Vercel, use **Node 22**, framework preset **Other**, build command **`npm run build`**, and output directory **`dist`**. Add the server environment variables and enable **Fluid compute** for the WebSocket interview endpoint. Routes and function limits are configured in `vercel.json`.

| Interview setting | Local | Current Vercel deployment |
| --- | --- | --- |
| Maximum session length | 10 minutes | 4 minutes, within a 300-second function limit |
| Connection | Local WebSocket relay | HTTPS/WSS with an authenticated account |

`/api/realtime-status` reports availability and duration. See [realtime interview details](docs/doubao-realtime.md).

## Storage and scope

- **Cloud:** accounts, courses, classroom activity, interviews, and account-owned learning records: check-ins, progress, achievements, bookmarks, plans, notes, Code Quest, and Git completion. XP is calculated from synchronized activity records.
- **Synchronization:** signed-in devices merge existing learning records, save changes automatically, and refresh visible records about every 15 seconds or when returning to the tab. Offline changes remain on the device and retry on reconnection. The sidebar shows sync status. Interface language, Git terminal sessions, and temporary AI tasks remain device-local.
- **Course editing:** instructors can edit teaching text, slides, narration scripts, and multiple-choice questions. Adapting an official course copies its teaching text; original bespoke animations and audio are not copied. Git tasks, game levels, and interview rules are not editable in the course studio.
- **AI:** generated content needs review. Courseware generation can take several minutes. Navigating within the app preserves running work; refreshing or closing the tab can interrupt it. Provider usage may incur charges.
- **Execution:** the Git Simulator and Code Quest use bounded teaching models. The coding playground uses separate browser runtimes; choosing remote backup sends code and input to Wandbox.

## Repository

| Path | Contents |
| --- | --- |
| `public/` | Frontend, curriculum, players, simulations, and static media. |
| `api/` | Vercel endpoints for accounts, AI, teaching, interviews, and administration. |
| `scripts/` | Local server, realtime relay, generation services, and build tools. |
| `supabase/migrations/` | Database schema, validation, and access policies. |
| `tests/` | Automated tests. |
| `docs/` | User guide, setup instructions, and development records. |

The final app integrates the team's **Forma**, **SkillForge**, and **CodeCraft Academy** prototypes. Use `main` for the integrated version and feature branches with pull requests for changes. Earlier design records in `docs/` describe their dated prototype stages; this README and the [user guide](docs/user-guide.md) describe the current app.
