import type { Metadata } from "next";
import { InterviewBrowser } from "@/components/interview/InterviewBrowser";
import { ROLE_PLAY_SCENARIOS } from "@/content";

export const metadata: Metadata = {
  title: "Mock interviews & role play",
  description:
    "Practise technical, behavioural and stakeholder interviews. Answers are scored on structure, evidence, vocabulary, ownership and clarity with instant rubric feedback.",
};

export default function InterviewPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <p className="eyebrow">Role play</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {ROLE_PLAY_SCENARIOS.length} mock interviews, scored like the real thing
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-300">
        Answer in your own words. You get a rubric breakdown immediately - structure, concrete
        evidence, domain vocabulary, ownership, length and clarity - plus what a strong answer would
        have covered. When you are ready, ask for AI coaching on the same answer.
      </p>
      <div className="mt-8">
        <InterviewBrowser />
      </div>
    </div>
  );
}
