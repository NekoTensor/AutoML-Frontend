"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

const ORBS = [
  { color: "rgba(232,121,249,0.35)", size: 520, top: "8%", left: "12%" },
  { color: "rgba(34,211,238,0.28)", size: 460, top: "45%", left: "70%" },
  { color: "rgba(167,139,250,0.3)", size: 600, top: "75%", left: "25%" },
];

export default function AmbientBackground() {
  const orbRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      orbRefs.current.forEach((orb, i) => {
        if (!orb) return;
        // Each orb drifts on its own slow, infinite, yoyo'd path — this is
        // ambient motion that runs continuously regardless of scroll
        // position or cursor, not tied to any user interaction.
        gsap.to(orb, {
          x: i % 2 === 0 ? 120 : -100,
          y: i % 2 === 0 ? -80 : 100,
          scale: 1.15,
          duration: 14 + i * 3,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div className="cyber-grid" />
      <div className="scanline-overlay" />
      {ORBS.map((orb, i) => (
        <div
          key={i}
          ref={(el) => {
            orbRefs.current[i] = el;
          }}
          className="glow-orb"
          style={{
            width: orb.size,
            height: orb.size,
            top: orb.top,
            left: orb.left,
            background: orb.color,
          }}
        />
      ))}
    </>
  );
}
