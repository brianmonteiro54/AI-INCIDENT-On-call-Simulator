"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Rocket, Check, X, Loader2 } from "lucide-react";
import { playSound } from "@/lib/sound";

interface Props {
  actionName: string;
  isGood: boolean; // A/A+ or B
  onComplete: () => void;
}

const GOOD_STAGES = [
  "executando…",
  "propagating to prod…",
  "running smoke tests…",
  "stabilized",
];

const BAD_STAGES = [
  "executando…",
  "propagating to prod…",
  "running smoke tests…",
  "❌ degraded",
];

export function DeploymentOverlay({ actionName, isGood, onComplete }: Props) {
  const [stage, setStage] = useState(0);
  const stages = isGood ? GOOD_STAGES : BAD_STAGES;

  useEffect(() => {
    playSound("tick");
    const t1 = setTimeout(() => { setStage(1); playSound("tick"); }, 380);
    const t2 = setTimeout(() => { setStage(2); playSound("tick"); }, 760);
    const t3 = setTimeout(() => {
      setStage(3);
      playSound(isGood ? "success" : "fail");
    }, 1140);
    const t4 = setTimeout(() => onComplete(), 1700);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [isGood, onComplete]);

  const isLast = stage === stages.length - 1;
  const accent = isGood ? "acid" : "blood";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 pointer-events-none"
    >
      <motion.div
        initial={{ scale: 0.9, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        className={`glass-elev rounded-xl p-6 sm:p-7 max-w-md w-full ${
          isLast
            ? isGood
              ? "border-acid-500/50 glow-green"
              : "border-blood-500/50 glow-red"
            : "border-cyber-500/30 glow-cyan"
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isLast
                ? isGood
                  ? "bg-acid-500/20"
                  : "bg-blood-500/20"
                : "bg-cyber-500/20"
            }`}
            animate={isLast ? { scale: [1, 1.2, 1] } : { rotate: 360 }}
            transition={isLast ? { duration: 0.4 } : { duration: 1.5, repeat: Infinity, ease: "linear" }}
          >
            {isLast ? (
              isGood ? <Check className={`w-5 h-5 text-acid-400`} /> : <X className={`w-5 h-5 text-blood-400`} />
            ) : (
              <Loader2 className="w-5 h-5 text-cyber-400" />
            )}
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="text-mono text-[10px] uppercase tracking-widest text-gray-500">
              {isLast ? (isGood ? "deployment succeeded" : "deployment degraded") : "deploying…"}
            </div>
            <div className="text-display font-bold text-white text-base truncate">{actionName}</div>
          </div>
        </div>

        <div className="space-y-1.5 text-mono text-xs">
          {stages.map((s, i) => {
            if (i > stage) return null;
            const isCurrent = i === stage && !isLast;
            const isDone = i < stage || (i === stage && isLast);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-center gap-2 ${
                  isDone ? (isGood || i < stages.length - 1 ? "text-acid-400" : "text-blood-400") : "text-cyber-300"
                }`}
              >
                <span className="w-3 inline-block">
                  {isDone ? "✓" : isCurrent ? (
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    >·</motion.span>
                  ) : "·"}
                </span>
                <span>{s}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}
