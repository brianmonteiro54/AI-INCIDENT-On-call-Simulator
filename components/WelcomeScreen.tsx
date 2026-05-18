"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mascot } from "./Mascot";
import { playSound, startAmbient } from "@/lib/sound";

interface Props {
  /** Called when user submits a name (or skips → "anon"). */
  onSubmit?: (name: string) => void;
  /** If true, shows the welcome regardless of internal state (used as loading screen). */
  forceShow?: boolean;
}

export function WelcomeScreen({ onSubmit, forceShow }: Props) {
  const [step, setStep] = useState<"hi" | "name">("hi");
  const [nameInput, setNameInput] = useState("");

  useEffect(() => {
    // Auto-advance from "hi" to "name" after a beat
    if (!forceShow) {
      const t = setTimeout(() => setStep("name"), 1400);
      return () => clearTimeout(t);
    }
  }, [forceShow]);

  const handleSubmit = () => {
    const trimmed = nameInput.trim();
    if (trimmed.length < 1) return;
    playSound("success");
    try { startAmbient(); } catch {}
    onSubmit?.(trimmed);
  };

  const handleSkip = () => {
    playSound("click");
    try { startAmbient(); } catch {}
    onSubmit?.("anon");
  };

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] bg-duo-cream flex items-center justify-center px-4 overflow-hidden"
    >
      {/* decorative blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-duo-green-light blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-duo-blue-light blur-3xl opacity-50 pointer-events-none" />

      <div className="relative max-w-md w-full text-center">
        <motion.div
          initial={{ scale: 0.5, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          className="mb-4 flex justify-center"
        >
          <Mascot expression={step === "name" ? "happy" : "celebrate"} size={160} />
        </motion.div>

        <AnimatePresence mode="wait">
          {(step === "hi" || forceShow) ? (
            <motion.div
              key="hi"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-display text-4xl sm:text-5xl font-black text-duo-ink mb-2">
                AI Incident
              </h1>
              <p className="text-duo-ink-soft font-bold text-base sm:text-lg leading-snug mb-5">
                treina pra AWS AI Practitioner 🚀
              </p>
              <p className="text-duo-ink-faded text-sm sm:text-base leading-snug font-medium max-w-xs mx-auto">
                Você é o engenheiro on-call. Recebe um incident de IA, investiga, decide.
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-6 flex items-center justify-center gap-1.5 text-duo-ink-faded text-xs font-bold"
              >
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}>●</motion.span>
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>●</motion.span>
                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}>●</motion.span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h1 className="text-display text-3xl sm:text-4xl font-black text-duo-ink mb-2 leading-tight">
                Oi! Como te chamamos?
              </h1>
              <p className="text-duo-ink-soft font-bold text-sm sm:text-base mb-5 leading-snug">
                teu nome aparece no ranking — escolhe um bom
              </p>

              {/* Quick "how it works" preview */}
              <div className="grid grid-cols-3 gap-2 mb-6 text-left">
                <div className="duo-card p-2.5">
                  <div className="text-xl mb-0.5">📟</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-duo-ink leading-tight">recebe<br/>incident</div>
                </div>
                <div className="duo-card p-2.5">
                  <div className="text-xl mb-0.5">🔍</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-duo-ink leading-tight">investiga<br/>pistas</div>
                </div>
                <div className="duo-card p-2.5">
                  <div className="text-xl mb-0.5">⚡</div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-duo-ink leading-tight">decide<br/>e ganha XP</div>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-3"
              >
                <input
                  autoFocus
                  type="text"
                  value={nameInput}
                  maxLength={14}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="seu @"
                  className="duo-card w-full text-center font-black text-xl sm:text-2xl text-duo-ink px-4 py-4 outline-none focus:duo-card-selected placeholder:text-duo-ink-faded placeholder:font-bold"
                  style={{ borderBottomWidth: 4 }}
                />

                <button
                  type="submit"
                  disabled={nameInput.trim().length < 1}
                  className={`duo-btn w-full ${nameInput.trim().length > 0 ? "duo-green" : "duo-white"}`}
                >
                  bora começar
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="text-duo-ink-faded text-sm font-bold hover:text-duo-ink transition"
                >
                  pular (vai entrar como "anon")
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
