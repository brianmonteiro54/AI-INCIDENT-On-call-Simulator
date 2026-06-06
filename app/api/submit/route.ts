import { NextRequest, NextResponse } from "next/server";
import { submitScore } from "@/lib/leaderboard-storage";
import { sanitizeName } from "@/lib/name-sanitize";
import { ScoreSchema } from "@/lib/score-schema";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { verifyScore, type SignablePayload } from "@/lib/score-signature";
import { claimSignature } from "@/lib/nonce";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ──────────────────────────────────────────────────────────────────────────────
// HARDENED LEADERBOARD SUBMIT
//
// No login system → can't fully prevent cheating. Layered defense:
//   1. Zod schema      → coerces + clamps every numeric field, then enforces
//                        cross-field consistency (lib/score-schema.ts)
//   2. Name sanitize   → no XSS / whitespace-impersonation (lib/name-sanitize.ts)
//   3. Distributed rate limit → per-name AND per-IP, backed by Upstash so it
//                        actually holds across serverless instances, with an
//                        in-memory fallback for local dev (lib/rate-limit.ts)
//   4. HMAC signature  → rejects forged requests that didn't come from the game
//                        (lib/score-signature.ts) — opt-in via env var. Signed
//                        requests are time-boxed AND single-use (lib/nonce.ts),
//                        so a captured valid request can't be replayed.
//   5. Origin check    → rejects basic cross-origin / CSRF POSTs
//
// Stronger guarantees (per-incident XP audit, true anti-cheat) require accounts
// + server-side state, which is out of scope for an educational app.
// ──────────────────────────────────────────────────────────────────────────────

// Shared secret for the HMAC signature. MUST be NEXT_PUBLIC_* so the browser can
// read it to sign (there's no login, so it can't be truly secret). When unset,
// signature verification is skipped — set it to turn the protection on.
const SUBMIT_SECRET = process.env.NEXT_PUBLIC_SUBMIT_SECRET || "";
const SIGNATURE_TTL_MS = 5 * 60 * 1000; // reject signed requests older than 5 min (anti-replay)

// ── ORIGIN CHECK (CSRF-light) ─────────────────────────────────────────────────
function checkOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return true; // some envs strip these — don't hard-fail
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 5. CSRF-light
    if (!checkOrigin(req)) {
      return NextResponse.json({ error: "bad origin" }, { status: 403 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "bad body" }, { status: 400 });
    }

    // 2. Name
    const name = sanitizeName((body as Record<string, unknown>).name);
    if (!name) {
      return NextResponse.json({ error: "invalid name" }, { status: 400 });
    }

    // 3. Rate limit (per-name + per-IP). Done early so a flood is throttled
    //    before we spend any work on crypto/validation.
    const rl = await checkRateLimit(name, clientIp(req.headers));
    if (!rl.ok) {
      return NextResponse.json({ error: rl.limitedBy === "ip" ? "too many requests" : "too fast" }, { status: 429 });
    }

    // 4. Signature (opt-in). Verify against the RAW body values the client signed,
    //    BEFORE clamping, then check the timestamp is fresh (anti-replay).
    if (SUBMIT_SECRET) {
      const b = body as Record<string, unknown>;
      const signable: SignablePayload = {
        name: typeof b.name === "string" ? b.name : String(b.name ?? ""),
        xp: Number(b.xp) || 0,
        totalSaved: Number(b.totalSaved) || 0,
        totalElapsedMs: Number(b.totalElapsedMs) || 0,
        completedCount: Number(b.completedCount) || 0,
        aPlusCount: Number(b.aPlusCount) || 0,
        streak: Number(b.streak) || 0,
        ts: Number(b.ts) || 0,
      };
      const sig = req.headers.get("x-score-signature") || "";
      const valid = await verifyScore(signable, sig, SUBMIT_SECRET);
      if (!valid) {
        return NextResponse.json({ error: "bad signature" }, { status: 401 });
      }
      if (!Number.isFinite(signable.ts) || Math.abs(Date.now() - signable.ts) > SIGNATURE_TTL_MS) {
        return NextResponse.json({ error: "stale request" }, { status: 401 });
      }
      // Single-use: this exact signature can only be accepted once (within its
      // TTL). Closes the replay window the freshness check leaves open.
      const firstUse = await claimSignature(sig);
      if (!firstUse) {
        return NextResponse.json({ error: "replay" }, { status: 409 });
      }
    }

    // 1. Validate + coerce + clamp + consistency (Zod). `data` is fully typed and
    //    already within the hard caps.
    const parsed = ScoreSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "invalid" }, { status: 400 });
    }
    const { xp, totalSaved, totalElapsedMs, completedCount, aPlusCount, streak } = parsed.data;

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
