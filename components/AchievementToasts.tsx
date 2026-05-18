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
      const t = setTimeout(() => clear(), 5500);
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
              transition={{ delay: i * 0.15, type: "spring", stiffness: 220, damping: 18 }}
              className="bg-duo-yellow-light border-2 border-duo-yellow rounded-2xl px-4 py-3 max-w-xs shadow-lg"
              style={{ borderBottomWidth: 4, borderRightWidth: 3 }}
            >
              <div className="text-[10px] uppercase tracking-widest text-duo-yellow-dark font-black mb-1 flex items-center gap-1">
                <span>⭐</span> CONQUISTA DESBLOQUEADA
              </div>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{ach.icon}</span>
                <div>
                  <div className="font-black text-duo-ink text-base leading-tight">
                    {ach.title}
                  </div>
                  <div className="text-xs text-duo-ink-soft font-medium leading-tight mt-0.5">
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
