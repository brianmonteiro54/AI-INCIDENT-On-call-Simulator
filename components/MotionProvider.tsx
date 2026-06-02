"use client";

import { MotionConfig } from "framer-motion";

/**
 * Makes ALL Framer Motion animations honor the user's
 * `prefers-reduced-motion` OS setting.
 *
 * The CSS rule in globals.css only neutralizes CSS keyframe/transition
 * animations — it does NOT affect Framer Motion's JS-driven `animate` props
 * (the infinite mascot bob, confetti, pulses, etc). Wrapping the app in
 * `reducedMotion="user"` disables transform & layout animations for users who
 * asked for reduced motion, while keeping opacity/color fades.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
