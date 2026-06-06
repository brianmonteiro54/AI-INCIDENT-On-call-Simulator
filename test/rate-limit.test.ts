import { describe, it, expect } from "vitest";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

// No Upstash env in the test runner → exercises the in-memory fallback path.

describe("checkRateLimit (in-memory fallback)", () => {
  it("allows the first submit for a name, blocks an immediate repeat", async () => {
    const first = await checkRateLimit("alice-unique", "10.0.0.1");
    expect(first.ok).toBe(true);

    const second = await checkRateLimit("alice-unique", "10.0.0.2");
    expect(second.ok).toBe(false);
    expect(second.limitedBy).toBe("name");
  });

  it("blocks a flood of different names from the same IP", async () => {
    const ip = "203.0.113.7";
    let blocked: Awaited<ReturnType<typeof checkRateLimit>> | null = null;
    // distinct names so the per-name limit never triggers; only the IP cap should
    for (let i = 0; i < 200; i++) {
      const r = await checkRateLimit(`flood-${ip}-${i}`, ip);
      if (!r.ok) {
        blocked = r;
        break;
      }
    }
    expect(blocked).not.toBeNull();
    expect(blocked?.limitedBy).toBe("ip");
  });

  it("does not apply the IP limit when IP is unavailable", async () => {
    // distinct names, null IP → never blocked
    for (let i = 0; i < 100; i++) {
      const r = await checkRateLimit(`no-ip-${i}`, null);
      expect(r.ok).toBe(true);
    }
  });
});

describe("clientIp", () => {
  it("takes the first entry of x-forwarded-for", () => {
    const h = new Headers({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(clientIp(h)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const h = new Headers({ "x-real-ip": "9.9.9.9" });
    expect(clientIp(h)).toBe("9.9.9.9");
  });

  it("returns null when no IP headers are present", () => {
    expect(clientIp(new Headers())).toBeNull();
  });
});
