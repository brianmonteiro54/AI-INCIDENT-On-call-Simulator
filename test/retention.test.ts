import { describe, it, expect } from "vitest";
import { RETENTION_MS, lastActiveTimestamp, isProgressExpired } from "@/lib/retention";
import type { IncidentResult } from "@/lib/types";

const DAY = 24 * 60 * 60 * 1000;

function result(at: number): IncidentResult {
  return {
    id: "x",
    grade: "A+",
    xp: 100,
    cost: 0,
    elapsed: 0,
    saved: 0,
    wouldve: 0,
    actionId: "a",
    actionLabel: "a",
    verdict: "v",
    sub: "s",
    at,
  };
}

describe("RETENTION_MS", () => {
  it("is exactly 30 days", () => {
    expect(RETENTION_MS).toBe(30 * DAY);
  });
});

describe("lastActiveTimestamp", () => {
  it("prefers the explicit timestamp", () => {
    expect(lastActiveTimestamp(5000, [result(1000)])).toBe(5000);
  });

  it("falls back to the newest history entry when no explicit timestamp", () => {
    expect(lastActiveTimestamp(0, [result(1000), result(9000), result(3000)])).toBe(9000);
  });

  it("returns 0 when there is no signal at all", () => {
    expect(lastActiveTimestamp(0, [])).toBe(0);
    expect(lastActiveTimestamp(null, null)).toBe(0);
  });
});

describe("isProgressExpired", () => {
  const now = 1_000_000_000_000;

  it("is NOT expired within the window", () => {
    expect(isProgressExpired(now - 29 * DAY, [], now)).toBe(false);
  });

  it("is NOT expired exactly at the boundary", () => {
    expect(isProgressExpired(now - RETENTION_MS, [], now)).toBe(false);
  });

  it("IS expired just past the window", () => {
    expect(isProgressExpired(now - RETENTION_MS - 1, [], now)).toBe(true);
    expect(isProgressExpired(now - 31 * DAY, [], now)).toBe(true);
  });

  it("uses history when no explicit timestamp", () => {
    expect(isProgressExpired(0, [result(now - 31 * DAY)], now)).toBe(true);
    expect(isProgressExpired(0, [result(now - 10 * DAY)], now)).toBe(false);
  });

  it("never expires a fresh/legacy install with no signal (timestamp 0)", () => {
    expect(isProgressExpired(0, [], now)).toBe(false);
    expect(isProgressExpired(null, null, now)).toBe(false);
  });
});
