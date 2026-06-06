import { describe, it, expect } from "vitest";
import { claimSignature } from "@/lib/nonce";

// A fake Redis implementing just SET ... NX (first write wins).
function fakeRedis() {
  const seen = new Set<string>();
  return {
    seen,
    set: async (key: string, _v: number, _opts: { nx: true; ex: number }) => {
      if (seen.has(key)) return null; // already exists → NX fails
      seen.add(key);
      return "OK";
    },
  };
}

describe("claimSignature (single-use nonce)", () => {
  it("allows the first use and rejects the second (replay)", async () => {
    const redis = fakeRedis();
    expect(await claimSignature("sig-abc", redis)).toBe(true);
    expect(await claimSignature("sig-abc", redis)).toBe(false);
    expect(await claimSignature("sig-abc", redis)).toBe(false);
  });

  it("treats distinct signatures independently", async () => {
    const redis = fakeRedis();
    expect(await claimSignature("sig-1", redis)).toBe(true);
    expect(await claimSignature("sig-2", redis)).toBe(true);
    expect(await claimSignature("sig-1", redis)).toBe(false);
  });

  it("allows empty signature (unsigned flow) without touching the store", async () => {
    const redis = fakeRedis();
    expect(await claimSignature("", redis)).toBe(true);
    expect(redis.seen.size).toBe(0);
  });

  it("degrades to allow when no store is available", async () => {
    expect(await claimSignature("sig-x", null)).toBe(true);
  });

  it("fails open if the store throws", async () => {
    const throwing = {
      set: async () => {
        throw new Error("redis down");
      },
    };
    expect(await claimSignature("sig-y", throwing)).toBe(true);
  });
});
