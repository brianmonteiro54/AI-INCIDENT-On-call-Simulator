import { NextRequest, NextResponse } from "next/server";
import { submitScore } from "@/lib/leaderboard-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").slice(0, 16).trim() || "anon";
    const xp = Math.max(0, Math.min(1_000_000, Number(body.xp) || 0));
    const totalSaved = Math.max(0, Math.min(100_000_000, Number(body.totalSaved) || 0));
    const completedCount = Math.max(0, Math.min(100, Number(body.completedCount) || 0));
    const aPlusCount = Math.max(0, Math.min(100, Number(body.aPlusCount) || 0));
    const streak = Math.max(0, Math.min(100, Number(body.streak) || 0));

    if (xp === 0) {
      return NextResponse.json({ error: "no xp" }, { status: 400 });
    }

    await submitScore({
      name,
      xp,
      totalSaved,
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
