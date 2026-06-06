import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import type { SignablePayload } from "@/lib/score-signature";

// End-to-end exercise of POST /api/submit: origin check → name sanitize →
// rate limit → (signature) → Zod → submitScore. No Upstash env in tests, so it
// runs the in-memory fallbacks. Uses plain Request (the handler only calls
// .json() and .headers.get()).

function makeReq(
  body: unknown,
  opts: { origin?: string; host?: string; signature?: string } = {},
) {
  const host = opts.host ?? "app.test";
  const origin = opts.origin ?? `https://${host}`;
  const headers: Record<string, string> = { "content-type": "application/json", host };
  if (origin !== "NONE") headers.origin = origin;
  if (opts.signature) headers["x-score-signature"] = opts.signature;
  return new Request("https://app.test/api/submit", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  }) as unknown as import("next/server").NextRequest;
}

const validBody = {
  name: "player",
  xp: 530,
  totalSaved: 1000,
  totalElapsedMs: 60000,
  completedCount: 3,
  aPlusCount: 2,
  streak: 1,
};

describe("POST /api/submit — without signature secret", () => {
  let POST: (req: import("next/server").NextRequest) => Promise<Response>;
  let getLeaderboard: (n?: number) => Promise<Array<{ name: string; xp: number }>>;

  beforeAll(async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_SUBMIT_SECRET;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    POST = (await import("@/app/api/submit/route")).POST;
    getLeaderboard = (await import("@/lib/leaderboard-storage")).getLeaderboard;
  });

  it("rejects cross-origin", async () => {
    const res = await POST(makeReq({ ...validBody, name: "x-origin" }, { origin: "https://evil.test" }));
    expect(res.status).toBe(403);
  });

  it("rejects a non-object body", async () => {
    const res = await POST(makeReq("not-an-object" as unknown));
    expect(res.status).toBe(400);
  });

  it("rejects an empty/invalid name", async () => {
    const res = await POST(makeReq({ ...validBody, name: "   " }));
    expect(res.status).toBe(400);
  });

  it("accepts a valid submit and stores it on the board", async () => {
    const res = await POST(makeReq({ ...validBody, name: "winner1" }));
    expect(res.status).toBe(200);
    const board = await getLeaderboard(50);
    expect(board.find((e) => e.name === "winner1")?.xp).toBe(530);
  });

  it("rejects an inconsistent score (aPlus > completed)", async () => {
    const res = await POST(makeReq({ ...validBody, name: "cheater1", aPlusCount: 5, completedCount: 3 }));
    expect(res.status).toBe(400);
  });

  it("rejects forged huge XP (clamped XP still implausible)", async () => {
    const res = await POST(makeReq({ ...validBody, name: "cheater2", xp: 999999, completedCount: 19 }));
    expect(res.status).toBe(400);
  });

  it("rate-limits a rapid second submit of the same name", async () => {
    const first = await POST(makeReq({ ...validBody, name: "rapid" }));
    expect(first.status).toBe(200);
    const second = await POST(makeReq({ ...validBody, name: "rapid", xp: 540 }));
    expect(second.status).toBe(429);
  });

  it("clamps soft fields without rejecting (huge totalSaved is capped, still 200)", async () => {
    const res = await POST(makeReq({ ...validBody, name: "bignums", totalSaved: 9_999_999_999 }));
    expect(res.status).toBe(200);
  });
});

describe("POST /api/submit — with signature secret", () => {
  const SECRET = "integration-secret";
  let POST: (req: import("next/server").NextRequest) => Promise<Response>;
  let signScore: (p: SignablePayload, s: string) => Promise<string>;

  beforeAll(async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUBMIT_SECRET = SECRET;
    delete process.env.UPSTASH_REDIS_REST_URL; // no nonce store → replay not enforced here
    POST = (await import("@/app/api/submit/route")).POST;
    signScore = (await import("@/lib/score-signature")).signScore;
  });

  afterAll(() => {
    delete process.env.NEXT_PUBLIC_SUBMIT_SECRET;
    vi.resetModules();
  });

  it("rejects when the signature is missing", async () => {
    const body = { ...validBody, name: "sig-missing", ts: Date.now() };
    const res = await POST(makeReq(body));
    expect(res.status).toBe(401);
  });

  it("accepts a correctly signed, fresh request", async () => {
    const body = { ...validBody, name: "sig-ok", ts: Date.now() };
    const sig = await signScore(body, SECRET);
    const res = await POST(makeReq(body, { signature: sig }));
    expect(res.status).toBe(200);
  });

  it("rejects a tampered body (signature no longer matches)", async () => {
    const body = { ...validBody, name: "sig-tamper", ts: Date.now() };
    const sig = await signScore(body, SECRET);
    const res = await POST(makeReq({ ...body, xp: 600 }, { signature: sig }));
    expect(res.status).toBe(401);
  });

  it("rejects a stale (old timestamp) signed request", async () => {
    const body = { ...validBody, name: "sig-stale", ts: Date.now() - 10 * 60 * 1000 };
    const sig = await signScore(body, SECRET);
    const res = await POST(makeReq(body, { signature: sig }));
    expect(res.status).toBe(401);
  });
});
