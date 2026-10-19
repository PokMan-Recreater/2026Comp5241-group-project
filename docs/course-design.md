# Course design notes

The course revision covers teaching content and the activities needed to support it. Authentication, a shared database and cross-student analytics remain future work. The website retains its yellow and pale-lavender design, with English as the default and Simplified Chinese and Traditional Chinese available.

## Courses and outcomes

| Course area | Teaching case | Main outputs |
| --- | --- | --- |
| Software development: from a need to a release | Campus second-hand book service | First-release scope, development workflow, trial and release review. |
| Requirements analysis and user interviews | Activity-room reservations | Follow-up questions, conflict records, acceptance scenarios and requirements handoff. |
| Web systems, data and permissions | Lost-and-found claims | Request flow, data relationships, access rules and failure paths. |
| Working with an AI coding assistant | Deduplicating a registration export | Task brief, runnable function, counterexamples and review notes. |
| Testing, incidents and release decisions | Ticketing incident and launch | Defect report, test table, two launch options and recovery notes. |
| Product scope and team communication | Changes to a lunch-order service | Cost comparison, negotiation response and implementation handoff. |
| Explaining your work in a technical interview | Completed exercises or a personal project | Project introduction, design answers, written mock interview and revision notes. |

The seven courses contain 28 lessons. Every lesson includes structured explanations, advanced analysis, a three-part assignment, reference answers and self-check criteria. Duration estimates include reading and practice; they are not video lengths or completion guarantees.

## Teaching principles

- Start with source material, concrete steps, mistakes or conflicting needs.
- Give cases enough detail to discuss time boundaries, data relationships, duplicate requests, costs and missing evidence.
- Distinguish observations, assumptions, policies and recommendations. Cases, people and figures are fictional teaching material, not reported interviews or operational data.
- Give open assignments a reasonable example answer and criteria for checking it. Avoid claiming that a particular wording is the only valid answer or assigning mastery scores from length or keywords.
- Make explanations readable and key tasks editable, savable and downloadable. A completion click does not replace the expected work.
- Interview practice does not certify job readiness. Learners should label course exercises accurately rather than present them as employment experience.
- English and Simplified Chinese drafts were authored separately. Traditional Chinese was generated with OpenCC and checked for technical terminology and ambiguous conversions. Further review by learners is still needed.

## Activities and their limits

| Activity | Implementation |
| --- | --- |
| Readings and worked examples | Structured reading, original schematic diagrams, cases and reference solutions. |
| Step-by-step demonstrations | Four-stage development and request-flow demonstrations with explanations for each stage. |
| Narration | Device text-to-speech with visible text. It is not generative AI audio. |
| Case interviews | Expandable, authored stakeholder accounts with different concerns, evidence and conflicts. |
| Live AI role-play | Uses the current course and role context. Requires server-side AI configuration. |
| Mock interviews | Four written questions with follow-up prompts and saved work. Live AI interviews require a provider connection. |
| Access-control exercise | Change the simulated requester, action and item status; evaluate fixed rules. This does not add real authentication. |
| Scope exercise | Compare change combinations against a six-point budget and identify unresolved policy decisions. The numbers are not development-time forecasts. |
| Online coding | Two lessons share an explicit function contract, correct reference implementation, faulty `Map` starter and isolated execution with a time limit. |
| Game | A budget-based ticket-launch simulation with comparison of two runs and discussion of model limitations. Its figures are model outputs. |
| Assignments and feedback | 28 three-part assignments, reference answers and self-check lists. Selected lessons include comprehension checks with explanations. |

AI teaching and personalized content are project requirements. Implementing an endpoint does not establish that a live provider has been configured and validated. Generative narration is also pending. Roles and classroom records retain the prototype limitations described in the README.

## Teaching references and technical checks

The organization of cases, examples, exercises and feedback draws on open teaching resources. Course handouts and assignments were not copied. These are original drafts written with AI assistance; they have not been presented as instruction delivered or approved by a human teacher.

- [Full Stack Open: Fundamentals of Web apps](https://fullstackopen.com/en/part0/fundamentals_of_web_apps): connecting explanations and diagrams through concrete request flows.
- [CS50: Problem Set 1](https://cs50.harvard.edu/x/psets/1/): organizing task contracts, examples and independent checks.
- [The Carpentries: Preparing to Teach](https://carpentries.github.io/instructor-training/instructor/18-preparation.html): learning objectives and formative checks.
- [MDN: Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) and [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map): collection behavior, object references and replacement by key. Runtime-specific performance expectations are not universal guarantees.
- [OWASP: Authorization Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html): checking permissions on each request.
- [Pro Git: Contributing to a Project](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project): small, reviewable changes when collaborating.

The mapping to the teacher's overview concerns its first-page requirements: the three topic areas, learners with different backgrounds, interactive activities, personalized teaching and instructor customization. Seven courses and the chosen cases are Forma's design decisions, not prescribed course counts or titles.

## Files and maintenance

- `course-authoring/curriculum.py`: English and Simplified Chinese drafts and Traditional Chinese generation rules.
- `course-authoring/requirements.txt`: dependencies used only when regenerating course content.
- `public/curriculum.js`: generated multilingual content. Running or building the website does not require Python or OpenCC.
- `public/learning-studio.js`: safe reading rendering, assignments, cases, comprehension feedback and rule-based exercises.

Assignments, check results, notes and progress remain in the local prototype. Changing language does not clear drafts. The three original built-in courses retain their course and lesson identifiers. Personally edited courses are not silently overwritten; a locally edited copy takes precedence over updated built-in content.

Existing progress is preserved. Historical completion records are learner confirmations and do not establish mastery of revised material; learners should reread the content and complete the new assignments.

To regenerate content, install `course-authoring/requirements.txt` in a separate authoring environment and run `python course-authoring/curriculum.py`. Normal website use requires only Node.js.
