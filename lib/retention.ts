import type { IncidentResult } from "./types";

// ──────────────────────────────────────────────────────────────────────────────
// RETENTION POLICY — 30-DAY EXPIRY (pure, framework-free → unit-testable)
//
// Both the local browser progress AND a player's standing on the global
// leaderboard are kept for at most 30 days since the player's LAST activity
// ("última jogada"). After that:
//   • local progress is wiped → the app greets the player fresh and re-asks
//     for their name (see lib/store.ts onRehydrateStorage)
//   • the leaderboard entry drops off / is pruned (see lib/leaderboard-storage.ts)
//
// Kept dependency-free (only imports a type) so it runs identically on the
// client, on the server, and inside vitest.
// ──────────────────────────────────────────────────────────────────────────────

/** Maximum time progress is retained after the last play. */
export const RETENTION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Best estimate of when the player was last active.
 * Prefers the explicit `lastActiveAt` timestamp; falls back to the newest
 * history entry; returns 0 when there is no signal at all.
 */
export function lastActiveTimestamp(
  lastActiveAt: number | undefined | null,
  history: IncidentResult[] | undefined | null,
): number {
  const explicit = Number(lastActiveAt) || 0;
  if (explicit > 0) return explicit;
  let mostRecent = 0;
  for (const h of history ?? []) {
    const at = Number(h?.at) || 0;
    if (at > mostRecent) mostRecent = at;
  }
  return mostRecent;
}

/**
 * True when more than RETENTION_MS has elapsed since the last activity.
 *
 * When there is NO signal at all (timestamp 0), we deliberately return false so
 * we never wipe a brand-new install — or a legacy install saved before this
 * field existed — just because it lacks a timestamp.
 */
export function isProgressExpired(
  lastActiveAt: number | undefined | null,
  history: IncidentResult[] | undefined | null,
  now: number = Date.now(),
): boolean {
  const last = lastActiveTimestamp(lastActiveAt, history);
  if (last <= 0) return false;
  return now - last > RETENTION_MS;
}
