"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, BookOpen, Home, Clock, Zap } from "lucide-react";
import type { IncidentResult, Incident, Grade } from "@/lib/types";
import { INCIDENTS } from "@/lib/incidents";
import { formatTime, getLevelIdx } from "@/lib/levels";
import { useGame } from "@/lib/store";
import { Mascot } from "./Mascot";
import { playSound } from "@/lib/sound";

interface Props {
  result: IncidentResult;
  incident: Incident;
  onClose: () => void;
}

function gradeRank(g: Grade): number {
  const order: Grade[] = ["F", "D", "C-", "C", "B-", "B", "A-", "A", "A+"];
  return order.indexOf(g);
}

export function ResultScreen({ result, incident, onClose }: Props) {
  const history = useGame((s) => s.history);
  const player = useGame((s) => s.player);

  const tier = gradeRank(result.grade); // 0-8

  // Calibrated feedback per tier
  const isGreat = tier >= 7;       // A, A+
  const isGood = tier === 6;        // A-
  const isOk = tier === 4 || tier === 5;   // B-, B
  const isMid = tier === 2 || tier === 3;  // C-, C
  const isBad = tier <= 1;          // D, F

  useEffect(() => {
    if (isGreat || isGood) playSound("promotion");
  }, [isGreat, isGood]);

  const completed = new Set(history.map((h) => h.id));
  const lvlIdx = getLevelIdx(player.xp + result.xp);
  // Pick the next incident the player can actually access
  const nextIncident =
    INCIDENTS.find((i) => !completed.has(i.id) && i.id !== result.id && i.minLevel <= lvlIdx) ||
    INCIDENTS.find((i) => !completed.has(i.id) && i.id !== result.id);

  const titleText =
    result.grade === "A+" ? "Perfeito!" :
    result.grade === "A" ? "Boa demais!" :
    result.grade === "A-" ? "Bem feito!" :
    isOk ? "Resolveu, mas custou caro" :
    isMid ? "Quase lá" :
    "Bora aprender com isso";

  const subText =
    isGreat ? "tu salvou a empresa hoje 🚀" :
    isGood ? "boa escolha, mas teve algumas tentativas" :
    isOk ? "funcionou, mas não era a melhor saída" :
    isMid ? "tá no caminho. olha o porquê embaixo" :
    "calma — todo mundo erra, é assim que aprende";

  const accent: "green" | "blue" | "yellow" | "red" =
    isGreat ? "green" :
    isGood ? "green" :
    isOk ? "blue" :
    isMid ? "yellow" :
    "red";

  const bannerClasses = {
    green: "bg-duo-green text-white",
    blue: "bg-duo-blue text-white",
    yellow: "bg-duo-yellow text-duo-ink",
    red: "bg-duo-red text-white",
  }[accent];

  const mascotExpr =
    isGreat ? "celebrate" :
    isGood ? "happy" :
    isOk ? "happy" :
    isMid ? "thinking" :
    "sad";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-duo-cream overflow-y-auto"
    >
      {/* Top banner */}
      <motion.div
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className={`${bannerClasses} pt-6 pb-12 px-4`}
      >
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0.4, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 14 }}
            className="flex justify-center mb-3"
          >
            <Mascot expression={mascotExpr} size={140} />
          </motion.div>

          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 200 }}
            className="text-display text-4xl sm:text-5xl font-black mb-2 tracking-tight"
          >
            {titleText}
          </motion.h1>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-base sm:text-lg font-bold opacity-90"
          >
            {subText}
          </motion.p>
        </div>
      </motion.div>

      {/* Stats cards */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 -mt-6 mb-6 relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="grid grid-cols-3 gap-2.5"
        >
          <StatCard icon={<div className="text-display font-black text-3xl">{result.grade}</div>} label="nota" color={accent} />
          <StatCard icon={<Zap className="w-7 h-7 fill-duo-yellow-dark text-duo-yellow-dark" strokeWidth={2.5} />} label={result.xp > 0 ? `+${result.xp} XP` : "0 XP"} color="yellow" mainLabel />
          <StatCard icon={<Clock className="w-7 h-7 text-duo-blue-dark" strokeWidth={2.5} />} label={formatTime(result.elapsed)} color="blue" mainLabel />
        </motion.div>

        {/* Replay banner — shows when this mission was already solved before */}
        {result.xp === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="duo-card mt-3 p-3 bg-duo-blue-light border-duo-blue flex items-center gap-3"
          >
            <div className="shrink-0 w-9 h-9 rounded-full bg-duo-blue text-white flex items-center justify-center text-base">
              🔁
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-duo-blue-dark text-sm leading-tight">
                Treino — sem novo XP
              </div>
              <div className="text-duo-blue-dark/80 text-xs font-bold leading-snug mt-0.5">
                Você já tinha resolvido essa missão. XP só é dado na <b>primeira vez</b> pra manter o ranking justo.
              </div>
            </div>
          </motion.div>
        )}
      </section>

      {/* Verdict + Decision */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 mb-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="duo-card p-5"
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-2xl bg-duo-blue-light text-duo-blue-dark flex items-center justify-center">
              <BookOpen className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-black uppercase tracking-widest text-duo-blue-dark mb-1.5">veredicto</div>
              <p className="font-black text-lg sm:text-xl text-duo-ink leading-snug mb-2">{result.verdict}</p>
              <p className="text-duo-ink-soft text-sm sm:text-base font-medium leading-relaxed">{result.sub}</p>
              <div className="mt-3 text-xs font-bold text-duo-ink-faded">
                Tua decisão: <span className="text-duo-ink">{result.actionLabel}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ════════ TEORIA AWS — destaque ════════ */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 mb-5">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.85 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="h-1 flex-1 bg-duo-line rounded-full" />
            <h2 className="text-display text-base sm:text-lg font-black text-duo-ink uppercase tracking-wider flex items-center gap-2">
              <span>📚</span>
              <span>teoria · cai na prova</span>
            </h2>
            <div className="h-1 flex-1 bg-duo-line rounded-full" />
          </div>

          {/* Root cause */}
          <div className="duo-card p-5 mb-3">
            <div className="text-xs font-black uppercase tracking-widest text-duo-orange-dark mb-2 flex items-center gap-2">
              <span>🔍</span>
              CAUSA RAIZ
            </div>
            <div
              className="text-duo-ink text-base sm:text-lg leading-relaxed prose-result"
              dangerouslySetInnerHTML={{ __html: incident.rootCause }}
            />
          </div>

          {/* Exam note */}
          <div className="duo-card p-5 mb-3 bg-duo-yellow-light border-duo-yellow">
            <div className="text-xs font-black uppercase tracking-widest text-duo-yellow-dark mb-2 flex items-center gap-2">
              <span>📝</span>
              CONCEITO DA PROVA
            </div>
            <div
              className="text-duo-ink text-base leading-relaxed prose-result"
              dangerouslySetInnerHTML={{ __html: incident.examNote }}
            />
          </div>

          {/* Services */}
          <div className="duo-card p-5">
            <div className="text-xs font-black uppercase tracking-widest text-duo-blue-dark mb-3 flex items-center gap-2">
              <span>🧱</span>
              TÓPICOS DESSE INCIDENT
            </div>
            <div className="space-y-3">
              {incident.services.map((s) => (
                <div key={s.name} className="border-l-4 border-duo-blue pl-3">
                  <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                    <span className="font-black text-duo-ink">{s.name}</span>
                    <span className="text-[10px] uppercase tracking-widest font-black text-duo-blue-dark">{s.role}</span>
                  </div>
                  <p
                    className="text-duo-ink-soft text-sm font-medium leading-snug [&_code]:bg-duo-yellow-light [&_code]:text-duo-ink [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-mono [&_code]:font-bold [&_code]:text-xs [&_b]:font-black [&_b]:text-duo-ink"
                    dangerouslySetInnerHTML={{ __html: s.description }}
                  />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Actions */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-10 space-y-3">
        {nextIncident && (
          <Link
            href={`/incident/${nextIncident.id}`}
            onClick={() => playSound("page")}
            className="duo-btn duo-green w-full flex items-center justify-center gap-2"
          >
            <span>próxima missão</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/"
            onClick={() => playSound("page")}
            className="duo-btn duo-white flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            <span>home</span>
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => playSound("page")}
            className="duo-btn duo-white flex items-center justify-center gap-2"
          >
            <span>🏆</span>
            <span>ranking</span>
          </Link>
        </div>
      </section>

      <style jsx global>{`
        .prose-result b { color: #3C3C3C; font-weight: 800; }
        .prose-result code {
          background: rgba(28, 176, 246, 0.12);
          color: #1899D6;
          padding: 2px 6px;
          border-radius: 6px;
          font-family: var(--font-jetbrains), monospace;
          font-size: 0.92em;
          font-weight: 700;
        }
        .prose-result p { margin: 0.5em 0; }
        .prose-result ul { margin: 0.5em 0; padding-left: 1.2em; list-style: disc; }
        .prose-result li { margin: 0.2em 0; }
      `}</style>
    </motion.div>
  );
}

function StatCard({
  icon,
  label,
  sublabel,
  color,
  mainLabel,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  color: "green" | "yellow" | "blue" | "red";
  mainLabel?: boolean;
}) {
  const cfg =
    color === "green" ? { bg: "bg-duo-green-light", text: "text-duo-green-dark", border: "border-duo-green" } :
    color === "yellow" ? { bg: "bg-duo-yellow-light", text: "text-duo-yellow-dark", border: "border-duo-yellow" } :
    color === "blue" ? { bg: "bg-duo-blue-light", text: "text-duo-blue-dark", border: "border-duo-blue" } :
    { bg: "bg-duo-red-light", text: "text-duo-red-dark", border: "border-duo-red" };

  return (
    <div className={`rounded-2xl p-3 sm:p-4 ${cfg.bg} border-2 ${cfg.border} text-center`} style={{ borderBottomWidth: 4 }}>
      <div className="flex items-center justify-center mb-1.5 h-9">{icon}</div>
      {mainLabel ? (
        <>
          <div className={`font-black text-base sm:text-lg ${cfg.text} tabular leading-none`}>{label}</div>
          {sublabel && <div className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text} opacity-70 mt-1`}>{sublabel}</div>}
        </>
      ) : (
        <div className={`text-[10px] font-bold uppercase tracking-wider ${cfg.text}`}>{label}</div>
      )}
    </div>
  );
}
