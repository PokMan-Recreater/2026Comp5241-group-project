/**
 * localStorage helpers. Every function is guarded so the module can be imported
 * from server components and unit tests without a browser.
 */

export const STORAGE_KEYS = {
  profile: "skillforge.profile.v1",
  progress: "skillforge.progress.v1",
  paths: "skillforge.paths.v1",
  customCourses: "skillforge.customCourses.v1",
  activePath: "skillforge.activePath.v1",
  challengeCode: "skillforge.challengeCode.v1",
} as const;

function hasStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readJSON<T>(key: string, fallback: T): T {
  if (!hasStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or blocked (private mode): the app still works in-memory.
  }
}

export function readString(key: string, fallback: string | null = null): string | null {
  if (!hasStorage()) return fallback;
  return window.localStorage.getItem(key) ?? fallback;
}

export function writeString(key: string, value: string): void {
  if (!hasStorage()) return;
  window.localStorage.setItem(key, value);
}

export function removeKey(key: string): void {
  if (!hasStorage()) return;
  window.localStorage.removeItem(key);
}
