# Requirements and remaining work

This checklist maps the prototype to the teacher's project overview and the design decisions made for Forma. The original `project_overivew.pdf` is a course reference and is not included in this branch. Prototype coverage does not imply final acceptance.

| Requirement | Current status |
| --- | --- |
| Software engineering, AI-assisted coding, soft skills and product skills | Seven multilingual courses and 28 lessons are available; see [course design](course-design.md). |
| Learners from non-CS backgrounds and CS graduates preparing for employment | Learning profiles, rule-based recommendations and introductory/advanced material are available. Feedback from real learners is pending. |
| Text and images | Available. Custom image uploads require storage integration. |
| Interactive simulations and games | Launch-decision game, access-control exercise and scope/budget exercise are available. |
| Role-play and mock interviews | Authored stakeholder interviews and written mock interviews are available. Live AI interactions use the current course context and require server-side configuration. |
| AI-narrated animations and slides | Staged diagrams/slides and device narration are available. Generative narration and full animations are pending. |
| Online coding | Two isolated JavaScript coding lessons include behavior checks and reference implementations. |
| AI teaching and personalized content | Question-answering and course-generation endpoints are implemented. Live-provider validation requires credentials. Path matching currently uses rules. |
| Instructor editing of courses and activities, manually and with AI | Manual editing is available. New-course generation uses the AI endpoint when configured. Targeted AI rewriting and activity-parameter editing need further work. |
| Student import and participation tracking | Browser-local rosters and activity records are available. Shared classrooms and cross-account analytics require a database and authentication. |
| Other subjects and self-directed learning | Users can create courses on arbitrary topics manually, or generate drafts when AI is configured. Personal learning paths can be reordered. |
| Learner, instructor and administrator roles and manuals | Three demonstration workspaces and a [user guide](user-guide.md) are available. Real authentication and server-side permissions are pending. |
| English by default; English, Simplified Chinese and Traditional Chinese | Available. Custom courses fall back to a language that has actually been authored. |
| Multiple prototypes, user feedback and iteration | Forma is one member's proposal on `prototype/forma`; SkillForge remains on `main`. The third member's upload, comparisons and user-feedback evidence are team tasks. |
| Member contributions and public project repository | This branch is in the shared group repository. The team should confirm the course's repository-organization instructions and retain evidence of individual contributions. |
| Public deployment | [Forma live demo](https://forma-learning-lab.vercel.app/) is available on Vercel. |
| Progress summaries, video, report, slides, AI Fluency 4D reflection and peer review | These are team deliverables to prepare separately from the application. |

## Next steps

1. Ask learners to try the courses and game, then revise the content and interactions using their feedback.
2. Add authentication and shared storage for users, roles, courses, course versions, classrooms, enrollments, activity events, learning profiles and personal paths. Enforce access rules on the server using account and classroom relationships.
3. Configure the AI service provided for the course and validate its behavior end to end. Keep credentials on the server.
4. Extend instructor activity settings, media uploads, learning analytics and human review.
5. Collect interview notes, test results, contribution records and AI-use evidence for the final submission.
