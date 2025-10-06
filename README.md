# RuneScape Defensive Lab

A modern, API-driven RuneScape 3 survivability workbench. This project lays the foundation for a fully-fledged defensive calculator that pulls armour, prayer, aura, familiar and boss-mechanic data from live community APIs.

## Getting started

```bash
pnpm install
pnpm dev
```

The app is bootstrapped with Vite + React + TypeScript and uses React Query for data orchestration. All data is cached with TTLs so that equipment and mechanic information can be refreshed without redeploying the application.

## Project structure

- `src/api` – HTTP helpers, API registry and domain-specific fetchers
- `src/features` – UI modules for combat style, armour, hitpoints, bosses and simulation preview
- `src/state` – Zustand-powered global state and React context for user configuration
- `src/utils` – Calculation helpers for hitpoints and defensive mitigation pipelines

Future iterations will move heavy simulations into a Web Worker and expand the defensive ability engine.
