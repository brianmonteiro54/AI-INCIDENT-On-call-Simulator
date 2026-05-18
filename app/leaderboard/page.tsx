"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Trophy, Flame, Upload, Check, RefreshCw } from "lucide-react";
import { PlayerBar } from "@/components/PlayerBar";
import { useGame, bestGradeByIncident } from "@/lib/store";
import { getLevel } from "@/lib/levels";
import { playSound } from "@/lib/sound";

interface Entry {
  name: string;
  xp: number;
  totalSaved: number;
  completedCount: number;
  aPlusCount: number;
  streak: number;
  at: number;
}

export default function LeaderboardPage() {
  const player = useGame((s) => s.player);
  const history = useGame((s) => s.history);
  const hydrated = useGame((s) => s.hydrated);

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchBoard() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      const data = await res.json();
      setEntries(data.entries ?? []);
    } catch {
      setError("falhou em buscar — leaderboard offline?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBoard();
  }, []);

  async function submit() {
    if (submitting || !hydrated || player.xp === 0) return;
    setSubmitting(true);
    playSound("click");
    const best = bestGradeByIncident(history);
    const completedCount = Object.keys(best).length;
    const aPlusCount = Object.values(best).filter((g) => g === "A+").length;
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: player.name,
          xp: player.xp,
          totalSaved: player.totalSaved,
          completedCount,
          aPlusCount,
          streak: player.streak,
        }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      playSound("success");
      await fetchBoard();
    } catch {
      setError("erro ao submeter");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PlayerBar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-20">
        <Link href="/" onClick={() => playSound("page")} className="flex items-center gap-2 text-mono text-xs text-gray-500 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>back to incidents</span>
        </Link>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 relative">
          <div className="absolute -top-8 -left-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 text-mono text-[10px] text-amber-400 uppercase tracking-widest mb-2">
              <Trophy className="w-3 h-3" />
              global leaderboard
            </div>
            <h1 className="text-display text-4xl sm:text-5xl font-black text-white tracking-tight">
              hall of <span className="text-amber-400 italic">on-call</span>
            </h1>
            <p className="text-gray-400 mt-2 text-sm max-w-lg">
              Top engineers que dominaram os incidentes. Submete teu score quando estiver pronto pra entrar no ranking.
            </p>
          </div>
        </motion.div>

        {/* Submit panel */}
        {hydrated && player.xp > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="glass-elev rounded-lg p-4 mb-6 flex items-center gap-4 flex-wrap"
          >
            <div className="flex-1 min-w-[180px]">
              <div className="text-mono text-[10px] text-gray-500 uppercase tracking-widest">your score</div>
              <div className="text-display text-2xl font-bold text-white">
                @{player.name} · {player.xp} XP
              </div>
              <div className="text-mono text-xs text-gray-400">
                {Object.keys(bestGradeByIncident(history)).length} resolvidos · ${player.totalSaved.toLocaleString()} salvos
              </div>
            </div>
            <button
              onClick={submit}
              disabled={submitting || submitted}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {submitted ? <Check className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
              <span>{submitted ? "submetido!" : submitting ? "enviando…" : "submeter score"}</span>
            </button>
          </motion.div>
        )}

        {/* Table */}
        <div className="glass rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-mono text-xs font-bold text-gray-300 uppercase tracking-[0.2em]">top engineers</h2>
            <button onClick={fetchBoard} className="text-gray-500 hover:text-white transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          {loading && entries.length === 0 ? (
            <div className="text-center py-12 text-mono text-xs text-gray-500">carregando…</div>
          ) : error ? (
            <div className="text-center py-12 text-mono text-xs text-blood-400">{error}</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-display text-2xl font-bold text-gray-400 mb-2">🏜️ sem entradas ainda</div>
              <div className="text-mono text-xs text-gray-600">Seja o primeiro a submeter um score.</div>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {entries.map((e, i) => {
                const lvl = getLevel(e.xp);
                const isMe = e.name === player.name;
                return (
                  <motion.div
                    key={`${e.name}-${i}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`grid grid-cols-[36px_1fr_auto_auto_auto] items-center px-3 sm:px-5 py-3 gap-3 sm:gap-5 ${
                      isMe ? "bg-acid-500/5 border-l-2 border-acid-500" : ""
                    }`}
                  >
                    <div className={`text-display text-xl font-black text-center ${
                      i === 0 ? "text-amber-400" :
                      i === 1 ? "text-gray-300" :
                      i === 2 ? "text-orange-400" : "text-gray-600"
                    }`}>
                      {i < 3 ? ["🥇", "🥈", "🥉"][i] : `#${i + 1}`}
                    </div>
                    <div className="min-w-0">
                      <div className="text-white font-semibold truncate flex items-center gap-2">
                        @{e.name}
                        {isMe && <span className="text-mono text-[9px] uppercase tracking-widest text-acid-400">you</span>}
                      </div>
                      <div className="text-mono text-[10px] text-gray-500 truncate">
                        {lvl.name} · {e.completedCount} resolvidos · {e.aPlusCount} A+
                      </div>
                    </div>
                    <div className="text-mono text-xs text-amber-400 text-right">
                      <div className="text-[9px] text-gray-600 uppercase tracking-widest">XP</div>
                      <div>{e.xp.toLocaleString()}</div>
                    </div>
                    <div className="text-mono text-xs text-acid-400 text-right hidden sm:block">
                      <div className="text-[9px] text-gray-600 uppercase tracking-widest">Saved</div>
                      <div>${(e.totalSaved / 1000).toFixed(0)}k</div>
                    </div>
                    <div className="text-mono text-xs text-blood-400 text-right hidden sm:flex items-center gap-1 justify-end">
                      {e.streak >= 2 && <><Flame className="w-3 h-3" /> {e.streak}</>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-mono text-[10px] text-gray-600 text-center mt-6">
          Sem Upstash configurado, o leaderboard usa memória (reseta no restart).
        </p>
      </main>
    </>
  );
}
