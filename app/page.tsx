"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useGame, bestGradeByIncident } from "@/lib/store";
import { INCIDENTS } from "@/lib/incidents";
import { getLevelIdx, formatTime, getTodaysDailyId, getDailyKey, gradeColor } from "@/lib/levels";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { PlayerBar } from "@/components/PlayerBar";
import { IncidentCard } from "@/components/IncidentCard";
import { BootSequence } from "@/components/BootSequence";
import { AchievementToasts } from "@/components/AchievementToasts";
import { Flame, Crown, Calendar, BarChart3, Sparkles, ChevronRight } from "lucide-react";

export default function HomePage() {
  const player = useGame((s) => s.player);
  const history = useGame((s) => s.history);
  const hydrated = useGame((s) => s.hydrated);

  if (!hydrated) {
    return (
      <>
        <BootSequence />
        <PlayerBar />
      </>
    );
  }

  const lvlIdx = getLevelIdx(player.xp);
  const bestByInc = bestGradeByIncident(history);
  const dailyId = getTodaysDailyId(INCIDENTS.map((i) => i.id));
  const dailyKey = getDailyKey();
  const dailyDoneToday = history.some(
    (h) => h.id === dailyId && new Date(h.at).toISOString().slice(0, 10) === dailyKey
  );

  const completed = Object.keys(bestByInc).length;
  const aPlus = Object.values(bestByInc).filter((g) => g === "A+").length;
  const totalAchievements = ACHIEVEMENTS.filter((a) => player.achievements.includes(a.id)).length;

  const dailyInc = INCIDENTS.find((i) => i.id === dailyId);

  return (
    <>
      <BootSequence />
      <PlayerBar />
      <AchievementToasts />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        {/* HERO */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 relative"
        >
          <div className="absolute -top-8 -left-8 w-64 h-64 bg-blood-500/8 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-8 right-0 w-48 h-48 bg-cyber-400/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 text-mono text-[10px] text-blood-400 uppercase tracking-widest mb-3">
              <motion.div
                className="w-2 h-2 rounded-full bg-blood-500"
                animate={{ scale: [1, 0.6, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              />
              ACTIVE INCIDENTS · {INCIDENTS.length - completed} open
            </div>
            <h1 className="text-display text-4xl sm:text-6xl font-black leading-[0.95] tracking-tight mb-4 text-balance">
              3:17AM. <span className="text-blood-500 italic">A produção tá pegando fogo.</span>
            </h1>
            <p className="text-gray-400 max-w-2xl leading-relaxed text-balance">
              Tu é o(a) engineer de plantão. Bedrock alucinando, custo subindo $400/min, cliente reclamando no Twitter. Lê os dashboards, decide a ação certa. Cada decisão te ensina um pedaço da AWS — porque tu <em className="text-acid-400 not-italic">viu</em> a coisa quebrar.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/leaderboard" className="btn-ghost flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span>Leaderboard global</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
              {dailyInc && !dailyDoneToday && (
                <Link
                  href={`/incident/${dailyInc.id}?daily=1`}
                  className="btn-primary flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Daily challenge · {dailyInc.title}</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
              {dailyDoneToday && (
                <div className="btn-ghost flex items-center gap-2 text-acid-400 border-acid-500/30">
                  <Calendar className="w-4 h-4" />
                  <span>Daily ✓ resolvido hoje</span>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* STATS */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12"
        >
          {[
            { label: "Resolvidos", value: completed, sub: `de ${INCIDENTS.length}`, color: "text-white" },
            { label: "A+ obtidos", value: aPlus, sub: "perfect runs", color: "text-acid-400", icon: Sparkles },
            { label: "Economizado", value: `$${(player.totalSaved / 1000).toFixed(0)}k`, sub: "vs deixar correr", color: "text-acid-400" },
            { label: "Achievements", value: `${totalAchievements}/${ACHIEVEMENTS.length}`, sub: "desbloqueados", color: "text-amber-400", icon: Crown },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="glass rounded-lg p-4 relative overflow-hidden"
            >
              {s.icon && <s.icon className="absolute top-3 right-3 w-4 h-4 text-white/10" />}
              <div className="text-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">{s.label}</div>
              <div className={`text-display text-3xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-mono text-[10px] text-gray-600 mt-1">{s.sub}</div>
            </motion.div>
          ))}
        </motion.section>

        {player.streak >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 glass-elev rounded-lg p-4 flex items-center gap-3 border-amber-500/30"
          >
            <Flame className="w-6 h-6 text-amber-400" />
            <div>
              <div className="text-display font-bold text-white">Streak: {player.streak} A+ consecutivos</div>
              <div className="text-mono text-xs text-gray-400">Mantém o ritmo. Próximo A+ aumenta o multiplicador.</div>
            </div>
          </motion.div>
        )}

        {/* AVAILABLE INCIDENTS */}
        <section className="mb-12">
          <SectionHead title="Available incidents" count={`${INCIDENTS.filter(i => !bestByInc[i.id] && i.minLevel <= lvlIdx).length} abertos · ${INCIDENTS.filter(i => i.minLevel > lvlIdx).length} locked`} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INCIDENTS.map((inc, i) => (
              <motion.div
                key={inc.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.04 }}
              >
                <IncidentCard
                  incident={inc}
                  locked={inc.minLevel > lvlIdx}
                  bestResult={
                    bestByInc[inc.id]
                      ? {
                          grade: bestByInc[inc.id],
                          cost: history.filter((h) => h.id === inc.id).slice(-1)[0]?.cost ?? 0,
                          elapsed: history.filter((h) => h.id === inc.id).slice(-1)[0]?.elapsed ?? 0,
                        }
                      : undefined
                  }
                  daily={inc.id === dailyId && !dailyDoneToday}
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* HISTORY */}
        {history.length > 0 && (
          <section className="mb-12">
            <SectionHead title="Incident history" count={`${history.length} resolvidos`} />
            <div className="glass rounded-lg overflow-hidden divide-y divide-white/5">
              {history.slice().reverse().slice(0, 20).map((h) => {
                const inc = INCIDENTS.find((i) => i.id === h.id);
                return (
                  <div key={h.at} className="grid grid-cols-[60px_1fr_auto_auto_auto] items-center px-4 sm:px-5 py-3 gap-3 sm:gap-5 text-sm">
                    <div className={`text-display text-2xl font-black text-center ${gradeColor(h.grade)}`}>{h.grade}</div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate">{inc?.title ?? h.id}</div>
                      <div className="text-mono text-[10px] text-gray-500 truncate">{inc?.incId ?? ""}</div>
                    </div>
                    <div className="text-mono text-xs text-gray-400 text-right">
                      <div className="text-[9px] text-gray-600 uppercase tracking-widest">Time</div>
                      <div>{formatTime(h.elapsed)}</div>
                    </div>
                    <div className="text-mono text-xs text-gray-400 text-right hidden sm:block">
                      <div className="text-[9px] text-gray-600 uppercase tracking-widest">Cost</div>
                      <div className="text-white">${Math.round(h.cost).toLocaleString()}</div>
                    </div>
                    <div className="text-mono text-xs text-amber-400 text-right">
                      <div className="text-[9px] text-gray-600 uppercase tracking-widest">XP</div>
                      <div>+{h.xp}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ACHIEVEMENTS */}
        <section>
          <SectionHead title="Achievements" count={`${totalAchievements} / ${ACHIEVEMENTS.length}`} />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {ACHIEVEMENTS.map((a, i) => {
              const owned = player.achievements.includes(a.id);
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.03 }}
                  className={`glass rounded-lg p-3 transition-all ${owned ? "border-acid-500/30 bg-acid-500/5" : "opacity-50 grayscale"}`}
                >
                  <div className="text-3xl mb-1">{a.icon}</div>
                  <div className={`text-display text-sm font-bold mb-0.5 ${owned ? "text-white" : "text-gray-500"}`}>
                    {a.title}
                  </div>
                  <div className="text-xs text-gray-500 leading-tight">{a.description}</div>
                </motion.div>
              );
            })}
          </div>
        </section>

        <footer className="mt-20 pt-6 border-t border-white/5 text-mono text-[11px] text-gray-600 text-center space-y-2">
          <div>AI INCIDENT v2.0 · simulador para AWS AI Practitioner</div>
          <ResetButton />
        </footer>
      </main>
    </>
  );
}

function SectionHead({ title, count }: { title: string; count: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <h2 className="text-mono text-xs font-bold text-gray-400 uppercase tracking-[0.25em]">{title}</h2>
      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
      <span className="text-mono text-[10px] text-gray-500">{count}</span>
    </div>
  );
}

function ResetButton() {
  const reset = useGame((s) => s.reset);
  return (
    <button
      onClick={() => {
        if (confirm("Vai apagar TODO o progresso. Continuar?")) reset();
      }}
      className="text-gray-600 hover:text-blood-400 underline decoration-dotted underline-offset-2"
    >
      apagar progresso local
    </button>
  );
}
