import type { AICompletionOptions, AIMessage, AIProvider } from "@/lib/ai/types";

/**
 * OpenAI-compatible chat completions provider.
 *
 * Enabled automatically when OPENAI_API_KEY is present. Any OpenAI-compatible
 * gateway works (Azure OpenAI, OpenRouter, a local Ollama proxy, ...) by
 * pointing OPENAI_BASE_URL at it.
 */

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_BASE_URL = "https://api.openai.com/v1";

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
}

export function createOpenAIProvider(apiKey: string): AIProvider {
  const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
  const baseUrl = (process.env.OPENAI_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");

  return {
    id: "openai",
    label: `OpenAI (${model})`,
    remote: true,
    async complete(
      messages: AIMessage[],
      options: AICompletionOptions = {},
    ): Promise<string> {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: options.maxTokens ?? 500,
          temperature: options.temperature ?? 0.4,
        }),
        // Never let a slow model block the UI for long.
        signal: AbortSignal.timeout(20_000),
      });

      if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(
          `OpenAI request failed (${response.status}): ${detail.slice(0, 200)}`,
        );
      }

      const data = (await response.json()) as ChatCompletionResponse;
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) throw new Error("OpenAI returned an empty completion");
      return content;
    },
  };
}
