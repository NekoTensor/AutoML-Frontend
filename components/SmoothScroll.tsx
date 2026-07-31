"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, ensureGsapRegistered, prefersReducedMotion } from "@/lib/gsap";

// This is what makes scrolling feel like momentum instead of raw wheel
// input — Lenis intercepts scroll and smooths it with inertia, then
// feeds each frame into GSAP's own ticker so ScrollTrigger-driven
// animations (Hero, ScrollySteps) stay perfectly in sync with the
// smoothed position rather than the raw, jumpy one.
//
// Respects prefers-reduced-motion: if it's on, we skip Lenis entirely
// and let the browser's native (instant) scroll behavior take over —
// inertia/momentum is exactly the kind of motion that setting exists
// to suppress.

export default function SmoothScroll() {
  useEffect(() => {
    ensureGsapRegistered();
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => 1 - Math.pow(1 - t, 3), // easeOutCubic — smooth but responsive, not sluggish
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  return null;
}
