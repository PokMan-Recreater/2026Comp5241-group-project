/**
 * English dictionary - the source of truth for every translatable string.
 *
 * `TranslationKey` is derived from this object, so adding a key here instantly
 * becomes a compile error in the other locales until they translate it. That is
 * what keeps the dictionaries in sync, with no runtime tooling.
 */
export const en = {
  // Language switcher
  "a11y.language": "Language",

  // Header
  "nav.courses": "Courses",
  "nav.paths": "My paths",
  "nav.labs": "Labs",
  "nav.interviews": "Interviews",
  "nav.customTopic": "Custom topic",
  "nav.dashboard": "Dashboard",
  "header.startFree": "Start free",
  "header.toggleNav": "Toggle navigation",
  "header.xp": "{xp} XP",
  "header.level": "Lv{level} {title}",
  "header.streak": "{days}d",

  // Level titles (mirror LEVEL_TITLES in src/lib/progress.ts)
  "level.explorer": "Explorer",
  "level.builder": "Builder",
  "level.engineer": "Engineer",
  "level.specialist": "Specialist",
  "level.architect": "Architect",
  "level.mentor": "Mentor",

  // Home
  "home.eyebrow": "Mini-courses · software engineering & AI tools",
  "home.titleLead": "Learn the tools the industry actually uses -",
  "home.titleAccent": "at the pace you actually have.",
  "home.intro":
    "SkillForge builds you a week-by-week learning path, then teaches it with interactive simulations, browser coding challenges, mock interviews and narrated lessons. Built for computer science students and for people coming from completely outside it.",
  "home.cta.path": "Build my learning path",
  "home.cta.browse": "Browse {count} courses",
  "home.cta.lab": "Try a lab first →",
  "home.stat.courses": "curated courses",
  "home.stat.lessons": "lessons",
  "home.stat.hours": "hours of material",
  "home.stat.labs": "interactive labs",
  "home.stat.interviews": "mock interviews",
  "home.stat.challenges": "coding challenges",
  "home.how.title": "How it works",
  "home.step1.title": "Describe yourself",
  "home.step1.body":
    "CS or non-CS, your level, your goal and how many minutes a week you can study.",
  "home.step2.title": "Name your topic",
  "home.step2.body":
    "Pick from the catalogue or type anything: 'Git for designers', 'vector databases', 'AI for marketing'.",
  "home.step3.title": "Get a scheduled path",
  "home.step3.body":
    "Lessons are ordered, grouped into modules and spread across the weeks your budget allows.",
  "home.step4.title": "Learn by doing",
  "home.step4.body":
    "Labs, quizzes, coding challenges and mock interviews, with XP, streaks and badges for momentum.",
  "home.features.title": "Everything you need to actually finish",
  "home.feature.paths.title": "Personalised learning paths",
  "home.feature.paths.body":
    "Tell us your background, goal and weekly study time. The path generator sequences lessons into a week-by-week plan and explains its reasoning.",
  "home.feature.custom.title": "Any topic, even ours",
  "home.feature.custom.body":
    "Type a topic we do not cover and a complete mini-course is generated for it - foundations, vocabulary, hands-on workflow, quality checks and a capstone.",
  "home.feature.sims.title": "Interactive simulations",
  "home.feature.sims.body":
    "Merge a branch and resolve the conflict. Break a CI pipeline and read the log. Fit a model and watch the loss diverge. Practice, not just reading.",
  "home.feature.interviews.title": "Role-play mock interviews",
  "home.feature.interviews.body":
    "Five realistic scenarios scored by a rubric on structure, evidence, vocabulary, ownership and clarity - with coaching you can request when ready.",
  "home.feature.code.title": "Coding challenges in the browser",
  "home.feature.code.body":
    "Real tests, run in a sandboxed iframe. Your code never leaves the page, and an infinite loop cannot hang the app.",
  "home.feature.narration.title": "AI-narrated content",
  "home.feature.narration.body":
    "Every lesson can be read aloud with sentence-level highlighting, so you can revise while commuting or resting your eyes.",
  "home.startWith": "Start with a curated course",
  "home.seeAll": "See all {count} →",
  "home.modules.one": "{count} module",
  "home.modules.other": "{count} modules",
  "home.custom.title": "Nothing here fits your goal? Describe it in one line.",
  "home.custom.body":
    "The custom-topic engine builds a complete mini-course for any subject - including the non-technical ones - then schedules it into your available study time and finishes with interview rehearsal.",
  "home.custom.cta": "Generate a custom topic",
  "home.custom.interview": "Practise a mock interview",

  // Footer
  "footer.tagline":
    "Mini-courses on software engineering and AI tools, with paths that adapt to what you already know.",
  "footer.stats": "{courses} curated courses · {lessons} lessons · {time} of material",
  "footer.learn": "Learn",
  "footer.project": "Project",
  "footer.catalog": "Course catalogue",
  "footer.labs": "Interactive labs",
  "footer.interviews": "Mock interviews",
  "footer.create": "Build a custom topic",
  "footer.onboarding": "Personalise your path",
  "footer.dashboard": "Your progress",
  "footer.credit": "COMP5241 group project · deployable to Vercel",
  "footer.privacy":
    "Progress is stored in your browser. No account, no tracking, no data leaves this device.",
} as const;

export type TranslationKey = keyof typeof en;
