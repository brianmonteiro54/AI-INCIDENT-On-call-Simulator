"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { X, Search, ChevronRight, Check, Flame, Sparkles, Volume2, VolumeX, ArrowRight, Eye, AlertCircle, MessageSquare } from "lucide-react";
import type { Incident, IncidentResult, Grade, Action, InvestigateAction, DecisionAction, Metric, LogLine } from "@/lib/types";
import { sevLabel, formatTime } from "@/lib/levels";
import { gradeRank } from "@/lib/achievements";
import { FINDINGS } from "@/lib/findings";
import { useGame } from "@/lib/store";
import { playSound, stopAlarmLoop } from "@/lib/sound";
import { haptic } from "@/lib/haptic";
import { saveMissionProgress, loadMissionProgress, clearMissionProgress } from "@/lib/mission-progress";
import { Mascot, type MascotExpression } from "./Mascot";
import { ResultScreen } from "./ResultScreen";
import { ConsoleFrame } from "./ConsoleFrame";
import { SlackThread } from "./SlackThread";
import { PollyFindingInteractive } from "./PollyFindingInteractive";

interface Props {
  incident: Incident;
  isDaily: boolean;
}

type Step = "briefing" | "investigation" | "finding" | "decide" | "checking" | "feedback" | "quiz";

