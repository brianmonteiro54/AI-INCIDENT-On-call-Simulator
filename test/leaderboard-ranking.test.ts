import { describe, it, expect } from "vitest";
import { sortEntries, compositeScore, bestOf, type LeaderboardEntry } from "@/lib/leaderboard-storage";

function entry(over: Partial<LeaderboardEntry> & { name: string }): LeaderboardEntry {
  return {
    xp: 0,
    totalSaved: 0,
    totalElapsedMs: 0,
    completedCount: 0,
    aPlusCount: 0,
    streak: 0,
    at: 0,
    ...over,
  };
}

const names = (list: LeaderboardEntry[]) => list.map((e) => e.name);

describe("sortEntries", () => {
  it("orders by XP descending (primary)", () => {
    const out = sortEntries([
      entry({ name: "a", xp: 100 }),
      entry({ name: "b", xp: 300 }),
      entry({ name: "c", xp: 200 }),
    ]);
    expect(names(out)).toEqual(["b", "c", "a"]);
  });

  it("breaks an XP tie by A+ count descending", () => {
    const out = sortEntries([
      entry({ name: "a", xp: 100, aPlusCount: 2 }),
      entry({ name: "b", xp: 100, aPlusCount: 5 }),
    ]);
    expect(names(out)).toEqual(["b", "a"]);
  });

  it("breaks an XP + A+ tie by faster time (lower elapsedMs wins)", () => {
    const out = sortEntries([
      entry({ name: "slow", xp: 100, aPlusCount: 3, totalElapsedMs: 5000 }),
      entry({ name: "fast", xp: 100, aPlusCount: 3, totalElapsedMs: 3000 }),
    ]);
    expect(names(out)).toEqual(["fast", "slow"]);
  });

  it("does not mutate the input array", () => {
    const input = [entry({ name: "a", xp: 1 }), entry({ name: "b", xp: 2 })];
    sortEntries(input);
    expect(names(input)).toEqual(["a", "b"]);
  });
});

describe("compositeScore", () => {
  it("increases with XP", () => {
    expect(compositeScore(entry({ name: "x", xp: 200 }))).toBeGreaterThan(
      compositeScore(entry({ name: "y", xp: 100 })),
    );
  });

  it("lets XP dominate A+ count (1 more XP beats a pile of A+)", () => {
    const higherXp = compositeScore(entry({ name: "x", xp: 101, aPlusCount: 0 }));
    const lowerXpManyAPlus = compositeScore(entry({ name: "y", xp: 100, aPlusCount: 19 }));
    expect(higherXp).toBeGreaterThan(lowerXpManyAPlus);
  });
});

describe("bestOf", () => {
  it("returns the incoming entry when there is no previous one", () => {
    const next = entry({ name: "a", xp: 100 });
    expect(bestOf(null, next)).toBe(next);
    expect(bestOf(undefined, next)).toBe(next);
  });

  it("never downgrades a player, regardless of argument order", () => {
    const better = entry({ name: "a", xp: 500 });
    const worse = entry({ name: "a", xp: 100 });
    expect(bestOf(better, worse)).toBe(better);
    expect(bestOf(worse, better)).toBe(better);
  });
});
