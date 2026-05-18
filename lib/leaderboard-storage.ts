import { Redis } from "@upstash/redis";

const LB_KEY = "ai-incident:leaderboard:v1";
const MAX_ENTRIES = 100;

export interface LeaderboardEntry {
  name: string;
  xp: number;
  totalSaved: number;
  completedCount: number;
  aPlusCount: number;
  streak: number;
  at: number;
}

let memoryStore: LeaderboardEntry[] = [];

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

function sortEntries(list: LeaderboardEntry[]): LeaderboardEntry[] {
  // Multi-tier ranking: primary XP, then A+ count, then completion, then streak, then recency
  return [...list].sort((a, b) => {
    if (b.xp !== a.xp) return b.xp - a.xp;
    if (b.aPlusCount !== a.aPlusCount) return b.aPlusCount - a.aPlusCount;
    if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
    if (b.streak !== a.streak) return b.streak - a.streak;
    return b.at - a.at;
  });
}

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const redis = getRedis();
  if (!redis) {
    return sortEntries(memoryStore).slice(0, limit);
  }
  try {
    const entries = (await redis.get<LeaderboardEntry[]>(LB_KEY)) ?? [];
    return sortEntries(entries).slice(0, limit);
  } catch {
    return [];
  }
}

export async function submitScore(entry: LeaderboardEntry): Promise<void> {
  const redis = getRedis();

  // dedupe by name — keep best (using same sort criteria)
  function merge(list: LeaderboardEntry[]): LeaderboardEntry[] {
    const byName = new Map<string, LeaderboardEntry>();
    for (const e of [...list, entry]) {
      const prev = byName.get(e.name);
      if (!prev) {
        byName.set(e.name, e);
        continue;
      }
      // Keep the one with more XP. If tied, more A+. Then completion.
      const better = sortEntries([prev, e])[0];
      byName.set(e.name, better);
    }
    return sortEntries(Array.from(byName.values())).slice(0, MAX_ENTRIES);
  }

  if (!redis) {
    memoryStore = merge(memoryStore);
    return;
  }

  try {
    const current = (await redis.get<LeaderboardEntry[]>(LB_KEY)) ?? [];
    await redis.set(LB_KEY, merge(current));
  } catch {
    /* swallow */
  }
}
