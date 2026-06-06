import { describe, it, expect } from "vitest";
import {
  ScoreSchema,
  ABSOLUTE_XP_CAP,
  ABSOLUTE_SAVED_CAP,
  TOTAL_MISSIONS,
} from "@/lib/score-schema";

function parse(input: unknown) {
  return ScoreSchema.safeParse(input);
}

const valid = {
  xp: 530,
  totalSaved: 1000,
  totalElapsedMs: 60000,
  completedCount: 3,
  aPlusCount: 2,
  streak: 1,
};

describe("ScoreSchema", () => {
  it("accepts a valid payload", () => {
    const r = parse(valid);
    expect(r.success).toBe(true);
  });

  it("coerces numeric strings", () => {
    const r = parse({ ...valid, xp: "530", completedCount: "3" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.xp).toBe(530);
  });

  it("clamps soft fields instead of rejecting (e.g. huge totalSaved)", () => {
    const r = parse({ ...valid, totalSaved: 9_999_999_999 });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.totalSaved).toBe(ABSOLUTE_SAVED_CAP);
  });

  it("rejects forged huge XP via consistency (clamped XP still implausible)", () => {
    const r = parse({ ...valid, xp: 999999, completedCount: TOTAL_MISSIONS, aPlusCount: 2 });
    // xp clamps to ABSOLUTE_XP_CAP (12000) but max plausible for 19 missions is 11400
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("xp inconsistent");
    expect(ABSOLUTE_XP_CAP).toBeGreaterThan(TOTAL_MISSIONS * 600);
  });

  it("rejects no-progress (xp 0 or completedCount 0)", () => {
    expect(parse({ ...valid, xp: 0 }).success).toBe(false);
    expect(parse({ ...valid, completedCount: 0 }).success).toBe(false);
  });

  it("treats invalid/missing numbers as 0 → no progress", () => {
    const r = parse({ ...valid, xp: "abc" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("no progress");
  });

  it("rejects aPlusCount > completedCount", () => {
    const r = parse({ ...valid, aPlusCount: 5, completedCount: 3 });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("aPlus > completed");
  });

  it("rejects streak > aPlusCount", () => {
    const r = parse({ ...valid, streak: 5, aPlusCount: 2 });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("streak > aPlus");
  });

  it("rejects xp below the plausible floor for completedCount", () => {
    const r = parse({ ...valid, xp: 5, completedCount: 3 }); // floor = 30
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0].message).toBe("xp inconsistent");
  });
});
