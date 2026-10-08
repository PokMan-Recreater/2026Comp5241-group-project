import type { Metadata } from "next";
import { LabsBrowser } from "@/components/labs/LabsBrowser";
import { SIMULATIONS } from "@/content";

export const metadata: Metadata = {
  title: "Interactive labs",
  description:
    "Practise Git branching, prompt quality, RAG retrieval, CI/CD debugging, the Docker lifecycle and gradient descent - all simulated in the browser.",
};

export default function LabsPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <p className="eyebrow">Labs</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {SIMULATIONS.length} simulations you can break safely
      </h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-7 text-slate-300">
        Every lab is a real model of the thing it teaches - a commit graph, a retriever, an
        optimiser - not a video. Try the wrong thing on purpose: that is what the reset button is
        for.
      </p>
      <div className="mt-8">
        <LabsBrowser />
      </div>
    </div>
  );
}
