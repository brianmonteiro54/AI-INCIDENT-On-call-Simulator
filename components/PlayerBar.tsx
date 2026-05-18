"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Trophy, Zap } from "lucide-react";
import Link from "next/link";
import { useGame } from "@/lib/store";
import { getLevel, getNextLevel } from "@/lib/levels";
import { playSound } from "@/lib/sound";

export function PlayerBar() {
  const player = useGame((s) => s.player);
  const hydrated = useGame((s) => s.hydrated);
  const setName = useGame((s) => s.setName);
  const setSoundOn = useGame((s) => s.setSoundOn);

  if (!hydrated) {
    return (
      <header className="sticky top-0 z-40 glass border-b border-white/5 px-6 py-3">
        <div className="h-9" />
      </header>
    );
  }

  const lvl = getLevel(player.xp);
  const next = getNextLevel(player.xp);
  const inLevel = player.xp - lvl.min;
  const span = next ? next.min - lvl.min : 1;
  const pct = next ? Math.min(100, (inLevel / span) * 100) : 100;

  return (
    <header className="sticky top-0 z-40 glass-strong border-b border-white/5 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center gap-4 sm:gap-6">
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            className="relative w-3 h-3 rounded-full bg-blood-500 glow-red"
            animate={{ scale: [1, 0.7, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="leading-tight">
            <div className="text-display text-sm font-black tracking-wide text-white">AI INCIDENT</div>
            <div className="text-mono text-[9px] text-gray-500 -mt-0.5 group-hover:text-acid-400 transition-colors">
              on-call simulator
            </div>
          </div>
        </Link>

        <div className="flex-1" />

        <div className="hidden md:flex items-center gap-5">
          <div className="text-mono text-[9px] text-gray-500 uppercase tracking-widest leading-tight">
            <div>Engineer</div>
            <input
              type="text"
              defaultValue={player.name}
              maxLength={14}
              onChange={(e) => setName(e.target.value)}
              className="bg-transparent text-display text-sm text-white font-bold outline-none border-b border-dashed border-white/15 focus:border-acid-400 w-24 normal-case tracking-normal mt-0.5"
            />
          </div>

          <div className="text-mono text-[9px] text-gray-500 uppercase tracking-widest leading-tight">
            <div>Level</div>
            <div className="flex items-center gap-1 mt-0.5">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span className="text-display text-sm text-white font-bold normal-case tracking-normal">{lvl.name}</span>
            </div>
          </div>

          <div className="text-mono text-[9px] text-gray-500 uppercase tracking-widest leading-tight">
            <div>Saved</div>
            <div className="text-display text-sm font-bold text-acid-400 normal-case tracking-normal mt-0.5">
              ${player.totalSaved.toLocaleString()}
            </div>
          </div>

          <div className="min-w-[180px]">
            <div className="flex justify-between items-center text-mono text-[9px] uppercase tracking-widest text-gray-500 mb-1">
              <span className="flex items-center gap-1"><Zap className="w-2.5 h-2.5" /> XP</span>
              <span className="text-gray-300 normal-case tracking-normal text-mono">
                {player.xp} {next ? `/ ${next.min}` : "MAX"}
              </span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </div>

        {/* mobile compact */}
        <div className="md:hidden flex items-center gap-3 text-mono text-[10px]">
          <div className="flex items-center gap-1 text-amber-400">
            <Trophy className="w-3 h-3" />
            <span className="text-display normal-case">{lvl.name}</span>
          </div>
          <div className="text-acid-400">
            ${(player.totalSaved / 1000).toFixed(0)}k
          </div>
          <div className="text-gray-300">{player.xp} xp</div>
        </div>

        <button
          aria-label="Toggle sound"
          onClick={() => { playSound("click"); setSoundOn(!player.soundOn); }}
          className="p-2 rounded-md hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
        >
          {player.soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {player.streak >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-3 py-1 rounded-full glass-elev text-[10px] text-mono text-amber-400 flex items-center gap-1 whitespace-nowrap"
          >
            🔥 STREAK <b className="text-white">{player.streak}</b> · A+ consecutivos
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
