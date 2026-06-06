import { signScore, type SignablePayload } from "./score-signature";

// ──────────────────────────────────────────────────────────────────────────────
// CLIENT-SIDE SCORE PUBLISHER
//
// Single place that builds, signs, and POSTs a score, so the two call sites
// (post-mission auto-publish in lib/store.ts and the background sync on the
// leaderboard page) always produce an identical, correctly-signed request.
//
// Signing is gated on NEXT_PUBLIC_SUBMIT_SECRET: if it's set, every request is
// signed; if it's empty, requests go unsigned and the server skips verification
// (it reads the same env var). So this is safe to ship before configuring the
// secret — nothing breaks, you just turn on the protection by setting the var.
// ──────────────────────────────────────────────────────────────────────────────

export interface ScorePayload {
  name: string;
  xp: number;
  totalSaved: number;
  totalElapsedMs: number;
  completedCount: number;
  aPlusCount: number;
  streak: number;
}

const SUBMIT_SECRET = process.env.NEXT_PUBLIC_SUBMIT_SECRET || "";

export async function publishScore(payload: ScorePayload): Promise<Response> {
  const signable: SignablePayload = { ...payload, ts: Date.now() };

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (SUBMIT_SECRET) {
    try {
      headers["x-score-signature"] = await signScore(signable, SUBMIT_SECRET);
    } catch {
      /* if subtle crypto is unavailable, send unsigned — server decides */
    }
  }

  return fetch("/api/submit", {
    method: "POST",
    headers,
    body: JSON.stringify(signable),
  });
}
