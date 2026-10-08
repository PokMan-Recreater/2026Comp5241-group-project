import { afterEach, describe, expect, it, vi } from "vitest";
import {
  completeWithFallback,
  getAIProvider,
  getAIStatus,
  isRemoteAIEnabled,
  mockProvider,
} from "@/lib/ai";
import { createOpenAIProvider } from "@/lib/ai/openai";
import { buildExplainTopicPrompt, buildPathRationalePrompt } from "@/lib/ai/prompts";
import type { AIMessage } from "@/lib/ai/types";

/**
 * The provider abstraction is the contract every AI feature depends on, so it is
 * tested without touching the network: the remote provider is driven through a
 * stubbed `fetch`.
 */

const ENV_KEYS = ["AI_PROVIDER", "OPENAI_API_KEY", "OPENAI_MODEL", "OPENAI_BASE_URL"] as const;
const original: Record<string, string | undefined> = {};
for (const key of ENV_KEYS) original[key] = process.env[key];

function explainMessages(): AIMessage[] {
  return buildExplainTopicPrompt({
    topic: "RAG",
    level: "beginner",
    audience: "non-cs",
    goal: "curiosity",
  }).messages;
}

afterEach(() => {
  for (const key of ENV_KEYS) {
    if (original[key] === undefined) delete process.env[key];
    else process.env[key] = original[key];
  }
  vi.unstubAllGlobals();
});

describe("offline (mock) provider", () => {
  it("identifies itself as offline", () => {
    expect(mockProvider.id).toBe("mock");
    expect(mockProvider.remote).toBe(false);
    expect(mockProvider.label).toBe("Offline engine");
  });

  it("is deterministic for the same input", async () => {
    const messages = explainMessages();
    expect(await mockProvider.complete(messages)).toBe(await mockProvider.complete(messages));
  });

  it("uses the structured payload when writing a rationale", async () => {
    const messages = buildPathRationalePrompt(
      { topic: "git", audience: "cs", level: "beginner", weeklyMinutes: 180, goal: "career" },
      {
        weeks: 4,
        matchedTopics: ["Version control"],
        moduleTitles: ["Git basics"],
        lessonTitles: ["Commits"],
      },
    ).messages;
    const text = await mockProvider.complete(messages);
    expect(text).toContain("4 weeks");
    expect(text).toContain("180 minutes per week");
    expect(text).toContain("Version control");
    expect(text).toContain("45-minute slots"); // the `career` habit
  });

  it("still answers when the prompt carries no task marker", async () => {
    const text = await mockProvider.complete([{ role: "system", content: "nothing here" }]);
    expect(text.length).toBeGreaterThan(0);
  });
});

describe("provider selection", () => {
  it("stays offline by default", () => {
    delete process.env.AI_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    expect(isRemoteAIEnabled()).toBe(false);
    expect(getAIProvider().id).toBe("mock");
    expect(getAIStatus()).toMatchObject({ provider: "mock", remote: false, model: null });
  });

  it("needs both AI_PROVIDER=openai and a key to go remote", () => {
    process.env.AI_PROVIDER = "openai";
    expect(isRemoteAIEnabled()).toBe(false);
    process.env.OPENAI_API_KEY = "test-key";
    expect(isRemoteAIEnabled()).toBe(true);
    expect(getAIStatus()).toMatchObject({ provider: "openai", remote: true, model: "gpt-4o-mini" });
  });

  it("honours AI_PROVIDER=mock even when a key exists", () => {
    process.env.AI_PROVIDER = "mock";
    process.env.OPENAI_API_KEY = "test-key";
    expect(isRemoteAIEnabled()).toBe(false);
    expect(getAIProvider().id).toBe("mock");
  });
});

describe("completeWithFallback", () => {
  it("returns the offline engine's text when nothing remote is configured", async () => {
    delete process.env.AI_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    const result = await completeWithFallback(explainMessages());
    expect(result.provider).toBe("mock");
    expect(result.degraded).toBe(false);
    expect(result.text).toContain("RAG");
  });

  it("degrades to the offline engine when the remote call fails", async () => {
    process.env.AI_PROVIDER = "openai";
    process.env.OPENAI_API_KEY = "invalid";
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("network down");
      }),
    );
    const result = await completeWithFallback(explainMessages());
    expect(result.provider).toBe("mock");
    expect(result.degraded).toBe(true);
    expect(result.text.length).toBeGreaterThan(0);
  });
});

describe("OpenAI provider", () => {
  it("posts to chat completions and returns the trimmed content", async () => {
    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response(
          JSON.stringify({ choices: [{ message: { content: "  hello from the model  " } }] }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = createOpenAIProvider("secret-key");
    expect(provider.id).toBe("openai");
    expect(provider.remote).toBe(true);

    const text = await provider.complete(explainMessages(), { maxTokens: 123 });
    expect(text).toBe("hello from the model");
    expect(fetchMock).toHaveBeenCalledTimes(1);

    expect(fetchMock.mock.calls[0][0]).toBe("https://api.openai.com/v1/chat/completions");
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>).authorization).toBe("Bearer secret-key");
    expect(JSON.parse(String(init.body))).toMatchObject({ model: "gpt-4o-mini", max_tokens: 123 });
  });

  it("respects OPENAI_MODEL and OPENAI_BASE_URL", async () => {
    process.env.OPENAI_MODEL = "my-model";
    process.env.OPENAI_BASE_URL = "http://localhost:11434/v1/";
    const fetchMock = vi.fn(
      async (_url: string, _init?: RequestInit) =>
        new Response(JSON.stringify({ choices: [{ message: { content: "ok" } }] }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const provider = createOpenAIProvider("k");
    expect(provider.label).toBe("OpenAI (my-model)");
    await provider.complete([{ role: "user", content: "hi" }]);
    // The trailing slash in the base URL must not double up.
    expect(fetchMock.mock.calls[0][0]).toBe("http://localhost:11434/v1/chat/completions");
  });

  it("throws on a non-2xx response and on an empty completion", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (_url: string, _init?: RequestInit) => new Response("nope", { status: 401 })),
    );
    const provider = createOpenAIProvider("k");
    await expect(provider.complete([{ role: "user", content: "hi" }])).rejects.toThrow(/401/);

    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (_url: string, _init?: RequestInit) =>
          new Response(JSON.stringify({ choices: [] }), { status: 200 }),
      ),
    );
    await expect(provider.complete([{ role: "user", content: "hi" }])).rejects.toThrow(
      /empty completion/,
    );
  });
});

