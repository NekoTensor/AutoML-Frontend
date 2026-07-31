"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, ensureGsapRegistered, prefersReducedMotion } from "@/lib/gsap";
import LogoMark from "./LogoMark";

const LAYERS = [
  { x: 120, ys: [80, 180, 280, 380] },
  { x: 360, ys: [40, 140, 240, 340, 440] },
  { x: 600, ys: [130, 280] },
];

function buildEdges() {
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let l = 0; l < LAYERS.length - 1; l++) {
    const from = LAYERS[l];
    const to = LAYERS[l + 1];
    from.ys.forEach((y1) => {
      to.ys.forEach((y2) => {
        edges.push({ x1: from.x, y1, x2: to.x, y2 });
      });
    });
  }
  return edges;
}

export default function Hero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    ensureGsapRegistered();
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      const edgeEls = svgRef.current?.querySelectorAll<SVGLineElement>(".scrub-edge");
      const nodeEls = svgRef.current?.querySelectorAll<SVGCircleElement>(".scrub-node");

      if (reduced) {
        gsap.set(edgeEls ?? [], { strokeDashoffset: 0, opacity: 0.35 });
        gsap.set(nodeEls ?? [], { opacity: 1, scale: 1, transformOrigin: "center" });
        gsap.set([logoRef.current, titleRef.current, subRef.current], { opacity: 1, y: 0 });
        return;
      }

      edgeEls?.forEach((el) => {
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(nodeEls ?? [], { opacity: 0, scale: 0.3, transformOrigin: "center" });
      gsap.set(logoRef.current, { opacity: 0, y: -20, scale: 0.85 });
      gsap.set([titleRef.current, subRef.current], { opacity: 0, y: 20 });

      const intro = gsap.timeline();
      intro
        .to(nodeEls ?? [], { opacity: 1, scale: 1, stagger: 0.03, duration: 0.5 }, 0)
        .to(edgeEls ?? [], { strokeDashoffset: 0, stagger: 0.012, duration: 0.8 }, 0.1)
        .to(logoRef.current, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.6)" }, 0.5)
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.75)
        .to(subRef.current, { opacity: 1, y: 0, duration: 0.6 }, 0.9);

      if (nodeEls && nodeEls.length) {
        gsap.to(nodeEls, {
          opacity: 0.55,
          duration: 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.15, repeat: -1, yoyo: true },
          delay: 1.2,
        });
      }

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top top",
        end: "+=35%",
        pin: true,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const edges = buildEdges();
  const nodes = LAYERS.flatMap((layer) => layer.ys.map((y) => ({ x: layer.x, y })));

  return (
    <section ref={sectionRef} className="pin-scroller relative flex items-center justify-center overflow-hidden">
      <div className="parallax-layer absolute inset-0 flex items-center justify-center opacity-50">
        <svg ref={svgRef} viewBox="0 0 720 480" className="w-[90vw] max-w-3xl scrub-target">
          <defs>
            <linearGradient id="edgeGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#e879f9" stopOpacity="0.55" />
            </linearGradient>
            <filter id="nodeGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {edges.map((e, i) => (
            <line
              key={i}
              className="scrub-edge"
              x1={e.x1}
              y1={e.y1}
              x2={e.x2}
              y2={e.y2}
              stroke="url(#edgeGradient)"
              strokeWidth={1}
            />
          ))}
          {nodes.map((n, i) => (
            <circle
              key={i}
              className="scrub-node"
              cx={n.x}
              cy={n.y}
              r={7}
              fill="#e879f9"
              filter="url(#nodeGlow)"
            />
          ))}
        </svg>
      </div>

      <div className="relative z-10 text-center px-6">
        <div ref={logoRef} className="reduced-motion-static flex justify-center mb-6">
          <LogoMark size={200} glow={false} className="logo-pulse" />
        </div>

        <div ref={titleRef} className="reduced-motion-static">
          <h1 className="glitch-title neon-text font-display text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-accent3 to-accent">
            NekoCortex
          </h1>
          <p className="neon-text font-display text-xl md:text-3xl font-normal tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-accent3 to-accent mt-2">
            An autonomous deep learning framework
          </p>
        </div>
        <div ref={subRef} className="reduced-motion-static mt-6">
          <p className="text-lg md:text-xl text-white/60 max-w-xl mx-auto">
            Upload a dataset. Architecture search, tuning, training, and compression
            run entirely on their own.
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-accent2/70 text-xs tracking-[0.3em] uppercase animate-pulse">
        Scroll
      </div>
    </section>
  );
}
