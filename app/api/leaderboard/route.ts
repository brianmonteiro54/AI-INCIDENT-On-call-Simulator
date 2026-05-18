import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const entries = await getLeaderboard(50);
    return NextResponse.json({ entries });
  } catch (e) {
    return NextResponse.json({ entries: [], error: "fetch failed" }, { status: 500 });
  }
}
