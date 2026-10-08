import Link from "next/link";
import { TOTAL_CURATED_LESSONS, TOTAL_CURATED_MINUTES, curatedCourses } from "@/content";
import { formatMinutes } from "@/lib/utils";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-ink-950/60">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-sm font-bold text-white">SkillForge</p>
          <p className="mt-2 text-sm text-slate-400">
            Mini-courses on software engineering and AI tools, with paths that adapt to what you
            already know.
          </p>
          <p className="mt-3 text-xs text-slate-500">
            {curatedCourses.length} curated courses · {TOTAL_CURATED_LESSONS} lessons ·{" "}
            {formatMinutes(TOTAL_CURATED_MINUTES)} of material
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Learn</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <Link className="hover:text-white" href="/catalog">
                Course catalogue
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/labs">
                Interactive labs
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/interview">
                Mock interviews
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/create">
                Build a custom topic
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Project</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <Link className="hover:text-white" href="/onboarding">
                Personalise your path
              </Link>
            </li>
            <li>
              <Link className="hover:text-white" href="/dashboard">
                Your progress
              </Link>
            </li>
            <li className="text-slate-500">
              COMP5241 group project · deployable to Vercel
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-4 text-center text-xs text-slate-500">
        Progress is stored in your browser. No account, no tracking, no data leaves this device.
      </div>
    </footer>
  );
}
