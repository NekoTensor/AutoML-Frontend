"use client";

import { PipelineState } from "@/lib/types";

interface Props {
  status: PipelineState["status"];
  resuming: boolean;
  onCancel: () => void;
  onReset: () => void;
}

// The status strip that sits between the upload card and the phase feed.
// Its whole job is making sure a run is never a one-way door: while a job is
// in flight it can be stopped, and once it's finished (or was stopped, or
// died) there's an explicit way back to a clean slate.
export default function RunControls({ status, resuming, onCancel, onReset }: Props) {
  if (status === "idle" && !resuming) return null;

  const base =
    "rounded-xl px-5 py-2.5 text-sm font-medium border transition-colors focus-visible:outline-none focus-visible:ring-2";

  return (
    <section className="px-6 pb-8" aria-live="polite">
      <div className="max-w-3xl mx-auto flex flex-wrap items-center gap-4">
        {resuming && (
          <p className="text-sm text-accent2">⟳ Reconnecting to a run already in progress…</p>
        )}

        {status === "running" && (
          <>
            <p className="text-sm text-white/60 mr-auto">Run in progress.</p>
            <button
              type="button"
              onClick={onCancel}
              className={`${base} border-red-500/40 bg-red-500/10 text-red-300 hover:border-red-500/70 focus-visible:ring-red-400`}
            >
              Cancel run
            </button>
          </>
        )}

        {status === "cancelled" && (
          <>
            <p className="text-sm text-white/60 mr-auto">Run cancelled.</p>
            <button
              type="button"
              onClick={onReset}
              className={`${base} border-white/10 bg-white/5 hover:border-accent2/50 focus-visible:ring-accent2`}
            >
              Start over
            </button>
          </>
        )}

        {(status === "complete" || status === "error") && (
          <button
            type="button"
            onClick={onReset}
            className={`${base} ml-auto border-white/10 bg-white/5 hover:border-accent2/50 focus-visible:ring-accent2`}
          >
            Start over
          </button>
        )}
      </div>
    </section>
  );
}
