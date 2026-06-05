import { describe, it, expect } from "vitest";
import { isEntryActive, type LeaderboardEntry } from "@/lib/leaderboard-storage";
import { RETENTION_MS } from "@/lib/retention";

const DAY = 24 * 60 * 60 * 1000;

function entry(at: number): LeaderboardEntry {
  return {
    name: "p",
    xp: 100,
    totalSaved: 0,
    totalElapsedMs: 0,
    completedCount: 1,
    aPlusCount: 1,
    streak: 1,
    at,
  };
}

describe("isEntryActive (30-day leaderboard retention)", () => {
  const now = 1_000_000_000_000;

  it("keeps an entry played today", () => {
    expect(isEntryActive(entry(now), now)).toBe(true);
  });

  it("keeps an entry from 29 days ago", () => {
    expect(isEntryActive(entry(now - 29 * DAY), now)).toBe(true);
  });

  it("keeps an entry exactly at the 30-day boundary", () => {
    expect(isEntryActive(entry(now - RETENTION_MS), now)).toBe(true);
  });

  it("drops an entry older than 30 days regardless of its points", () => {
    const ancientButHighScore = { ...entry(now - 31 * DAY), xp: 11_999 };
    expect(isEntryActive(ancientButHighScore, now)).toBe(false);
  });
});
