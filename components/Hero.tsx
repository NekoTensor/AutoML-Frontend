"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, ensureGsapRegistered, prefersReducedMotion } from "@/lib/gsap";

// A small 3-layer network (4-5-2 nodes) used as the scroll-scrubbed visual
// centerpiece — standing in for the "hero video" requirement, since
// scrubbing an actual product-demo video needs a real video asset this
// project doesn't have. The draw-in (stroke-dashoffset) and node
// fade/scale are driven by scroll progress via a GSAP timeline with
// `scrub: true`. On top of that, an ambient idle pulse runs continuously
// on the nodes regardless of scroll (skipped under reduced motion).

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
        gsap.from([titleRef.current, subRef.current], {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.15,
        });
        return;
      }

      edgeEls?.forEach((el) => {
        const len = el.getTotalLength();
        gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(nodeEls ?? [], { opacity: 0, scale: 0.3, transformOrigin: "center" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=160%",
          scrub: 1,
          pin: true,
        },
      });

      tl.to(nodeEls ?? [], { opacity: 1, scale: 1, stagger: 0.03, duration: 0.4 }, 0)
        .to(edgeEls ?? [], { strokeDashoffset: 0, stagger: 0.01, duration: 0.6 }, 0.05)
        .to(svgRef.current, { y: -60, opacity: 0.35, duration: 1 }, 0.55)
        .to(titleRef.current, { y: -140, opacity: 0, duration: 0.6 }, 0.6)
        .to(subRef.current, { y: -90, opacity: 0, duration: 0.5 }, 0.65);

      // Ambient idle pulse — runs continuously, independent of scroll,
      // so the network never feels fully "at rest" once drawn in.
      if (nodeEls && nodeEls.length) {
        gsap.to(nodeEls, {
          opacity: 0.55,
          duration: 1.6,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          stagger: { each: 0.15, repeat: -1, yoyo: true },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const edges = buildEdges();
  const nodes = LAYERS.flatMap((layer) => layer.ys.map((y) => ({ x: layer.x, y })));

  return (
    <section ref={sectionRef} className="pin-scroller relative flex items-center justify-center overflow-hidden">
      <div className="parallax-layer absolute inset-0 flex items-center justify-center opacity-70">
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
        <div ref={titleRef} className="reduced-motion-static">
          <h1 className="glitch-title neon-text font-display text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-accent3 to-accent">
            Autonomous Deep
            <br />
            Learning Framework
          </h1>
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
