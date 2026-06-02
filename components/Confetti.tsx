"use client";

import { m } from "framer-motion";
import { useMemo } from "react";

// Brand palette — confetti pieces pick from these.
const COLORS = ["#58CC02", "#1CB0F6", "#FFC800", "#FF4B4B", "#CE82FF", "#FF9600"];

/**
 * A one-shot confetti burst that rains down from the top-center of the screen.
 * Dependency-free (just Framer Motion, already in the bundle). Decorative only:
 * `pointer-events-none`, `aria-hidden`, and it sits above the result overlay.
 *
 * Render it conditionally (e.g. only on an A+ / perfect result) — it animates
 * once on mount and the pieces fall off-screen.
 */
export function Confetti({ count = 46 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        startX: (Math.random() - 0.5) * 110,
        endX: (Math.random() - 0.5) * 540,
        endY: 520 + Math.random() * 600,
        rotate: (Math.random() - 0.5) * 900,
        delay: Math.random() * 0.22,
        duration: 1.7 + Math.random() * 1.3,
        color: COLORS[i % COLORS.length],
        w: 7 + Math.random() * 6,
        h: 10 + Math.random() * 9,
        round: Math.random() > 0.62,
      })),
    [count]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-20">
        {pieces.map((p) => (
          <m.span
            key={p.id}
            initial={{ x: p.startX, y: -10, rotate: 0, opacity: 1 }}
            animate={{ x: p.endX, y: p.endY, rotate: p.rotate, opacity: 0 }}
            transition={{ duration: p.duration, delay: p.delay, ease: [0.2, 0.6, 0.4, 1] }}
            style={{
              position: "absolute",
              display: "block",
              width: p.w,
              height: p.h,
              backgroundColor: p.color,
              borderRadius: p.round ? "9999px" : "2px",
            }}
          />
        ))}
      </div>
    </div>
  );
}
