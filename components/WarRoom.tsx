"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, AlertTriangle, MessageSquare, User, Clock, Activity, Search, ChevronRight, FileText, Check, Eye, Sparkles } from "lucide-react";
import Link from "next/link";
import type { Incident, IncidentResult, Grade, Action, InvestigateAction, DecisionAction, BossPhase, Metric, LogLine } from "@/lib/types";
import { sevColor, sevBg, sevLabel, formatTime, gradeColor } from "@/lib/levels";
import { gradeRank } from "@/lib/achievements";
import { FINDINGS } from "@/lib/findings";
import { useGame } from "@/lib/store";
import {
  playSound,
  startAlarmLoop,
  stopAlarmLoop,
} from "@/lib/sound";
import { CostTicker } from "./CostTicker";
import { Spark } from "./Spark";
import { LogConsole } from "./LogConsole";
import { ResultScreen } from "./ResultScreen";
import { InvestigationModal } from "./InvestigationModal";
import { DecisionConfirmModal } from "./DecisionConfirmModal";
import { DeploymentOverlay } from "./DeploymentOverlay";

interface Props {
  incident: Incident;
  isDaily: boolean;
}

export function WarRoom({ incident, isDaily }: Props) {
  const player = useGame((s) => s.player);
  const recordResult = useGame((s) => s.recordResult);

  const isBoss = !!incident.isBoss && !!incident.phases?.length;
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(
    isBoss ? incident.phases![0].duration : 0
  );
  const [bossGrades, setBossGrades] = useState<Grade[]>([]);

  const [elapsed, setElapsed] = useState(incident.initialElapsed);
  const [cost, setCost] = useState(incident.initialCost);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [result, setResult] = useState<IncidentResult | null>(null);
  const [decided, setDecided] = useState(false);

  // modals
  const [activeFindingKey, setActiveFindingKey] = useState<string | null>(null);
  const [pendingDecision, setPendingDecision] = useState<DecisionAction | null>(null);
  const [showNotebook, setShowNotebook] = useState(false);
  const [deploying, setDeploying] = useState<{ action: DecisionAction; grade: Grade; actionId: string; verdict: string; sub: string; costDelta: number; xp: number; perfect: boolean; isBossNonFinal: boolean } | null>(null);

  // current phase data (boss) or root incident
  const currentMetrics: Metric[] = isBoss
    ? incident.phases![phaseIdx].metrics
    : incident.metrics;
  const currentLogs: LogLine[] = isBoss
    ? [...incident.logs.slice(0, 3), ...incident.phases![phaseIdx].logs]
    : incident.logs;
  const currentActions: Action[] = isBoss
    ? incident.phases![phaseIdx].actions
    : incident.actions;

  // alarms for SEV-0/SEV-1
  useEffect(() => {
    if (incident.sev <= 1 && !decided) {
      const t = setTimeout(() => startAlarmLoop(), 600);
      return () => {
        clearTimeout(t);
        stopAlarmLoop();
      };
    }
    return () => stopAlarmLoop();
  }, [incident.sev, decided]);

  // cost + elapsed ticker
  useEffect(() => {
    if (decided || deploying) return;
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      setCost((c) => c + incident.ratePerMin / 60);
    }, 1000);
    return () => clearInterval(t);
  }, [decided, deploying, incident.ratePerMin]);

  // phase auto-escalate (boss)
  useEffect(() => {
    if (!isBoss || decided || deploying) return;
    setPhaseTimeLeft(incident.phases![phaseIdx].duration);
    const t = setInterval(() => {
      setPhaseTimeLeft((p) => {
        if (p <= 1) {
          // auto-fail this phase
          clearInterval(t);
          handleBossPhaseTimeout();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIdx, isBoss, decided, deploying]);

  function handleBossPhaseTimeout() {
    playSound("fail");
    // timeout = D grade in this phase
    setBossGrades((g) => [...g, "D"]);
    advanceBossOrFinish("D", "timeout", "Sistema escalou automaticamente.", "Tempo da fase esgotou.", 8000, 20);
  }

  function advanceBossOrFinish(grade: Grade, actionId: string, verdict: string, sub: string, costDelta: number, xp: number) {
    if (phaseIdx < incident.phases!.length - 1) {
      // advance
      setCost((c) => c + costDelta);
      setPhaseIdx((p) => p + 1);
      playSound("success");
    } else {
      // final phase — compute overall grade as worst of all phases
      const all = [...bossGrades, grade];
      const worst = all.reduce((acc, g) => (gradeRank(g) < gradeRank(acc) ? g : acc), "A+" as Grade);
      finalizeResult(worst, actionId, verdict, sub, costDelta, xp + (worst === "A+" ? 200 : 0));
    }
  }

  function handleInvestigate(a: InvestigateAction) {
    if (revealed.includes(a.reveals)) {
      // re-open the modal to revisit
      setActiveFindingKey(a.reveals);
      return;
    }
    playSound("investigate");
    setRevealed((r) => [...r, a.reveals]);
    setElapsed((e) => e + a.timeCost);
    setActiveFindingKey(a.reveals);
  }

  function openFinding(key: string) {
    setActiveFindingKey(key);
    playSound("investigate");
  }

  function handleDecide(a: DecisionAction, force = false) {
    // Confirmation gate: if non-boss, has investigations, none done, and not forced
    if (!isBoss && !force && investigateActions.length > 0 && revealed.length === 0) {
      setPendingDecision(a);
      playSound("alarm");
      return;
    }

    playSound("click");
    stopAlarmLoop();

    // freeze cost ticker by setting decided early-ish via deploying flag
    if (isBoss) {
      const isFinal = a.grade === "F" || phaseIdx === incident.phases!.length - 1;
      if (!isFinal) {
        // mid-boss phase advance — quick animation
        setDeploying({
          action: a,
          grade: a.grade,
          actionId: a.id,
          verdict: a.verdict,
          sub: a.sub,
          costDelta: a.costDelta,
          xp: a.xp,
          perfect: false,
          isBossNonFinal: true,
        });
        return;
      }
      // final boss decision — show overlay, then finalize
      const all = [...bossGrades, a.grade];
      const worst = all.reduce((acc, g) => (gradeRank(g) < gradeRank(acc) ? g : acc), "A+" as Grade);
      setBossGrades(all);
      setDeploying({
        action: a,
        grade: worst,
        actionId: a.id,
        verdict: a.verdict,
        sub: a.sub,
        costDelta: a.costDelta,
        xp: a.xp,
        perfect: false,
        isBossNonFinal: false,
      });
      return;
    }

    // non-boss: queue deployment animation
    const perfect = revealed.length > 0 && (a.grade === "A" || a.grade === "A+");
    const xpBonus = perfect ? 30 : 0;
    setDeploying({
      action: a,
      grade: a.grade,
      actionId: a.id,
      verdict: a.verdict,
      sub: a.sub,
      costDelta: a.costDelta,
      xp: a.xp + xpBonus,
      perfect,
      isBossNonFinal: false,
    });
  }

  function onDeploymentComplete() {
    if (!deploying) return;
    const d = deploying;
    setDeploying(null);

    if (d.isBossNonFinal) {
      // advance boss phase
      setBossGrades((g) => [...g, d.action.grade]);
      setCost((c) => c + d.costDelta);
      setPhaseIdx((p) => p + 1);
      playSound("success");
      return;
    }

    finalizeResult(d.grade, d.actionId, d.verdict, d.sub, d.costDelta, d.xp, d.perfect);
  }

  function finalizeResult(grade: Grade, actionId: string, verdict: string, sub: string, costDelta: number, xp: number, perfect = false) {
    stopAlarmLoop();
    const finalCost = cost + costDelta;
    const wouldveContinued = (1000 - elapsed) * (incident.ratePerMin / 60);
    const saved = Math.max(0, wouldveContinued - costDelta);
    const action = currentActions.find((x) => x.id === actionId);
    const r: IncidentResult = {
      id: incident.id,
      grade,
      xp,
      cost: finalCost,
      elapsed: elapsed,
      saved,
      wouldve: wouldveContinued,
      actionId,
      actionLabel: action?.name ?? actionId,
      verdict,
      sub,
      at: Date.now(),
      perfect,
      isDaily,
    };
    setCost(finalCost);
    setDecided(true);
    setResult(r);
    recordResult(r);
    if (grade === "A" || grade === "A+") {
      playSound("success");
    } else if (grade === "F" || grade === "D") {
      playSound("fail");
    } else {
      playSound("click");
    }
  }

  const investigateActions = currentActions.filter((a): a is InvestigateAction => "type" in a && a.type === "investigate");
  const decisionActions = currentActions.filter((a): a is DecisionAction => !("type" in a) || a.type !== "investigate");
  const allInvestigated = investigateActions.length > 0 && investigateActions.every((a) => revealed.includes(a.reveals));

  const sevAccentClass =
    incident.sev === 0 ? "text-fuchsia-400" :
    incident.sev === 1 ? "text-blood-400" :
    incident.sev === 2 ? "text-amber-400" :
    "text-cyber-400";

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-20">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            onClick={() => { stopAlarmLoop(); playSound("page"); }}
            className="flex items-center gap-2 text-mono text-xs text-gray-500 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>back to incidents</span>
          </Link>
          {isDaily && (
            <div className="text-mono text-[10px] text-acid-400 uppercase tracking-widest flex items-center gap-2">
              <motion.span
                animate={{ opacity: [1, 0.4, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-acid-400"
              />
              DAILY CHALLENGE · 2x XP
            </div>
          )}
        </div>

        {/* SEV-0 / SEV-1 alarm banner */}
        {incident.sev <= 1 && !decided && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 rounded-lg p-3 flex items-center gap-3 border ${
              incident.sev === 0
                ? "bg-fuchsia-500/15 border-fuchsia-500/40 animate-siren"
                : "bg-blood-500/15 border-blood-500/40 animate-siren"
            }`}
          >
            <AlertTriangle className={`w-5 h-5 ${incident.sev === 0 ? "text-fuchsia-400" : "text-blood-400"} animate-pulse`} />
            <div className="flex-1 text-sm">
              <b className="text-white">{sevLabel(incident.sev)} ACTIVE</b>
              <span className="text-gray-300 ml-2">· {incident.short}</span>
            </div>
            <div className="text-mono text-[10px] text-white/80 uppercase tracking-widest">⚠ alarm active</div>
          </motion.div>
        )}

        {/* Boss phase tracker */}
        {isBoss && !decided && (
          <motion.div
            key={phaseIdx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 glass-elev rounded-lg p-4 border-fuchsia-500/30 glow-fuchsia"
          >
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <div className="text-mono text-[10px] text-fuchsia-300 uppercase tracking-widest">
                BOSS · Fase {phaseIdx + 1}/{incident.phases!.length}
              </div>
              <div className="text-mono text-xs text-fuchsia-200">
                ⏱ <b className="text-white">{formatTime(phaseTimeLeft)}</b> antes da auto-escalação
              </div>
            </div>
            <div className="text-display text-xl font-bold text-white">
              {incident.phases![phaseIdx].name}
            </div>
            <p className="text-sm text-gray-400 mt-1">{incident.phases![phaseIdx].description}</p>
            <div className="flex gap-1 mt-3">
              {incident.phases!.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded ${
                    i < phaseIdx
                      ? "bg-acid-500"
                      : i === phaseIdx
                      ? "bg-fuchsia-400"
                      : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className={`text-mono text-[10px] font-black px-2.5 py-1 rounded ${sevBg(incident.sev)} text-${incident.sev === 2 ? "black" : "white"} tracking-widest`}>
              {sevLabel(incident.sev)}
            </span>
            <span className="text-mono text-[10px] text-gray-500 break-all">{incident.incId}</span>
          </div>
          <h1 className="text-display text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-3">
            {incident.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-mono text-[11px] text-gray-400">
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3" />
              <span>cliente · <b className="text-white">{incident.customer}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" />
              <span>slack · <b className="text-cyber-400">{incident.slack}</b></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>elapsed · <b className="text-blood-400">{formatTime(elapsed)}</b></span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* LEFT: situation */}
          <div className="lg:col-span-2 space-y-5">
            <p className="text-gray-300 leading-relaxed glass-strong rounded-lg p-5">{incident.desc}</p>

            {/* metrics */}
            <div className={`glass rounded-lg p-5 ${decided ? "" : "animate-breath"}`}>
              <div className="flex items-center gap-2 mb-4">
                <Activity className={`w-4 h-4 ${sevAccentClass}`} />
                <h3 className="text-mono text-xs uppercase tracking-widest text-gray-400 font-bold">live metrics</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {currentMetrics.map((m, i) => (
                  <motion.div
                    key={`${phaseIdx}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white/[0.02] border border-white/5 rounded-md p-3"
                  >
                    <div className="text-mono text-[9px] text-gray-500 uppercase tracking-widest">{m.label}</div>
                    <div className={`text-display text-2xl font-bold mt-1 ${
                      m.cls === "red" ? "text-blood-400" :
                      m.cls === "amber" ? "text-amber-400" :
                      m.cls === "green" ? "text-acid-400" :
                      m.cls === "cyan" ? "text-cyber-400" : "text-white"
                    }`}>{m.value}</div>
                    {m.delta && (
                      <div className={`text-mono text-[10px] mt-1 ${
                        m.deltaCls === "up" ? "text-blood-400" :
                        m.deltaCls === "down" ? "text-acid-400" : "text-gray-500"
                      }`}>{m.delta}</div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-4">
                <Spark type={incident.sparkType} />
              </div>
            </div>

            {/* timeline */}
            {!isBoss && (
              <div className="glass rounded-lg p-5">
                <h3 className="text-mono text-xs uppercase tracking-widest text-gray-400 font-bold mb-3">timeline</h3>
                <div className="space-y-2">
                  {incident.timeline.map((ev, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`flex items-start gap-3 p-2 rounded text-sm ${
                        ev.bad ? "bg-blood-500/5 border-l-2 border-blood-500" : "bg-white/[0.015]"
                      }`}
                    >
                      <span className="text-mono text-[10px] text-gray-500 shrink-0 w-16 pt-0.5">{ev.t}</span>
                      <span className="text-gray-300 [&_b]:text-white [&_b]:font-semibold" dangerouslySetInnerHTML={{ __html: ev.ev }} />
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* logs */}
            <div className="glass rounded-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-mono text-xs uppercase tracking-widest text-gray-400 font-bold">cloudwatch logs · live</h3>
                <motion.div
                  className="w-2 h-2 rounded-full bg-blood-500"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                />
              </div>
              <LogConsole logs={currentLogs} />
            </div>

            {/* findings notebook · compact strip */}
            <AnimatePresence>
              {revealed.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="glass rounded-lg p-3 border-cyber-500/20"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-cyber-400" />
                    <h3 className="text-mono text-[10px] uppercase tracking-widest text-cyber-400 font-bold">notebook</h3>
                    <span className="text-mono text-[10px] text-gray-500">· {revealed.length} {revealed.length === 1 ? "anotação" : "anotações"}</span>
                    {allInvestigated && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-auto flex items-center gap-1 text-mono text-[10px] text-acid-400 font-bold"
                      >
                        <Sparkles className="w-3 h-3" />
                        FULL CONTEXT
                      </motion.span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {revealed.map((key) => {
                      const f = FINDINGS[key];
                      if (!f) return null;
                      return (
                        <button
                          key={key}
                          onClick={() => openFinding(key)}
                          className="text-mono text-[10px] px-2 py-1 rounded bg-cyber-500/10 border border-cyber-500/20 text-cyber-300 hover:bg-cyber-500/20 hover:border-cyber-500/40 transition-all flex items-center gap-1"
                        >
                          <Eye className="w-2.5 h-2.5" />
                          <span>{f.title.length > 28 ? f.title.slice(0, 26) + "…" : f.title}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: cost + actions */}
          <div className="space-y-5">
            <CostTicker cost={cost} rate={incident.ratePerMin} highIntensity={incident.sev <= 1} />

            {/* investigate actions */}
            {!isBoss && investigateActions.length > 0 && (
              <div className="glass rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Search className="w-4 h-4 text-cyber-400" />
                  <h3 className="text-mono text-xs uppercase tracking-widest text-cyber-400 font-bold">investigate first</h3>
                  <div className="ml-auto text-mono text-[10px] text-cyber-300">
                    {revealed.length}/{investigateActions.length}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                  Sêniores investigam antes de agir. <span className="text-cyber-300">+30 XP</span> de bonus se a decisão for A/A+.
                </p>
                <div className="space-y-2">
                  {investigateActions.map((a) => {
                    const done = revealed.includes(a.reveals);
                    return (
                      <button
                        key={a.id}
                        onClick={() => handleInvestigate(a)}
                        onMouseEnter={() => playSound("hover")}
                        disabled={decided || !!deploying}
                        className={`w-full text-left rounded-md px-3 py-2.5 border transition-all text-sm group ${
                          done
                            ? "bg-cyber-500/8 border-cyber-500/25 text-cyber-200 hover:bg-cyber-500/15 hover:border-cyber-500/40"
                            : "bg-white/[0.02] border-white/8 hover:border-cyber-500/40 hover:bg-cyber-500/10 text-gray-200"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium flex items-center gap-2 min-w-0">
                            {done && <Check className="w-3 h-3 text-acid-400 shrink-0" />}
                            <span className="truncate">{a.name}</span>
                          </span>
                          <span className="text-mono text-[10px] text-cyber-400 shrink-0 group-hover:text-cyber-300">
                            {done ? "revisar →" : a.hint}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* decision actions */}
            <div className={`glass rounded-lg p-5 transition-all ${allInvestigated ? "border-acid-500/30 glow-green" : ""}`}>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-mono text-xs uppercase tracking-widest text-acid-400 font-bold">decide & act</h3>
                {allInvestigated && (
                  <motion.span
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="text-mono text-[9px] bg-acid-500/20 text-acid-300 px-1.5 py-0.5 rounded-full border border-acid-500/30 font-bold"
                  >
                    +30 XP READY
                  </motion.span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">A escolha define a nota. O custo do incidente para no momento que tu age.</p>
              {!isBoss && !allInvestigated && investigateActions.length > 0 && revealed.length > 0 && (
                <p className="text-mono text-[10px] text-amber-400/80 mb-3 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>ainda tem {investigateActions.length - revealed.length} pista pra checar pro full context bonus.</span>
                </p>
              )}
              <div className="space-y-2">
                {decisionActions.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => handleDecide(a)}
                    onMouseEnter={() => playSound("hover")}
                    disabled={decided || !!deploying}
                    className="w-full text-left rounded-md px-3 py-3 border bg-white/[0.02] border-white/8 hover:border-acid-500/40 hover:bg-acid-500/8 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="font-semibold text-sm text-gray-100 group-hover:text-white">{a.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-acid-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
                    </div>
                    <div className="text-mono text-[10px] text-gray-500 mt-1">{a.hint}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Investigation modal */}
      <AnimatePresence>
        {activeFindingKey && FINDINGS[activeFindingKey] && (
          <InvestigationModal
            findingKey={activeFindingKey}
            finding={FINDINGS[activeFindingKey]}
            onClose={() => setActiveFindingKey(null)}
          />
        )}
      </AnimatePresence>

      {/* Decision confirmation */}
      <AnimatePresence>
        {pendingDecision && (
          <DecisionConfirmModal
            actionName={pendingDecision.name}
            pendingCount={investigateActions.length - revealed.length}
            onCancel={() => setPendingDecision(null)}
            onConfirm={() => {
              const a = pendingDecision;
              setPendingDecision(null);
              handleDecide(a, true);
            }}
          />
        )}
      </AnimatePresence>

      {/* Deployment animation */}
      <AnimatePresence>
        {deploying && (
          <DeploymentOverlay
            actionName={deploying.action.name}
            isGood={deploying.grade === "A+" || deploying.grade === "A" || deploying.grade === "A-" || deploying.grade === "B"}
            onComplete={onDeploymentComplete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <ResultScreen
            result={result}
            incident={incident}
            onClose={() => setResult(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
