import { describe, it, expect } from "vitest";
import {
  sanitizeRehydratedState,
  MAX_XP_PER_MISSION,
  TOTAL_MISSIONS,
} from "@/lib/sanitize-progress";
import type { Player, IncidentResult } from "@/lib/types";

function res(over: Partial<IncidentResult> & { id: string }): IncidentResult {
  return {
    grade: "A+",
    xp: 100,
    cost: 0,
    elapsed: 0,
    saved: 0,
    wouldve: 0,
    actionId: "a1",
    actionLabel: "act",
    verdict: "",
    sub: "",
    at: 0,
    ...over,
  };
}

function player(over: Partial<Player> = {}): Player {
  return {
    name: "Maria",
    xp: 0,
    totalSaved: 0,
    totalCost: 0,
    totalElapsedMs: 0,
    streak: 0,
    lastDailyAt: null,
    achievements: [],
    soundOn: true,
    ...over,
  };
}

describe("sanitizeRehydratedState", () => {
  it("clamps an absurd per-mission XP to the cap", () => {
    const out = sanitizeRehydratedState({
      player: player(),
      history: [res({ id: "m1", xp: 999_999 })],
    });
    expect(out.history[0].xp).toBe(MAX_XP_PER_MISSION);
    expect(out.player.xp).toBe(MAX_XP_PER_MISSION);
  });

  it("recomputes player totals from history (ignores forged stored xp)", () => {
    const out = sanitizeRehydratedState({
      player: player({ xp: 999_999, totalSaved: 999_999 }),
      history: [res({ id: "m1", xp: 100, saved: 50 }), res({ id: "m2", xp: 200, saved: 75 })],
    });
    expect(out.player.xp).toBe(300);
    expect(out.player.totalSaved).toBe(125);
  });

  it("counts only the first solve of each mission (replays grant nothing)", () => {
    const out = sanitizeRehydratedState({
      player: player(),
      history: [res({ id: "m1", xp: 100 }), res({ id: "m1", xp: 100 })],
    });
    expect(out.player.xp).toBe(100); // second m1 ignored in the sum
    expect(out.history).toHaveLength(2); // but both attempts stay in history
  });

  it("drops garbage history entries", () => {
    const dirty = [null, {}, { id: "" }, res({ id: "m1" })] as unknown as IncidentResult[];
    const out = sanitizeRehydratedState({ player: player(), history: dirty });
    expect(out.history).toHaveLength(1);
    expect(out.history[0].id).toBe("m1");
  });

  it("treats a non-array history as empty", () => {
    const out = sanitizeRehydratedState({
      player: player({ xp: 500 }),
      history: undefined as unknown as IncidentResult[],
    });
    expect(out.history).toEqual([]);
    expect(out.player.xp).toBe(0);
  });

  it("truncates an over-long name and falls back to 'anon' for non-strings", () => {
    const long = sanitizeRehydratedState({ player: player({ name: "x".repeat(40) }), history: [] });
    expect(long.player.name).toHaveLength(16);

    const bad = sanitizeRehydratedState({
      player: player({ name: 123 as unknown as string }),
      history: [],
    });
    expect(bad.player.name).toBe("anon");
  });

  it("clamps streak into [0, TOTAL_MISSIONS]", () => {
    expect(sanitizeRehydratedState({ player: player({ streak: 999 }), history: [] }).player.streak).toBe(TOTAL_MISSIONS);
    expect(sanitizeRehydratedState({ player: player({ streak: -5 }), history: [] }).player.streak).toBe(0);
  });
});
