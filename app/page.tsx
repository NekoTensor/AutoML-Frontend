"use client";

import Hero from "@/components/Hero";
import ScrollySteps from "@/components/ScrollySteps";
import UploadCard from "@/components/UploadCard";
import PhaseFeed from "@/components/PhaseFeed";
import Dashboard from "@/components/Dashboard";
import { useAutoMLPipeline } from "@/lib/useAutoMLPipeline";

export default function Page() {
  const { state, uploading, uploadFile, start } = useAutoMLPipeline();

  return (
    <main>
      <Hero />
      <ScrollySteps />
      <UploadCard onUpload={uploadFile} onStart={start} uploading={uploading} disabled={state.status === "running"} />
      <PhaseFeed state={state} />
      {state.status === "error" && (
        <section className="px-6 pb-24">
          <div className="max-w-2xl mx-auto rounded-2xl border border-red-500/40 bg-red-500/10 text-red-300 p-6">
            Pipeline error: {state.errorMessage}
          </div>
        </section>
      )}
      {state.status === "complete" && state.final && <Dashboard final={state.final} />}
    </main>
  );
}
