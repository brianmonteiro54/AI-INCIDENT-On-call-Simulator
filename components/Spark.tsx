"use client";

import { motion } from "framer-motion";

const PATHS = {
  spike: "M0,50 L40,48 L80,46 L120,44 L160,42 L200,40 L240,38 L260,28 L280,15 L300,8 L340,6 L380,4 L400,2",
  "flat-spike": "M0,50 L60,50 L120,48 L180,47 L240,46 L260,30 L280,12 L320,8 L360,6 L400,4",
  "slow-rise": "M0,45 L40,42 L80,38 L120,35 L160,32 L200,28 L240,24 L280,20 L320,16 L360,12 L400,8",
  exponential: "M0,55 L80,52 L160,48 L220,38 L260,22 L300,12 L340,6 L380,3 L400,2",
  flat: "M0,45 L80,46 L160,45 L240,44 L320,45 L400,45",
  chaotic: "M0,40 L20,38 L40,52 L60,30 L80,55 L100,28 L120,48 L140,18 L160,42 L180,12 L200,38 L220,8 L240,32 L260,5 L280,28 L300,4 L320,22 L340,3 L360,16 L380,2 L400,8",
};

export function Spark({ type }: { type: keyof typeof PATHS }) {
  const p = PATHS[type] || PATHS.spike;
  const closed = p + " L400,60 L0,60 Z";
  const color = type === "chaotic" ? "#d946ef" : "#ff3355";

  return (
    <div className="h-16 border border-white/5 rounded bg-white/[0.02] overflow-hidden relative">
      <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id={`grad-${type}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={closed}
          fill={`url(#grad-${type})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        />
        <motion.path
          d={p}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <line x1="240" y1="0" x2="240" y2="60" stroke="#fbbf24" strokeDasharray="2,2" strokeWidth="1" opacity="0.6" />
        <text x="244" y="12" fill="#fbbf24" fontSize="9" fontFamily="monospace">trigger event</text>
      </svg>
    </div>
  );
}
