# Contributing to the AutoML frontend

## The actual deploy flow

This repo is connected directly to Vercel's GitHub integration — no
custom Action needed here (unlike the backend, which needs one to
reach Hugging Face). Concretely:

1. You fork this repo and open a PR against `main`.
2. Vercel automatically builds a **preview deployment** for your PR —
   look for the Vercel bot's comment on your PR with a live URL. Anyone
   reviewing can click through and actually use your changes before
   merging, not just read the diff.
3. When a maintainer merges your PR, Vercel automatically redeploys
   **production** from `main`. Nothing manual.

## Before opening a PR

- This project was originally hand-written without `npm install` ever
  being run against it in the environment that created it — if you're
  reading this and everything already builds cleanly, that's no longer
  true and this note is stale; feel free to delete it.
- If your change touches `lib/types.ts` or `lib/pipelineReducer.ts`
  (the websocket event contract), check whether the backend repo's
  `app.py` / `src/phases/*.py` need a matching update, and link both
  PRs in your description.
- Respect the existing `prefers-reduced-motion` handling — every new
  GSAP timeline should check `prefersReducedMotion()` from `lib/gsap.ts`
  before running, and have a static fallback. This isn't optional
  polish, it's an accessibility requirement for this project.
- Test locally against a real running backend
  (`NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` in `.env.local`) before
  opening the PR — a change that only works against mocked data can
  still break the live websocket flow.

## Environment variable a maintainer needs configured on Vercel

- `NEXT_PUBLIC_API_URL` — set in the Vercel project's Environment
  Variables, pointing at the deployed backend's HF Space URL. Preview
  deployments inherit this too unless overridden per-branch.

## Local setup

```bash
npm install
cp .env.local.example .env.local
npm run dev
```
