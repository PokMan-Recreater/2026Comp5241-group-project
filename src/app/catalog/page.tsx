import type { Metadata } from "next";
import { CatalogBrowser } from "@/components/catalog/CatalogBrowser";
import { TOTAL_CURATED_LESSONS, curatedCourses } from "@/content";

export const metadata: Metadata = {
  title: "Course catalogue",
  description:
    "Browse mini-courses on Git, Python, AI tools, prompt engineering, LLM apps, testing, Docker, CI/CD, SQL, interviews and machine learning - plus any topic you generate yourself.",
};

export default function CatalogPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header>
        <p className="eyebrow">Catalogue</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {curatedCourses.length} mini-courses, {TOTAL_CURATED_LESSONS} lessons
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-300">
          Each course is short by design: two to three lessons, one interactive lab, a quiz per
          lesson and a coding challenge where the topic allows it. Filter by background if you are
          not coming from computer science - nothing here assumes prior programming experience.
        </p>
      </header>

      <div className="mt-8">
        <CatalogBrowser />
      </div>
    </div>
  );
}
