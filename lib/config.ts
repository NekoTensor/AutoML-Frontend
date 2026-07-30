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
