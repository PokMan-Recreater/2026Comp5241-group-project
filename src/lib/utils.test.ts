import { describe, expect, it } from "vitest";
import {
  clamp,
  daysBetween,
  formatMinutes,
  percent,
  readingMinutes,
  slugify,
  splitSentences,
  todayKey,
  topicTitle,
  truncate,
  uniq,
} from "@/lib/utils";

describe("cn and ids", () => {
  it("formats minutes for humans", () => {
    expect(formatMinutes(45)).toBe("45m");
    expect(formatMinutes(60)).toBe("1h");
    expect(formatMinutes(95)).toBe("1h 35m");
    expect(formatMinutes(-10)).toBe("0m");
  });
});

describe("slugify", () => {
  it("produces url safe slugs", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
    expect(slugify("  Deploy to Vercel  ")).toBe("deploy-to-vercel");
    expect(slugify("Comp 5241: Group Project")).toBe("comp-5241-group-project");
    expect(slugify("my-slug")).toBe("my-slug");
    expect(slugify("***")).toBe("");
  });
});

describe("topicTitle", () => {
  it("keeps acronyms and lowercases small words", () => {
    expect(topicTitle("vector databases")).toBe("Vector Databases");
    expect(topicTitle("ai for hr teams")).toBe("Ai for Hr Teams");
    expect(topicTitle("")).toBe("Custom Topic");
  });
});

describe("dates", () => {
  it("formats a local date key", () => {
    expect(todayKey(new Date(2026, 9, 8))).toBe("2026-10-08");
  });

  it("counts whole days between keys", () => {
    expect(daysBetween("2026-10-08", "2026-10-09")).toBe(1);
    expect(daysBetween("2026-10-08", "2026-10-08")).toBe(0);
    expect(daysBetween("2026-09-30", "2026-10-02")).toBe(2);
  });
});

describe("sentences", () => {
  it("splits on sentence boundaries", () => {
    expect(splitSentences("One. Two! Three? Four")).toEqual(["One.", "Two!", "Three?", "Four"]);
  });

  it("normalises whitespace", () => {
    expect(splitSentences("  A   sentence.  Another  ")).toEqual(["A sentence.", "Another"]);
  });
});

describe("misc helpers", () => {
  it("clamps, uniques and truncates", () => {
    expect(clamp(5, 1, 3)).toBe(3);
    expect(clamp(-5, 1, 3)).toBe(1);
    expect(uniq([1, 1, 2, 3, 3])).toEqual([1, 2, 3]);
    expect(truncate("abcdefgh", 5)).toBe("abcd…");
    expect(truncate("abc", 5)).toBe("abc");
  });

  it("computes percentages safely", () => {
    expect(percent(1, 4)).toBe(25);
    expect(percent(1, 0)).toBe(0);
    expect(percent(9, 4)).toBe(100);
  });

  it("estimates reading time", () => {
    expect(readingMinutes("")).toBe(1);
    expect(readingMinutes(new Array(400).fill("word").join(" "))).toBe(2);
  });
});
