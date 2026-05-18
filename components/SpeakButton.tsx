"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2 } from "lucide-react";

interface Props {
  text: string;
  lang: "pt-BR" | "en-US";
  label?: string;
  variant?: "wrong" | "correct" | "neutral";
}

export function SpeakButton({ text, lang, label, variant = "neutral" }: Props) {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
    }
    return () => {
      // Stop on unmount
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to pick a voice that matches the language
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const exactMatch = voices.find((v) => v.lang === lang);
      const partialMatch = voices.find((v) => v.lang.toLowerCase().startsWith(lang.split("-")[0].toLowerCase()));
      const voice = exactMatch || partialMatch;
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  if (!supported) {
    return (
      <span className="text-xs text-duo-ink-faded font-medium italic">
        (áudio indisponível no navegador)
      </span>
    );
  }

  const cls =
    variant === "wrong"
      ? "border-duo-red-dark bg-duo-red-light text-duo-red-dark hover:bg-duo-red hover:text-white"
      : variant === "correct"
      ? "border-duo-green-dark bg-duo-green-light text-duo-green-dark hover:bg-duo-green hover:text-white"
      : "border-duo-blue-dark bg-duo-blue-light text-duo-blue-dark hover:bg-duo-blue hover:text-white";

  return (
    <button
      type="button"
      onClick={speak}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 font-black text-xs transition ${cls}`}
      style={{ borderBottomWidth: 3 }}
    >
      <Volume2 className={`w-3.5 h-3.5 ${playing ? "animate-pulse" : ""}`} strokeWidth={2.5} />
      <span>{label ?? (playing ? "tocando..." : "ouvir")}</span>
    </button>
  );
}
