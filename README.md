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

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

- `src/engine/` — HRM runtime, weather state, mechanisms, and simulation logic
- `src/domains/` — Domain models (hurricane twins, weather patterns)
- `src/components/` — React UI components
- `src/types/` — TypeScript type definitions
- `docs/` — Architecture and roadmap documentation

## License

AGPL-3.0-only — see [LICENSE](LICENSE) for details.

---

Part of the [Axiom Zeta Innovations](https://github.com/Axiom-Zeta-Innovations-LLC) open source ecosystem.
