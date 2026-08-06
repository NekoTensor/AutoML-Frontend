"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

interface Props {
  lines: string[];
  className?: string;
  maxHeight?: string;
}

export default function LiveLog({ lines, className = "", maxHeight = "220px" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const newCount = lines.length - prevCount.current;
    if (newCount > 0) {
      const items = Array.from(container.children).slice(-newCount);
      if (!prefersReducedMotion()) {
        gsap.fromTo(items, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.04 });
      }
    }
    prevCount.current = lines.length;
    container.scrollTop = container.scrollHeight;
  }, [lines]);

  return (
    <div
      ref={containerRef}
      // Same reason as the dropdown list: without this, Lenis consumes the
      // wheel and scrolling back through the epoch/trial log is impossible
      // without grabbing the scrollbar.
      data-lenis-prevent
      className={`overflow-y-auto overscroll-contain font-mono text-sm text-white/70 space-y-1 pr-2 ${className}`}
      style={{ maxHeight }}
    >
      {lines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
}
