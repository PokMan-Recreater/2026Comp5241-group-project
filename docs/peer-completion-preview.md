# Peer integration completion preview

21 October 2026. Local changes only, based on `prototype/forma` commit `7e19746`. No commit, push, main-branch merge or deployment was performed.

## Review scope

This change addresses the confirmed functional gaps in `forma-peer-audit-2026-10-21.md`, including the mixed-topic cases added during the follow-up. It retains Forma's existing visual system and the original course, question and scenario IDs so saved learner work remains usable.

| Audit item | Implemented result | Verification |
| --- | --- | --- |
| Topic aliases | Common AI, cloud, API, teamwork, career and developer-tool terms recommend related catalog courses. Short abbreviations do not match inside unrelated words. | Alias and unknown-topic regression tests. |
| Multi-topic intent | Language study coexists with Git/other requested subjects. Courses are no longer truncated independently of their practice. | Python + Git; HTML + Python + Git; Git + Docker + SQL tests. |
| Plan stages | Plans contain named course/language stages, connected exercises and a final explanation review, with one overall rationale. Weekly budgets still apply. | Stage/weekly-budget tests and browser preview. |
| Original course connections | Existing course-to-practice mappings feed the planner, including game, lessons, mini lessons, labs, challenges and interviews. Duplicate steps are omitted. | Every intermediate SE course's mapped practice route checked. |
| Older saved plans | Existing plans continue rendering. An explicit “Update this plan” action regenerates old-format plans; native lesson IDs and completed work are preserved. | Source review; canonical-ID progress tests. This button was not exercised against a real pre-existing browser plan. |
| Unknown-topic adaptation | Beginner gets four lessons; intermediate/advanced gets six. Background framing, level and audience are recorded. Each step has a distinct process question, worked example and self-review; the final step links to the study-project interview. | Level/background and multilingual template tests. |
| Interview content | Six additional scenarios: frontend hiring, delivery/learning, AI adoption, SQL investigation, ML delivery and study-project explanation. Original five scenarios remain intact. | 11 scenarios / 33 localized prompts and guides checked. SQL interview completed and saved in browser. |
| Interview feedback | Adds sentence length/filler diagnostics, clearer ownership checks and six review dimensions. New reviews have version 3; old records remain readable. | English/Chinese expression tests; browser feedback/history checks. |
| Interactive webpage coding | HTML/CSS and JavaScript can work together in an opaque-origin preview. DOM lesson opens a relevant plain-text-message exercise; a counter example is also included. Click-driven text changes record exercise completion. | Browser button changed count, console output appeared and completion was observed. CSP/origin configuration tests. |
| Prompt rewrite | Appends missing elements while preserving the original draft, source and existing sections. Undo restores the previous draft. | Pure tests across three languages and browser undo check. |
| Retrieval | Adds stop-word filtering and simple English suffix normalization. Empty/no-evidence queries remain empty. | Singular/plural, question-word and empty-query tests. |
| Container simulation | Accepts namespaced image tags and the peer's limited `exec -it NAME sh` transcript, plus bounded simulated commands. | Lifecycle and namespace/exec tests. |
| Gradient dataset | Learners can compare an exact line with 11 noisy observations; both charts use the selected dataset. | Numeric convergence/residual tests; browser showed 11 points and a falling loss. |
| Programming navigation/help | Adds previous-lesson control and reuses device narration/simpler explanation in mini lessons. | Browser DOM lesson controls and explanation dialog checked. |
| Exact revision concepts | Adds dedicated address-of and virtual-dispatch keyword questions. Correct signed-overflow teaching is retained. | 73-question bank and canonical record tests. |
| Lab control appearance | Replaces raw native selectors with compact rounded controls and a consistent arrow. Hides the redundant visible “Task” label while retaining its accessible label. | Browser screenshot and selector interaction. |

## What remains deliberately different

Forma opens connected labs on their own pages instead of copying the peer's embedded lesson blocks. This preserves the capability with a different workflow. Sample corpora, interview names and display metadata need not be literal copies. The peer's broken image-delete path, preset rewards and incorrect signed-overflow teaching were not reproduced.

The new page preview is for learner-authored exercises, not a validated assessment or a general-purpose untrusted-code hosting service. It uses `sandbox="allow-scripts"` without same-origin access and a restrictive CSP; external resources, requests, frames and form submissions are restricted. JavaScript-only challenges retain their existing isolated worker and timeout. DOM-page execution does not claim the worker's execution-time guarantees.

Unknown-topic templates teach a source-led study process, not verified facts about any arbitrary subject. AI reviews remain optional; local writing cues do not establish competence or hiring suitability. Container/CI simulations and C/C++/Python output traces remain explicitly labeled. Authentication, server-side persistence and live-provider verification are unchanged production concerns.

## Validation

- 63 automated tests passed, including 14 new completion/regression tests.
- Build passed; whitespace check passed.
- Browser: mixed-topic plan preview, HTML + JS click/console interaction, mini-lesson explanation/navigation controls, SQL interview through saved history, simplified/traditional Chinese, prompt append/undo and noisy gradient observations.
- Browser test data was created only in a separate local origin (`127.0.0.1:4176`); production learner data was not reset or seeded.
- New source/module files are included by the existing build's public-directory copy.

Preview: `http://127.0.0.1:4176/`. No claim is made that passing these checks proves absence of all possible runtime defects.
