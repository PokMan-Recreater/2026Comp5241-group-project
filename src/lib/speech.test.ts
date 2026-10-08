import { describe, expect, it, vi } from "vitest";
import {
  isNarrationSupported,
  listVoices,
  narrationScript,
  narrate,
  preferredVoiceId,
  stopNarration,
  type NarrationVoice,
} from "@/lib/speech";

/**
 * The Web Speech API does not exist in Node, which is exactly the case the
 * module has to survive: every entry point is guarded so a server render or a
 * browser without narration cannot crash the app.
 */

const voice = (id: string, label: string, lang: string, local = true): NarrationVoice => ({
  id,
  label,
  lang,
  local,
});

describe("without the Web Speech API", () => {
  it("reports itself unsupported and lists no voices", () => {
    expect(isNarrationSupported()).toBe(false);
    expect(listVoices()).toEqual([]);
  });

  it("returns a harmless handle and still signals the end", () => {
    const onEnd = vi.fn();
    const handle = narrate("One sentence. Two sentences.", { onEnd });

    expect(handle.total).toBe(2);
    expect(onEnd).toHaveBeenCalledTimes(1);
    expect(() => handle.cancel()).not.toThrow();
    expect(() => stopNarration()).not.toThrow();
  });

  it("counts zero sentences for empty text", () => {
    const onEnd = vi.fn();
    expect(narrate("   ", { onEnd }).total).toBe(0);
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});

describe("preferredVoiceId", () => {
  it("returns null when there is nothing to choose from", () => {
    expect(preferredVoiceId([])).toBeNull();
  });

  it("prefers an English voice marked natural, neural or enhanced", () => {
    expect(
      preferredVoiceId([
        voice("de", "Anna (de-DE)", "de-DE"),
        voice("en", "Daniel (en-GB)", "en-GB"),
        voice("en-natural", "Sonia Natural (en-GB)", "en-GB", false),
      ]),
    ).toBe("en-natural");
  });

  it("prefers any English voice over a non-English one", () => {
    expect(
      preferredVoiceId([
        voice("de", "Anna (de-DE)", "de-DE"),
        voice("en", "Daniel (en-GB)", "en-GB"),
      ]),
    ).toBe("en");
  });

  it("falls back to the first voice when no English voice exists", () => {
    expect(
      preferredVoiceId([
        voice("ja", "Kyoko (ja-JP)", "ja-JP"),
        voice("de", "Anna (de-DE)", "de-DE"),
      ]),
    ).toBe("ja");
  });
});

describe("narrationScript", () => {
  it("flattens parts and collapses whitespace", () => {
    expect(narrationScript(["  hello ", ["world", "again"]])).toBe("hello world again");
    expect(narrationScript([])).toBe("");
    expect(narrationScript(["", ["", "only"]])).toBe("only");
  });
});