export function WarRoom({ incident, isDaily }: Props) {
  const player = useGame((s) => s.player);
  const setSoundOn = useGame((s) => s.setSoundOn);
  const recordResult = useGame((s) => s.recordResult);

  const isBoss = !!incident.isBoss && !!incident.phases?.length;
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [phaseTimeLeft, setPhaseTimeLeft] = useState(isBoss ? incident.phases![0].duration : 0);
  const [bossGrades, setBossGrades] = useState<Grade[]>([]);

  const [step, setStep] = useState<Step>("briefing");
  const [elapsed, setElapsed] = useState(incident.initialElapsed);
  const [cost, setCost] = useState(incident.initialCost);
  const [revealed, setRevealed] = useState<string[]>([]);
  const [currentFinding, setCurrentFinding] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<DecisionAction | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; grade: Grade; verdict: string; sub: string; xp: number; perfect: boolean; costDelta: number; actionId: string } | null>(null);
  const [speedBonus, setSpeedBonus] = useState(0);
  const [wrongActions, setWrongActions] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
  const [wrongFeedback, setWrongFeedback] = useState<{ name: string; sub: string } | null>(null);
  const [result, setResult] = useState<IncidentResult | null>(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizSelectedIdx, setQuizSelectedIdx] = useState<number | null>(null);
  const [quizRevealed, setQuizRevealed] = useState(false);

  // ── SHUFFLE QUIZ OPTIONS ──
  // Randomize the option order at mount time so the correct answer doesn't
  // always sit in the same position (which we noticed was concentrated on B/C).
  // `shuffled` is an array of original indices in the new display order.
  // E.g. shuffled=[2,0,3,1] means: render original opt[2] first, opt[0] second, etc.
  // We resolve correctness by comparing the SELECTED display position back to
  // the original correctIdx via this mapping.
  const [quizShuffleOrder] = useState<number[]>(() => {
    if (!incident.quizQuestion) return [];
    const n = incident.quizQuestion.options.length;
    const order = Array.from({ length: n }, (_, i) => i);
    // Fisher-Yates
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    return order;
  });

  // Real player time (since this WarRoom mounted) — used for display & speed bonus
  const playerStartedAtRef = useRef<number>(Date.now());

  // ── RESTORE PROGRESS on mount (if user refreshed mid-mission) ──
  // Only run once per mount. Sets initial state from localStorage if present.
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    const saved = loadMissionProgress(incident.id);
    if (!saved) return;
    // Only restore valid steps
    const allowed: Step[] = ["investigation", "decide", "finding"];
    if (!allowed.includes(saved.step as Step)) return;
    // Restore step state
    setStep(saved.step === "finding" ? "investigation" : (saved.step as Step));
    setRevealed(saved.revealed);
    setAttempts(saved.attempts);
    setWrongActions(saved.wrongActions);
    if (isBoss) {
      setPhaseIdx(saved.phaseIdx);
      setBossGrades(saved.bossGrades as Grade[]);
    }
    playerStartedAtRef.current = saved.playerStartedAt;
  }, [incident.id, isBoss]);

  // ── SAVE PROGRESS on key state changes ──
  useEffect(() => {
    // Don't save the briefing (entry point) — keeps clean UX on first load
    // Don't save once feedback/result reached — at that point the mission is over
    if (step === "briefing" || step === "feedback" || step === "checking") return;
    saveMissionProgress({
      incidentId: incident.id,
      step,
      revealed,
      attempts,
      wrongActions,
      phaseIdx,
      bossGrades,
      playerStartedAt: playerStartedAtRef.current,
    });
  }, [step, revealed, attempts, wrongActions, phaseIdx, bossGrades, incident.id]);

  const currentMetrics: Metric[] = isBoss ? incident.phases![phaseIdx].metrics : incident.metrics;
  const currentLogs: LogLine[] = isBoss
    ? [...incident.logs.slice(0, 3), ...incident.phases![phaseIdx].logs]
    : incident.logs;
  const currentActions: Action[] = isBoss ? incident.phases![phaseIdx].actions : incident.actions;

  const investigateActions = useMemo(
    () => currentActions.filter((a): a is InvestigateAction => "type" in a && a.type === "investigate"),
    [currentActions]
  );
  const decisionActions = useMemo(
    () => currentActions.filter((a): a is DecisionAction => !("type" in a) || a.type !== "investigate"),
    [currentActions]
  );
  const allInvestigated = investigateActions.length > 0 && investigateActions.every((a) => revealed.includes(a.reveals));

  // —— Cost ticker (silent background) ——
  useEffect(() => {
    if (step === "feedback" || step === "checking") return;
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      setCost((c) => c + incident.ratePerMin / 60);
    }, 1000);
    return () => clearInterval(t);
  }, [step, incident.ratePerMin]);

  // —— Boss phase timer ——
  useEffect(() => {
    if (!isBoss || step === "feedback" || step === "checking") return;
    setPhaseTimeLeft(incident.phases![phaseIdx].duration);
    const t = setInterval(() => {
      setPhaseTimeLeft((p) => {
        if (p <= 1) { clearInterval(t); handleBossPhaseTimeout(); return 0; }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phaseIdx, isBoss, step]);

  // Stop alarm always (this is friendly UX, no alarm)
  useEffect(() => {
    stopAlarmLoop();
    return () => stopAlarmLoop();
  }, []);

  // —— Handlers ——
  function handleBossPhaseTimeout() {
    playSound("fail");
    setBossGrades((g) => [...g, "D"]);
    advanceBossOrFinish("D", "timeout", "Sistema escalou automaticamente.", "Tempo da fase esgotou.", 8000, 20);
  }

  function advanceBossOrFinish(grade: Grade, actionId: string, verdict: string, sub: string, costDelta: number, xp: number) {
    if (phaseIdx < incident.phases!.length - 1) {
      setCost((c) => c + costDelta);
      setPhaseIdx((p) => p + 1);
      setStep("briefing");
      setRevealed([]);
      setSelectedAction(null);
      playSound("success");
    } else {
      const all = [...bossGrades, grade];
      const worst = all.reduce((acc, g) => (gradeRank(g) < gradeRank(acc) ? g : acc), "A+" as Grade);
      finalizeResult(worst, actionId, verdict, sub, costDelta, xp + (worst === "A+" ? 200 : 0));
    }
  }

  function startInvestigation() {
    if (investigateActions.length === 0) {
      setStep("decide");
    } else if (investigateActions.length === 1) {
      // Shortcut: only one clue, skip the list and open it directly.
      openFinding(investigateActions[0]);
      return; // openFinding already plays sound
    } else {
      setStep("investigation");
    }
    playSound("tick");
  }

  function openFinding(a: InvestigateAction) {
    if (!revealed.includes(a.reveals)) {
      setRevealed((r) => [...r, a.reveals]);
      setElapsed((e) => e + a.timeCost);
    }
    setCurrentFinding(a.reveals);
    setStep("finding");
    playSound("investigate");
  }

  function closeFinding() {
    setCurrentFinding(null);
    // If there was only one clue, no point going back to an empty list — go to decide.
    if (investigateActions.length === 1) {
      setStep("decide");
      setSelectedAction(null);
      playSound("page");
      return;
    }
    setStep("investigation");
    playSound("tick");
  }

  function goToDecide() {
    setStep("decide");
    setSelectedAction(null);
    playSound("page");
  }

  function checkAnswer() {
    if (!selectedAction) return;
    setStep("checking");
    playSound("click");

    setTimeout(() => {
      const a = selectedAction;
      const isCorrect = a.grade === "A+" || a.grade === "A";
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (isCorrect) {
        // Compute final grade — downgrade by attempts
        let finalGrade: Grade = a.grade;
        if (newAttempts === 2) finalGrade = a.grade === "A+" ? "A" : "A-";
        else if (newAttempts === 3) finalGrade = "B";
        else if (newAttempts >= 4) finalGrade = "C";

        // —— NEW SCORING: multiplicative for fairer competition ——
        // playerElapsedSec = real player time since this WarRoom mounted
        const playerElapsedSec = Math.floor((Date.now() - playerStartedAtRef.current) / 1000);

        // SPEED MULTIPLIER: rewards speed strongly so 100 students competing
        // get meaningfully different scores based on how fast they solved it.
        //   ≤ 30s   → 1.50× (max)
        //   60s    → 1.30×
        //   120s   → 1.05×
        //   180s   → 0.85×
        //   300s   → 0.55×
        //   ≥ 360s → 0.50× (floor)
        const speedMultiplier = (() => {
          if (playerElapsedSec <= 30) return 1.5;
          if (playerElapsedSec >= 360) return 0.5;
          // Linear decay from 1.5 (at 30s) to 0.5 (at 360s)
          return 1.5 - ((playerElapsedSec - 30) / 330);
        })();

        // ACCURACY MULTIPLIER: each wrong attempt reduces multiplier
        //   1 try  → 1.0×
        //   2 try  → 0.8×
        //   3 try  → 0.6×
        //   4+ try → 0.4×
        const accuracyMultiplier = Math.max(0.4, 1.0 - (newAttempts - 1) * 0.2);

        // INVESTIGATION BONUS: flat +30 if player investigated everything before deciding
        const perfect = newAttempts === 1 && revealed.length > 0 && allInvestigated;
        const investBonus = perfect ? 30 : 0;

        // Compute final XP
        const xpEarned = Math.max(
          10,
          Math.round(a.xp * speedMultiplier * accuracyMultiplier) + investBonus
        );

        const grade: Grade = isBoss
          ? (phaseIdx === incident.phases!.length - 1
            ? [...bossGrades, finalGrade].reduce((acc, g) => (gradeRank(g) < gradeRank(acc) ? g : acc), "A+" as Grade)
            : finalGrade)
          : finalGrade;

        setFeedback({
          correct: true,
          grade,
          verdict: a.verdict,
          sub: a.sub,
          xp: xpEarned,
          perfect,
          costDelta: a.costDelta,
          actionId: a.id,
        });
        setSpeedBonus(Math.round((speedMultiplier - 1) * 100)); // for display: -50 to +50 (%)
        playSound("success");
        haptic("success");
        setStep("feedback");
      } else {
        // WRONG — marca opção, volta pro decide (sem game over, tenta até acertar)
        setWrongActions((w) => [...w, a.id]);
        setWrongFeedback({ name: a.name, sub: a.sub });
        playSound("fail");
        haptic("fail");

        setSelectedAction(null);
        setStep("decide");
        setTimeout(() => setWrongFeedback(null), 6000);
      }
    }, 500);
  }

  function handleContinue() {
    if (!feedback) return;

    if (isBoss && phaseIdx < incident.phases!.length - 1) {
      // mid-boss, advance phase
      setCost((c) => c + feedback.costDelta);
      setBossGrades((g) => [...g, selectedAction!.grade]);
      setPhaseIdx((p) => p + 1);
      setStep("briefing");
      setRevealed([]);
      setSelectedAction(null);
      setFeedback(null);
      setWrongActions([]);
      setAttempts(0);
      setWrongFeedback(null);
      return;
    }

    // If this incident has a theory quiz, show it before finalizing.
    // Skip the quiz on replays (already-solved missions) — the quiz is for reinforcement on first solve.
    const alreadySolved = result !== null; // shouldn't happen here but guard anyway
    if (incident.quizQuestion && !quizCompleted && !alreadySolved) {
      setStep("quiz");
      return;
    }

    finalizeResult(feedback.grade, feedback.actionId, feedback.verdict, feedback.sub, feedback.costDelta, feedback.xp, feedback.perfect);
  }

  function handleQuizComplete(quizCorrect: boolean) {
    if (!feedback) return;
    setQuizCompleted(true);
    // Quiz bonus: +25 XP for correct answer, 0 for wrong (but mission XP unchanged)
    const xpWithQuiz = quizCorrect ? feedback.xp + 25 : feedback.xp;
    finalizeResult(feedback.grade, feedback.actionId, feedback.verdict, feedback.sub, feedback.costDelta, xpWithQuiz, feedback.perfect);
  }

  function finalizeResult(grade: Grade, actionId: string, verdict: string, sub: string, costDelta: number, xp: number, perfect = false) {
    stopAlarmLoop();
    clearMissionProgress(incident.id);
    const finalCost = cost + costDelta;
    const wouldveContinued = (1000 - elapsed) * (incident.ratePerMin / 60);
    const saved = Math.max(0, wouldveContinued - costDelta);
    const action = currentActions.find((x) => x.id === actionId);
    // result.elapsed = REAL player time (not the incident clock)
    const playerElapsedSec = Math.floor((Date.now() - playerStartedAtRef.current) / 1000);
    const r: IncidentResult = {
      id: incident.id,
      grade,
      xp,
      cost: finalCost,
      elapsed: playerElapsedSec,
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
    setResult(r);
    recordResult(r);
  }

  // —— Mascot expression mapping ——
  const mascotExpr: MascotExpression =
    step === "briefing" ? (incident.sev <= 1 ? "alert" : "default") :
    step === "investigation" ? "thinking" :
    step === "finding" ? "happy" :
    step === "decide" ? "thinking" :
    step === "checking" ? "thinking" :
    step === "feedback" ? (feedback?.correct ? "celebrate" : "sad") :
    "default";

  // —— Progress percentage ——
  // Each step has an explicit percentage. More predictable than dividing by total.
  const progressPct =
    step === "briefing" ? 5 :
    step === "investigation" ? 30 :
    step === "finding" ? 45 :
    step === "decide" ? 70 :
    step === "checking" ? 85 :
    step === "feedback" && feedback?.correct ? 95 :
    step === "feedback" ? 70 :
    step === "quiz" ? 98 :
    0;

  return (
    <div className="min-h-screen bg-duo-cream text-duo-ink flex flex-col">
      {/* ════════ TOP BAR ════════ */}
      <header className="sticky top-0 z-30 bg-duo-cream/95 backdrop-blur-sm border-b-2 border-duo-line">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => {
              playSound("tick");
              setShowExitModal(true);
            }}
            className="text-duo-ink-soft hover:text-duo-ink p-1.5 rounded-full hover:bg-duo-line-soft transition"
            aria-label="fechar"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>

          {/* Progress bar */}
          <div className="flex-1 progress-track h-4">
            <motion.div
              className={`progress-fill ${
                step === "feedback" && !feedback?.correct ? "progress-fill-red" :
                step === "feedback" && feedback?.correct ? "progress-fill-green" :
                "progress-fill"
              }`}
              initial={false}
              animate={{ width: `${progressPct}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>

          {/* Attempts counter (only shows if there were wrong attempts) */}
          {wrongActions.length > 0 && (
            <div className="flex items-center gap-1 shrink-0 chip border-duo-orange-dark bg-duo-orange-light text-duo-orange-dark text-xs px-2 py-0.5">
              <span>↩</span>
              <span className="font-black tabular">{wrongActions.length + 1}ª tentativa</span>
            </div>
          )}

          {/* Sound toggle */}
          <button
            onClick={() => { playSound("click"); setSoundOn(!player.soundOn); }}
            className="text-duo-ink-soft hover:text-duo-ink p-1.5 rounded-full hover:bg-duo-line-soft transition shrink-0"
            aria-label={player.soundOn ? "desativar som" : "ativar som"}
          >
            {player.soundOn ? <Volume2 className="w-5 h-5 stroke-[2.5]" /> : <VolumeX className="w-5 h-5 stroke-[2.5]" />}
          </button>
        </div>

        {/* Boss phase pill */}
        {isBoss && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-2 flex items-center gap-2 text-sm">
            <span className="chip border-duo-purple-dark bg-duo-purple-dark/10 text-duo-purple-dark">
              👑 BOSS
            </span>
            <span className="font-bold text-duo-purple-dark">
              Fase {phaseIdx + 1}/{incident.phases!.length} · {incident.phases![phaseIdx].name}
            </span>
            <div className="flex-1" />
            <span className="text-duo-ink-soft text-sm font-bold tabular">⏱ {formatTime(phaseTimeLeft)}</span>
          </div>
        )}

        {isDaily && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-2 flex items-center gap-2 text-sm">
            <span className="chip border-duo-green-dark bg-duo-green-light text-duo-green-dark">
              <Sparkles className="w-3.5 h-3.5" /> DAILY · 2× XP
            </span>
          </div>
        )}
      </header>

      {/* ════════ MAIN STAGE ════════ */}
      <main className="flex-1 flex flex-col">
        <AnimatePresence mode="wait">

          {/* ─── STEP 1: BRIEFING ─── */}
          {step === "briefing" && (
            <motion.section
              key="briefing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6"
            >
              <div className="max-w-2xl w-full mx-auto">
                {/* Mascot + speech bubble */}
                <div className="flex items-end gap-3 sm:gap-5 mb-6">
                  <Mascot expression={mascotExpr} size={140} />
                  <div className="duo-card flex-1 p-5 relative -mb-1">
                    {/* Speech bubble tail */}
                    <div className="absolute -left-3 bottom-6 w-0 h-0 border-t-[10px] border-t-transparent border-r-[14px] border-r-white border-b-[10px] border-b-transparent" />
                    <div className="absolute -left-[14px] bottom-6 w-0 h-0 border-t-[10px] border-t-transparent border-r-[14px] border-r-duo-line border-b-[10px] border-b-transparent" />
                    <div className="flex items-center gap-2 mb-2">
                      <SevPill sev={incident.sev} />
                      <span className="text-duo-ink-soft text-xs font-bold tabular">@{incident.customer}</span>
                    </div>
                    <p className="text-duo-ink font-bold text-base sm:text-lg leading-snug">
                      {incident.sev <= 1 ? "Eita, deu ruim! " : "Tem um problema rolando. "}
                      Bora resolver?
                    </p>
                  </div>
                </div>

                {/* Big incident title card */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 18 }}
                  className="duo-card p-6 sm:p-8 mb-6"
                >
                  <h1 className="text-display text-3xl sm:text-5xl font-black text-duo-ink leading-tight mb-3 tracking-tight">
                    {incident.title.replace(/^🔥\s*/, "")}
                  </h1>
                  <p className="text-duo-ink-soft text-base sm:text-lg leading-relaxed">
                    {incident.desc}
                  </p>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-2 mt-5">
                    <span className="chip border-duo-blue-dark bg-duo-blue-light text-duo-blue-dark">
                      💬 {incident.slack}
                    </span>
                    {!isBoss && incident.short && (
                      <span className="chip border-duo-orange-dark bg-duo-orange-light text-duo-orange-dark">
                        ⚠ {incident.short}
                      </span>
                    )}
                  </div>
                </motion.div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {!isBoss && investigateActions.length > 0 ? (
                    <>
                      <button onClick={startInvestigation} className="duo-btn duo-green flex-1 flex items-center justify-center gap-2">
                        <Search className="w-5 h-5" />
                        <span>{investigateActions.length === 1 ? "ver a pista" : "investigar primeiro"}</span>
                      </button>
                      <button onClick={goToDecide} className="duo-btn duo-white">
                        pular
                      </button>
                    </>
                  ) : (
                    <button onClick={goToDecide} className="duo-btn duo-green w-full flex items-center justify-center gap-2">
                      <span>bora decidir</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {/* ─── STEP 2: INVESTIGATION HUB ─── */}
          {step === "investigation" && (
            <motion.section
              key="investigation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6"
            >
              <div className="max-w-2xl w-full mx-auto">
                <div className="flex items-center gap-3 mb-4">
                  <Mascot expression="thinking" size={90} />
                  <div>
                    <h2 className="text-display text-2xl sm:text-3xl font-black text-duo-ink leading-tight">
                      Olha as pistas antes de decidir
                    </h2>
                    <p className="text-duo-ink-soft text-sm mt-1">
                      Investigar = mais contexto = nota melhor. {revealed.length}/{investigateActions.length} checadas.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 mb-6">
                  {investigateActions.map((a, i) => {
                    const done = revealed.includes(a.reveals);
                    return (
                      <motion.button
                        key={a.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        onClick={() => openFinding(a)}
                        onMouseEnter={() => playSound("hover")}
                        className={`duo-card text-left p-4 sm:p-5 flex items-center gap-4 card-press ${
                          done ? "duo-card-correct" : ""
                        }`}
                      >
                        <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                          done ? "bg-duo-green text-white" : "bg-duo-blue-light text-duo-blue-dark"
                        }`}>
                          {done ? <Check className="w-6 h-6 stroke-[3]" /> : <Eye className="w-6 h-6 stroke-[2.5]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-black text-base sm:text-lg leading-tight ${done ? "text-duo-green-dark" : "text-duo-ink"}`}>
                            {a.name}
                          </div>
                          <div className="text-duo-ink-soft text-sm mt-0.5 font-medium">
                            {done ? "✓ visto · clique pra revisar" : a.hint}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-duo-ink-faded stroke-[3] shrink-0" />
                      </motion.button>
                    );
                  })}
                </div>

                {allInvestigated && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="duo-card duo-card-correct p-4 mb-4 flex items-center gap-3"
                  >
                    <Sparkles className="w-6 h-6 fill-duo-yellow text-duo-yellow-dark shrink-0" />
                    <div className="flex-1 font-bold text-duo-green-dark text-sm sm:text-base">
                      Investigaste tudo! A/A+ agora vale +30 XP bônus 🎯
                    </div>
                  </motion.div>
                )}

                <button onClick={goToDecide} className="duo-btn duo-green w-full flex items-center justify-center gap-2">
                  <span>{allInvestigated ? "pronto pra decidir" : "decidir agora"}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.section>
          )}

          {/* ─── STEP 3: FINDING REVEAL (modal-like inline) ─── */}
          {step === "finding" && currentFinding && FINDINGS[currentFinding] && (
            <motion.section
              key="finding"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col px-4 sm:px-6 py-6"
            >
              <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
                <div className="flex items-start gap-3 mb-5">
                  <div className="shrink-0 w-12 h-12 rounded-2xl bg-duo-blue text-white flex items-center justify-center">
                    <Eye className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <div className="text-duo-blue-dark text-xs font-black uppercase tracking-widest mb-1">pista encontrada · você está em</div>
                    <h2 className="text-display text-2xl sm:text-3xl font-black text-duo-ink leading-tight">
                      {FINDINGS[currentFinding].title}
                    </h2>
                  </div>
                </div>

                {/* Finding rendered inside AWS Console frame */}
                <div className="mb-5 flex-1">
                  <ConsoleFrame findingKey={currentFinding}>
                    {currentFinding === "polly" ? (
                      <PollyFindingInteractive />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: FINDINGS[currentFinding].body }} />
                    )}
                  </ConsoleFrame>
                </div>

                <button onClick={closeFinding} className="duo-btn duo-green w-full flex items-center justify-center gap-2">
                  <span>entendi, próxima</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.section>
          )}

          {/* ─── STEP 4: DECISION ─── */}
          {step === "decide" && (
            <motion.section
              key="decide"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col px-4 sm:px-6 py-6"
            >
              <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <Mascot expression={mascotExpr} size={90} />
                  <div className="flex-1">
                    <h2 className="text-display text-2xl sm:text-3xl font-black text-duo-ink leading-tight">
                      {attempts === 0 ? "Qual a melhor decisão?" : "Tenta outra"}
                    </h2>
                    <p className="text-duo-ink-soft text-sm mt-1">
                      {attempts === 0 ? (
                        <>Escolhe uma opção e bate em <b className="text-duo-green-dark">VERIFICAR</b>.</>
                      ) : (
                        <>Esse não foi · tenta outra. Cada erro tira pontos do XP final.</>
                      )}
                    </p>
                  </div>
                </div>

                {/* Wrong toast — appears after a wrong attempt */}
                <AnimatePresence>
                  {wrongFeedback && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 0.95 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 250, damping: 18 }}
                      className="duo-card duo-card-wrong p-4 mb-4 flex items-center gap-3"
                    >
                      <div className="shrink-0 w-10 h-10 rounded-2xl bg-duo-red text-white flex items-center justify-center font-black text-xl">
                        ✗
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-duo-red-dark text-sm sm:text-base leading-tight">
                          Não foi essa
                        </div>
                        <div className="text-duo-red-dark/80 text-xs font-medium mt-0.5 leading-snug">
                          {wrongFeedback.sub}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hint card — appears after 2+ wrong attempts */}
                {wrongActions.length >= 2 && incident.hint && (
                  <motion.div
                    key="hint-card"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    className="duo-card p-4 mb-4 bg-duo-blue-light border-duo-blue flex items-start gap-3"
                  >
                    <div className="shrink-0 w-10 h-10 rounded-2xl bg-duo-blue text-white flex items-center justify-center text-lg">
                      💡
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-black uppercase tracking-widest text-duo-blue-dark mb-1">
                        dica · pra te ajudar a pensar
                      </div>
                      <div
                        className="text-duo-ink text-sm font-medium leading-snug [&_b]:font-black [&_b]:text-duo-blue-dark"
                        dangerouslySetInnerHTML={{ __html: incident.hint }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Case briefing — Slack-style war room thread */}
                <div className="mb-4">
                  <SlackThread incident={incident} playerName={player.name} />
                </div>

                {/* Pistas encontradas */}
                {revealed.length > 0 && (
                  <FindingsRecap
                    keys={revealed}
                    pendingCount={investigateActions.length - revealed.length}
                    onGoBack={!isBoss && investigateActions.length > revealed.length ? () => { playSound("page"); setStep("investigation"); setSelectedAction(null); } : undefined}
                  />
                )}

                {!isBoss && investigateActions.length > 0 && revealed.length === 0 && (
                  <div className="duo-card p-4 mb-4 bg-duo-yellow-light border-duo-yellow flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-duo-yellow-dark shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-duo-yellow-dark text-sm leading-tight">
                        Decidir sem investigar é arriscado
                      </div>
                      <div className="text-duo-yellow-dark/80 text-xs font-bold mt-0.5 leading-snug mb-2">
                        {investigateActions.length === 1
                          ? <>Tem <b>1 pista</b> esperando. Vale dar uma olhada antes — dá contexto e XP bônus.</>
                          : <>Tem <b>{investigateActions.length} pistas</b> esperando. Investigar dá contexto e XP bônus.</>
                        }
                      </div>
                      <button
                        onClick={() => { setSelectedAction(null); startInvestigation(); }}
                        className="text-xs font-black text-duo-yellow-dark underline underline-offset-2 hover:text-duo-ink"
                      >
                        ← {investigateActions.length === 1 ? "ver a pista" : "voltar e investigar"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Options */}
                <div className="space-y-2.5 flex-1 mb-5">
                  {decisionActions.map((a, i) => {
                    const letter = String.fromCharCode(65 + i);
                    const isSelected = selectedAction?.id === a.id;
                    const isWrong = wrongActions.includes(a.id);
                    return (
                      <motion.button
                        key={a.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => {
                          if (isWrong) return;
                          playSound("tick");
                          setSelectedAction(a);
                        }}
                        disabled={isWrong}
                        onMouseEnter={() => !isWrong && playSound("hover")}
                        className={`duo-card w-full text-left p-4 flex items-center gap-3 card-press transition-opacity ${
                          isWrong ? "duo-card-wrong opacity-60 cursor-not-allowed" :
                          isSelected ? "duo-card-selected" : ""
                        }`}
                      >
                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                          isWrong ? "bg-duo-red text-white" :
                          isSelected ? "bg-duo-blue text-white" :
                          "bg-duo-line-soft text-duo-ink-soft"
                        }`}>
                          {isWrong ? "✗" : letter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`font-black text-base sm:text-lg leading-tight ${
                            isWrong ? "text-duo-red-dark line-through" :
                            isSelected ? "text-duo-blue-dark" :
                            "text-duo-ink"
                          }`}>
                            {a.name}
                          </div>
                          {(() => {
                            const svc = inferDecisionService(a.name);
                            if (!svc) return null;
                            return (
                              <div className="text-xs font-bold mt-1 flex items-center gap-1 text-duo-ink-faded">
                                <span>via</span>
                                <span className={`${
                                  isWrong ? "text-duo-red-dark" :
                                  isSelected ? "text-duo-blue-dark" :
                                  "text-duo-orange-dark"
                                } font-black`}>{svc}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                <button
                  onClick={checkAnswer}
                  disabled={!selectedAction}
                  className={`duo-btn w-full ${selectedAction ? "duo-green" : "duo-white"}`}
                >
                  verificar
                </button>
              </div>
            </motion.section>
          )}

          {/* ─── STEP 5: CHECKING ─── */}
          {step === "checking" && (
            <motion.section
              key="checking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <Mascot expression="thinking" size={140} />
            </motion.section>
          )}

          {/* ─── STEP 6: FEEDBACK ─── */}
          {step === "feedback" && feedback && (
            <motion.section
              key="feedback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-6">
                <div className="max-w-2xl w-full mx-auto text-center">
                  <motion.div
                    initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, damping: 14 }}
                    className="mb-6 flex justify-center"
                  >
                    <Mascot expression={feedback.correct ? "celebrate" : "sad"} size={180} />
                  </motion.div>

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className={`text-display font-black mb-2 text-4xl sm:text-5xl tracking-tight text-duo-green`}>
                      {attempts === 1 ? (
                        <>Mandou bem! <span className="underline decoration-wavy">{feedback.grade}</span></>
                      ) : (
                        <>Acertou! <span className="underline decoration-wavy">{feedback.grade}</span></>
                      )}
                    </div>

                    <p className="text-duo-ink text-lg sm:text-xl font-bold leading-snug mb-2 max-w-xl mx-auto">
                      {feedback.verdict}
                    </p>
                    <p className="text-duo-ink-soft text-sm sm:text-base leading-relaxed max-w-xl mx-auto mb-6">
                      {feedback.sub}
                    </p>

                    {/* XP gain pill */}
                    {feedback.xp > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 250 }}
                        className="inline-flex items-center gap-2 chip border-duo-yellow-dark bg-duo-yellow-light text-duo-yellow-dark text-base px-4 py-2 mb-2"
                      >
                        <Sparkles className="w-4 h-4 fill-duo-yellow-dark" />
                        <span className="font-black">+{feedback.xp} XP</span>
                        {feedback.perfect && <span className="text-duo-green-dark">· 🎯 perfeito</span>}
                      </motion.div>
                    )}

                    {speedBonus > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.55, type: "spring", stiffness: 250 }}
                        className="inline-flex items-center gap-2 chip border-duo-blue-dark bg-duo-blue-light text-duo-blue-dark text-base px-4 py-2 mb-2 ml-2"
                      >
                        <span className="text-base">⚡</span>
                        <span className="font-black">+{speedBonus} velocidade</span>
                      </motion.div>
                    )}

                    {attempts > 1 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.65, type: "spring", stiffness: 250 }}
                        className="inline-flex items-center gap-2 chip border-duo-orange-dark bg-duo-orange-light text-duo-orange-dark text-sm px-3 py-1.5 mb-2 ml-2"
                      >
                        <span>↩</span>
                        <span className="font-bold">tentou {attempts} vez{attempts > 1 ? "es" : ""}</span>
                      </motion.div>
                    )}
                  </motion.div>
                </div>
              </div>

              <div className="sticky bottom-0 left-0 right-0 bg-duo-cream/95 backdrop-blur-sm border-t-2 border-duo-line p-4">
                <div className="max-w-2xl mx-auto">
                  <button onClick={handleContinue} className="duo-btn w-full duo-green">
                    {isBoss && phaseIdx < incident.phases!.length - 1 ? "próxima fase →" : feedback?.correct && incident.quizQuestion ? "responder quiz →" : "continuar"}
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* ─── STEP 7: THEORY QUIZ ─── */}
          {step === "quiz" && incident.quizQuestion && (
            <motion.section
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col px-4 sm:px-6 py-6"
            >
              <div className="max-w-2xl w-full mx-auto flex-1 flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <Mascot expression="thinking" size={90} />
                  <div className="flex-1">
                    <div className="text-xs font-black uppercase tracking-widest text-duo-yellow-dark mb-1">
                      📚 quiz de fixação · +25 XP se acertar
                    </div>
                    <h2 className="text-display text-xl sm:text-2xl font-black text-duo-ink leading-tight">
                      Antes de fechar, uma pergunta da prova:
                    </h2>
                  </div>
                </div>

                {/* Question card */}
                <div className="duo-card p-5 mb-5 bg-duo-yellow-light border-duo-yellow">
                  <p
                    className="text-duo-ink font-black text-base sm:text-lg leading-snug [&_code]:bg-white [&_code]:text-duo-ink [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-mono [&_code]:font-bold [&_code]:text-xs"
                    dangerouslySetInnerHTML={{ __html: incident.quizQuestion.question }}
                  />
                </div>

                {/* Options — rendered in shuffled order, but quizSelectedIdx
                    stores the ORIGINAL index so correctIdx logic is unchanged. */}
                <div className="space-y-2.5 flex-1 mb-5">
                  {quizShuffleOrder.map((originalIdx, displayPos) => {
                    const opt = incident.quizQuestion!.options[originalIdx];
                    const letter = String.fromCharCode(65 + displayPos);
                    const isSelected = quizSelectedIdx === originalIdx;
                    const isCorrect = originalIdx === incident.quizQuestion!.correctIdx;
                    const showResult = quizRevealed;

                    let cardClasses = "duo-card";
                    if (showResult) {
                      if (isCorrect) cardClasses = "duo-card duo-card-correct";
                      else if (isSelected) cardClasses = "duo-card duo-card-wrong";
                      else cardClasses = "duo-card opacity-50";
                    } else if (isSelected) {
                      cardClasses = "duo-card duo-card-selected";
                    }

                    return (
                      <motion.button
                        key={originalIdx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: displayPos * 0.05 }}
                        onClick={() => {
                          if (showResult) return;
                          playSound("tick");
                          haptic("tap");
                          setQuizSelectedIdx(originalIdx);
                        }}
                        onMouseEnter={() => !showResult && playSound("hover")}
                        disabled={showResult}
                        className={`${cardClasses} w-full text-left p-4 flex items-center gap-3 card-press transition`}
                      >
                        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${
                          showResult && isCorrect ? "bg-duo-green text-white" :
                          showResult && isSelected ? "bg-duo-red text-white" :
                          isSelected ? "bg-duo-blue text-white" :
                          "bg-duo-line-soft text-duo-ink-soft"
                        }`}>
                          {showResult && isCorrect ? "✓" : showResult && isSelected ? "✗" : letter}
                        </div>
                        <div
                          className={`flex-1 font-bold text-sm sm:text-base leading-snug ${
                            showResult && isCorrect ? "text-duo-green-dark" :
                            showResult && isSelected ? "text-duo-red-dark" :
                            "text-duo-ink"
                          } [&_code]:bg-duo-yellow-light [&_code]:text-duo-ink [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-mono [&_code]:font-bold [&_code]:text-xs`}
                          dangerouslySetInnerHTML={{ __html: opt }}
                        />
                      </motion.button>
                    );
                  })}
                </div>

                {/* Explanation (after reveal) */}
                <AnimatePresence>
                  {quizRevealed && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className={`duo-card p-4 mb-5 ${
                        quizSelectedIdx === incident.quizQuestion.correctIdx
                          ? "duo-card-correct"
                          : "bg-duo-blue-light border-duo-blue"
                      } flex items-start gap-3`}
                    >
                      <div className={`shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${
                        quizSelectedIdx === incident.quizQuestion.correctIdx
                          ? "bg-duo-green text-white"
                          : "bg-duo-blue text-white"
                      }`}>
                        {quizSelectedIdx === incident.quizQuestion.correctIdx ? "🎉" : "📖"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-black text-sm sm:text-base mb-1 ${
                          quizSelectedIdx === incident.quizQuestion.correctIdx
                            ? "text-duo-green-dark"
                            : "text-duo-blue-dark"
                        }`}>
                          {quizSelectedIdx === incident.quizQuestion.correctIdx
                            ? "Boa! +25 XP de bônus 🎯"
                            : "Não foi essa — mas olha o porquê:"}
                        </div>
                        <div
                          className="text-duo-ink text-sm font-medium leading-relaxed [&_b]:font-black [&_b]:text-duo-ink [&_code]:bg-duo-yellow-light [&_code]:text-duo-ink [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-mono [&_code]:font-bold [&_code]:text-xs"
                          dangerouslySetInnerHTML={{ __html: incident.quizQuestion.explanation }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA */}
              <div className="sticky bottom-0 left-0 right-0 bg-duo-cream/95 backdrop-blur-sm border-t-2 border-duo-line p-4">
                <div className="max-w-2xl mx-auto">
                  {!quizRevealed ? (
                    <button
                      onClick={() => {
                        if (quizSelectedIdx === null) return;
                        playSound("click");
                        const correct = quizSelectedIdx === incident.quizQuestion!.correctIdx;
                        if (correct) { haptic("success"); playSound("success"); }
                        else { haptic("fail"); }
                        setQuizRevealed(true);
                      }}
                      disabled={quizSelectedIdx === null}
                      className={`duo-btn w-full ${quizSelectedIdx !== null ? "duo-green" : "duo-white"}`}
                    >
                      verificar
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        playSound("page");
                        const correct = quizSelectedIdx === incident.quizQuestion!.correctIdx;
                        handleQuizComplete(correct);
                      }}
                      className="duo-btn w-full duo-green"
                    >
                      continuar pro resultado →
                    </button>
                  )}
                </div>
              </div>
            </motion.section>
          )}

        </AnimatePresence>
      </main>

      {/* Confete on correct */}
      {step === "feedback" && feedback?.correct && <Confetti />}

      {/* Exit confirmation modal */}
      <AnimatePresence>
        {showExitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-duo-ink/40 backdrop-blur-sm flex items-center justify-center px-4"
            onClick={() => setShowExitModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
              className="duo-card p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-3">
                <Mascot expression="thinking" size={100} />
              </div>
              <h3 className="text-display text-2xl font-black text-duo-ink text-center mb-2 leading-tight">
                Sair da missão?
              </h3>
              <p className="text-duo-ink-soft text-sm font-medium text-center mb-5 leading-snug">
                Vai perder o progresso desse incident.
              </p>
              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    playSound("page");
                    stopAlarmLoop();
                    clearMissionProgress(incident.id);
                    window.location.href = "/";
                  }}
                  className="duo-btn duo-red w-full"
                >
                  Sair sem salvar
                </button>
                <button
                  onClick={() => {
                    playSound("tick");
                    setShowExitModal(false);
                  }}
                  className="duo-btn duo-white w-full"
                >
                  Continuar resolvendo
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result modal */}
      <AnimatePresence>
        {result && (
          <ResultScreen
            result={result}
            incident={incident}
            onClose={() => setResult(null)}
          />
        )}
      </AnimatePresence>

      <style jsx global>{`
        .prose-finding b { color: #3C3C3C; font-weight: 800; }
        .prose-finding code {
          background: #FFF1AA;
          color: #3C3C3C;
          padding: 2px 6px;
          border-radius: 6px;
          font-family: var(--font-jetbrains), monospace;
          font-size: 0.92em;
          font-weight: 700;
        }
        .prose-finding p { margin: 0.5em 0; }
        .prose-finding ul { margin: 0.5em 0; padding-left: 1.2em; list-style: disc; }
        .prose-finding li { margin: 0.2em 0; }
      `}</style>
    </div>
  );
}

// ───── Atoms ─────

function FindingsRecap({ keys, pendingCount, onGoBack }: { keys: string[]; pendingCount: number; onGoBack?: () => void }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="duo-card duo-card-correct p-4 mb-4">
      <button
        onClick={() => { playSound("tick"); setExpanded((v) => !v); }}
        className="w-full flex items-center gap-3 text-left"
      >
        <div className="shrink-0 w-10 h-10 rounded-2xl bg-duo-green text-white flex items-center justify-center font-black text-lg">
          🔍
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-black uppercase tracking-widest text-duo-green-dark">
            pistas que tu já tem · {keys.length}
          </div>
          <div className="text-duo-green-dark font-bold text-sm leading-tight">
            {expanded ? "click pra ocultar" : "click pra revisar"}
          </div>
        </div>
        <ChevronRight
          className={`w-5 h-5 text-duo-green-dark stroke-[3] shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2">
              {keys.map((k, i) => {
                const f = FINDINGS[k];
                if (!f) return null;
                // strip HTML tags for the recap excerpt
                const plain = f.body.replace(/<[^>]*>/g, "").trim().slice(0, 140);
                return (
                  <div key={k} className="bg-white rounded-xl p-3 border-2 border-duo-green/20" style={{ borderBottomWidth: 3 }}>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-duo-green-dark shrink-0">
                        #{i + 1}
                      </span>
                      <span className="font-black text-duo-ink text-sm leading-tight">{f.title}</span>
                    </div>
                    <p className="text-duo-ink-soft text-xs font-medium leading-snug">
                      {plain}{plain.length >= 140 ? "…" : ""}
                    </p>
                  </div>
                );
              })}

              {pendingCount > 0 && onGoBack && (
                <button
                  onClick={onGoBack}
                  className="w-full text-center text-xs font-black text-duo-green-dark hover:text-duo-ink py-2 underline underline-offset-2"
                >
                  ← voltar e ver as outras {pendingCount} pista{pendingCount > 1 ? "s" : ""}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function inferDecisionService(name: string): string | null {
  const n = name.toLowerCase();
  if (n.includes("rollback")) return "CodeDeploy";
  if (n.includes("guardrail")) return "Bedrock Guardrails";
  if (n.includes("scale") || n.includes("escala") || n.includes("autoscaling")) return "Auto Scaling";
  if (n.includes("page") || n.includes("escalar") || n.includes("staff")) return "PagerDuty";
  if (n.includes("disable") || n.includes("desabilita")) return "IAM";
  if (n.includes("reindex") || n.includes("reindexar")) return "OpenSearch";
  if (n.includes("glossário") || n.includes("glossary") || n.includes("terminolog")) return "Amazon Translate";
  if (n.includes("retreinar") || n.includes("retrain") || n.includes("retreinamento")) return "SageMaker";
  if (n.includes("threshold") || n.includes("limiar")) return "Rekognition";
  if (n.includes("prompt")) return "Bedrock";
  if (n.includes("guardduty") || n.includes("macie")) return "Amazon Macie";
  if (n.includes("vocabulario") || n.includes("vocabulary") || n.includes("vocab")) return "Transcribe Medical";
  if (n.includes("budget") || n.includes("custo") || n.includes("orçamento")) return "AWS Budgets";
  if (n.includes("cache")) return "ElastiCache";
  if (n.includes("dlq") || n.includes("queue") || n.includes("fila")) return "SQS";
  if (n.includes("policy") || n.includes("política")) return "IAM";
  if (n.includes("retry")) return "Lambda Config";
  if (n.includes("limite") || n.includes("limit") || n.includes("quota")) return "Service Quotas";
  if (n.includes("schedule") || n.includes("cron") || n.includes("agenda")) return "EventBridge";
  if (n.includes("filter") || n.includes("filtrar")) return "Bedrock Guardrails";
  if (n.includes("modelo") || n.includes("model")) return "Bedrock";
  return null;
}


function SevPill({ sev }: { sev: number }) {
  const cfg =
    sev === 0 ? { bg: "bg-duo-purple", text: "text-white", border: "border-duo-purple-dark", label: "BOSS" } :
    sev === 1 ? { bg: "bg-duo-red", text: "text-white", border: "border-duo-red-dark", label: "URGENTE" } :
    sev === 2 ? { bg: "bg-duo-orange", text: "text-white", border: "border-duo-orange-dark", label: "ALTA" } :
    { bg: "bg-duo-blue", text: "text-white", border: "border-duo-blue-dark", label: "BAIXA" };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider border-2 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.label}
    </span>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ["#58CC02", "#1CB0F6", "#FFC800", "#FF4B4B", "#CE82FF", "#FF9600"];
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 2 + Math.random() * 1.5;
        const rotation = Math.random() * 360;
        const color = colors[i % colors.length];
        return (
          <motion.div
            key={i}
            initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
            animate={{ y: "110vh", x: (Math.random() - 0.5) * 200, opacity: [1, 1, 0], rotate: rotation }}
            transition={{ duration, delay, ease: "easeIn" }}
            className="absolute top-0 w-2.5 h-3.5 rounded-sm"
            style={{
              left: `${left}%`,
              backgroundColor: color,
            }}
          />
        );
      })}
    </div>
  );
}
