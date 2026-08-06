// Central place for the backend origin so it's one env var to change
// when this frontend and the FastAPI backend live on different domains
// (e.g. this on Vercel, backend on an HF Space).
//
// Set NEXT_PUBLIC_API_URL in `.env.local` for local dev, and in your
// Vercel project's environment variables for production, e.g.:
//   NEXT_PUBLIC_API_URL=https://your-username-automl-backend.hf.space

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// Strip any trailing slash so we can safely do `${API_URL}/api/...`
export const API_URL = rawApiUrl.replace(/\/+$/, "");

// Derive the websocket URL from the same origin (http -> ws, https -> wss)
export const WS_URL = API_URL.replace(/^http/, "ws");

// The backend hands back download links as root-relative paths
// ("/api/download/onnx/abc123"), but nothing stops a future version from
// returning an absolute URL instead — e.g. if artifacts move to S3 or a
// CDN. Naively doing `${API_URL}${path}` would mangle that into
// "https://backend/https://cdn/..." , so resolve properly: absolute URLs
// pass through untouched, relative ones get the API origin prefixed.
export function resolveApiUrl(path: string): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
