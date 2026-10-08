import { describe, expect, it } from "vitest";
import {
  STORAGE_KEYS,
  readJSON,
  readString,
  removeKey,
  writeJSON,
  writeString,
} from "@/lib/storage";

/**
 * These helpers are the only thing standing between the app and a
 * `localStorage` that is missing (SSR) or blocked (private mode), so the
 * "no browser" path is the one worth pinning down.
 */

describe("storage keys", () => {
  it("are namespaced and versioned", () => {
    for (const key of Object.values(STORAGE_KEYS)) {
      expect(key, key).toMatch(/^skillforge\.[A-Za-z]+\.v\d+$/);
    }
  });

  it("cover every store the app writes to", () => {
    expect(Object.keys(STORAGE_KEYS).sort()).toEqual([
      "activePath",
      "challengeCode",
      "customCourses",
      "locale",
      "paths",
      "profile",
      "progress",
    ]);
  });
});

describe("without a browser", () => {
  it("reads fall back instead of throwing", () => {
    const fallback = { xp: 0 };
    // The fallback is returned as-is when there is nowhere to read from.
    expect(readJSON(STORAGE_KEYS.progress, fallback)).toBe(fallback);
    expect(readString(STORAGE_KEYS.locale)).toBeNull();
    expect(readString(STORAGE_KEYS.locale, "en")).toBe("en");
  });

  it("writes and removes are silently ignored", () => {
    expect(() => writeJSON(STORAGE_KEYS.progress, { xp: 1 })).not.toThrow();
    expect(() => writeString(STORAGE_KEYS.locale, "zh-Hans")).not.toThrow();
    expect(() => removeKey(STORAGE_KEYS.locale)).not.toThrow();
  });
});
