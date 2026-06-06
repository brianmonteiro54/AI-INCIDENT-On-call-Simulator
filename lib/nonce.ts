import { getRedis } from "./redis";

// ──────────────────────────────────────────────────────────────────────────────
// SINGLE-USE SIGNATURE (replay nonce)
//
// The HMAC signature is already unique per request (it covers the `ts`), so we
// use the signature itself as a one-time token. The first time we see it we
// "claim" it in Redis with a TTL; if it shows up again within the TTL we reject
// it as a replay.
//
// This closes the gap left by the freshness window alone: timestamp-freshness
// stops "replay tomorrow", but the same valid request could still be replayed
// MANY times within the 5-minute window. The nonce makes each signed request
// usable exactly once.
//
// TTL is the freshness window + a buffer, so the nonce always outlives the window
// (any request that still passes the freshness check is guaranteed to find a live
// nonce on replay — no boundary gap).
//
// Degrades gracefully: with no Redis (local dev) or on a Redis hiccup it returns
// "first use" (can't enforce single-use, but the freshness window still applies).
// ──────────────────────────────────────────────────────────────────────────────

// Minimal shape we need from the Redis client (keeps this unit-testable).
interface NonceStore {
  set(
    key: string,
    value: number,
    opts: { nx: true; ex: number },
  ): Promise<unknown>;
}

const NONCE_TTL_S = 6 * 60; // 5-minute freshness window + 1-minute buffer

/**
 * Atomically claim a signature for one-time use.
 * @returns true if this is the FIRST use (allow); false if already used (replay → reject).
 */
export async function claimSignature(
  signature: string,
  redis: NonceStore | null = getRedis(),
): Promise<boolean> {
  if (!signature) return true; // unsigned flow — nothing to claim
  if (!redis) return true; // no store → can't enforce; freshness window still applies
  try {
    // SET key 1 NX EX → "OK" if it didn't exist (first use), null if it did (replay)
    const set = await redis.set(`nonce:${signature}`, 1, { nx: true, ex: NONCE_TTL_S });
    return set !== null;
  } catch {
    return true; // fail open on a Redis hiccup — don't block a legit player
  }
}
