"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function ensureGsapRegistered() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
}

// Heavy scroll-scrub/parallax animations should never run for people who
// asked their OS for reduced motion — this is the JS-side counterpart to
// the CSS `prefers-reduced-motion` fallback in globals.css, since GSAP
// writes inline transforms that a CSS media query alone can't intercept
// before they're set.
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger };
