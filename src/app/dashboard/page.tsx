import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/Dashboard";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Your XP, level, streak, badges, bookmarked lessons and mock interview history - all stored locally in your browser.",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <p className="eyebrow">Progress</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">Your dashboard</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-300">
        Everything here is derived from what you have actually completed: lessons, quizzes, coding
        challenges and mock interviews.
      </p>
      <div className="mt-8">
        <Dashboard />
      </div>
    </div>
  );
}
