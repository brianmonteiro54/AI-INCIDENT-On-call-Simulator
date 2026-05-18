"use client";

/**
 * Persist mission-in-progress state to localStorage so a page refresh during
 * an active mission doesn't lose progress. Useful for students studying on the
 * subway who lose connection or accidentally hit refresh.
 *
 * One slot per incident id. Keep small — only the data needed to resume.
 */

const STORAGE_KEY_PREFIX = "ai-incident:mission:";
const MAX_AGE_MS = 6 * 60 * 60 * 1000; // 6h — old saves are discarded

export interface MissionProgress {
  incidentId: string;
  step: string;
  revealed: string[];
  attempts: number;
  wrongActions: string[];
  phaseIdx: number;
  bossGrades: string[];
  playerStartedAt: number;
  savedAt: number;
}

function key(id: string): string {
  return `${STORAGE_KEY_PREFIX}${id}`;
}

export function saveMissionProgress(p: Omit<MissionProgress, "savedAt">): void {
  if (typeof window === "undefined") return;
  try {
    const data: MissionProgress = { ...p, savedAt: Date.now() };
    window.localStorage.setItem(key(p.incidentId), JSON.stringify(data));
  } catch {
    /* quota or disabled */
  }
}

export function loadMissionProgress(incidentId: string): MissionProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key(incidentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as MissionProgress;
    if (!parsed || typeof parsed !== "object") return null;
    // Discard stale saves
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) {
      window.localStorage.removeItem(key(incidentId));
      return null;
    }
    // Discard if it doesn't match the incident id (sanity)
    if (parsed.incidentId !== incidentId) return null;
    // Don't restore if we're already past the entrance (briefing is OK to skip)
    if (parsed.step === "briefing") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearMissionProgress(incidentId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key(incidentId));
  } catch {
    /* ignore */
  }
}

/** Clear all stale mission saves on app load. Call once at boot. */
export function cleanupStaleMissionSaves(): void {
  if (typeof window === "undefined") return;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i);
      if (!k || !k.startsWith(STORAGE_KEY_PREFIX)) continue;
      const raw = window.localStorage.getItem(k);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as { savedAt?: number };
        if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
          toRemove.push(k);
        }
      } catch {
        toRemove.push(k);
      }
    }
    toRemove.forEach((k) => window.localStorage.removeItem(k));
  } catch {
    /* ignore */
  }
}
