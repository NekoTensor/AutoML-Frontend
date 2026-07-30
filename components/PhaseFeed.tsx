"use client";

import PhaseCard from "./PhaseCard";
import ProgressBar from "./ProgressBar";
import LiveLog from "./LiveLog";
import { PipelineState } from "@/lib/types";

const COMPRESS_LABELS: Record<string, string> = {
  pruning: "Pruning",
  distillation: "Knowledge Distillation",
  quantization: "Quantization",
  export: "Exporting ONNX",
};

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white/5 border border-white/10 px-4 py-3">
      <div className="text-[10px] uppercase tracking-wider text-white/40">{label}</div>
      <div className="text-lg font-semibold mt-0.5">{value}</div>
    </div>
  );
}

export default function PhaseFeed({ state }: { state: PipelineState }) {
  if (state.status === "idle") return null;

  const { phase1, phase2, phase3, phase4, phase5 } = state;

  return (
    <section className="px-6 pb-24">
      <div className="max-w-3xl mx-auto grid gap-6">
        {/* Phase 1 */}
        <PhaseCard title="Phase 1 · Data Understanding" active={phase1.active} done={phase1.done}>
          {phase1.rows !== undefined && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-2">
              <Stat label="Rows" value={phase1.rows} />
              <Stat label="Features" value={phase1.features ?? "-"} />
              <Stat label="Target" value={phase1.target ?? "-"} />
              {phase1.classBalance && (
                <Stat
                  label="Class Balance"
                  value={Object.values(phase1.classBalance)
                    .map((v) => `${v}%`)
                    .join(" / ")}
                />
              )}
            </div>
          )}
          {phase1.augmentMessage && <p className="text-sm text-accent2 mt-2">⟳ {phase1.augmentMessage}</p>}
          {phase1.done && (
            <p className="text-sm text-accent mt-2">
              ✓ Dataset ready — {phase1.finalRows} rows
              {phase1.syntheticAdded ? ` (+${phase1.syntheticAdded} synthetic)` : ""}.
            </p>
          )}
        </PhaseCard>

        {/* Phase 2 */}
        {phase2.active && (
          <PhaseCard title="Phase 2 · Architecture Search (NAS)" active={phase2.active} done={phase2.done}>
            <ProgressBar pct={(phase2.candidates.length / phase2.total) * 100} />
            <LiveLog
              lines={phase2.candidates.map(
                (c) => `Architecture #${c.index} (${c.architecture}) — ${c.accuracy !== null ? `${c.accuracy}%` : c.score}`
              )}
            />
            {phase2.done && phase2.best && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                <Stat label="Layers" value={phase2.best.layers.length} />
                <Stat label="Units" value={phase2.best.layers.join("-")} />
                <Stat label="Activation" value={phase2.best.activation.toUpperCase()} />
                <Stat label="Dropout" value={phase2.best.dropout} />
              </div>
            )}
          </PhaseCard>
        )}

        {/* Phase 3 */}
        {phase3.active && (
          <PhaseCard title="Phase 3 · Hyperparameter Optimization" active={phase3.active} done={phase3.done}>
            <ProgressBar pct={(phase3.trials.length / phase3.total) * 100} />
            <LiveLog
              lines={phase3.trials.map(
                (t) =>
                  `Trial ${t.trial} — LR = ${t.lr}, dropout = ${t.dropout} → Accuracy = ${
                    t.accuracy !== null ? `${t.accuracy}%` : t.score
                  }`
              )}
            />
            {phase3.done && phase3.best && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Stat
                  label="Best Validation Accuracy"
                  value={phase3.best.accuracy !== null ? `${phase3.best.accuracy}%` : phase3.best.score}
                />
                <Stat label="Best LR" value={phase3.best.lr} />
              </div>
            )}
          </PhaseCard>
        )}

        {/* Phase 4 */}
        {phase4.active && (
          <PhaseCard title="Phase 4 · Training" active={phase4.active} done={phase4.done}>
            <ProgressBar pct={(phase4.epochs.length / phase4.totalEpochs) * 100} />
            <LiveLog
              lines={phase4.epochs.map((e) => {
                const acc =
                  e.train_acc !== null ? `Accuracy ${e.train_acc}% (train) / ${e.val_acc}% (val)` : `Val Loss ${e.val_loss}`;
                return `Epoch ${e.epoch}/${e.total_epochs} — Loss ${e.train_loss} · ${acc}`;
              })}
            />
            {phase4.overfitEvents.map((ev, i) => (
              <div key={i} className="mt-2 rounded-lg border border-warn/40 bg-warn/10 text-warn text-sm px-3 py-2">
                ⚠ Overfitting Detected (epoch {ev.epoch}) — increasing dropout to {ev.new_dropout}, reducing LR to{" "}
                {ev.new_lr}
              </div>
            ))}
            {phase4.done && (
              <p className="text-sm text-accent mt-3">
                ✓ Training complete — best checkpoint restored from epoch {phase4.bestEpoch} (final validation{" "}
                {phase4.finalValAcc !== null ? "accuracy" : "loss"}:{" "}
                {phase4.finalValAcc !== null ? `${phase4.finalValAcc}%` : phase4.finalValLoss})
              </p>
            )}
          </PhaseCard>
        )}

        {/* Phase 5 */}
        {phase5.active && (
          <PhaseCard title="Phase 5 · Compression & Export" active={phase5.active} done={phase5.done}>
            <div className="space-y-3">
              {(Object.keys(COMPRESS_LABELS) as (keyof typeof COMPRESS_LABELS)[]).map((key) => {
                const s = phase5.steps[key as keyof typeof phase5.steps];
                if (s === "pending") return null;
                return (
                  <div key={key} className="text-sm">
                    {COMPRESS_LABELS[key]} {s === "done" ? "✓" : "..."}
                    <ProgressBar pct={s === "done" ? 100 : 45} />
                  </div>
                );
              })}
            </div>
            {phase5.done && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Stat label="Model Size" value={`${phase5.originalSizeMb} MB → ${phase5.compressedSizeMb} MB`} />
                <Stat label="Accuracy Loss" value={`${phase5.accuracyLoss}`} />
              </div>
            )}
          </PhaseCard>
        )}
      </div>
    </section>
  );
}
