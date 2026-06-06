import { describe, it, expect } from "vitest";
import {
  signScore,
  verifyScore,
  canonicalScoreString,
  timingSafeEqualHex,
  type SignablePayload,
} from "@/lib/score-signature";

const SECRET = "test-secret-123";

const base: SignablePayload = {
  name: "alice",
  xp: 530,
  totalSaved: 1000,
  totalElapsedMs: 60000,
  completedCount: 3,
  aPlusCount: 2,
  streak: 1,
  ts: 1_700_000_000_000,
};

describe("score signature", () => {
  it("verifies a correctly signed payload", async () => {
    const sig = await signScore(base, SECRET);
    expect(await verifyScore(base, sig, SECRET)).toBe(true);
  });

  it("rejects when any field is tampered", async () => {
    const sig = await signScore(base, SECRET);
    expect(await verifyScore({ ...base, xp: 99999 }, sig, SECRET)).toBe(false);
    expect(await verifyScore({ ...base, name: "bob" }, sig, SECRET)).toBe(false);
    expect(await verifyScore({ ...base, ts: base.ts + 1 }, sig, SECRET)).toBe(false);
  });

  it("rejects a signature made with a different secret", async () => {
    const sig = await signScore(base, "other-secret");
    expect(await verifyScore(base, sig, SECRET)).toBe(false);
  });

  it("rejects an empty signature", async () => {
    expect(await verifyScore(base, "", SECRET)).toBe(false);
  });

  it("canonical string is stable and order-defined", () => {
    expect(canonicalScoreString(base)).toBe("alice|530|1000|60000|3|2|1|1700000000000");
  });

  it("timingSafeEqualHex compares correctly", () => {
    expect(timingSafeEqualHex("abcd", "abcd")).toBe(true);
    expect(timingSafeEqualHex("abcd", "abce")).toBe(false);
    expect(timingSafeEqualHex("ab", "abcd")).toBe(false);
    expect(timingSafeEqualHex("", "")).toBe(false);
  });
});
