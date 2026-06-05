import { describe, it, expect } from "vitest";
import { INCIDENTS } from "@/lib/incidents";
import { INCIDENTS_META } from "@/lib/incidents-meta";

// ──────────────────────────────────────────────────────────────────────────────
// Guards the bundle optimization: lib/incidents-meta.ts is a hand-materialized,
// lightweight slice of lib/incidents.ts so the home/result screens don't ship the
// full 128 KB dataset. This test fails the moment the two drift apart, so the
// optimization can never silently serve stale/wrong metadata.
// ──────────────────────────────────────────────────────────────────────────────

describe("INCIDENTS_META stays in sync with INCIDENTS", () => {
  it("has the same incidents in the same order", () => {
    expect(INCIDENTS_META.map((m) => m.id)).toEqual(INCIDENTS.map((i) => i.id));
  });

  it("matches the light fields used by the home and result screens", () => {
    const derived = INCIDENTS.map((i) => ({
      id: i.id,
      sev: i.sev,
      title: i.title,
      short: i.short,
      minLevel: i.minLevel,
      isBoss: Boolean(i.isBoss),
      services: (i.services ?? []).map((s) => ({ name: s.name })),
    }));
    expect(INCIDENTS_META).toEqual(derived);
  });
});
