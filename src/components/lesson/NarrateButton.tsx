"use client";

import { useCallback, useEffect, useState } from "react";
import {
  isNarrationSupported,
  listVoices,
  narrate,
  preferredVoiceId,
  stopNarration,
  type NarrationHandle,
  type NarrationVoice,
} from "@/lib/speech";
import { cn } from "@/lib/utils";

const RATES = [0.8, 1, 1.25, 1.5] as const;

/**
 * AI-narrated content: reads the lesson aloud with the browser's own speech
 * engine (no audio files, no API keys, works offline) and reports which sentence
 * is being spoken so the page can highlight it.
 */
export function NarrateButton({
  script,
  onSentence,
  onEnd,
  label = "Listen",
}: {
  script: string;
  onSentence?: (index: number) => void;
  onEnd?: () => void;
  label?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1);
  const [voices, setVoices] = useState<NarrationVoice[]>([]);
  const [voiceId, setVoiceId] = useState<string | null>(null);
  const [handle, setHandle] = useState<NarrationHandle | null>(null);

  useEffect(() => {
    // Capability detection has to happen after mount: the server cannot know
    // whether the browser exposes the Web Speech API.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time capability probe
    setSupported(isNarrationSupported());
    const load = () => {
      const available = listVoices();
      setVoices(available);
      setVoiceId((current) => current ?? preferredVoiceId(available));
    };
    load();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.addEventListener("voiceschanged", load);
      return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
    }
    return undefined;
  }, []);

  const stop = useCallback(() => {
    handle?.cancel();
    stopNarration();
    setHandle(null);
    setPlaying(false);
  }, [handle]);

  useEffect(() => () => stopNarration(), []);

  const toggle = () => {
    if (playing) {
      stop();
      onEnd?.();
      return;
    }
    const next = narrate(script, {
      rate,
      voiceId,
      onSentence: (index) => onSentence?.(index),
      onEnd: () => {
        setPlaying(false);
        setHandle(null);
        onEnd?.();
      },
    });
    setHandle(next);
    setPlaying(next.total > 0);
  };

  if (!supported) {
    return (
      <p className="text-xs text-slate-500">
        Narration needs a browser with the Web Speech API (Chrome, Edge, Safari).
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={toggle}
        className={cn("btn btn-sm", playing ? "btn-secondary" : "btn-primary")}
        aria-pressed={playing}
      >
        {playing ? "⏹ Stop narration" : `🔊 ${label}`}
      </button>

      <label className="flex items-center gap-1.5 text-xs text-slate-400">
        Speed
        <select
          value={rate}
          onChange={(event) => setRate(Number(event.target.value))}
          className="rounded-lg border border-white/10 bg-ink-900 px-2 py-1 text-xs text-slate-200"
        >
          {RATES.map((value) => (
            <option key={value} value={value}>
              {value}x
            </option>
          ))}
        </select>
      </label>

      {voices.length > 0 && (
        <label className="flex items-center gap-1.5 text-xs text-slate-400">
          Voice
          <select
            value={voiceId ?? ""}
            onChange={(event) => {
              setVoiceId(event.target.value);
              if (playing) stop();
            }}
            className="max-w-[12rem] rounded-lg border border-white/10 bg-ink-900 px-2 py-1 text-xs text-slate-200"
          >
            {voices.slice(0, 24).map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
