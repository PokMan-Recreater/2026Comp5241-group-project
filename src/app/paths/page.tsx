import type { Metadata } from "next";
import { PathList } from "@/components/path/PathList";

export const metadata: Metadata = {
  title: "My learning paths",
  description:
    "Every personalised path you have generated, with progress, the next lesson and the reasoning behind the sequence.",
};

export default function PathsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <p className="eyebrow">Personalised</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">My learning paths</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-300">
        Each path was scheduled from your goal, your level and the minutes you have each week. Mark
        lessons complete as you go - the next step is always one click away.
      </p>
      <div className="mt-8">
        <PathList />
      </div>
    </div>
  );
}
