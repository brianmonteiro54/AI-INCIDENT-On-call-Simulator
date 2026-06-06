import { Redis } from "@upstash/redis";

// ──────────────────────────────────────────────────────────────────────────────
// Shared Upstash Redis client.
//
// Returns a single memoized client (or null when the Upstash env vars aren't
// configured — e.g. local dev). Callers MUST handle the null case and fall back
// to in-memory behavior. Used by the leaderboard storage and the distributed
// rate limiter so they share one connection/config.
// ──────────────────────────────────────────────────────────────────────────────

let cached: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (cached !== undefined) return cached; // memoized (including the null case)
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    cached = null;
    return cached;
  }
  try {
    cached = new Redis({ url, token });
  } catch {
    cached = null;
  }
  return cached;
}
