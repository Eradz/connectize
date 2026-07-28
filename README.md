# Connectize Frontend

[![Quality CI](https://github.com/LekiaAnonim/Connectize-Frontend/actions/workflows/quality.yml/badge.svg?branch=main)](https://github.com/LekiaAnonim/Connectize-Frontend/actions/workflows/quality.yml)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Scoped coverage](https://img.shields.io/badge/scoped_coverage-42.69%25-yellow)](docs/QUALITY_EVIDENCE.md)
[![Quality evidence](https://img.shields.io/badge/quality-evidence-0969DA)](docs/QUALITY_EVIDENCE.md)

Web application for the Connectize platform. The application uses React 18, React Router 7, Vite 7, TanStack Query, Tailwind CSS, and Capacitor.

## Requirements

- Node.js 20
- npm
- The NEM API for workflows that require backend data

## Setup

```bash
npm ci
npm run dev
```

The development server uses `http://localhost:3000` and proxies `/api` requests to `http://localhost:8000`.

## Verification

```bash
npm run test:seo
npm run test:coverage
npm run build
npm run check:bundle
npm run security:budget
npm run quality
npm run test:e2e
```

`npm run quality` runs deterministic SEO tests, a production build, and bundle-size budgets. Dependency and bundle budgets are ratchets: lower them after improvements so regressions cannot restore removed debt.

## Production Output

The production application is emitted to `build/client`. Vercel deployment behavior and response headers are defined in `vercel.json`.

## Reliability Program

See [docs/RELIABILITY_PROGRAM.md](docs/RELIABILITY_PROGRAM.md) for current baselines, CI gates, residual risks, and the staged remediation plan.
