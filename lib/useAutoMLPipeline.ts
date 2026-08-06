"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { API_URL, WS_URL } from "./config";
import { initialPipelineState, TaskType, UploadResponse } from "./types";
import { pipelineReducer } from "./pipelineReducer";

// A pipeline run outlives the page that started it: the job is owned by the
// backend and keyed by `job_id`, so a reload, an accidental back-navigation
// or a dropped connection shouldn't destroy a run that's still going. We
// stash just the job id — not the accumulated UI state — because the server
// keeps an event log per job and replays it on attach. Replaying through the
// same reducer that handled the events live means the restored view is
// reconstructed rather than serialized, so it can never drift out of sync
// with the live rendering path.
const ACTIVE_JOB_KEY = "nekocortex:activeJobId";

function readStoredJobId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(ACTIVE_JOB_KEY);
  } catch {
    // Safari in private mode throws on sessionStorage access; resume is a
    // nice-to-have, so degrade to "no stored job" rather than breaking boot.
    return null;
  }
}

function writeStoredJobId(jobId: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (jobId) window.sessionStorage.setItem(ACTIVE_JOB_KEY, jobId);
    else window.sessionStorage.removeItem(ACTIVE_JOB_KEY);
  } catch {
    /* see above */
  }
}

export function useAutoMLPipeline() {
  const [state, dispatch] = useReducer(pipelineReducer, initialPipelineState);
  const [upload, setUpload] = useState<UploadResponse | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resuming, setResuming] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  // Distinguishes "the socket closed because we asked it to" from "the socket
  // closed on us", so onclose can tell a cancel apart from a real disconnect.
  const intentionalCloseRef = useRef(false);

  const closeSocket = useCallback(() => {
    intentionalCloseRef.current = true;
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  // Shared wiring for both a fresh run and a re-attach. Everything the server
  // sends flows through the reducer; everything that can go wrong ends up as
  // an explicit terminal state rather than a spinner that never stops.
  const openSocket = useCallback((url: string, onOpen?: (ws: WebSocket) => void) => {
    closeSocket();
    intentionalCloseRef.current = false;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => onOpen?.(ws);

    ws.onmessage = (msg) => {
      try {
        dispatch(JSON.parse(msg.data));
      } catch {
        // A single malformed frame must not take down the run: previously this
        // threw out of the handler and every later event was silently dropped.
        dispatch({
          phase: "pipeline",
          status: "error",
          message: "Received a malformed event from the server.",
        });
      }
    };

    ws.onerror = () => {
      dispatch({ phase: "pipeline", status: "error", message: "WebSocket connection error." });
    };

    ws.onclose = () => {
      if (wsRef.current === ws) wsRef.current = null;
      if (intentionalCloseRef.current) return;
      // The server hanging up without a terminal event is the case that used
      // to leave the UI pinned at "running" forever. The reducer ignores this
      // unless the run really was still in flight.
      dispatch({
        phase: "pipeline",
        status: "disconnected",
        message: "Lost connection to the backend before the run finished.",
      });
    };

    return ws;
  }, [closeSocket]);

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

  const start = useCallback(
    (taskType: TaskType, targetCol: string) => {
      if (!upload) return;

      dispatch({ phase: "pipeline", status: "reset" });
      dispatch({ phase: "pipeline", status: "started", job_id: upload.job_id });
      writeStoredJobId(upload.job_id);

      openSocket(`${WS_URL}/ws/run`, (ws) => {
        ws.send(
          JSON.stringify({
            path: upload.path,
            job_id: upload.job_id,
            task_type: taskType,
            target_col: targetCol,
          })
        );
      });
    },
    [upload, openSocket]
  );

  const cancel = useCallback(async () => {
    const jobId = state.jobId;
    // Close first so the imminent socket teardown isn't mistaken for a crash.
    closeSocket();
    dispatch({ phase: "pipeline", status: "cancelled" });
    writeStoredJobId(null);
    if (!jobId) return;
    try {
      // Best-effort: the run is already gone from this user's view either way,
      // this just stops the backend burning CPU on an abandoned job.
      await fetch(`${API_URL}/api/cancel/${jobId}`, { method: "POST" });
    } catch {
      /* nothing useful to show — the UI has already moved on */
    }
  }, [state.jobId, closeSocket]);

  const reset = useCallback(() => {
    closeSocket();
    writeStoredJobId(null);
    dispatch({ phase: "pipeline", status: "reset" });
  }, [closeSocket]);

  // Resume-on-mount. Runs once: if a previous page load left a job behind, ask
  // the backend whether it's still alive and re-attach to its event stream.
  useEffect(() => {
    const jobId = readStoredJobId();
    if (!jobId) return;

    let cancelled = false;
    setResuming(true);

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/job/${jobId}`);
        if (!res.ok) throw new Error("job lookup failed");
        const { status } = (await res.json()) as { status: string };
        if (cancelled) return;

        // Nothing to attach to — the job finished long ago and was swept, or
        // the backend restarted. Clear the pointer instead of showing a stale
        // "reconnecting" state forever.
        if (status === "unknown") {
          writeStoredJobId(null);
          return;
        }

        dispatch({ phase: "pipeline", status: "started", job_id: jobId });
        openSocket(`${WS_URL}/ws/attach/${jobId}`);
      } catch {
        if (!cancelled) writeStoredJobId(null);
      } finally {
        if (!cancelled) setResuming(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Intentionally mount-only: re-attaching on every render would fight the
    // socket that a live run already owns.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Once a run reaches a terminal state there's nothing left to resume, so
  // drop the pointer — otherwise the next page load would try to re-attach to
  // a job that's already done and briefly flash a reconnecting state.
  useEffect(() => {
    if (state.status === "complete" || state.status === "error") writeStoredJobId(null);
  }, [state.status]);

  // Tear the socket down when the component goes away, so a navigation away
  // mid-run doesn't leak an open connection (and, in StrictMode, a doubled one).
  useEffect(() => () => closeSocket(), [closeSocket]);

  return { state, upload, uploading, resuming, uploadFile, start, cancel, reset };
}
