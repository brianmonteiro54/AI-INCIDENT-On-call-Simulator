"use client";

import { motion } from "framer-motion";
import { Lock, CheckCircle2, AlertTriangle, Crown } from "lucide-react";
import Link from "next/link";
import type { Incident, IncidentResult, Grade } from "@/lib/types";
import { sevColor, sevBgSoft, sevLabel, formatTime, gradeColor } from "@/lib/levels";
import { playSound } from "@/lib/sound";

interface Props {
  incident: Incident;
  locked: boolean;
  bestResult?: { grade: Grade; cost: number; elapsed: number };
  daily?: boolean;
}

export function IncidentCard({ incident, locked, bestResult, daily }: Props) {
  const isBoss = incident.isBoss;
  const done = !!bestResult;

  const card = (
    <motion.div
      whileHover={!locked ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onMouseEnter={() => !locked && playSound("hover")}
      className={`relative overflow-hidden rounded-xl border p-5 transition-all cursor-${locked ? "not-allowed" : "pointer"} ${
        locked ? "opacity-40 grayscale" : ""
      } ${isBoss ? "bg-gradient-to-br from-fuchsia-950/40 via-void-800 to-void-900 border-fuchsia-500/30 glow-fuchsia" : "glass border-white/8 hover:border-white/15"}`}
    >
      {/* severity edge */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${
        incident.sev === 0 ? "bg-gradient-to-b from-fuchsia-400 to-fuchsia-600" :
        incident.sev === 1 ? "bg-gradient-to-b from-blood-400 to-blood-600 shadow-[0_0_12px_rgba(255,51,85,0.6)]" :
        incident.sev === 2 ? "bg-gradient-to-b from-amber-300 to-amber-500" :
        "bg-gradient-to-b from-cyber-400 to-cyber-600"
      }`} />

      {/* daily ribbon */}
      {daily && !locked && (
        <div className="absolute -right-8 top-3 rotate-45 bg-acid-500 text-black text-mono text-[9px] font-bold px-10 py-0.5 shadow-lg">
          DAILY
        </div>
      )}

      {/* boss decorations */}
      {isBoss && !locked && (
        <>
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blood-500/10 rounded-full blur-3xl" />
        </>
      )}

      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-mono text-[9px] font-black px-2 py-0.5 rounded ${
            incident.sev === 0 ? "bg-fuchsia-500 text-white" :
            incident.sev === 1 ? "bg-blood-500 text-white" :
            incident.sev === 2 ? "bg-amber-400 text-black" :
            "bg-cyber-500 text-white"
          } tracking-widest`}>
            {sevLabel(incident.sev)}
          </span>
          {isBoss && (
            <span className="flex items-center gap-1 text-mono text-[9px] font-black bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-2 py-0.5 rounded tracking-widest">
              <Crown className="w-3 h-3" /> BOSS
            </span>
          )}
          <div className="flex-1" />
          {locked ? (
            <span className="flex items-center gap-1 text-mono text-[10px] text-gray-600 uppercase tracking-widest">
              <Lock className="w-3 h-3" /> Lvl {incident.minLevel + 1}+
            </span>
          ) : done ? (
            <span className={`flex items-center gap-1 text-mono text-[10px] uppercase tracking-widest ${gradeColor(bestResult!.grade)}`}>
              <CheckCircle2 className="w-3 h-3" /> {bestResult!.grade}
            </span>
          ) : (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="flex items-center gap-1 text-mono text-[10px] text-acid-400 uppercase tracking-widest"
            >
              <AlertTriangle className="w-3 h-3" /> NEW
            </motion.span>
          )}
        </div>

        <h3 className="text-display text-lg font-bold leading-tight text-white mb-1">
          {incident.title}
        </h3>
        <div className="text-mono text-[10px] text-gray-500 mb-3 break-all leading-tight">
          {incident.incId}
        </div>

        <p className="text-sm text-gray-400 leading-relaxed mb-4 line-clamp-3">
          {incident.desc}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-mono text-[10px] text-gray-500 pt-3 border-t border-white/5">
          {done ? (
            <>
              <span>Tempo · <b className="text-white">{formatTime(bestResult!.elapsed)}</b></span>
              <span>Custo · <b className="text-white">${Math.round(bestResult!.cost).toLocaleString()}</b></span>
            </>
          ) : (
            <>
              <span>Cliente · <b className="text-white">{incident.customer}</b></span>
              <span>Rate · <b className="text-blood-400">${incident.ratePerMin}/min</b></span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (locked) return <div>{card}</div>;
  return <Link href={`/incident/${incident.id}`} onClick={() => playSound("page")}>{card}</Link>;
}
