"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "@/lib/store";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { playSound } from "@/lib/sound";

export function AchievementToasts() {
  const newAchievements = useGame((s) => s.newAchievements);
  const clear = useGame((s) => s.clearNewAchievements);

  useEffect(() => {
    if (newAchievements.length > 0) {
      playSound("achievement");
      const t = setTimeout(() => clear(), 6500);
      return () => clearTimeout(t);
    }
  }, [newAchievements, clear]);

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {newAchievements.map((id, i) => {
          const ach = ACHIEVEMENTS.find((a) => a.id === id);
          if (!ach) return null;
          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ delay: i * 0.15, type: "spring", stiffness: 200, damping: 20 }}
              className="glass-elev rounded-lg border-l-4 border-acid-400 px-4 py-3 max-w-xs shadow-xl"
            >
              <div className="text-mono text-[9px] text-acid-400 uppercase tracking-widest font-bold mb-0.5">
                Achievement unlocked
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{ach.icon}</span>
                <div>
                  <div className="text-display font-bold text-white text-sm leading-tight">
                    {ach.title}
                  </div>
                  <div className="text-xs text-gray-400 leading-tight mt-0.5">
                    {ach.description}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
