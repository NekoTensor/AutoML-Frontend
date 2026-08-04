# AutoML — Cinematic Frontend (Next.js 15 + Tailwind + GSAP)

This replaces `automl/static/index.html` with a scroll-driven, dark
luxury-tech redesign of the **same functional app** — upload a CSV, pick a
task type and target column, watch all 5 phases stream live over the same
WebSocket contract, download the same 3 files at the end (ONNX, JSON
report, notebook). Nothing about the backend's behavior changed — only
how it's presented.

## What's actually running here

- **Hero** — a pinned section where a small neural-network SVG "draws
  itself" (nodes fade/scale in, edges stroke-draw) exactly in sync with
  scroll position via GSAP `ScrollTrigger` with `scrub: true`. This
  stands in for a literal scrubbed product video, since generating a
  real demo video wasn't something I could do here — swap in a `<video>`
  element with `currentTime` driven by the same scrub timeline if you'd
  rather use actual footage.
- **4-step scrollytelling** — Understand → Search & Tune → Train →
  Compress, each card fading/translating up as it enters the viewport,
  with a subtle parallax drift as you scroll past.
- **Upload card** — glassmorphic, the real functional entry point. Same
  upload → target-column-dropdown → Start AutoML flow as before.
- **Live phase feed** — same 5 phases, same event contract, now rendered
  as glass cards with GSAP-animated entrances instead of plain CSS.
- **Dashboard** — same 3 downloads, now with magnetic-hover buttons.
- **Smooth inertia scrolling** — Lenis (`components/SmoothScroll.tsx`)
  intercepts scroll and smooths it with momentum, then drives each frame
  from GSAP's ticker so ScrollTrigger animations stay in sync with the
  smoothed position instead of the raw one.
- **Reduced motion** — every GSAP timeline checks
  `prefers-reduced-motion` before running (see `lib/gsap.ts`'s
  `prefersReducedMotion()`) and falls back to a static, fully-visible
  state with a simple fade-in instead of scrub/parallax/pin. There's
  also a CSS-level fallback in `globals.css` as a second line of
  defense for anything GSAP doesn't reach.

## Project layout

```
automl-frontend/
├── app/
│   ├── layout.tsx       # root layout, fonts, metadata
│   ├── page.tsx         # assembles Hero → ScrollySteps → UploadCard → PhaseFeed → Dashboard
│   └── globals.css      # glassmorphism utilities + prefers-reduced-motion fallback
├── components/
│   ├── Hero.tsx         # scroll-scrubbed SVG network + parallax title
│   ├── ScrollySteps.tsx # 4-step scrollytelling section
│   ├── UploadCard.tsx   # functional upload/config form
│   ├── PhaseFeed.tsx    # all 5 live phase cards
│   ├── PhaseCard.tsx    # shared glass card shell + entrance animation
│   ├── LiveLog.tsx      # auto-scrolling log list with per-line fade-in
│   ├── ProgressBar.tsx
│   ├── Dashboard.tsx    # final downloads
│   ├── MagneticButton.tsx
│   ├── SmoothScroll.tsx # Lenis inertia scrolling, fed into GSAP's ticker
│   ├── AmbientBackground.tsx
│   ├── BrandHeader.tsx  # NekoCortex header
│   └── LogoMark.tsx     # NekoCortex logo SVG
├── lib/
│   ├── config.ts        # API_URL / WS_URL — the one place to point at your backend
│   ├── types.ts         # TS types mirroring the backend's websocket event contract
│   ├── pipelineReducer.ts # maps each websocket event onto UI state
│   ├── useAutoMLPipeline.ts # upload + websocket hook, used by page.tsx
│   └── gsap.ts           # registers ScrollTrigger once, prefersReducedMotion()
└── .env.local.example
```

## Continuous deployment

Once this repo is connected to a Vercel project, it deploys natively —
every push to `main` redeploys production, every PR gets its own
preview URL automatically. No custom Action needed here (unlike the
backend). See `CONTRIBUTING.md` for the contributor-facing version of
this flow.

## Setup

**Important — this was written without a network connection available in
the environment it was built in, so `npm install` was never actually run
against it.** Every file was hand-written and checked for structural
correctness (brace/paren balance, consistent typing against the backend's
real event shapes), but you're the first one to actually build it. If
something doesn't compile, paste me the exact error and I'll fix it —
don't assume it's your setup that's wrong.

```bash
cd automl-frontend
npm install
cp .env.local.example .env.local
```

Edit `.env.local` to point at your running backend (defaults to
`http://127.0.0.1:8000`, matching the FastAPI project's default).

```bash
npm run dev
```

Open **http://localhost:3000**. Make sure the FastAPI backend
(`automl/app.py`) is running separately on port 8000 — this frontend is
now a fully separate process/origin from it, which is also why
`automl/app.py` picked up a `CORSMiddleware` block in this same round of
changes; without it, the browser will block every request from
`localhost:3000` to `localhost:8000`.

## Known gaps / things I'd tell you about before you show this to anyone

- **No real product video.** The hero's scroll-scrubbed centerpiece is a
  generated SVG network diagram, not footage of the actual app running.
  If you want a literal video-scrub hero, record a screen capture of a
  real run and swap `Hero.tsx`'s SVG block for a `<video>` element whose
  `currentTime` is set from the same scroll-progress calculation.
- **Tailwind v3, not v4.** Next.js 15 works with either; this pins v3
  since it's the more battle-tested pairing as of when this was written
  — upgrade path to v4 exists if you want it later, but wasn't tested
  here.
