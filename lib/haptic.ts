"use client";

/**
 * Subtle haptic feedback. Most mobile browsers support navigator.vibrate
 * (Android Chrome, modern Edge). iOS Safari still doesn't, so this is a no-op
 * there — safe to call from anywhere.
 *
 * Patterns:
 *  - "tap"     → 8ms quick tap
 *  - "success" → light tap (10ms)
 *  - "fail"    → harsher buzz (15ms,40ms,15ms)
 *  - "celebrate" → triple short tap
 */
export type HapticPattern = "tap" | "success" | "fail" | "celebrate";

const PATTERNS: Record<HapticPattern, number | number[]> = {
  tap: 8,
  success: 12,
  fail: [15, 40, 15],
  celebrate: [10, 60, 10, 60, 10],
};

let hapticsEnabled = true;

export function setHapticsEnabled(on: boolean) {
  hapticsEnabled = on;
}

export function haptic(pattern: HapticPattern = "tap") {
  if (!hapticsEnabled) return;
  if (typeof window === "undefined") return;
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  // Respect prefers-reduced-motion users — they generally prefer less feedback noise
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  try {
    navigator.vibrate(PATTERNS[pattern]);
  } catch {
    /* ignore */
  }
}
