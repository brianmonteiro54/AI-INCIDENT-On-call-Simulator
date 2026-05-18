"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Flame, Upload, Check, RefreshCw, Trophy, Crown, Medal } from "lucide-react";
import { useGame, bestGradeByIncident } from "@/lib/store";
import { getLevel } from "@/lib/levels";
import { playSound } from "@/lib/sound";
import { Mascot } from "@/components/Mascot";

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
      setError("não conseguimos carregar o ranking");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBoard(); }, []);

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
      setError("não rolou enviar");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-duo-cream">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-duo-cream/95 backdrop-blur-sm border-b-2 border-duo-line">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
          <Link href="/" onClick={() => playSound("page")} className="text-duo-ink-soft hover:text-duo-ink p-1.5 rounded-full hover:bg-duo-line-soft transition">
            <ArrowLeft className="w-6 h-6 stroke-[2.5]" />
          </Link>
          <h1 className="text-display text-xl font-black text-duo-ink">Ranking Global</h1>
          <div className="flex-1" />
          <button onClick={() => { playSound("click"); fetchBoard(); }} className="text-duo-ink-soft hover:text-duo-ink p-1.5 rounded-full hover:bg-duo-line-soft transition">
            <RefreshCw className={`w-5 h-5 stroke-[2.5] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      {/* Hero card */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        <div className="duo-card p-5 sm:p-6 flex items-center gap-4 sm:gap-5 bg-duo-yellow-light border-duo-yellow">
          <Mascot expression="celebrate" size={100} className="shrink-0" />
          <div className="flex-1">
            <h2 className="text-display text-2xl sm:text-3xl font-black text-duo-yellow-dark leading-tight mb-1">
              Hall da Fama 🏆
            </h2>
            <p className="text-duo-ink-soft text-sm sm:text-base font-medium leading-snug">
              Os engenheiros que mais salvaram a produção. Onde tu vai chegar?
            </p>
          </div>
        </div>
      </section>

      {/* Submit panel */}
      {hydrated && player.xp > 0 && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-4">
          <div className="duo-card p-4 flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[180px]">
              <div className="text-xs font-black uppercase tracking-widest text-duo-ink-soft mb-1">tua pontuação</div>
              <div className="font-black text-duo-ink text-lg leading-tight">
                {player.name} · <span className="text-duo-blue-dark tabular">{player.xp.toLocaleString()}</span> XP
              </div>
            </div>
            <button
              onClick={submit}
              disabled={submitting || submitted}
              className={`duo-btn ${submitted ? "duo-white" : "duo-green"} flex items-center gap-2`}
            >
              {submitted ? <Check className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
              <span>{submitted ? "enviado!" : submitting ? "enviando…" : "publicar"}</span>
            </button>
          </div>
        </section>
      )}

      {/* Rankings */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-6 pb-10">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-1 flex-1 bg-duo-line rounded-full" />
          <h2 className="text-display text-xl font-black text-duo-ink uppercase tracking-wider">top players</h2>
          <div className="h-1 flex-1 bg-duo-line rounded-full" />
        </div>

        {loading && entries.length === 0 ? (
          <div className="text-center py-16">
            <Mascot expression="thinking" size={120} />
            <div className="text-duo-ink-soft font-bold mt-3">carregando…</div>
          </div>
        ) : error ? (
          <div className="duo-card duo-card-wrong p-5 text-center">
            <div className="text-duo-red-dark font-black">{error}</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="duo-card p-10 text-center">
            <Mascot expression="happy" size={120} className="mx-auto mb-4" />
            <div className="text-display text-2xl font-black text-duo-ink mb-2">seja o primeiro!</div>
            <div className="text-duo-ink-soft text-sm font-medium">ainda ninguém entrou no ranking 👀</div>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((e, i) => {
              const lvl = getLevel(e.xp);
              const isMe = e.name === player.name;
              const medalCfg =
                i === 0 ? { bg: "bg-duo-yellow", border: "border-duo-yellow-dark", text: "text-duo-yellow-dark", icon: "🥇" } :
                i === 1 ? { bg: "bg-duo-line", border: "border-duo-ink-soft", text: "text-duo-ink", icon: "🥈" } :
                i === 2 ? { bg: "bg-duo-orange-light", border: "border-duo-orange-dark", text: "text-duo-orange-dark", icon: "🥉" } :
                null;

              return (
                <motion.div
                  key={`${e.name}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`duo-card p-4 flex items-center gap-3 sm:gap-4 ${isMe ? "duo-card-selected" : ""}`}
                >
                  {/* Rank */}
                  {medalCfg ? (
                    <div className={`shrink-0 w-12 h-12 rounded-2xl ${medalCfg.bg} border-2 ${medalCfg.border} flex items-center justify-center text-2xl`}
                      style={{ borderBottomWidth: 4 }}>
                      {medalCfg.icon}
                    </div>
                  ) : (
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-duo-line-soft border-2 border-duo-line flex items-center justify-center font-black text-duo-ink-soft text-lg"
                      style={{ borderBottomWidth: 4 }}>
                      {i + 1}
                    </div>
                  )}

                  {/* Name + meta */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-display text-base sm:text-lg font-black text-duo-ink truncate">
                        {e.name}
                      </h3>
                      {isMe && <span className="chip border-duo-blue-dark bg-duo-blue text-white text-[10px] px-2 py-0">VC</span>}
                      {e.streak >= 3 && (
                        <span className="text-duo-orange-dark text-xs font-bold flex items-center">
                          <Flame className="w-3 h-3 fill-duo-orange" />{e.streak}
                        </span>
                      )}
                    </div>
                    <div className="text-duo-ink-soft text-xs font-bold flex items-center gap-2 flex-wrap">
                      <span>{lvl.name}</span>
                      <span className="text-duo-ink-faded">·</span>
                      <span>{e.completedCount} resolvidos</span>
                      {e.aPlusCount > 0 && (
                        <>
                          <span className="text-duo-ink-faded">·</span>
                          <span className="text-duo-yellow-dark">⭐ {e.aPlusCount} A+</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right shrink-0">
                    <div className="font-black text-duo-blue-dark text-lg sm:text-xl tabular leading-none">
                      {e.xp.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-duo-ink-faded mt-1">
                      XP
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center text-duo-ink-faded text-xs font-medium">
          sem upstash, o ranking zera quando o servidor reinicia
        </div>
      </section>
    </div>
  );
}
