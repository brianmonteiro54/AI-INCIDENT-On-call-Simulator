"use client";

import { useState, useEffect, useRef } from "react";
import { Volume2, AlertCircle } from "lucide-react";

interface Props {
  text: string;
  lang: "pt-BR" | "en-US";
  label?: string;
  variant?: "wrong" | "correct" | "neutral";
}

/**
 * Pre-loads voices and stores them at module scope so they're ready by the time
 * a button is clicked. Chrome loads voices asynchronously via `voiceschanged`.
 */
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesReady = false;

function loadVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const v = window.speechSynthesis.getVoices();
  if (v.length > 0) {
    cachedVoices = v;
    voicesReady = true;
  }
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  loadVoices();
  // Chrome fires this when voices finish loading
  window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
}

export function SpeakButton({ text, lang, label, variant = "neutral" }: Props) {
  const [playing, setPlaying] = useState(false);
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const playingRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
      return;
    }
    // Make sure voices are loaded for this mount too
    loadVoices();

    return () => {
      // Don't cancel here — would kill audio from other buttons
    };
  }, []);

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setError("não suportado");
      return;
    }

    setError(null);

    // Stop any other audio that might be playing
    try {
      window.speechSynthesis.cancel();
    } catch {}

    // After cancel, give the engine a tick before starting a new utterance
    // (Chrome has a known race condition with cancel + immediate speak)
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.85;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Pick the best matching voice
        const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          const exact = voices.find((v) => v.lang === lang);
          const langBase = lang.split("-")[0].toLowerCase();
          const partial = voices.find((v) => v.lang.toLowerCase().startsWith(langBase));
          // For pt-BR, prefer a Brazilian voice over Portuguese-Portugal
          const ptBR = lang === "pt-BR"
            ? voices.find((v) => v.lang.toLowerCase().includes("pt-br") || v.lang.toLowerCase().includes("pt_br"))
            : undefined;
          // For en-US, prefer US over UK
          const enUS = lang === "en-US"
            ? voices.find((v) => v.lang.toLowerCase().includes("en-us") || v.lang.toLowerCase().includes("en_us"))
            : undefined;

          const voice = ptBR || enUS || exact || partial;
          if (voice) utterance.voice = voice;
        }

        utterance.onstart = () => {
          playingRef.current = true;
          setPlaying(true);
        };
        utterance.onend = () => {
          playingRef.current = false;
          setPlaying(false);
        };
        utterance.onerror = (e) => {
          playingRef.current = false;
          setPlaying(false);
          // "canceled" / "interrupted" are normal when user clicks another button
          const errName = (e as SpeechSynthesisErrorEvent).error;
          if (errName && errName !== "canceled" && errName !== "interrupted") {
            setError(errName);
          }
        };

        // Fallback in case onstart never fires (some browsers)
        setTimeout(() => {
          if (!playingRef.current && window.speechSynthesis.speaking) {
            setPlaying(true);
          }
        }, 200);

        window.speechSynthesis.speak(utterance);

        // Safety: if after 500ms nothing happened, show a hint
        setTimeout(() => {
          if (!window.speechSynthesis.speaking && !playingRef.current) {
            setError("sem som? verifica o volume");
          }
        }, 500);
      } catch (e) {
        setError("erro de áudio");
        console.error("speak error:", e);
      }
    }, 80);
  };

  if (!supported) {
    return (
      <span className="text-[10px] text-duo-ink-faded font-medium italic px-2">
        áudio indisponível
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
    <div className="inline-flex flex-col items-stretch gap-0.5">
      <button
        type="button"
        onClick={speak}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border-2 font-black text-xs transition ${cls}`}
        style={{ borderBottomWidth: 3 }}
      >
        <Volume2 className={`w-3.5 h-3.5 ${playing ? "animate-pulse" : ""}`} strokeWidth={2.5} />
        <span>{label ?? (playing ? "tocando..." : "ouvir")}</span>
      </button>
      {error && (
        <div className="inline-flex items-center gap-1 text-[10px] text-duo-orange-dark font-bold px-1 leading-tight">
          <AlertCircle className="w-3 h-3" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
