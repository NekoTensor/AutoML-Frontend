import { PipelineEvent, PipelineState, CompressStep, initialPipelineState } from "./types";

export function pipelineReducer(state: PipelineState, event: PipelineEvent): PipelineState {
  const { phase, status } = event;

  // Client-side control events. These share the `pipeline` phase with the
  // server's own lifecycle events so that attaching to a running job — which
  // replays the server's whole event log through this same reducer — rebuilds
  // state identically to having watched the run live.
  if (phase === "pipeline") {
    if (status === "reset") return { ...initialPipelineState };
    if (status === "started") return { ...state, status: "running", jobId: event.job_id as string };
    if (status === "cancelled") return { ...state, status: "cancelled" };
    if (status === "disconnected") {
      // Only meaningful mid-run; a socket closing after the run finished is
      // just the server hanging up normally and must not clobber the result.
      if (state.status !== "running") return state;
      return { ...state, status: "error", errorMessage: event.message as string };
    }
  }

  if (phase === "phase1") {
    const p1 = { ...state.phase1, active: true };
    if (status === "stats") {
      p1.rows = event.rows as number;
      p1.features = event.features as number;
      p1.target = event.target as string;
      p1.classBalance = event.class_balance as Record<string, number> | null;
    } else if (status === "augmenting") {
      p1.augmentMessage = event.message as string;
    } else if (status === "done") {
      p1.done = true;
      p1.finalRows = event.final_rows as number;
      p1.syntheticAdded = event.synthetic_added as number;
    }
    return { ...state, status: "running", phase1: p1, phase2: { ...state.phase2, active: status === "done" } };
  }

  if (phase === "phase2") {
    const p2 = { ...state.phase2, active: true };
    if (status === "running") {
      p2.total = event.total as number;
    } else if (status === "candidate") {
      p2.candidates = [
        ...p2.candidates,
        {
          index: event.index as number,
          total: event.total as number,
          architecture: event.architecture as string,
          accuracy: event.accuracy as number | null,
          score: event.score as number,
        },
      ];
    } else if (status === "done") {
      p2.done = true;
      p2.best = event.best_architecture as PipelineState["phase2"]["best"];
    }
    return { ...state, phase2: p2, phase3: { ...state.phase3, active: status === "done" } };
  }

  if (phase === "phase3") {
    const p3 = { ...state.phase3, active: true };
    if (status === "running") {
      p3.total = event.total as number;
    } else if (status === "trial") {
      p3.trials = [
        ...p3.trials,
        {
          trial: event.trial as number,
          total: event.total as number,
          lr: event.lr as number,
          dropout: event.dropout as number,
          batch_size: event.batch_size as number,
          accuracy: event.accuracy as number | null,
          score: event.score as number,
        },
      ];
    } else if (status === "done") {
      p3.done = true;
      const best = event.best_trial as Record<string, unknown>;
      p3.best = {
        trial: best.trial as number,
        total: p3.total,
        lr: best.lr as number,
        dropout: best.dropout as number,
        batch_size: best.batch_size as number,
        accuracy: (best.accuracy as number | null) ?? null,
        score: best.score as number,
      };
    }
    return { ...state, phase3: p3, phase4: { ...state.phase4, active: status === "done" } };
  }

  if (phase === "phase4") {
    const p4 = { ...state.phase4, active: true };
    if (status === "running") {
      p4.totalEpochs = event.total_epochs as number;
    } else if (status === "epoch") {
      p4.epochs = [
        ...p4.epochs,
        {
          epoch: event.epoch as number,
          total_epochs: event.total_epochs as number,
          train_loss: event.train_loss as number,
          val_loss: event.val_loss as number,
          train_acc: event.train_acc as number | null,
          val_acc: event.val_acc as number | null,
        },
      ];
    } else if (status === "overfitting_detected") {
      p4.overfitEvents = [
        ...p4.overfitEvents,
        {
          epoch: event.epoch as number,
          message: event.message as string,
          new_dropout: event.new_dropout as number,
          new_lr: event.new_lr as number,
        },
      ];
    } else if (status === "done") {
      p4.done = true;
      p4.bestEpoch = event.best_epoch as number;
      p4.finalValAcc = event.final_val_acc as number | null;
      p4.finalValLoss = event.final_val_loss as number;
    }
    return { ...state, phase4: p4, phase5: { ...state.phase5, active: status === "done" } };
  }

  if (phase === "phase5") {
    const p5 = { ...state.phase5, active: true };
    const step = event.step as CompressStep | undefined;
    if (step) {
      const steps = { ...p5.steps };
      if (status === "running") steps[step] = "running";
      if (status === "step_done") steps[step] = "done";
      p5.steps = steps;
    }
    if (status === "done") {
      p5.done = true;
      p5.originalSizeMb = event.original_size_mb as number;
      p5.compressedSizeMb = event.compressed_size_mb as number;
      p5.accuracyLoss = event.accuracy_loss as number;
    }
    return { ...state, phase5: p5 };
  }

  if (phase === "pipeline") {
    if (status === "error") {
      return { ...state, status: "error", errorMessage: event.message as string };
    }
    if (status === "complete") {
      return {
        ...state,
        status: "complete",
        final: {
          jobId: event.job_id as string,
          onnxUrl: event.onnx_url as string,
          reportUrl: event.report_url as string,
          notebookUrl: event.notebook_url as string,
          elapsedSeconds: (event.report as Record<string, unknown>)?.elapsed_seconds as number,
        },
      };
    }
  }

  return state;
}
