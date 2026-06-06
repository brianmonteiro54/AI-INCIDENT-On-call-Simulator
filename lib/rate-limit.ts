import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";

// ──────────────────────────────────────────────────────────────────────────────
// DISTRIBUTED RATE LIMITER (official @upstash/ratelimit, sliding window)
//
// On serverless (Vercel) each instance has its own memory, so an in-memory limit
// is trivially bypassed by spreading requests across instances. This uses Upstash
// Redis (shared across all instances) via the official @upstash/ratelimit lib,
// which implements a precise SLIDING WINDOW (no burst at the fixed-window edge)
// and an in-instance ephemeralCache so already-blocked identifiers short-circuit
// without another Redis round-trip.
//
// TWO independent limits:
//   • per NAME → 1 / 5s   — fairness per player + stops self-spam of the board
//   • per IP   → 10 / 10s — volume cap that stops one attacker flooding with MANY
//                different names from a script (the "just change the name" bypass)
//
// ⚠️ IP CAP IS A TRADEOFF: one IP is NOT one person — CGNAT, mobile (4G/5G) and
// multiple devices in a home can put several legitimate players behind the same
// public IP. A low per-IP cap (this one is intentionally strict at 10/10s) risks
// the odd false 429 for shared IPs. The per-NAME limit is the PRIMARY fairness
// control (each player gets their own 1/5s budget regardless of IP); the per-IP
// cap is just a flood backstop. Raise IP_TOKENS if shared-IP players hit 429s.
//
// Falls back to per-instance in-memory limiting when Upstash isn't configured
// (local dev), and FAILS toward in-memory on a Redis error so a transient hiccup
// never hard-blocks a legitimate player.
// ──────────────────────────────────────────────────────────────────────────────

const NAME_TOKENS = 1;
const NAME_WINDOW = "5 s" as const;
const IP_TOKENS = 10; // ~1/s — strict volume cap per IP (see CGNAT note above)
const IP_WINDOW = "10 s" as const;

// Upstash dashboard graphs. Costs a few extra Redis commands per check; flip to
// false to minimize free-tier command usage.
const ENABLE_ANALYTICS = true;

const MEM_MAX_KEYS = 5_000;
const NAME_WINDOW_MS = 5_000;
const IP_WINDOW_MS = 10_000;

export interface RateResult {
  ok: boolean;
  limitedBy?: "name" | "ip";
}

// ── Upstash limiters (lazily built + memoized; null when Upstash isn't set) ────
let built: { name: Ratelimit; ip: Ratelimit } | null | undefined;

function getLimiters(): { name: Ratelimit; ip: Ratelimit } | null {
  if (built !== undefined) return built;
  const redis = getRedis();
  if (!redis) {
    built = null;
    return built;
  }
  built = {
    name: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(NAME_TOKENS, NAME_WINDOW),
      prefix: "ratelimit:submit:name",
      analytics: ENABLE_ANALYTICS,
      ephemeralCache: new Map(),
    }),
    ip: new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(IP_TOKENS, IP_WINDOW),
      prefix: "ratelimit:submit:ip",
      analytics: ENABLE_ANALYTICS,
      ephemeralCache: new Map(),
    }),
  };
  return built;
}

// Don't await analytics/multi-region sync on the hot path; just don't let it
// surface as an unhandled rejection.
function flush(pending: Promise<unknown> | undefined) {
  if (pending) Promise.resolve(pending).catch(() => {});
}

// ── in-memory fallback state (per instance) ───────────────────────────────────
const memName = new Map<string, number>();
const memIp = new Map<string, { count: number; resetAt: number }>();

function evict(map: Map<string, unknown>) {
  if (map.size <= MEM_MAX_KEYS) return;
  const keys = Array.from(map.keys());
  for (let i = 0; i < 1000 && i < keys.length; i++) map.delete(keys[i]);
}

function checkInMemory(name: string, ip: string | null): RateResult {
  const now = Date.now();

  const last = memName.get(name);
  if (last && now - last < NAME_WINDOW_MS) return { ok: false, limitedBy: "name" };
  evict(memName);
  memName.set(name, now);

  if (ip) {
    const entry = memIp.get(ip);
    if (!entry || now > entry.resetAt) {
      evict(memIp);
      memIp.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    } else {
      entry.count += 1;
      if (entry.count > IP_TOKENS) return { ok: false, limitedBy: "ip" };
    }
  }

  return { ok: true };
}

export async function checkRateLimit(name: string, ip: string | null): Promise<RateResult> {
  const limiters = getLimiters();

  if (limiters) {
    try {
      const n = await limiters.name.limit(name);
      flush(n.pending);
      if (!n.success) return { ok: false, limitedBy: "name" };

      if (ip) {
        const i = await limiters.ip.limit(ip);
        flush(i.pending);
        if (!i.success) return { ok: false, limitedBy: "ip" };
      }

      return { ok: true };
    } catch {
      // Redis hiccup → degrade to per-instance in-memory limiting (better than
      // hard-blocking legitimate players, still some protection).
      return checkInMemory(name, ip);
    }
  }

  // Upstash not configured (local dev)
  return checkInMemory(name, ip);
}

/** Best-effort client IP from the proxy headers Vercel sets. */
export function clientIp(headers: Headers): string | null {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip");
}
