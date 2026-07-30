// Mirrors exactly what the FastAPI backend's /ws/run sends — see
// automl/app.py + automl/src/phases/*.py for the source of truth.

export type TaskType = "classification" | "regression";

export interface UploadResponse {
  job_id: string;
  filename: string;
  path: string;
  columns: string[];
  rows: number;
  preview: Record<string, unknown>[];
}

export interface ArchCandidate {
  index: number;
  total: number;
  architecture: string;
  accuracy: number | null;
  score: number;
}

export interface BestArchitecture {
  layers: number[];
  activation: string;
  dropout: number;
}

export interface HpoTrial {
  trial: number;
  total: number;
  lr: number;
  dropout: number;
  batch_size: number;
  accuracy: number | null;
  score: number;
}

export interface EpochEvent {
  epoch: number;
  total_epochs: number;
  train_loss: number;
  val_loss: number;
  train_acc: number | null;
  val_acc: number | null;
}

export interface OverfitEvent {
  epoch: number;
  message: string;
  new_dropout: number;
  new_lr: number;
}

export type CompressStep = "pruning" | "distillation" | "quantization" | "export";

export interface PipelineEvent {
  phase: "phase1" | "phase2" | "phase3" | "phase4" | "phase5" | "pipeline";
  status: string;
  message?: string;
  [key: string]: unknown;
}

export interface PipelineState {
  status: "idle" | "running" | "complete" | "error";
  phase1: {
    active: boolean;
    done: boolean;
    rows?: number;
    features?: number;
    target?: string;
    classBalance?: Record<string, number> | null;
    augmentMessage?: string;
    finalRows?: number;
    syntheticAdded?: number;
  };
  phase2: {
    active: boolean;
    done: boolean;
    total: number;
    candidates: ArchCandidate[];
    best?: BestArchitecture;
  };
  phase3: {
    active: boolean;
    done: boolean;
    total: number;
    trials: HpoTrial[];
    best?: HpoTrial;
  };
  phase4: {
    active: boolean;
    done: boolean;
    totalEpochs: number;
    epochs: EpochEvent[];
    overfitEvents: OverfitEvent[];
    bestEpoch?: number;
    finalValAcc?: number | null;
    finalValLoss?: number;
  };
  phase5: {
    active: boolean;
    done: boolean;
    steps: Record<CompressStep, "pending" | "running" | "done">;
    originalSizeMb?: number;
    compressedSizeMb?: number;
    accuracyLoss?: number;
  };
  final?: {
    jobId: string;
    onnxUrl: string;
    reportUrl: string;
    notebookUrl: string;
    elapsedSeconds: number;
  };
  errorMessage?: string;
}

export const initialPipelineState: PipelineState = {
  status: "idle",
  phase1: { active: false, done: false },
  phase2: { active: false, done: false, total: 6, candidates: [] },
  phase3: { active: false, done: false, total: 25, trials: [] },
  phase4: { active: false, done: false, totalEpochs: 40, epochs: [], overfitEvents: [] },
  phase5: {
    active: false,
    done: false,
    steps: { pruning: "pending", distillation: "pending", quantization: "pending", export: "pending" },
  },
};
