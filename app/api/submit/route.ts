import { NextRequest, NextResponse } from "next/server";
import { submitScore } from "@/lib/leaderboard-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ──────────────────────────────────────────────────────────────────────────────
// HARDENED LEADERBOARD SUBMIT
//
// This endpoint can't authenticate users (no login system) so it can't fully
// prevent cheating. Defense strategy is layered:
//   1. Strict caps on every numeric field (no fake +99999 XP)
//   2. Cross-field consistency (XP must make sense given completedCount)
//   3. Sanitize name (no XSS, no impersonation via whitespace tricks)
//   4. Rate limit per name (in-memory, 5s between submits)
//   5. Origin check (rejects basic CSRF / cross-origin POSTs)
//
// Anything that requires a server-side source of truth (per-incident XP audit,
// real anti-cheat) would need a login system + signed payloads, which is out
// of scope for an educational app.
// ──────────────────────────────────────────────────────────────────────────────

// ── 1. ABSOLUTE CAPS ─────────────────────────────────────────────────────────
// Max XP per mission in the realistic case (base 200 × 1.5 speed × 1.0 acc + 30 invest + boss 200) ≈ 530.
// Total XP for 19 missions with all bonuses ≈ 7.500. Cap at 12.000 for safety.
const TOTAL_MISSIONS = 19;
const ABSOLUTE_XP_CAP = 12_000;
const ABSOLUTE_SAVED_CAP = 50_000_000;
// 30 min per mission × 19 missions = 34.2M ms. Cap at 100M as absolute hard ceiling.
const ABSOLUTE_ELAPSED_MS_CAP = 100_000_000;
const NAME_MAX_LEN = 16;
const NAME_MIN_LEN = 1;

// Min XP a real player could have per completed mission (low base × bad accuracy + min speed bonus 15)
// 100 × 0.4 + 15 = 55. Floor at 10 just in case.
const MIN_XP_PER_MISSION = 10;
// Max XP a real player could have per completed mission (high base × 1.0 acc + 60 invest + 50 quiz + 100 speed + boss 200)
const MAX_XP_PER_MISSION = 600;

// ── 2. RATE LIMIT (in-memory, per server instance) ───────────────────────────
const lastSubmitByName = new Map<string, number>();
const RATE_LIMIT_MS = 5_000; // 5s between submits for the same name
const MAX_TRACKED_NAMES = 5_000; // evict old entries to prevent memory leak

function checkRateLimit(name: string): boolean {
  const now = Date.now();
  const last = lastSubmitByName.get(name);
  if (last && now - last < RATE_LIMIT_MS) return false;

  // Evict oldest entries if map grows too big
  if (lastSubmitByName.size > MAX_TRACKED_NAMES) {
    const sorted = Array.from(lastSubmitByName.entries()).sort((a, b) => a[1] - b[1]);
    for (let i = 0; i < 1000 && i < sorted.length; i++) {
      lastSubmitByName.delete(sorted[i][0]);
    }
  }

  lastSubmitByName.set(name, now);
  return true;
}

// ── 3. NAME SANITIZATION ─────────────────────────────────────────────────────
// Allow: letters (incl. accented), digits, space, hyphen, underscore, dot,
// and a curated emoji-safe Unicode range. Strip everything else.
function sanitizeName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let s = raw.trim();
  if (s.length < NAME_MIN_LEN) return null;
  if (s.length > NAME_MAX_LEN) s = s.slice(0, NAME_MAX_LEN);

  // Remove HTML tag chars, quotes, backticks, control chars, zero-width chars
  s = s.replace(/[<>"'`\u0000-\u001F\u007F\u200B-\u200F\u2028-\u202F\u2060-\u206F]/g, "");
  // Collapse runs of whitespace
  s = s.replace(/\s+/g, " ").trim();

  if (s.length < NAME_MIN_LEN) return null;

  // Reserved name
  if (s.toLowerCase() === "anon") return null;

  return s;
}

// ── 4. ORIGIN CHECK (CSRF-light) ─────────────────────────────────────────────
function checkOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true; // some envs strip these — don't hard-fail
  try {
    const originHost = new URL(origin).host;
    return originHost === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // CSRF-light
    if (!checkOrigin(req)) {
      return NextResponse.json({ error: "bad origin" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "bad body" }, { status: 400 });
    }

    // Name validation
    const name = sanitizeName(body.name);
    if (!name) {
      return NextResponse.json({ error: "invalid name" }, { status: 400 });
    }

    // Numeric coercion with hard caps
    const xp = Math.max(0, Math.min(ABSOLUTE_XP_CAP, Number(body.xp) || 0));
    const totalSaved = Math.max(0, Math.min(ABSOLUTE_SAVED_CAP, Number(body.totalSaved) || 0));
    const totalElapsedMs = Math.max(0, Math.min(ABSOLUTE_ELAPSED_MS_CAP, Number(body.totalElapsedMs) || 0));
    const completedCount = Math.max(0, Math.min(TOTAL_MISSIONS, Number(body.completedCount) || 0));
    const aPlusCount = Math.max(0, Math.min(TOTAL_MISSIONS, Number(body.aPlusCount) || 0));
    const streak = Math.max(0, Math.min(TOTAL_MISSIONS, Number(body.streak) || 0));

    // Must have some XP
    if (xp === 0 || completedCount === 0) {
      return NextResponse.json({ error: "no progress" }, { status: 400 });
    }

    // ── 5. CROSS-FIELD CONSISTENCY ──────────────────────────────────────────
    // aPlusCount can't exceed completedCount
    if (aPlusCount > completedCount) {
      return NextResponse.json({ error: "aPlus > completed" }, { status: 400 });
    }
    // streak can't exceed completedCount (streak is consecutive A+ — can't have streak > A+ count)
    if (streak > aPlusCount) {
      return NextResponse.json({ error: "streak > aPlus" }, { status: 400 });
    }
    // XP must be within plausible range for completedCount
    const minPossibleXp = completedCount * MIN_XP_PER_MISSION;
    const maxPossibleXp = completedCount * MAX_XP_PER_MISSION;
    if (xp < minPossibleXp || xp > maxPossibleXp) {
      return NextResponse.json({ error: "xp inconsistent" }, { status: 400 });
    }

    // Rate limit (per name)
    if (!checkRateLimit(name)) {
      return NextResponse.json({ error: "too fast" }, { status: 429 });
    }

    await submitScore({
      name,
      xp,
      totalSaved,
      totalElapsedMs,
      completedCount,
      aPlusCount,
      streak,
      at: Date.now(),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "submit failed" }, { status: 500 });
  }
}
