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

## Deploying to GitHub Pages

The repository includes a GitHub Actions workflow that publishes the Vite build output to GitHub Pages. To see the app live:

1. Push this project to a GitHub repository using the `main` branch.
2. In your repository settings, enable **GitHub Pages** and choose **GitHub Actions** as the source (Pages will suggest the recommended workflow).
3. On every push to `main`, the `Deploy to GitHub Pages` workflow installs dependencies, builds the project and deploys the `dist/` output to GitHub Pages.
4. Your site will be available at `https://<username>.github.io/<repository-name>/` once the workflow completes.

The Vite configuration automatically sets the correct base path during production builds when it detects the GitHub repository name, ensuring that asset URLs resolve correctly on GitHub Pages.
