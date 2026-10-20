# Learning workspace preview

Prepared locally on 20 October 2026. The user requested review before any Git commit or upload. These changes have not been committed, pushed, merged or deployed.

## Navigation

- **My learning**: resume learning, the next unfinished lessons in the active weekly plan, one related practice, a programming-course shortcut and a saved-lessons shortcut.
- **Courses**: software-engineering courses and programming foundations. The latter groups 30 mini lessons into C, C++, Python, JavaScript and HTML/CSS. Syntax reference remains available from this collection.
- **Study plan**: existing plan preview, weekly budgets and independent plans. Programming-language topics now schedule the actual mini lessons rather than creating an unknown-subject template.
- **Practice**: separate tabs for interactive labs, coding challenges, interview practice and free coding. Old playground/reference URLs still work.
- **My records**: saved lessons, learning history and achievements. Seven badges show their conditions and earned state; profile settings are available from the top-right avatar.

## Learning flow

Every built-in course lesson has a relevant practice or follow-on teaching link. Completing a lesson opens a next-step page with that link, the next lesson and the learning record. Practices opened from a lesson retain a return link to that source lesson.

The programming mini lessons now contain a concrete question, worked-example explanation, a pitfall, a small task, a three-option knowledge check with feedback, a worked answer, notes, bookmarking, completion/reopening and links to the adjacent lessons. JavaScript and HTML/CSS exercises have an editor directly in the lesson. Lesson editor drafts are stored separately from the general playground draft. C/C++ and Python remain reading/manual-tracing exercises; no full language runtime has been added.

Existing courses, classroom records, notes and saved plans remain in the same additive browser-state format. Completed mini lessons count toward lesson badges and programming-plan progress. Bookmarking or checking a lesson preserves the current scroll position.

## Verification

- The 36-test suite passes, including existing curriculum and AI-endpoint tests, practice-link validity, resuming after course reordering, real programming-plan generation/progress, badge rules, complete teaching/check translations and executable JavaScript worked answers.
- Browser checks verified the five-item navigation, both course collections, practice categories, saved lessons, achievements, course completion and source-practice navigation, Python plan generation and homepage resume, JavaScript lesson execution and HTML previews, reference-answer loading, and Simplified/Traditional Chinese rendering.
- Six main routes were checked for a single main heading and no horizontal page overflow. No page errors were reported during the final browser sweep.
- Build and syntax validation passed. Review uses local previews only; production learner data and the production site are unchanged.
