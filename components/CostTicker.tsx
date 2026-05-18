"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Props {
  cost: number;
  rate: number;
  highIntensity?: boolean;
}

export function CostTicker({ cost, rate, highIntensity }: Props) {
  const [shake, setShake] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 350);
    }, highIntensity ? 4500 : 9000);
    return () => clearInterval(t);
  }, [highIntensity]);

  const displayCost = Math.round(cost);

  return (
    <div className="glass-elev rounded-lg p-5 text-center relative overflow-hidden">
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: highIntensity ? [0.1, 0.3, 0.1] : 0.05 }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{
          background: "radial-gradient(ellipse at center, rgba(255, 51, 85, 0.25), transparent 60%)",
        }}
      />
      <div className="text-mono text-[9px] text-gray-500 uppercase tracking-[0.25em] mb-2 relative z-10">
        custo do incidente
      </div>
      <motion.div
        animate={shake ? { x: [0, -2, 3, -2, 2, 0] } : {}}
        transition={{ duration: 0.35 }}
        className="text-display text-4xl font-black text-blood-500 tracking-tight relative z-10"
        style={{ textShadow: "0 0 24px rgba(255, 51, 85, 0.5)" }}
      >
        ${displayCost.toLocaleString()}
      </motion.div>
      <div className="text-mono text-[10px] text-gray-500 mt-2 relative z-10">
        <span className="text-blood-400">+${rate}/min</span>
      </div>
    </div>
  );
}
