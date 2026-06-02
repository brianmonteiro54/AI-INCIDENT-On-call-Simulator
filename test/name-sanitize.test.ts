import { describe, it, expect } from "vitest";
import { sanitizeName, NAME_MAX_LEN } from "@/lib/name-sanitize";

describe("sanitizeName", () => {
  it("keeps a normal name unchanged", () => {
    expect(sanitizeName("Maria")).toBe("Maria");
  });

  it("preserves accented letters and emoji", () => {
    expect(sanitizeName("José 🚀")).toBe("José 🚀");
  });

  it("trims surrounding whitespace", () => {
    expect(sanitizeName("   Maria   ")).toBe("Maria");
  });

  it("collapses internal whitespace runs", () => {
    expect(sanitizeName("a    b")).toBe("a b");
  });

  it("strips HTML / quote / backtick characters (anti-XSS)", () => {
    expect(sanitizeName("a<b>c")).toBe("abc");
    expect(sanitizeName('x"y\'z`w')).toBe("xyzw");
  });

  it("strips zero-width / invisible characters (anti-impersonation)", () => {
    expect(sanitizeName("a\u200Bb")).toBe("ab");
  });

  it("truncates to the max length", () => {
    const long = "a".repeat(NAME_MAX_LEN + 10);
    expect(sanitizeName(long)).toHaveLength(NAME_MAX_LEN);
  });

  it("rejects empty / whitespace-only input", () => {
    expect(sanitizeName("")).toBeNull();
    expect(sanitizeName("    ")).toBeNull();
  });

  it("rejects the reserved name 'anon' (any case)", () => {
    expect(sanitizeName("anon")).toBeNull();
    expect(sanitizeName("ANON")).toBeNull();
  });

  it("rejects non-string input", () => {
    expect(sanitizeName(123)).toBeNull();
    expect(sanitizeName(null)).toBeNull();
    expect(sanitizeName(undefined)).toBeNull();
    expect(sanitizeName({})).toBeNull();
  });
});
