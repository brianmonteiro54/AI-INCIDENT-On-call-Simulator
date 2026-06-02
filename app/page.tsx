"use client";

import { m, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useGame, bestGradeByIncident } from "@/lib/store";
import { INCIDENTS } from "@/lib/incidents";
import { getLevel, getLevelIdx, getNextLevel, getTodaysDailyId, getDailyKey, sevLabel } from "@/lib/levels";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { AchievementToasts } from "@/components/AchievementToasts";
import { Mascot } from "@/components/Mascot";
import { playSound } from "@/lib/sound";
import { cleanupStaleMissionSaves, clearAllMissionProgress } from "@/lib/mission-progress";
import { Sparkles, Flame, Crown, Lock, Check, Star, Volume2, VolumeX, Trophy, Settings, ChevronRight, Zap, BookOpen } from "lucide-react";

// Build a smooth (vertical-tangent) SVG path through a list of points.
// Shared by the dotted full trail and the colored "done" portion.
function buildTrailPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const my = (a.y + b.y) / 2;
    d += ` C ${a.x} ${my}, ${b.x} ${my}, ${b.x} ${b.y}`;
  }
  return d;
}

export default function HomePage() {
  const player = useGame((s) => s.player);
  const history = useGame((s) => s.history);
  const hydrated = useGame((s) => s.hydrated);
  const setName = useGame((s) => s.setName);
  const setSoundOn = useGame((s) => s.setSoundOn);
  const reset = useGame((s) => s.reset);

  // —— Welcome / onboarding flow ——
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean | null>(null);
  const [forceReady, setForceReady] = useState(false);

  // —— Mission-path connector line, measured from the rendered node circles ——
  const pathRef = useRef<HTMLDivElement>(null);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [nodePoints, setNodePoints] = useState<{ x: number; y: number }[]>([]);
  const [trailDims, setTrailDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    const t = setTimeout(() => setForceReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Boot housekeeping: drop any mission-in-progress saves older than 6h.
  useEffect(() => {
    cleanupStaleMissionSaves();
  }, []);

  useEffect(() => {
    if (!hydrated && !forceReady) return;
    if (typeof window === "undefined") {
      setNeedsOnboarding(false);
      return;
    }
    const onboarded = localStorage.getItem("ai-incident-onboarded");
    const hasCustomName = player.name && player.name !== "anon";
    setNeedsOnboarding(!onboarded && !hasCustomName);
  }, [hydrated, forceReady, player.name]);

  function handleWelcomeSubmit(name: string) {
    setName(name);
    try { localStorage.setItem("ai-incident-onboarded", "1"); } catch {}
    setNeedsOnboarding(false);
  }

  // —— Name input on home (controlled) ——
  const [nameDraft, setNameDraft] = useState(player.name);
  useEffect(() => {
    setNameDraft(player.name);
  }, [player.name]);

  function commitName() {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== player.name) {
      setName(trimmed);
    } else {
      setNameDraft(player.name);
    }
  }

  const bestByInc = useMemo(() => bestGradeByIncident(history), [history]);
  const lvlIdx = getLevelIdx(player.xp);
  const lvl = getLevel(player.xp);
  const next = getNextLevel(player.xp);
  const dailyId = getTodaysDailyId(INCIDENTS.map((i) => i.id));
  const dailyKey = getDailyKey();
  const dailyDoneToday = history.some(
    (h) => h.id === dailyId && new Date(h.at).toISOString().slice(0, 10) === dailyKey
  );
  const dailyInc = INCIDENTS.find((i) => i.id === dailyId);

  const completed = Object.keys(bestByInc).length;
  const aPlus = Object.values(bestByInc).filter((g) => g === "A+").length;
  const ownedAchievements = ACHIEVEMENTS.filter((a) => player.achievements.includes(a.id));

  // Measure each rendered node circle and draw a smooth dotted trail through
  // their centers. Re-measures on resize, font load, and progress changes
  // (heights shift), and once onboarding clears (the path mounts).
  useEffect(() => {
    const container = pathRef.current;
    if (!container) return;
    const measure = () => {
      const cr = container.getBoundingClientRect();
      const pts: { x: number; y: number }[] = [];
      for (const el of circleRefs.current) {
        if (!el) continue;
        const r = el.getBoundingClientRect();
        pts.push({
          x: +(r.left - cr.left + r.width / 2).toFixed(1),
          y: +(r.top - cr.top + r.height / 2).toFixed(1),
        });
      }
      if (pts.length < 2) return;
      setNodePoints(pts);
      setTrailDims({ w: cr.width, h: cr.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(container);
    window.addEventListener("resize", measure);
    const fonts = (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts;
    if (fonts?.ready) fonts.ready.then(measure).catch(() => {});
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, needsOnboarding, lvlIdx, completed]);

  // Show welcome while we don't know whether to onboard, OR while waiting hydration
  if (needsOnboarding === null) {
    return <WelcomeScreen forceShow />;
  }

  if (needsOnboarding) {
    return <WelcomeScreen onSubmit={handleWelcomeSubmit} />;
  }

  const inLevel = player.xp - lvl.min;
  const span = next ? next.min - lvl.min : 1;
  const xpPct = next ? Math.min(100, (inLevel / span) * 100) : 100;
  const isAnon = !player.name || player.name === "anon";
  // The single "next" mission to play: first unlocked one not yet cleared.
  const currentIdx = INCIDENTS.findIndex((inc) => inc.minLevel <= lvlIdx && !bestByInc[inc.id]);
  // Trail fill: solid colored up to the furthest mission reached (current node,
  // or the last completed one if everything unlocked is already done); dotted beyond.
  const doneMaxIdx = INCIDENTS.reduce((mx, inc, i) => (bestByInc[inc.id] ? i : mx), -1);
  const fillEnd = Math.max(currentIdx, doneMaxIdx);
  const fullTrailD = buildTrailPath(nodePoints);
  const doneTrailD = buildTrailPath(nodePoints.slice(0, fillEnd + 1));

  return (
    <>
      <AchievementToasts />

      <div className="min-h-screen bg-duo-cream pb-20">
        {/* ════════ TOP BAR ════════ */}
        <header className="sticky top-0 z-30 bg-duo-cream/95 backdrop-blur-sm border-b-2 border-duo-line">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3 sm:gap-4">
            {/* Streak */}
            <div className="flex items-center gap-1.5">
              <div className={player.streak >= 1 ? "fire-pulse" : ""}>
                <Flame className={`w-6 h-6 ${player.streak >= 1 ? "fill-duo-orange text-duo-orange-dark" : "text-duo-ink-faded"}`} strokeWidth={2.5} />
              </div>
              <span className={`font-black text-lg tabular ${player.streak >= 1 ? "text-duo-orange-dark" : "text-duo-ink-faded"}`}>
                {player.streak}
              </span>
            </div>

            {/* Gems / XP */}
            <div className="flex items-center gap-1.5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="#1CB0F6" stroke="#1899D6" strokeWidth="2">
                <path d="M12 2 L22 12 L12 22 L2 12 Z" strokeLinejoin="round" />
              </svg>
              <span className="font-black text-lg tabular text-duo-blue-dark">
                {player.xp}
              </span>
            </div>

            {/* A+ count */}
            <div className="flex items-center gap-1.5">
              <Star className={`w-6 h-6 ${aPlus > 0 ? "fill-duo-yellow text-duo-yellow-dark" : "text-duo-ink-faded"}`} strokeWidth={2.5} />
              <span className={`font-black text-lg tabular ${aPlus > 0 ? "text-duo-yellow-dark" : "text-duo-ink-faded"}`}>
                {aPlus}
              </span>
            </div>

            <div className="flex-1" />

            <button
              onClick={() => { playSound("click"); setSoundOn(!player.soundOn); }}
              className="text-duo-ink-soft hover:text-duo-ink tap-target rounded-full hover:bg-duo-line-soft transition shrink-0"
              aria-label={player.soundOn ? "desativar som" : "ativar som"}
            >
              {player.soundOn ? <Volume2 className="w-5 h-5 stroke-[2.5]" /> : <VolumeX className="w-5 h-5 stroke-[2.5]" />}
            </button>
          </div>

          {/* XP bar */}
          <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-black text-duo-yellow-dark uppercase tracking-wider shrink-0">
                {lvl.name}
              </span>
              <div className="flex-1 progress-track h-3">
                <m.div
                  className="progress-fill"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs font-bold text-duo-ink-soft tabular shrink-0">
                {next ? `${player.xp}/${next.min}` : "MAX"}
              </span>
            </div>
          </div>
        </header>

        {/* ════════ HERO ════════ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-6">
          <div className="duo-card p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
            <Mascot expression="happy" size={100} className="shrink-0" />
            <div className="flex-1 min-w-0">
              <h1 className="text-display text-2xl sm:text-3xl font-black text-duo-ink leading-tight mb-1.5">
                {isAnon ? (
                  "E aí! 👋"
                ) : (
                  <>Oi, <input
                    type="text"
                    aria-label="seu nome"
                    value={nameDraft}
                    maxLength={14}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onBlur={commitName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur();
                      }
                    }}
                    className="bg-transparent outline-none text-duo-blue-dark border-b-2 border-dashed border-duo-line focus:border-duo-blue inline-block max-w-[140px] font-black"
                  />! 👋</>
                )}
              </h1>
              <p className="text-duo-ink-soft text-sm sm:text-base font-medium leading-snug">
                Bora estudar AWS AI Practitioner resolvendo incidentes reais.
              </p>
            </div>
          </div>

          {/* Daily challenge */}
          {dailyInc && !dailyDoneToday && (
            <Link
              href={`/incident/${dailyInc.id}?daily=1`}
              onClick={() => playSound("page")}
              className="block mt-3 group"
            >
              <div className="duo-card duo-card-correct p-4 flex items-center gap-3 hover:bg-duo-green-light transition card-press">
                <div className="shrink-0 w-12 h-12 rounded-2xl bg-duo-green text-white flex items-center justify-center fire-pulse">
                  <Sparkles className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-black text-duo-green-dark text-sm uppercase tracking-wider">desafio do dia</div>
                  <div className="font-bold text-duo-ink leading-tight truncate">
                    {dailyInc.title.replace(/^🔥\s*/, "")}
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-duo-green-dark stroke-[3] shrink-0" />
              </div>
            </Link>
          )}
        </section>

        {/* ════════ STATS STRIP ════════ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 mb-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <StatBlock icon="🎯" label="resolvidos" value={`${completed}/${INCIDENTS.length}`} color="green" />
            <StatBlock icon="⭐" label="A+" value={String(aPlus)} color="yellow" />
            <StatBlock icon="💰" label="poupados" value={`$${(player.totalSaved / 1000).toFixed(0)}k`} color="blue" />
          </div>
        </section>

        {/* ════════ MISSIONS PATH ════════ */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-1 flex-1 bg-duo-line rounded-full" />
            <h2 className="text-display text-xl sm:text-2xl font-black text-duo-ink uppercase tracking-wider">
              missões
            </h2>
            <div className="h-1 flex-1 bg-duo-line rounded-full" />
          </div>

          <div ref={pathRef} className="relative overflow-x-clip">
            {trailDims.w > 0 && (
              <svg
                className="absolute inset-0 pointer-events-none"
                width={trailDims.w}
                height={trailDims.h}
                viewBox={`0 0 ${trailDims.w} ${trailDims.h}`}
                fill="none"
                aria-hidden="true"
                style={{ zIndex: 0 }}
              >
                {/* full path, dotted — the road ahead */}
                <path
                  d={fullTrailD}
                  stroke="#E2E1D8"
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray="1 17"
                />
                {/* completed portion, solid green — draws itself in */}
                {fillEnd >= 1 && (
                  <m.path
                    key={`trail-done-${fillEnd}`}
                    d={doneTrailD}
                    stroke="#58CC02"
                    strokeWidth={6}
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{
                      pathLength: { duration: 1.1, ease: "easeInOut" },
                      opacity: { duration: 0.25 },
                    }}
                  />
                )}
              </svg>
            )}
            <div className="relative" style={{ zIndex: 1 }}>
              {INCIDENTS.map((inc, i) => {
                const isLocked = inc.minLevel > lvlIdx;
                const best = bestByInc[inc.id];
                const isDone = !!best;
                const isCurrent = i === currentIdx; // only the next playable mission
                // Winding path: nodes alternate left/right as you go down.
                const side: "left" | "right" = i % 2 === 0 ? "left" : "right";

                return (
                  <MissionNode
                    key={inc.id}
                    incident={inc}
                    isLocked={isLocked}
                    isDone={isDone}
                    isCurrent={isCurrent}
                    best={best}
                    index={i}
                    side={side}
                    circleRef={(el) => {
                      circleRefs.current[i] = el;
                    }}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════ ACHIEVEMENTS ════════ */}
        {ownedAchievements.length > 0 && (
          <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-1 flex-1 bg-duo-line rounded-full" />
              <h2 className="text-display text-xl sm:text-2xl font-black text-duo-ink uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-5 h-5 text-duo-yellow-dark" />
                conquistas
              </h2>
              <div className="h-1 flex-1 bg-duo-line rounded-full" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ACHIEVEMENTS.map((a) => {
                const owned = player.achievements.includes(a.id);
                return (
                  <div key={a.id} className={`duo-card p-4 text-center ${owned ? "" : "opacity-40 grayscale"}`}>
                    <div className="text-4xl mb-2">{a.icon}</div>
                    <div className="font-black text-duo-ink text-sm mb-0.5 leading-tight">{a.title}</div>
                    <div className="text-duo-ink-soft text-xs font-medium leading-snug">{a.description}</div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ════════ FOOTER ════════ */}
        <footer className="max-w-3xl mx-auto px-4 sm:px-6 mt-12 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 flex-wrap">
            <Link
              href="/leaderboard"
              onClick={() => playSound("page")}
              className="text-sm font-bold text-duo-blue-dark hover:underline flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4" />
              ranking
            </Link>
            <Link
              href="/glossario"
              onClick={() => playSound("page")}
              className="text-sm font-bold text-duo-blue-dark hover:underline flex items-center gap-1.5"
            >
              <BookOpen className="w-4 h-4" />
              glossário
            </Link>
          </div>
          <button
            onClick={() => {
              if (confirm("Apagar todo o progresso (XP, missões e conquistas)? Teu nome é mantido.")) {
                reset();
                clearAllMissionProgress();
              }
            }}
            className="text-sm font-medium text-duo-ink-faded hover:text-duo-red-dark transition"
          >
            <Settings className="w-4 h-4 inline mr-1" />
            resetar
          </button>
        </footer>
      </div>
    </>
  );
}

// ────────────────────────────────────────────
// Atoms
// ────────────────────────────────────────────

function StatBlock({ icon, label, value, color }: { icon: string; label: string; value: string; color: "green" | "yellow" | "blue" | "red" }) {
  const cfg =
    color === "green" ? { bg: "bg-duo-green-light", text: "text-duo-green-dark", border: "border-duo-green" } :
    color === "yellow" ? { bg: "bg-duo-yellow-light", text: "text-duo-yellow-dark", border: "border-duo-yellow" } :
    color === "blue" ? { bg: "bg-duo-blue-light", text: "text-duo-blue-dark", border: "border-duo-blue" } :
    { bg: "bg-duo-red-light", text: "text-duo-red-dark", border: "border-duo-red" };
  return (
    <div className={`rounded-2xl p-3 sm:p-4 ${cfg.bg} border-2 ${cfg.border} text-center`} style={{ borderBottomWidth: 4 }}>
      <div className="text-2xl sm:text-3xl mb-1">{icon}</div>
      <div className={`font-black text-xl sm:text-2xl tabular ${cfg.text} leading-none`}>{value}</div>
      <div className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider mt-1 ${cfg.text} opacity-80`}>
        {label}
      </div>
    </div>
  );
}

function MissionNode({
  incident,
  isLocked,
  isDone,
  isCurrent,
  best,
  index,
  side,
  circleRef,
}: {
  incident: typeof INCIDENTS[0];
  isLocked: boolean;
  isDone: boolean;
  isCurrent: boolean;
  best: string | undefined;
  index: number;
  side: "left" | "right";
  circleRef?: (el: HTMLDivElement | null) => void;
}) {
  const cfg =
    incident.isBoss ? { bg: "bg-duo-purple", border: "border-duo-purple-dark", text: "text-white", glow: "shadow-[0_0_30px_rgba(206,130,255,0.5)]" } :
    isLocked ? { bg: "bg-duo-line", border: "border-duo-line", text: "text-duo-ink-faded", glow: "" } :
    isDone ? { bg: "bg-duo-yellow", border: "border-duo-yellow-dark", text: "text-white", glow: "" } :
    { bg: "bg-duo-green", border: "border-duo-green-dark", text: "text-white", glow: isCurrent ? "shadow-[0_0_24px_rgba(88,204,2,0.35)]" : "" };

  const titleClean = incident.title.replace(/^🔥\s*/, "");

  // Difficulty tier color (Nível 1–4), shown as a chip on every mission.
  const tier = [
    { label: "Nível 1", bg: "bg-duo-green-light", text: "text-duo-green-dark", border: "border-duo-green/40" },
    { label: "Nível 2", bg: "bg-duo-blue-light", text: "text-duo-blue-dark", border: "border-duo-blue/40" },
    { label: "Nível 3", bg: "bg-duo-orange-light", text: "text-duo-orange-dark", border: "border-duo-orange/40" },
    { label: "Nível 4", bg: "bg-duo-red-light", text: "text-duo-red-dark", border: "border-duo-red/40" },
  ][Math.min(incident.minLevel, 3)];

  const inner = (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`relative flex items-center gap-4 ${side === "right" ? "flex-row-reverse" : ""}`}
    >
      {/* Node circle */}
      <div ref={circleRef} className={`relative shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center ${cfg.bg} border-4 ${cfg.border} ${cfg.glow} ${isCurrent ? "card-press" : ""} transition-all`}
        style={{ borderBottomWidth: 8 }}>
        {isLocked && <Lock className={`w-8 h-8 sm:w-9 sm:h-9 ${cfg.text} stroke-[2.5]`} />}
        {!isLocked && isDone && !incident.isBoss && (
          <div className={`text-display font-black ${cfg.text} text-3xl sm:text-4xl drop-shadow-md`}>{best}</div>
        )}
        {!isLocked && !isDone && !incident.isBoss && <Star className={`w-9 h-9 sm:w-10 sm:h-10 ${cfg.text} fill-current drop-shadow-md`} strokeWidth={2.5} />}
        {!isLocked && incident.isBoss && <Crown className={`w-10 h-10 ${cfg.text} fill-current drop-shadow-md`} />}

        {isCurrent && (
          <m.div
            className="absolute -top-12 left-1/2 -translate-x-1/2 chip border-duo-yellow-dark bg-duo-yellow text-duo-yellow-dark text-xs font-black uppercase tracking-wider px-2 py-1 whitespace-nowrap"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.4, repeat: Infinity }}
          >
            COMEÇAR
          </m.div>
        )}
      </div>

      {/* Info card */}
      <div className={`flex-1 min-w-0 ${side === "right" ? "text-right" : ""}`}>
        <div className={`flex items-center gap-2 mb-1 flex-wrap ${side === "right" ? "justify-end" : ""}`}>
          <span className="text-[10px] font-black uppercase tracking-widest text-duo-ink-faded">
            missão {String(index + 1).padStart(2, "0")}
          </span>
          <span className={`chip ${tier.bg} ${tier.text} ${tier.border} text-[10px] px-2 py-0 ${isLocked ? "opacity-70" : ""}`}>
            {tier.label}
          </span>
          {incident.isBoss && (
            <span className="chip border-duo-purple-dark bg-duo-purple/15 text-duo-purple-dark text-[10px] px-2 py-0">
              BOSS
            </span>
          )}
        </div>
        <h3 className={`text-display text-base sm:text-xl font-black leading-tight ${isLocked ? "text-duo-ink-faded" : "text-duo-ink"}`}>
          {titleClean}
        </h3>
        <p className={`text-xs sm:text-sm font-medium leading-snug mt-0.5 line-clamp-1 sm:line-clamp-2 ${isLocked ? "text-duo-ink-faded" : "text-duo-ink-soft"}`}>
          {incident.short}
        </p>
        {!isLocked && incident.services && incident.services.length > 0 && (
          <div className={`mt-2 flex flex-wrap gap-1.5 ${side === "right" ? "justify-end" : ""}`}>
            {incident.services.slice(0, 3).map((s) => (
              <span
                key={s.name}
                className="text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-md bg-duo-orange-light text-duo-orange-dark border border-duo-orange/30"
              >
                {s.name}
              </span>
            ))}
            {incident.services.length > 3 && (
              <span className="text-[10px] font-bold text-duo-ink-faded">+{incident.services.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </m.div>
  );

  if (isLocked) {
    return <div className="py-3">{inner}</div>;
  }

  return (
    <Link
      href={`/incident/${incident.id}`}
      onClick={() => playSound("page")}
      className="block py-3 hover:scale-[1.01] transition-transform"
    >
      {inner}
    </Link>
  );
}
