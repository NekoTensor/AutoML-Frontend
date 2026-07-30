"use client";

import { useLayoutEffect, useRef, ReactNode } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

interface Props {
  title: string;
  active: boolean;
  done: boolean;
  children: ReactNode;
}

export default function PhaseCard({ title, active, done, children }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const wasActive = useRef(false);

  useLayoutEffect(() => {
    if (active && !wasActive.current && cardRef.current && !prefersReducedMotion()) {
      gsap.fromTo(cardRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" });
    }
    if (active) wasActive.current = true;
  }, [active]);

  return (
    <div
      ref={cardRef}
      className={`glass rounded-2xl p-6 transition-shadow duration-500 ${
        active && !done ? "neon-border" : "border border-white/10"
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`w-2.5 h-2.5 rounded-full transition-colors ${
            done
              ? "bg-accent shadow-[0_0_10px] shadow-accent"
              : active
              ? "bg-accent2 shadow-[0_0_10px] shadow-accent2 animate-pulse"
              : "bg-white/20"
          }`}
        />
        <h3 className="font-display font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}
