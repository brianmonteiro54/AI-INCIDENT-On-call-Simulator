// ──────────────────────────────────────────────────────────────────────────────
// SCORE SIGNATURE (HMAC-SHA256, isomorphic)
//
// Adds a shared-secret signature so a forged request sent straight to /api/submit
// (Postman / cURL) is rejected unless it carries a valid signature. The client
// signs the payload; the server recomputes and compares.
//
// ⚠️ This is OBFUSCATION, not authentication. There is no login, so the secret
// must live in the client bundle (NEXT_PUBLIC_SUBMIT_SECRET) and a determined
// user can extract it from the JS and forge signatures. It stops the casual 99%
// (anyone replaying/editing a captured request without re-signing), not a
// motivated reverse-engineer. Real anti-cheat needs accounts + server-side audit.
//
// Uses Web Crypto (globalThis.crypto.subtle), available in modern browsers and in
// Node 18+ / Vercel, so the SAME code signs on the client and verifies on the
// server.
// ──────────────────────────────────────────────────────────────────────────────

export interface SignablePayload {
  name: string;
  xp: number;
  totalSaved: number;
  totalElapsedMs: number;
  completedCount: number;
  aPlusCount: number;
  streak: number;
  /** Epoch ms when the client built the payload — signed and freshness-checked. */
  ts: number;
}

/** Deterministic string both sides hash. Field order here is the contract. */
export function canonicalScoreString(p: SignablePayload): string {
  return [
    p.name,
    p.xp,
    p.totalSaved,
    p.totalElapsedMs,
    p.completedCount,
    p.aPlusCount,
    p.streak,
    p.ts,
  ]
    .map((v) => String(v))
    .join("|");
}

async function hmacHex(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  let hex = "";
  for (const b of new Uint8Array(sig)) hex += b.toString(16).padStart(2, "0");
  return hex;
}

export async function signScore(payload: SignablePayload, secret: string): Promise<string> {
  return hmacHex(canonicalScoreString(payload), secret);
}

/** Constant-time hex comparison (avoids leaking via early-exit timing). */
export function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length || a.length === 0) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function verifyScore(
  payload: SignablePayload,
  signature: string,
  secret: string,
): Promise<boolean> {
  if (!signature) return false;
  const expected = await signScore(payload, secret);
  return timingSafeEqualHex(expected, signature);
}
