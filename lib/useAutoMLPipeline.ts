"use client";

import { useCallback, useReducer, useRef, useState } from "react";
import { API_URL, WS_URL } from "./config";
import { initialPipelineState, TaskType, UploadResponse } from "./types";
import { pipelineReducer } from "./pipelineReducer";

export function useAutoMLPipeline() {
  const [state, dispatch] = useReducer(pipelineReducer, initialPipelineState);
  const [upload, setUpload] = useState<UploadResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/api/upload`, { method: "POST", body: form });
      if (!res.ok) throw new Error(`Upload failed (${res.status})`);
      const data: UploadResponse = await res.json();
      setUpload(data);
      return data;
    } finally {
      setUploading(false);
    }
  }, []);

  const start = useCallback((taskType: TaskType, targetCol: string) => {
    if (!upload) return;

    const ws = new WebSocket(`${WS_URL}/ws/run`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          path: upload.path,
          job_id: upload.job_id,
          task_type: taskType,
          target_col: targetCol,
        })
      );
    };

    ws.onmessage = (msg) => {
      const event = JSON.parse(msg.data);
      dispatch(event);
    };

    ws.onerror = () => {
      dispatch({ phase: "pipeline", status: "error", message: "WebSocket connection error." });
    };
  }, [upload]);

  return { state, upload, uploading, uploadFile, start };
}
