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

export async function getLeaderboard(limit = 50): Promise<LeaderboardEntry[]> {
  const redis = getRedis();
  if (!redis) {
    return [...memoryStore].sort((a, b) => b.xp - a.xp).slice(0, limit);
  }
  try {
    const entries = (await redis.get<LeaderboardEntry[]>(LB_KEY)) ?? [];
    return entries.sort((a, b) => b.xp - a.xp).slice(0, limit);
  } catch {
    return [];
  }
}

export async function submitScore(entry: LeaderboardEntry): Promise<void> {
  const redis = getRedis();

  // dedupe by name — keep best
  function merge(list: LeaderboardEntry[]): LeaderboardEntry[] {
    const byName = new Map<string, LeaderboardEntry>();
    for (const e of [...list, entry]) {
      const prev = byName.get(e.name);
      if (!prev || e.xp > prev.xp) byName.set(e.name, e);
    }
    return Array.from(byName.values())
      .sort((a, b) => b.xp - a.xp)
      .slice(0, MAX_ENTRIES);
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
