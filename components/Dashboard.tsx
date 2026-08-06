"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { resolveApiUrl } from "@/lib/config";
import { PipelineState } from "@/lib/types";

// Downloads are plain anchors rather than `window.open`, deliberately:
// an <a download> lets the browser stream the file straight to disk (and
// gives the user the usual right-click / open-in-new-tab affordances),
// where window.open flashes a tab that immediately closes. `rel` is set
// because a target=_blank link hands the opened page a `window.opener`
// handle back into this one unless noopener is present.
function DownloadLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      download
      rel="noopener noreferrer"
      className="magnetic-btn rounded-xl px-6 py-3 bg-white/5 border border-white/10 hover:border-accent2/50 font-medium inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent2"
    >
      {children}
    </a>
  );
}

export default function Dashboard({ final }: { final: NonNullable<PipelineState["final"]> }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!ref.current || prefersReducedMotion()) return;
    gsap.fromTo(ref.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" });
  }, []);

  return (
    <section className="px-6 pb-32">
      <div ref={ref} className="glass-strong neon-border max-w-3xl mx-auto rounded-3xl p-10">
        <div className="flex items-center gap-3 mb-6">
          <span className="w-2.5 h-2.5 rounded-full bg-accent" />
          <h3 className="font-display text-xl font-bold">Final Dashboard</h3>
        </div>
        <p className="text-white/60 text-sm mb-8">Total pipeline time: {final.elapsedSeconds}s</p>

        <div className="flex flex-wrap gap-4">
          <DownloadLink href={resolveApiUrl(final.onnxUrl)}>⬇ Download ONNX</DownloadLink>
          <DownloadLink href={resolveApiUrl(final.reportUrl)}>⬇ Download Report</DownloadLink>
          <DownloadLink href={resolveApiUrl(final.notebookUrl)}>⬇ Download Notebook (.ipynb)</DownloadLink>
        </div>
      </div>
    </section>
  );
}
