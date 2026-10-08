import { splitSentences } from "@/lib/utils";

/**
 * Thin wrapper around the browser Web Speech API (SpeechSynthesis) used for
 * AI-narrated lesson content. No audio files and no third-party services, so it
 * works offline and costs nothing. Everything is guarded so the module can be
 * imported from a server component without crashing.
 */

export interface NarrationVoice {
  id: string;
  label: string;
  lang: string;
  local: boolean;
}

export function isNarrationSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function listVoices(): NarrationVoice[] {
  if (!isNarrationSupported()) return [];
  return window.speechSynthesis.getVoices().map((voice) => ({
    id: voice.voiceURI,
    label: `${voice.name} (${voice.lang})`,
    lang: voice.lang,
    local: voice.localService,
  }));
}

export function preferredVoiceId(voices: NarrationVoice[]): string | null {
  if (voices.length === 0) return null;
  const english = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const pool = english.length > 0 ? english : voices;
  const natural = pool.find((voice) => /natural|neural|premium|enhanced/i.test(voice.label));
  return (natural ?? pool[0]).id;
}

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  voiceId?: string | null;
  /** Called with the index of the sentence currently being spoken. */
  onSentence?: (index: number) => void;
  onEnd?: () => void;
}

export interface NarrationHandle {
  cancel: () => void;
  /** Sentence count, so the caller can render progress. */
  total: number;
}

/**
 * Speaks `text` sentence by sentence so the UI can highlight what is being read.
 * Returns a handle so callers can stop playback.
 */
export function narrate(text: string, options: SpeakOptions = {}): NarrationHandle {
  const sentences = splitSentences(text);
  if (!isNarrationSupported() || sentences.length === 0) {
    options.onEnd?.();
    return { cancel: () => {}, total: sentences.length };
  }

  const synth = window.speechSynthesis;
  synth.cancel();

  const voiceId = options.voiceId ?? preferredVoiceId(listVoices());
  const voice = voiceId
    ? synth.getVoices().find((candidate) => candidate.voiceURI === voiceId)
    : undefined;

  sentences.forEach((sentence, index) => {
    const utterance = new SpeechSynthesisUtterance(sentence);
    if (voice) utterance.voice = voice;
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.onstart = () => options.onSentence?.(index);
    if (index === sentences.length - 1) {
      utterance.onend = () => options.onEnd?.();
    }
    synth.speak(utterance);
  });

  return { cancel: () => synth.cancel(), total: sentences.length };
}

export function stopNarration(): void {
  if (isNarrationSupported()) window.speechSynthesis.cancel();
}

/** Plain-text flattening of lesson blocks, used as the narration script. */
export function narrationScript(parts: Array<string | string[]>): string {
  return parts
    .flat()
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}
