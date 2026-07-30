"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import MagneticButton from "./MagneticButton";
import { API_URL } from "@/lib/config";
import { PipelineState } from "@/lib/types";

export default function Dashboard({ final }: { final: NonNullable<PipelineState["final"]> }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    gsap.fromTo(ref.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
  }, []);

  const link = (path: string) => `${API_URL}${path}`;

  return (
    <section className="px-6 pb-32">
      <div ref={ref} className="glass-strong neon-border max-w-3xl mx-auto rounded-3xl p-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <h3 className="font-display text-xl font-bold">Final Dashboard</h3>
        </div>
        <p className="text-white/60 text-sm mb-8">Total pipeline time: {final.elapsedSeconds}s</p>

        <div className="flex flex-wrap gap-4">
          <MagneticButton
            className="rounded-xl px-6 py-3 bg-white/5 border border-white/10 hover:border-accent2/50 font-medium"
            onClick={() => window.open(link(final.onnxUrl), "_blank")}
          >
            ⬇ Download ONNX
          </MagneticButton>
          <MagneticButton
            className="rounded-xl px-6 py-3 bg-white/5 border border-white/10 hover:border-accent2/50 font-medium"
            onClick={() => window.open(link(final.reportUrl), "_blank")}
          >
            ⬇ Download Report
          </MagneticButton>
          <MagneticButton
            className="rounded-xl px-6 py-3 bg-white/5 border border-white/10 hover:border-accent2/50 font-medium"
            onClick={() => window.open(link(final.notebookUrl), "_blank")}
          >
            ⬇ Download Notebook (.ipynb)
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
