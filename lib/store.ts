"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Player, IncidentResult, Grade } from "./types";
import { gradeRank, ACHIEVEMENTS } from "./achievements";
import { setSoundEnabled } from "./sound";

interface GameState {
  player: Player;
  history: IncidentResult[];
  hydrated: boolean;
  newAchievements: string[];

  setName: (name: string) => void;
  setSoundOn: (on: boolean) => void;
  recordResult: (r: IncidentResult) => void;
  clearNewAchievements: () => void;
  reset: () => void;
  setHydrated: (b: boolean) => void;
}

const initialPlayer: Player = {
  name: "anon",
  xp: 0,
  totalSaved: 0,
  totalCost: 0,
  streak: 0,
  lastDailyAt: null,
  achievements: [],
  soundOn: true,
};

function evalAchievements(player: Player, history: IncidentResult[]): { player: Player; newOnes: string[] } {
  const newOnes: string[] = [];
  const updated = { ...player, achievements: [...player.achievements] };
  for (const ach of ACHIEVEMENTS) {
    if (!updated.achievements.includes(ach.id) && ach.check({ player: updated, history })) {
      updated.achievements.push(ach.id);
      newOnes.push(ach.id);
    }
  }
  return { player: updated, newOnes };
}

function bestGradeByIncident(history: IncidentResult[]): Record<string, Grade> {
  const out: Record<string, Grade> = {};
  for (const h of history) {
    const cur = out[h.id];
    if (!cur || gradeRank(h.grade) > gradeRank(cur)) out[h.id] = h.grade;
  }
  return out;
}

// ── ANTI-TAMPER CONSTANTS ───────────────────────────────────────────────────
// If the player edits localStorage to give themselves crazy XP, we sanitize on
// rehydrate. These match the server-side caps. The client is never the source
// of truth — the server validates submissions independently — but we make
// tampering obvious by zeroing-out absurd values.
const TOTAL_MISSIONS = 19;
const MAX_XP_ABSOLUTE = 12_000;
const MAX_SAVED_ABSOLUTE = 50_000_000;
const MAX_XP_PER_MISSION = 600;

/** Returns a sanitized player + history, or null if storage looks tampered beyond repair. */
function sanitizeRehydratedState(state: { player: Player; history: IncidentResult[] }): { player: Player; history: IncidentResult[] } {
  const history = Array.isArray(state.history) ? state.history : [];

  // Validate history entries (drop garbage entries, clamp values).
  const cleanHistory: IncidentResult[] = [];
  for (const h of history) {
    if (!h || typeof h !== "object" || !h.id) continue;
    // Cap individual result XP to plausible range
    const xp = Math.max(0, Math.min(MAX_XP_PER_MISSION, Number((h as IncidentResult).xp) || 0));
    const saved = Math.max(0, Math.min(MAX_SAVED_ABSOLUTE, Number((h as IncidentResult).saved) || 0));
    cleanHistory.push({ ...h, xp, saved });
  }

  // Recompute aggregates from history (don't trust stored player.xp)
  let firstSolveXp = 0;
  let firstSolveSaved = 0;
  const idsSeenWhileSumming = new Set<string>();
  for (const h of cleanHistory) {
    if (idsSeenWhileSumming.has(h.id)) continue; // only first-time solve counts (anti-cheat)
    idsSeenWhileSumming.add(h.id);
    firstSolveXp += h.xp;
    firstSolveSaved += h.saved;
  }

  const safePlayer: Player = {
    ...state.player,
    name: typeof state.player?.name === "string" ? state.player.name.slice(0, 16) : "anon",
    xp: Math.min(MAX_XP_ABSOLUTE, firstSolveXp),
    totalSaved: Math.min(MAX_SAVED_ABSOLUTE, firstSolveSaved),
    totalCost: Math.max(0, Number(state.player?.totalCost) || 0),
    streak: Math.max(0, Math.min(TOTAL_MISSIONS, Number(state.player?.streak) || 0)),
    lastDailyAt: typeof state.player?.lastDailyAt === "number" ? state.player.lastDailyAt : null,
    achievements: Array.isArray(state.player?.achievements) ? state.player.achievements : [],
    soundOn: typeof state.player?.soundOn === "boolean" ? state.player.soundOn : true,
  };

  return { player: safePlayer, history: cleanHistory };
}


