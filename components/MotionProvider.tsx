"use client";

import { LazyMotion, domMax, MotionConfig } from "framer-motion";

/**
 * Loads Framer Motion's animation features LAZILY (after first paint) instead of
 * bundling them eagerly with every component, and makes all animations honor the
 * user's `prefers-reduced-motion` OS setting.
 *
 * Because of this, components must use the lightweight `m` component
 * (e.g. `<m.div>`) instead of `motion` — that's what keeps the heavy feature
 * bundle out of the initial load. We use `domMax` (not the smaller
 * `domAnimation`) because the glossary relies on `layout` animations.
 *
 * The CSS rule in globals.css only neutralizes CSS keyframe/transition
 * animations — it does NOT affect Framer Motion's JS-driven `animate` props
 * (the infinite mascot bob, confetti, pulses, etc). `reducedMotion="user"`
 * disables transform & layout animations for users who asked for reduced motion,
 * while keeping opacity/color fades.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domMax}>{children}</LazyMotion>
    </MotionConfig>
  );
}
