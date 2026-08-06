"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, ensureGsapRegistered, prefersReducedMotion } from "@/lib/gsap";
import MagneticButton from "./MagneticButton";
import ThemedSelect from "./ThemedSelect";
import { TaskType, UploadResponse } from "@/lib/types";

interface Props {
  onUpload: (file: File) => Promise<UploadResponse>;
  onStart: (taskType: TaskType, targetCol: string) => void;
  uploading: boolean;
  disabled: boolean;
}

export default function UploadCard({ onUpload, onStart, uploading, disabled }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [upload, setUpload] = useState<UploadResponse | null>(null);
  const [taskType, setTaskType] = useState<TaskType>("classification");
  const [targetCol, setTargetCol] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useLayoutEffect(() => {
    ensureGsapRegistered();
    if (prefersReducedMotion() || !cardRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: cardRef.current, start: "top 85%" },
        }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clear the input straight away so picking the same file twice still
    // fires onChange — otherwise a retry after a failure silently does
    // nothing, because the input's value hasn't changed.
    e.target.value = "";
    if (!file) return;

    setFileName(file.name);
    setError(null);
    // Drop any previous dataset first: leaving the old columns on screen
    // while a new upload fails would let you start a run against the wrong
    // file's target column.
    setUpload(null);
    setTargetCol("");

    try {
      const data = await onUpload(file);
      if (!data.columns?.length) {
        setError("That CSV has no columns to train on.");
        return;
      }
      setUpload(data);
      setTargetCol(data.columns[data.columns.length - 1]);
    } catch (err) {
      // This used to be an unhandled rejection: the upload failed, nothing
      // was rendered, and the target-column dropdown just never appeared
      // with no indication why.
      setError(err instanceof Error ? err.message : "Upload failed.");
    }
  };

  return (
    <section id="upload" className="px-6 py-24">
      <div
        ref={cardRef}
        className="reduced-motion-static glass-strong neon-border max-w-2xl mx-auto rounded-3xl p-10 shadow-2xl shadow-black/40"
      >
        <h3 className="font-display text-2xl font-bold mb-1">Start a run</h3>
        <p className="text-white/50 text-sm mb-8">Upload a CSV — everything downstream is automatic.</p>

        <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Dataset (CSV)</label>
        <label
          className={`flex items-center justify-between rounded-xl border bg-white/5 px-4 py-3 cursor-pointer hover:border-accent2/50 transition-colors ${
            error ? "border-red-500/50 mb-2" : "border-white/10 mb-6"
          }`}
        >
          <span className="text-sm text-white/70">{fileName || "Choose a CSV file..."}</span>
          <span className="text-xs text-accent2 font-mono">{uploading ? "uploading…" : "browse"}</span>
          <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-300 mb-6">
            {error}
          </p>
        )}

        <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Task type</label>
        <div className="flex gap-6 mb-6">
          {(["classification", "regression"] as TaskType[]).map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="taskType"
                checked={taskType === t}
                onChange={() => setTaskType(t)}
                className="accent-accent"
              />
              <span className="capitalize">{t}</span>
            </label>
          ))}
        </div>

        <label className="block text-xs uppercase tracking-wider text-white/50 mb-2">Target column</label>
        <div className="mb-8">
          <ThemedSelect
            value={targetCol}
            onChange={setTargetCol}
            options={upload?.columns ?? []}
            placeholder="Upload a CSV first"
            disabled={!upload}
          />
        </div>

        <MagneticButton
          disabled={!upload || disabled}
          onClick={() => onStart(taskType, targetCol)}
          className="w-full rounded-xl py-4 font-semibold bg-gradient-to-r from-accent2 to-accent text-ink disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start AutoML
        </MagneticButton>
      </div>
    </section>
  );
}
