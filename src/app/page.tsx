import Link from "next/link";
import {
  CODE_CHALLENGES,
  ROLE_PLAY_SCENARIOS,
  SIMULATIONS,
  TOTAL_CURATED_LESSONS,
  TOTAL_CURATED_MINUTES,
  curatedCourses,
} from "@/content";
import { formatMinutes } from "@/lib/utils";

const FEATURES = [
  {
    icon: "🧭",
    title: "Personalised learning paths",
    body: "Tell us your background, goal and weekly study time. The path generator sequences lessons into a week-by-week plan and explains its reasoning.",
  },
  {
    icon: "🧩",
    title: "Any topic, even ours",
    body: "Type a topic we do not cover and a complete mini-course is generated for it - foundations, vocabulary, hands-on workflow, quality checks and a capstone.",
  },
  {
    icon: "🧪",
    title: "Interactive simulations",
    body: "Merge a branch and resolve the conflict. Break a CI pipeline and read the log. Fit a model and watch the loss diverge. Practice, not just reading.",
  },
  {
    icon: "🎤",
    title: "Role-play mock interviews",
    body: "Five realistic scenarios scored by a rubric on structure, evidence, vocabulary, ownership and clarity - with coaching you can request when ready.",
  },
  {
    icon: "💻",
    title: "Coding challenges in the browser",
    body: "Real tests, run in a sandboxed iframe. Your code never leaves the page, and an infinite loop cannot hang the app.",
  },
  {
    icon: "🔊",
    title: "AI-narrated content",
    body: "Every lesson can be read aloud with sentence-level highlighting, so you can revise while commuting or resting your eyes.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Describe yourself",
    body: "CS or non-CS, your level, your goal and how many minutes a week you can study.",
  },
  {
    step: "02",
    title: "Name your topic",
    body: "Pick from the catalogue or type anything: 'Git for designers', 'vector databases', 'AI for marketing'.",
  },
  {
    step: "03",
    title: "Get a scheduled path",
    body: "Lessons are ordered, grouped into modules and spread across the weeks your budget allows.",
  },
  {
    step: "04",
    title: "Learn by doing",
    body: "Labs, quizzes, coding challenges and mock interviews, with XP, streaks and badges for momentum.",
  },
];

export default function HomePage() {
  const stats = [
    { label: "curated courses", value: curatedCourses.length },
    { label: "lessons", value: TOTAL_CURATED_LESSONS },
    { label: "hours of material", value: Math.round(TOTAL_CURATED_MINUTES / 60) },
    { label: "interactive labs", value: SIMULATIONS.length },
    { label: "mock interviews", value: ROLE_PLAY_SCENARIOS.length },
    { label: "coding challenges", value: CODE_CHALLENGES.length },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-14">
      <section className="animate-rise">
        <p className="eyebrow">Mini-courses · software engineering &amp; AI tools</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
          Learn the tools the industry actually uses -{" "}
          <span className="bg-gradient-to-r from-brand-300 to-sky-300 bg-clip-text text-transparent">
            at the pace you actually have.
          </span>
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-7 text-slate-300">
          SkillForge builds you a week-by-week learning path, then teaches it with interactive
          simulations, browser coding challenges, mock interviews and narrated lessons. Built for
          computer science students and for people coming from completely outside it.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/onboarding" className="btn btn-primary">
            Build my learning path
          </Link>
          <Link href="/catalog" className="btn btn-secondary">
            Browse {curatedCourses.length} courses
          </Link>
          <Link href="/labs" className="btn btn-ghost">
            Try a lab first →
          </Link>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label} className="card p-4">
              <dt className="text-xs uppercase tracking-wider text-slate-500">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-16">
        <h2 className="section-title">How it works</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((item) => (
            <div key={item.step} className="card card-pad">
              <span className="font-mono text-xs text-brand-300">{item.step}</span>
              <h3 className="mt-2 text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-slate-400">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="section-title">Everything you need to actually finish</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <article key={feature.title} className="card card-pad card-hover">
              <span className="text-2xl">{feature.icon}</span>
              <h3 className="mt-3 text-base font-semibold text-white">{feature.title}</h3>
              <p className="mt-1.5 text-[13px] leading-6 text-slate-400">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="section-title">Start with a curated course</h2>
          <Link href="/catalog" className="link text-sm">
            See all {curatedCourses.length} →
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {curatedCourses.slice(0, 6).map((course) => (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="card card-pad card-hover block"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${course.accent} text-lg`}
                >
                  {course.icon}
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{course.title}</h3>
                  <p className="text-xs text-slate-500">
                    {course.modules.length} module{course.modules.length === 1 ? "" : "s"} ·{" "}
                    {formatMinutes(course.estimatedMinutes)}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[13px] leading-6 text-slate-400">{course.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 overflow-hidden rounded-3xl border border-brand-400/25 bg-gradient-to-br from-brand-600/25 via-ink-900 to-ink-950 p-8">
        <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Nothing here fits your goal? Describe it in one line.
        </h2>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-300">
          The custom-topic engine builds a complete mini-course for any subject - including the
          non-technical ones - then schedules it into your available study time and finishes with
          interview rehearsal.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/create" className="btn btn-primary">
            Generate a custom topic
          </Link>
          <Link href="/interview" className="btn btn-secondary">
            Practise a mock interview
          </Link>
        </div>
      </section>

    </div>
  );
}
