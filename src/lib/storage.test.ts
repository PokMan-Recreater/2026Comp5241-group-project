import { afterEach, describe, expect, it, vi } from "vitest";
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

describe("with a browser localStorage", () => {
  function fakeStorage() {
    const map = new Map<string, string>();
    return {
      map,
      getItem: (key: string) => map.get(key) ?? null,
      setItem: (key: string, value: string) => void map.set(key, value),
      removeItem: (key: string) => void map.delete(key),
    };
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("round-trips JSON and plain strings", () => {
    const store = fakeStorage();
    vi.stubGlobal("window", { localStorage: store });

    writeJSON(STORAGE_KEYS.progress, { xp: 40 });
    expect(readJSON(STORAGE_KEYS.progress, { xp: 0 })).toEqual({ xp: 40 });

    writeString(STORAGE_KEYS.locale, "zh-Hant");
    expect(readString(STORAGE_KEYS.locale)).toBe("zh-Hant");

    removeKey(STORAGE_KEYS.locale);
    expect(readString(STORAGE_KEYS.locale)).toBeNull();
  });

  it("falls back when the stored value is not valid JSON", () => {
    const store = fakeStorage();
    store.setItem(STORAGE_KEYS.progress, "{ not json");
    vi.stubGlobal("window", { localStorage: store });

    expect(readJSON(STORAGE_KEYS.progress, { safe: true })).toEqual({ safe: true });
  });

  it("survives a store that throws (private mode / quota)", () => {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: () => {
          throw new Error("blocked");
        },
        setItem: () => {
          throw new Error("quota exceeded");
        },
        removeItem: () => {
          throw new Error("blocked");
        },
      },
    });

    expect(readJSON(STORAGE_KEYS.progress, { safe: true })).toEqual({ safe: true });
    expect(readString(STORAGE_KEYS.locale, "en")).toBe("en");
    expect(() => writeJSON(STORAGE_KEYS.progress, { xp: 1 })).not.toThrow();
    expect(() => writeString(STORAGE_KEYS.locale, "en")).not.toThrow();
    expect(() => removeKey(STORAGE_KEYS.locale)).not.toThrow();
  });
});