export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      player: initialPlayer,
      history: [],
      hydrated: false,
      newAchievements: [],

      setName: (name: string) =>
        set((s) => ({ player: { ...s.player, name: name.trim() || "anon" } })),

      setSoundOn: (on: boolean) => {
        setSoundEnabled(on);
        set((s) => ({ player: { ...s.player, soundOn: on } }));
      },

      recordResult: (r: IncidentResult) => {
        const { player, history } = get();

        // ── DEFENSE IN DEPTH: clamp incoming result to plausible bounds ──
        // The WarRoom calculation should never exceed these, but if someone
        // pokes the React state via DevTools, we cap it here too.
        const safeR: IncidentResult = {
          ...r,
          xp: Math.max(0, Math.min(MAX_XP_PER_MISSION, Number(r.xp) || 0)),
          saved: Math.max(0, Math.min(MAX_SAVED_ABSOLUTE, Number(r.saved) || 0)),
          cost: Math.max(0, Number(r.cost) || 0),
          elapsed: Math.max(0, Number(r.elapsed) || 0),
        };

        // ── ANTI-CHEAT: only the FIRST successful solve of each incident grants XP ──
        // If the player already has a result for this incident, this replay is for
        // practice only — no XP, no saved cost added, no streak change.
        // The result is still recorded so the player can see "best grade" history.
        const isFirstTime = !history.some((h) => h.id === safeR.id);

        // The result that gets stored. If replay, zero out XP/saved/cost so the
        // history reflects "no impact" but keeps the attempt visible.
        const storedResult: IncidentResult = isFirstTime
          ? safeR
          : { ...safeR, xp: 0, saved: 0, cost: 0 };

        const nextHistory = [...history, storedResult];

        // streak: consecutive A+ from end — only counts first-time solves
        let streak = 0;
        if (isFirstTime) {
          for (let i = nextHistory.length - 1; i >= 0; i--) {
            const h = nextHistory[i];
            // skip replays (xp === 0 && grade exists — but check id-was-seen-before)
            const seen = nextHistory.slice(0, i).some((p) => p.id === h.id);
            if (seen) continue;
            if (h.grade === "A+") streak++;
            else break;
          }
        } else {
          streak = player.streak; // unchanged for replays
        }

        const nextPlayer: Player = {
          ...player,
          xp: player.xp + storedResult.xp,
          totalSaved: player.totalSaved + storedResult.saved,
          totalCost: player.totalCost + storedResult.cost,
          streak,
          lastDailyAt: isFirstTime && safeR.isDaily ? Date.now() : player.lastDailyAt,
        };

        const evaluated = evalAchievements(nextPlayer, nextHistory);
        set({
          player: evaluated.player,
          history: nextHistory,
          newAchievements: evaluated.newOnes,
        });

        // ── AUTO-PUBLISH to global leaderboard (fire-and-forget) ──
        // Only on first-time solves (so replays don't spam submissions)
        if (isFirstTime && typeof window !== "undefined" && evaluated.player.name && evaluated.player.name !== "anon") {
          const best = bestGradeByIncident(nextHistory);
          const completedCount = Object.keys(best).length;
          const aPlusCount = Object.values(best).filter((g) => g === "A+").length;
          fetch("/api/submit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: evaluated.player.name,
              xp: evaluated.player.xp,
              totalSaved: evaluated.player.totalSaved,
              completedCount,
              aPlusCount,
              streak: evaluated.player.streak,
            }),
          }).catch(() => {
            /* swallow — best-effort */
          });
        }
      },

      clearNewAchievements: () => set({ newAchievements: [] }),

      reset: () => set({ player: initialPlayer, history: [], newAchievements: [] }),

      setHydrated: (b: boolean) => set({ hydrated: b }),
    }),
    {
      name: "ai-incident-v2",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : { getItem: () => null, setItem: () => {}, removeItem: () => {} } as unknown as Storage)),
      partialize: (s) => ({ player: s.player, history: s.history }),
      onRehydrateStorage: () => (state, error) => {
        if (state) {
          // Sanitize any tampered/corrupted localStorage data before exposing it
          const safe = sanitizeRehydratedState({ player: state.player, history: state.history });
          state.player = safe.player;
          state.history = safe.history;
          // Re-evaluate achievements from clean history (so forged achievements get filtered too)
          const evaluated = evalAchievements(safe.player, safe.history);
          state.player = evaluated.player;
          state.setHydrated(true);
          setSoundEnabled(state.player.soundOn ?? true);
        } else {
          // No persisted state — manually trigger hydrated after a tick
          setTimeout(() => {
            try { useGame.setState({ hydrated: true }); } catch {}
          }, 0);
        }
        if (error) console.error("rehydrate error", error);
      },
    }
  )
);

export { bestGradeByIncident };
