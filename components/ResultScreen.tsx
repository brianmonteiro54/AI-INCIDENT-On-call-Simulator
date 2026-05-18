"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { X, Share2, ArrowRight, Clock, DollarSign, TrendingUp, Award, ChevronRight, BookOpen } from "lucide-react";
import type { IncidentResult, Incident } from "@/lib/types";
import { INCIDENTS } from "@/lib/incidents";
import { gradeColor, gradeGlow, formatTime, formatMoney } from "@/lib/levels";
import { useGame } from "@/lib/store";
import { ShareCard } from "./ShareCard";
import { playSound } from "@/lib/sound";

interface Props {
  result: IncidentResult;
  incident: Incident;
  onClose: () => void;
}

export function ResultScreen({ result, incident, onClose }: Props) {
  const player = useGame((s) => s.player);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    if (result.grade === "A+" || result.grade === "A") playSound("promotion");
  }, [result.grade]);

  // suggest next: first incident not yet attempted
  const history = useGame((s) => s.history);
  const completed = new Set(history.map((h) => h.id));
  const nextIncident = INCIDENTS.find((i) => !completed.has(i.id) && i.id !== result.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-void-950/85 backdrop-blur-md flex items-start sm:items-center justify-center p-2 sm:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="relative w-full max-w-3xl glass-elev rounded-2xl my-4"
      >
        <button
          onClick={() => { playSound("click"); onClose(); }}
          className="absolute top-3 right-3 p-2 rounded-md hover:bg-white/5 text-gray-400 hover:text-white transition-colors z-10"
          aria-label="close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 sm:p-8">
          {/* GRADE REVEAL */}
          <div className="text-center mb-6">
            <div className="text-mono text-[10px] text-gray-500 uppercase tracking-[0.35em] mb-3">
              incident resolved
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.15 }}
              className={`relative inline-flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 rounded-3xl border-2 ${gradeGlow(result.grade)}`}
              style={{
                background: "radial-gradient(circle at center, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.4) 100%)",
                borderColor: result.grade.startsWith("A") ? "rgba(52, 211, 153, 0.5)" :
                             result.grade.startsWith("B") ? "rgba(34, 211, 238, 0.5)" :
                             result.grade.startsWith("C") ? "rgba(251, 191, 36, 0.5)" :
                             "rgba(255, 51, 85, 0.5)",
              }}
            >
              <span className={`text-display text-7xl sm:text-8xl font-black ${gradeColor(result.grade)}`}>
                {result.grade}
              </span>
              {result.perfect && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="absolute -top-2 -right-2 bg-acid-500 text-black text-mono text-[10px] font-black px-2 py-1 rounded-full"
                >
                  PERFECT
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-5"
            >
              <div className="text-display text-2xl sm:text-3xl font-bold text-white mb-1">{result.verdict}</div>
              <div className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">{result.sub}</div>
            </motion.div>
          </div>

          {/* STATS GRID */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-6"
          >
            <Stat icon={Clock} label="Tempo" value={formatTime(result.elapsed)} sub="elapsed game" />
            <Stat icon={DollarSign} label="Custo" value={formatMoney(result.cost)} sub="cliente perdeu" tone="red" />
            <Stat icon={TrendingUp} label="Salvou" value={formatMoney(result.saved)} sub="vs deixar correr" tone="green" />
            <Stat icon={Award} label="XP ganho" value={`+${result.xp}`} sub="experiência" tone="amber" />
          </motion.div>

          {/* ROOT CAUSE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/[0.02] border border-white/5 rounded-lg p-4 mb-4"
          >
            <h4 className="text-mono text-[10px] text-acid-400 uppercase tracking-widest font-bold mb-2">root cause</h4>
            <p
              className="text-sm text-gray-300 leading-relaxed [&_b]:text-white [&_code]:text-mono [&_code]:text-acid-300 [&_code]:bg-black/40 [&_code]:px-1 [&_code]:rounded"
              dangerouslySetInnerHTML={{ __html: incident.rootCause }}
            />
          </motion.div>

          {/* SERVICES */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4"
          >
            {incident.services.map((s) => (
              <div key={s.name} className="bg-white/[0.02] border border-white/5 rounded-md p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-display font-bold text-white text-sm">{s.name}</div>
                  <div className="text-mono text-[9px] uppercase tracking-widest text-cyber-400">{s.role}</div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{s.description}</p>
              </div>
            ))}
          </motion.div>

          {/* EXAM NOTE */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 mb-6 flex gap-3"
          >
            <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p
              className="text-xs text-amber-100/90 leading-relaxed [&_code]:text-mono [&_code]:text-amber-300 [&_code]:bg-black/40 [&_code]:px-1 [&_code]:rounded"
              dangerouslySetInnerHTML={{ __html: incident.examNote }}
            />
          </motion.div>

          {/* ACTIONS */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap items-center gap-3"
          >
            <Link href="/" onClick={() => playSound("page")} className="btn-ghost flex items-center gap-2">
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>todos incidentes</span>
            </Link>
            <button onClick={() => { playSound("click"); setShowShare(true); }} className="btn-ghost flex items-center gap-2 border-cyber-500/30 hover:border-cyber-400 text-cyber-300">
              <Share2 className="w-4 h-4" />
              <span>compartilhar</span>
            </button>
            <div className="flex-1" />
            {nextIncident && (
              <Link
                href={`/incident/${nextIncident.id}`}
                onClick={() => playSound("page")}
                className="btn-primary flex items-center gap-2"
              >
                <span>próximo incidente</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </motion.div>
        </div>
      </motion.div>

      {showShare && (
        <ShareCard
          result={result}
          incident={incident}
          playerName={player.name}
          onClose={() => setShowShare(false)}
        />
      )}
    </motion.div>
  );
}

interface StatProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub: string;
  tone?: "red" | "green" | "amber";
}
function Stat({ icon: Icon, label, value, sub, tone }: StatProps) {
  const valColor =
    tone === "red" ? "text-blood-400" :
    tone === "green" ? "text-acid-400" :
    tone === "amber" ? "text-amber-400" :
    "text-white";
  return (
    <div className="glass rounded-md p-3 relative">
      <Icon className="absolute top-2.5 right-2.5 w-3 h-3 text-white/10" />
      <div className="text-mono text-[9px] text-gray-500 uppercase tracking-widest">{label}</div>
      <div className={`text-display text-xl font-bold mt-1 ${valColor}`}>{value}</div>
      <div className="text-mono text-[9px] text-gray-600 mt-0.5">{sub}</div>
    </div>
  );
}
