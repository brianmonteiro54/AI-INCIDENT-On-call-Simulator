"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSound, startAmbient } from "@/lib/sound";

const LINES = [
  "[ 0.001 ] BOOT · loading on-call simulator",
  "[ 0.214 ] auth · engineer credentials verified",
  "[ 0.487 ] dashboards · connecting to cloudwatch",
  "[ 0.732 ] pagerduty · subscribed to severity-1+",
  "[ 1.014 ] system · ready for chaos",
];

export function BootSequence() {
  const [show, setShow] = useState(false);
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    const seen = typeof window !== "undefined" && sessionStorage.getItem("ai-incident-booted");
    if (!seen) {
      setShow(true);
      try { sessionStorage.setItem("ai-incident-booted", "1"); } catch {}
    } else {
      startAmbient();
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    playSound("boot");
    const interval = setInterval(() => {
      setLineIdx((i) => {
        if (i < LINES.length - 1) {
          playSound("tick");
          return i + 1;
        }
        return i;
      });
    }, 220);

    const close = setTimeout(() => {
      clearInterval(interval);
      setShow(false);
      startAmbient();
    }, 1700);

    return () => {
      clearInterval(interval);
      clearTimeout(close);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className="fixed inset-0 z-[100] bg-void-950 flex flex-col items-center justify-center px-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-display text-5xl sm:text-7xl font-black text-white tracking-tight mb-3"
          >
            AI <span className="text-blood-500">INCIDENT</span>
          </motion.div>
          <div className="text-mono text-xs text-gray-500 uppercase tracking-[0.4em] mb-12">
            on-call simulator · v2.0
          </div>

          <div className="text-mono text-xs sm:text-sm text-acid-400 space-y-1 max-w-md w-full">
            {LINES.slice(0, lineIdx + 1).map((l, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex"
              >
                <span className="opacity-50 mr-1">{">"}</span>
                <span>{l}</span>
              </motion.div>
            ))}
          </div>

          {/* scan line */}
          <motion.div
            className="absolute left-0 right-0 h-px bg-acid-400/30"
            animate={{ y: ["0vh", "100vh"] }}
            transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
