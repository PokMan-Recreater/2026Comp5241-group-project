/** Small, dependency-free helpers shared across the app. */

/** Joins conditional class names. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

/** Collision-resistant id that works in the browser and in Node. */
export function uid(prefix = "id"): string {
  const random =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${random}`;
}

/** "Machine Learning Foundations" -> "machine-learning-foundations" */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** 95 -> "1h 35m" */
export function formatMinutes(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  if (safe < 60) return `${safe}m`;
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}m`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function uniq<T>(items: readonly T[]): T[] {
  return Array.from(new Set(items));
}

/** Returns a 0-100 percentage, guarding against division by zero. */
export function percent(part: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round(clamp((part / total) * 100, 0, 100));
}

/** Local date key, e.g. "2026-10-08" (not UTC, so streaks match the user's day). */
export function todayKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Whole days between two `YYYY-MM-DD` keys (b - a). */
export function daysBetween(a: string, b: string): number {
  const parse = (key: string) => {
    const [year, month, day] = key.split("-").map(Number);
    return Date.UTC(year, (month ?? 1) - 1, day ?? 1);
  };
  return Math.round((parse(b) - parse(a)) / 86_400_000);
}

/** Estimated reading time in minutes for narrated/lesson copy. */
export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

export function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

/** Sentence splitter used by the narration player to highlight text. */
export function splitSentences(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"'([])/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

export function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .map((word) => (word.length > 3 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

/** Turns a raw topic into a human title, e.g. "vector db" -> "Vector DB". */
export function topicTitle(topic: string): string {
  const cleaned = topic.replace(/\s+/g, " ").trim();
  if (!cleaned) return "Custom Topic";
  const small = new Set(["and", "or", "the", "a", "an", "for", "to", "of", "in", "with", "on"]);
  return cleaned
    .split(" ")
    .map((word, index) => {
      if (/^[A-Z0-9.+#/]+$/.test(word)) return word;
      const lower = word.toLowerCase();
      if (index > 0 && small.has(lower)) return lower;
      return lower[0].toUpperCase() + lower.slice(1);
    })
    .join(" ");
}
