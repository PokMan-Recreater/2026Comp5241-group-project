# Course revision verification record

The 20 October 2026 expansion has its own [feature checklist and verification record](feature-upgrade.md). The course checks below describe the earlier curriculum revision.

## Automated checks

All 13 Node.js tests and the static build passed again before the prototype was uploaded to the group repository. The checks cover multilingual content completeness, seven-course paths, access rules, scope budgets, option-specific feedback, draft preservation across languages, assignment export and HTML escaping.

Coding reference checks cover keeping the first matching record, order, a new result array, original object references, unchanged input and empty input. A duplicate-identifier case detects the faulty `Map` starter in the testing lesson.

## Browser checks recorded during the course revision

The following records describe the earlier course-revision checks; they were not rerun for the documentation-only English update.

- All 84 lesson/language combinations (7 courses × 4 lessons × 3 languages) displayed explanations, three assignment fields and reference answers, without desktop horizontal overflow.
- Draft text, self-check selections and answer feedback survived a language change to Traditional Chinese and a reload. Feedback updated when an answer was changed.
- The access-control exercise rejected a different student's request to read an application. Automated rules also reject approval of an already returned item.
- The scope exercise displayed a 7/6 overspend when changes costing three and four points were selected, and identified unresolved policies.
- The second demonstration stage displayed the Server stage and its matching explanation.
- The code runner rejected the faulty `Map` solution, accepted the correct `Set` implementation and terminated an infinite loop at the time limit.
- Written interview follow-up prompts could be expanded. Unconfigured live AI displayed a configuration message.
- Downloaded assignments contained the saved learner draft without including reference answers.
- Completing the first lesson opened the next lesson and retained completion. Learning paths and the instructor catalog included all seven courses.
- Syntax checks and the static build passed.

## Scope of verification

These checks establish behavior and content structure, not learning effectiveness. The course material still needs review by real learners. Narration depends on the device; audio playback was not validated during the recorded checks. Live AI was not tested end to end because server-side configuration was unavailable. Authentication and shared classroom data were outside the course-revision scope.

See [course design](course-design.md) for teaching references and content limitations. This record contains no real student submissions, interview data or mastery scores.

## Deployment record

The course revision was deployed to the existing Vercel project, `forma-learning-lab`, at [the Forma live demo](https://forma-learning-lab.vercel.app/).

The recorded production check found course-description entry points for all seven built-in courses and preserved existing personal courses. The requirements-interview lesson displayed three stakeholder accounts and three assignment fields. No browser errors were recorded at the end of that check.

The GitHub branch upload and this documentation update do not constitute a new production deployment.
