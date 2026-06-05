import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/leaderboard-storage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const entries = await getLeaderboard(50);
    return NextResponse.json(
      { entries },
      {
        headers: {
          // Cache the board on Vercel's CDN for 15s, then serve it stale for
          // another 45s while it revalidates in the background. Repeated opens
          // and refreshes within that window are served from the edge cache —
          // instant, with no function cold start and no Redis round-trip.
          //
          // CDN-Cache-Control targets the CDN only (Vercel strips it before the
          // browser) and takes precedence over Cache-Control for caching, so it
          // works even though the route is force-dynamic. The browser itself is
          // told not to cache, so a full page reload always re-checks.
          //
          // The "fresh" path on the client (manual refresh + post-submit
          // confirmation) appends a unique query param to bypass this cache.
          "CDN-Cache-Control": "public, s-maxage=15, stale-while-revalidate=45",
          "Cache-Control": "public, max-age=0, must-revalidate",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { entries: [], error: "fetch failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}
