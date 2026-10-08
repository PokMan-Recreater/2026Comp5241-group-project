import { mockProvider } from "@/lib/ai/mock";
import { createOpenAIProvider } from "@/lib/ai/openai";
import type { AIProvider } from "@/lib/ai/types";

/**
 * Picks the provider for the current process.
 *
 * `AI_PROVIDER=mock` (the default) always wins so that demos and CI builds are
 * deterministic. Otherwise, if an API key exists we use the real model and fall
 * back to the offline engine if anything goes wrong.
 */

export function isRemoteAIEnabled(): boolean {
  if ((process.env.AI_PROVIDER ?? "mock").toLowerCase() === "mock") return false;
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getAIProvider(): AIProvider {
  const key = process.env.OPENAI_API_KEY;
  if (isRemoteAIEnabled() && key) {
    return createOpenAIProvider(key);
  }
  return mockProvider;
}

export interface AIStatus {
  provider: AIProvider["id"];
  label: string;
  remote: boolean;
  model: string | null;
}

export function getAIStatus(): AIStatus {
  const provider = getAIProvider();
  return {
    provider: provider.id,
    label: provider.label,
    remote: provider.remote,
    model: provider.remote ? process.env.OPENAI_MODEL || "gpt-4o-mini" : null,
  };
}

/**
 * Runs a completion, degrading gracefully: if the remote provider throws we
 * retry with the deterministic engine rather than failing the request.
 */
export async function completeWithFallback(
  messages: Parameters<AIProvider["complete"]>[0],
  options?: Parameters<AIProvider["complete"]>[1],
): Promise<{ text: string; provider: AIProvider["id"]; degraded: boolean }> {
  const provider = getAIProvider();
  if (!provider.remote) {
    return {
      text: await provider.complete(messages, options),
      provider: provider.id,
      degraded: false,
    };
  }
  try {
    return {
      text: await provider.complete(messages, options),
      provider: provider.id,
      degraded: false,
    };
  } catch {
    return {
      text: await mockProvider.complete(messages, options),
      provider: mockProvider.id,
      degraded: true,
    };
  }
}

export { mockProvider };
