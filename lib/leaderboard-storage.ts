import { RETENTION_MS } from "./retention";
import { getRedis } from "./redis";

// ──────────────────────────────────────────────────────────────────────────────
// LEADERBOARD STORAGE — Redis Sorted Set + Hash
//
// Why not a single JSON array? The old design read the whole list, mutated it
// in memory, and wrote it back. Two players submitting at the same time would
// both read the same list and the last writer would erase the other's entry
// (a classic read-modify-write race).
//
// Now each player is an independent member:
//   • ZSET  (LB_ZSET) → member = name, score = composite rank (for ordering/trim)
//   • HASH  (LB_HASH) → field  = name, value = full entry JSON (for details)
//
// Submits for DIFFERENT players never touch the same key field, so they can't
// clobber each other. We also trim to the top MAX_ENTRIES via ZREMRANGEBYRANK,
// which is O(log n) instead of rewriting the entire list.
//
// (Structure changed → uses fresh v2 keys. The old v1 array isn't migrated;
//  the global board simply starts clean on this version.)
// ──────────────────────────────────────────────────────────────────────────────

const LB_ZSET = "ai-incident:lb:z:v2";
const LB_HASH = "ai-incident:lb:h:v2";
const MAX_ENTRIES = 100;

export interface LeaderboardEntry {
  name: string;
  xp: number;
  totalSaved: number;
  /** Sum of real player time across all first-time solves, in ms. Lower = faster = wins tiebreaker. */
  totalElapsedMs: number;
  completedCount: number;
  aPlusCount: number;
  streak: number;
  at: number;
}

// In-memory fallback (used when Upstash env vars aren't set, e.g. local dev).
let memoryStore: LeaderboardEntry[] = [];

// Redis client comes from lib/redis.ts (shared with the rate limiter).

// Composite score (higher = better), used only to ORDER & TRIM the sorted set.
// Exact tiebreaks are applied in JS by sortEntries() after fetching, so this
// just needs an XP-dominant ordering. Packs three tiers without overlap:
//   XP            → ×1e9   (range 0..1.2e13, well inside JS safe-integer range)
//   aPlusCount    → ×1e7   (0..19  → 0..1.9e8, below the 1e9 XP step)
//   speed (asc)   → (1e6 - elapsedSec)  (0..1e6, below the 1e7 aPlus step)
export function compositeScore(e: LeaderboardEntry): number {
  const elapsedSec = Math.min(1_000_000, Math.round((e.totalElapsedMs ?? 0) / 1000));
  return e.xp * 1e9 + (e.aPlusCount ?? 0) * 1e7 + (1e6 - elapsedSec);
}

// ── 30-DAY RETENTION ──────────────────────────────────────────────────────────
// A player's standing is kept for at most 30 days since their last submission
// (which auto-fires on every play, including replays — see lib/store.ts). After
// that the entry is considered expired: hidden from results and pruned from
// Redis on the next read. `at` is epoch ms of the player's last play.
/** True when the entry was last updated within the retention window. */
export function isEntryActive(e: LeaderboardEntry, now: number = Date.now()): boolean {
  return now - (Number(e?.at) || 0) <= RETENTION_MS;
}

export function sortEntries(list: LeaderboardEntry[]): LeaderboardEntry[] {
  // Multi-tier ranking:
  //   1. XP desc (primary)
  //   2. A+ count desc (quality)
  //   3. totalElapsedMs asc (faster wins on ties — guarantees unique ordering)
  //   4. completedCount desc
  //   5. streak desc
  //   6. at desc (recent submission breaks any remaining tie)
  return [...list].sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    if (b.aPlusCount !== a.aPlusCount) return b.aPlusCount - a.aPlusCount;
    const aMs = a.totalElapsedMs ?? Number.MAX_SAFE_INTEGER;
    const bMs = b.totalElapsedMs ?? Number.MAX_SAFE_INTEGER;
    if (aMs !== bMs) return aMs - bMs;
    if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
    if (b.streak !== a.streak) return b.streak - a.streak;
    return b.at - a.at;
  });
}

/** Pick the "better" of two entries for the same name (never downgrade a player). */
export function bestOf(prev: LeaderboardEntry | null | undefined, next: LeaderboardEntry): LeaderboardEntry {
  if (!prev) return next;
  return sortEntries([prev, next])[0];
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const now = Date.now();
  const redis = getRedis();
  if (!redis) {
    // Drop anyone whose last play was > 30 days ago, then return the top slice.
    memoryStore = memoryStore.filter((e) => isEntryActive(e, now));
    return sortEntries(memoryStore).slice(0, limit);
  }
  try {
    // The hash holds at most MAX_ENTRIES entries (kept trimmed on submit), so
    // reading it all and sorting in JS is cheap and gives exact tiebreak order.
    const map = await redis.hgetall<Record<string, LeaderboardEntry>>(LB_HASH);
    const all = map ? Object.values(map).filter(Boolean) : [];

    // Split into active vs expired (> 30 days since last play).
    const active: LeaderboardEntry[] = [];
    const staleNames: string[] = [];
    for (const e of all) {
      if (isEntryActive(e, now)) active.push(e);
      else if (e?.name) staleNames.push(e.name);
    }

    // Prune expired members so the board self-cleans over time — but do it
    // FIRE-AND-FORGET. The response is built from `active` (already filtered),
    // so the user never waits on this Redis round-trip. Worst case the delete
    // doesn't finish on a cold/frozen invocation; the entries are still hidden
    // from the response and a later request retries the cleanup.
    if (staleNames.length > 0) {
      void redis
        .zrem(LB_ZSET, ...staleNames)
        .then(() => redis.hdel(LB_HASH, ...staleNames))
        .catch(() => {
          /* swallow — best-effort cleanup */
        });
    }

    return sortEntries(active).slice(0, limit);
  } catch {
    return [];
  }
}

export async function submitScore(entry: LeaderboardEntry): Promise<void> {
  const redis = getRedis();

  if (!redis) {
    const others = memoryStore.filter((e) => e.name !== entry.name);
    const best = bestOf(memoryStore.find((e) => e.name === entry.name), entry);
    memoryStore = sortEntries([...others, best]).slice(0, MAX_ENTRIES);
    return;
  }

  try {
    const prev = await redis.hget<LeaderboardEntry>(LB_HASH, entry.name);
    const best = bestOf(prev, entry);

    // Per-member writes: two different players never collide here.
    await redis.zadd(LB_ZSET, { score: compositeScore(best), member: best.name });
    await redis.hset(LB_HASH, { [best.name]: best });

    // Keep only the top MAX_ENTRIES (drop the lowest-scoring overflow).
    const count = await redis.zcard(LB_ZSET);
    if (count > MAX_ENTRIES) {
      const dropTo = count - MAX_ENTRIES - 1; // ranks 0..dropTo are the lowest scores
      const losers = await redis.zrange<string[]>(LB_ZSET, 0, dropTo);
      await redis.zremrangebyrank(LB_ZSET, 0, dropTo);
      if (losers && losers.length > 0) {
        await redis.hdel(LB_HASH, ...losers);
      }
    }
  } catch {
    /* swallow — best-effort */
  }
}
