"use client";

import { useRef, MouseEvent, ButtonHTMLAttributes } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";

interface MagneticButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  strength?: number;
}

export default function MagneticButton({ strength = 0.35, className = "", children, ...props }: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handleMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion() || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    gsap.to(ref.current, {
      x: x * strength,
      y: y * strength,
      duration: 0.4,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    if (!ref.current) return;
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`magnetic-btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
