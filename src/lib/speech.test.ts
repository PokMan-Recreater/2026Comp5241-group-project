import { afterEach, describe, expect, it, vi } from "vitest";
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

describe("with the Web Speech API", () => {
  interface FakeUtterance {
    text: string;
    voice: { voiceURI: string } | null;
    rate: number;
    pitch: number;
    onstart: (() => void) | null;
    onend: (() => void) | null;
  }

  let spoken: FakeUtterance[] = [];
  let cancelCount = 0;

  function installSpeech() {
    spoken = [];
    cancelCount = 0;
    const synth = {
      getVoices: () => [
        { voiceURI: "en-natural", name: "Sonia Natural", lang: "en-GB", localService: false },
        { voiceURI: "de", name: "Anna", lang: "de-DE", localService: true },
      ],
      cancel: () => {
        cancelCount += 1;
      },
      speak: (utterance: FakeUtterance) => {
        spoken.push(utterance);
      },
    };

    class Utterance implements FakeUtterance {
      voice: { voiceURI: string } | null = null;
      rate = 1;
      pitch = 1;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      constructor(public text: string) {}
    }

    vi.stubGlobal("window", { speechSynthesis: synth });
    vi.stubGlobal("SpeechSynthesisUtterance", Utterance);
  }

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("reports support and lists the browser's voices", () => {
    installSpeech();
    expect(isNarrationSupported()).toBe(true);
    const voices = listVoices();
    expect(voices).toHaveLength(2);
    expect(voices[0]).toMatchObject({ id: "en-natural", lang: "en-GB", local: false });
  });

  it("speaks one utterance per sentence, at the requested rate, with the chosen voice", () => {
    installSpeech();
    const onSentence = vi.fn();
    const onEnd = vi.fn();

    const handle = narrate("First one. Second one.", { onSentence, onEnd, rate: 1.25 });

    expect(handle.total).toBe(2);
    expect(cancelCount).toBe(1); // stops whatever was already playing
    expect(spoken.map((utterance) => utterance.text)).toEqual(["First one.", "Second one."]);
    expect(spoken.every((utterance) => utterance.rate === 1.25)).toBe(true);
    // The natural English voice is chosen by default.
    expect(spoken[0].voice).toMatchObject({ voiceURI: "en-natural" });

    spoken[0].onstart?.();
    expect(onSentence).toHaveBeenLastCalledWith(0);
    spoken[1].onstart?.();
    expect(onSentence).toHaveBeenLastCalledWith(1);

    // Only the final utterance reports the end of the whole narration.
    expect(onEnd).not.toHaveBeenCalled();
    spoken[1].onend?.();
    expect(onEnd).toHaveBeenCalledTimes(1);

    handle.cancel();
    expect(cancelCount).toBe(2);
  });

  it("stops narration through the module helper", () => {
    installSpeech();
    stopNarration();
    expect(cancelCount).toBe(1);
  });
});
