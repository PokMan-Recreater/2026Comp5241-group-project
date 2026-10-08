import type { SimulationId, SimulationMeta } from "@/types";

/**
 * Registry of the interactive simulations ("labs") that ship with the app.
 * The React implementations live in `src/components/simulations` and are wired
 * up by `SimulationHost`; this file is the single source of truth for metadata
 * so lessons and the /labs page stay in sync.
 */
export const SIMULATIONS: SimulationMeta[] = [
  {
    id: "git-branching",
    title: "Branch & Merge Sandbox",
    description:
      "Make commits, create branches and merge them on a live commit graph. Break a merge on purpose, then fix it.",
    skill: "Git branching model",
    minutes: 10,
  },
  {
    id: "prompt-lab",
    title: "Prompt Quality Lab",
    description:
      "Write a prompt for a real task and watch a rubric score it on role, context, format, constraints and examples.",
    skill: "Prompt engineering",
    minutes: 8,
  },
  {
    id: "rag-pipeline",
    title: "RAG Retrieval Pipeline",
    description:
      "Type a question and see which document chunks a retriever would pick, how they are ranked, and what the model finally sees.",
    skill: "Retrieval-augmented generation",
    minutes: 12,
  },
  {
    id: "pipeline-runner",
    title: "Broken CI Pipeline",
    description:
      "Push a commit and watch the stages run. One stage fails: read the logs, choose a fix and re-run until it is green.",
    skill: "CI/CD debugging",
    minutes: 10,
  },
  {
    id: "container-lifecycle",
    title: "Container Lifecycle Simulator",
    description:
      "Run a mock Docker CLI: build an image, start a container, exec into it, stop it and clean up the layers.",
    skill: "Docker fundamentals",
    minutes: 10,
  },
  {
    id: "gradient-descent",
    title: "Gradient Descent Playground",
    description:
      "Fit a line to data by hand: pick a learning rate, step the optimiser and watch the loss curve converge or explode.",
    skill: "How models learn",
    minutes: 12,
  },
];

export const SIMULATION_IDS: SimulationId[] = SIMULATIONS.map(
  (simulation) => simulation.id,
);

export function getSimulation(id: SimulationId): SimulationMeta | undefined {
  return SIMULATIONS.find((simulation) => simulation.id === id);
}
