"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, ScrollTrigger, ensureGsapRegistered, prefersReducedMotion } from "@/lib/gsap";

const STEPS = [
  {
    n: "01",
    title: "Understand",
    body: "Row counts, feature types, and class balance are checked automatically. If the target is imbalanced, synthetic samples are generated to correct it.",
  },
  {
    n: "02",
    title: "Search & Tune",
    body: "A shortlist of architectures is trained and ranked. The best one is handed to a hyperparameter search across learning rate, dropout, and batch size.",
  },
  {
    n: "03",
    title: "Train",
    body: "The winning architecture and hyperparameters train for real, epoch by epoch — with live overfitting detection that adjusts dropout and learning rate mid-run.",
  },
  {
    n: "04",
    title: "Compress",
    body: "Pruning, knowledge distillation, and int8 quantization shrink the model before it's exported to ONNX — typically to a fraction of its original size.",
  },
];

export default function ScrollySteps() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    ensureGsapRegistered();
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set(cardsRef.current, { opacity: 1, y: 0 });
        return;
      }

      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        gsap.fromTo(
          card,
          { opacity: 0, y: 60, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 78%",
              toggleActions: "play none none reverse",
            },
          }
        );

        // Depth parallax: each subsequent card drifts at a slightly
        // different rate as the section scrolls past, for a layered feel.
        gsap.to(card, {
          y: -20 * (i % 2 === 0 ? 1 : -1),
          ease: "none",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto text-center mb-20">
        <p className="text-xs tracking-[0.3em] uppercase text-accent/80 mb-4">How it works</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent2 via-white to-accent">
          Four phases. Zero terminal commands.
        </h2>
      </div>

      <div className="max-w-3xl mx-auto grid gap-6">
        {STEPS.map((step, i) => (
          <div
            key={step.n}
            ref={(el) => {
              cardsRef.current[i] = el;
            }}
            className="glass neon-border rounded-2xl p-8 flex gap-6 items-start reduced-motion-static"
          >
            <span className="font-mono text-accent2 text-sm pt-1 shrink-0 w-8 h-8 rounded-full border border-accent2/40 flex items-center justify-center animate-pulse">
              {step.n}
            </span>
            <div>
              <h3 className="font-display text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-white/60 leading-relaxed">{step.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
