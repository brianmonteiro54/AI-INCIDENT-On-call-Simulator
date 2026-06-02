import type { Player, IncidentResult } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// ANTI-TAMPER / REHYDRATE SANITIZATION (pure, framework-free → unit-testable)
//
// If the player edits localStorage to give themselves crazy XP, we sanitize on
// rehydrate. These caps match the server-side ones (app/api/submit). The client
// is never the source of truth — the server validates submissions independently
// — but we make tampering obvious by clamping absurd values and recomputing
// aggregates from the (cleaned) history instead of trusting stored totals.
// ──────────────────────────────────────────────────────────────────────────────

export const TOTAL_MISSIONS = 19;
export const MAX_XP_ABSOLUTE = 12_000;
export const MAX_SAVED_ABSOLUTE = 50_000_000;
export const MAX_XP_PER_MISSION = 600;
// 30 min per mission × 19 missions = 34.2M ms. Cap at 100M for safety.
export const MAX_ELAPSED_MS_PER_MISSION = 30 * 60 * 1000;
export const MAX_TOTAL_ELAPSED_MS = 100_000_000;

/** Returns a sanitized player + history (garbage dropped, values clamped, totals recomputed). */
export function sanitizeRehydratedState(state: { player: Player; history: IncidentResult[] }): { player: Player; history: IncidentResult[] } {
  const history = Array.isArray(state.history) ? state.history : [];

  // Validate history entries (drop garbage entries, clamp values).
  const cleanHistory: IncidentResult[] = [];
  for (const h of history) {
    if (!h || typeof h !== "object" || !h.id) continue;
    // Cap individual result XP to plausible range
    const xp = Math.max(0, Math.min(MAX_XP_PER_MISSION, Number((h as IncidentResult).xp) || 0));
    const saved = Math.max(0, Math.min(MAX_SAVED_ABSOLUTE, Number((h as IncidentResult).saved) || 0));
    const elapsedMs = Math.max(0, Math.min(MAX_ELAPSED_MS_PER_MISSION, Number((h as IncidentResult).elapsedMs) || 0));
    cleanHistory.push({ ...h, xp, saved, elapsedMs });
  }

  // Recompute aggregates from history (don't trust stored player.xp)
  let firstSolveXp = 0;
  let firstSolveSaved = 0;
  let firstSolveElapsedMs = 0;
  const idsSeenWhileSumming = new Set<string>();
  for (const h of cleanHistory) {
    if (idsSeenWhileSumming.has(h.id)) continue; // only first-time solve counts (anti-cheat)
    idsSeenWhileSumming.add(h.id);
    firstSolveXp += h.xp;
    firstSolveSaved += h.saved;
    firstSolveElapsedMs += h.elapsedMs ?? 0;
  }

  const safePlayer: Player = {
    ...state.player,
    name: typeof state.player?.name === "string" ? state.player.name.slice(0, 16) : "anon",
    xp: Math.min(MAX_XP_ABSOLUTE, firstSolveXp),
    totalSaved: Math.min(MAX_SAVED_ABSOLUTE, firstSolveSaved),
    totalCost: Math.max(0, Number(state.player?.totalCost) || 0),
    totalElapsedMs: Math.min(MAX_TOTAL_ELAPSED_MS, firstSolveElapsedMs),
    streak: Math.max(0, Math.min(TOTAL_MISSIONS, Number(state.player?.streak) || 0)),
    lastDailyAt: typeof state.player?.lastDailyAt === "number" ? state.player.lastDailyAt : null,
    achievements: Array.isArray(state.player?.achievements) ? state.player.achievements : [],
    soundOn: typeof state.player?.soundOn === "boolean" ? state.player.soundOn : true,
  };

  return { player: safePlayer, history: cleanHistory };
}
