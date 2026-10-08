"use client";

import type { SimulationId } from "@/types";
import { ContainerLifecycleSimulator } from "@/components/simulations/ContainerLifecycleSimulator";
import { GitBranchSimulator } from "@/components/simulations/GitBranchSimulator";
import { GradientDescentSimulator } from "@/components/simulations/GradientDescentSimulator";
import { PipelineRunnerSimulator } from "@/components/simulations/PipelineRunnerSimulator";
import { PromptLabSimulator } from "@/components/simulations/PromptLabSimulator";
import { RagPipelineSimulator } from "@/components/simulations/RagPipelineSimulator";

/**
 * Renders the simulation requested by a lesson block. Keeping the mapping in one
 * client component means lesson content stays plain data (no component imports
 * in the content layer) and the /labs page can reuse the same host.
 */
export function SimulationHost({ simulationId }: { simulationId: SimulationId }) {
  switch (simulationId) {
    case "git-branching":
      return <GitBranchSimulator />;
    case "prompt-lab":
      return <PromptLabSimulator />;
    case "rag-pipeline":
      return <RagPipelineSimulator />;
    case "pipeline-runner":
      return <PipelineRunnerSimulator />;
    case "container-lifecycle":
      return <ContainerLifecycleSimulator />;
    case "gradient-descent":
      return <GradientDescentSimulator />;
    default:
      return null;
  }
}
