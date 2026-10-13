# Thoth Weather Oracle

> AI-powered weather prediction using digital twin world models.

Thoth Weather Oracle is a weather forecasting workbench built on HRM (Hierarchical Reasoning Model) architecture. It uses digital twin simulations — virtual replicas of weather systems — to predict and analyze weather patterns, with a special focus on hurricane tracking and severe weather events.

## Features

- **Digital Twin World Models** — Virtual replicas of weather systems that evolve in simulation
- **Hurricane Twin Framework** — Dedicated hurricane tracking and intensity modeling
- **Weather Pattern Simulation** — Multi-feed weather pattern analysis and prediction
- **Topology Visualization** — Interactive canvas showing weather system topology
- **Mechanism Console** — Inspect and control the simulation mechanisms
- **Consequence Evaluation** — Assess potential impacts of weather scenarios
- **Replay & Ledger** — Full simulation history with replay controls and audit ledger
- **Gemini Integration** — Optional LLM-powered weather analysis via Google Gemini

## Architecture

Built on HRM Ecology substrate principles:

- Common immutable snapshot for all mechanisms
- Proposal-only mechanisms (no direct mutation)
- Arbitration and singular commit
- Explanation ledger and conservation diagnostics
- Consequence evaluation, credit assignment, and reputation updates

## Run Locally

Prerequisites: Node.js 20+

1. Install dependencies:
   ```bash
   npm install
   ```
2. Set `GEMINI_API_KEY` in `.env.local` (optional, for LLM-powered analysis)
3. Start dev server:
   ```bash
   npm run dev
   ```

## Deploy on Vercel

The `api/` directory contains Vercel Serverless Functions that mirror the
Express server's routes (`/api/health`, `/api/gemini/*`, `/api/weather/*`),
so the deployed app keeps full AI and weather-feed functionality — no
long-running server needed. `vercel.json` handles SPA routing and function
timeouts.

1. Import this repo at [vercel.com](https://vercel.com) → Add New → Project
   (framework preset: Vite, build command `npm run build`, output `dist`).
2. (Optional, recommended) Add a `GEMINI_API_KEY` environment variable in the
   project settings. Without it, the app runs on its built-in heuristic
   fallbacks; with it, the Gemini reasoning / critique / weather-analysis
   endpoints go live.
3. Deploy. Every push to `main` redeploys automatically.

Local dev still uses the Express server (`npm run dev` → `server.ts`), which
shares its Gemini logic with the serverless functions via `lib/thoth-api.ts` —
behavior is identical in both environments.

## Build for Production (self-hosted)

```bash
npm run build
npm start
```

## Project Structure

- `src/engine/` — HRM runtime, weather state, mechanisms, and simulation logic
- `src/domains/` — Domain models (hurricane twins, weather patterns)
- `src/components/` — React UI components
- `src/types/` — TypeScript type definitions
- `api/` — Vercel Serverless Functions mirroring the Express API routes
- `lib/thoth-api.ts` — Shared API helpers (Gemini client, fallbacks) used by both `server.ts` and `api/`
- `server.ts` — Express server for local development
- `vercel.json` — Vercel deployment config (SPA rewrites, function timeouts)
- `docs/` — Architecture and roadmap documentation

## License

AGPL-3.0-only — see [LICENSE](LICENSE) for details.

---

Part of the [Axiom Zeta Innovations](https://github.com/Axiom-Zeta-Innovations-LLC) open source ecosystem.
