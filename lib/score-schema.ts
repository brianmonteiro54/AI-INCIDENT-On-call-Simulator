import { z } from "zod";

// ──────────────────────────────────────────────────────────────────────────────
// SCORE VALIDATION SCHEMA (Zod)
//
// Replaces the hand-rolled Math.min/Math.max coercion + the imperative
// consistency checks. Each numeric field is coerced, invalid/NaN/Infinity → 0,
// then CLAMPED to a hard cap (we clamp rather than reject so a legit player who
// e.g. accumulated a lot of play time over many sessions isn't bounced — only
// truly forged values get neutralized, then caught by the consistency rules).
// ──────────────────────────────────────────────────────────────────────────────

// Realistic ceilings (see derivation in app/api/submit/route.ts history):
export const TOTAL_MISSIONS = 19;
export const ABSOLUTE_XP_CAP = 12_000;
export const ABSOLUTE_SAVED_CAP = 50_000_000;
export const ABSOLUTE_ELAPSED_MS_CAP = 100_000_000; // ~27.7h hard ceiling

export const MIN_XP_PER_MISSION = 10;
export const MAX_XP_PER_MISSION = 600;

/** Coerce → invalid/non-finite to 0 → clamp into [0, max]. */
const clamped = (max: number) =>
  z.coerce
    .number()
    .catch(0)
    .transform((v) => (Number.isFinite(v) ? Math.max(0, Math.min(max, v)) : 0));

export const ScoreSchema = z
  .object({
    xp: clamped(ABSOLUTE_XP_CAP),
    totalSaved: clamped(ABSOLUTE_SAVED_CAP),
    totalElapsedMs: clamped(ABSOLUTE_ELAPSED_MS_CAP),
    completedCount: clamped(TOTAL_MISSIONS),
    aPlusCount: clamped(TOTAL_MISSIONS),
    streak: clamped(TOTAL_MISSIONS),
  })
  .superRefine((v, ctx) => {
    if (v.xp === 0 || v.completedCount === 0) {
      ctx.addIssue({ code: "custom", message: "no progress" });
      return; // the checks below are meaningless without progress
    }
    if (v.aPlusCount > v.completedCount) {
      ctx.addIssue({ code: "custom", message: "aPlus > completed" });
    }
    // streak is consecutive A+ → can't exceed the A+ count
    if (v.streak > v.aPlusCount) {
      ctx.addIssue({ code: "custom", message: "streak > aPlus" });
    }
    // XP must be plausible for the number of missions completed
    if (v.xp < v.completedCount * MIN_XP_PER_MISSION || v.xp > v.completedCount * MAX_XP_PER_MISSION) {
      ctx.addIssue({ code: "custom", message: "xp inconsistent" });
    }
  });

export type ScoreData = z.infer<typeof ScoreSchema>;
