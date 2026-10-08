/**
 * Provider abstraction for every "AI" feature in the app.
 *
 * Two implementations ship today:
 *  - `mock`   : deterministic, offline, zero cost (default)
 *  - `openai` : real LLM calls, enabled by setting OPENAI_API_KEY
 *
 * Everything downstream (API routes, UI) only depends on this interface, so
 * swapping providers - or adding a new one - never touches feature code.
 */

export type AIRole = "system" | "user" | "assistant";

export interface AIMessage {
  role: AIRole;
  content: string;
}

export interface AICompletionOptions {
  maxTokens?: number;
  temperature?: number;
}

export interface AIProvider {
  id: "mock" | "openai";
  label: string;
  /** True when the provider calls a third-party service over the network. */
  remote: boolean;
  complete(messages: AIMessage[], options?: AICompletionOptions): Promise<string>;
}

/** Task identifiers embedded in the system prompt so providers can branch. */
export type AITask =
  | "path-rationale"
  | "interview-coach"
  | "explain-topic"
  | "lesson-outline";

export function taskMarker(task: AITask): string {
  return `TASK:${task}`;
}

export function readTask(messages: AIMessage[]): AITask | null {
  const system = messages.find((message) => message.role === "system")?.content ?? "";
  const match = system.match(/TASK:([a-z-]+)/);
  return (match?.[1] as AITask | undefined) ?? null;
}

/** Extracts the JSON payload that our prompt builders place in the user turn. */
export function readPayload<T>(messages: AIMessage[]): T | null {
  const user = [...messages].reverse().find((message) => message.role === "user");
  if (!user) return null;
  const start = user.content.indexOf("{");
  const end = user.content.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(user.content.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
