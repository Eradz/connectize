# Frontend Quality Evidence

This document defines what "optimized" means for the Connectize frontend. A claim is accepted only when a repeatable check produces evidence tied to a Git commit.

## Evidence contract

The `Frontend quality` workflow runs on every push and pull request to `main`. It retains `reports/quality` for 90 days. The evidence manifest records:

- Git commit, branch, workflow run, runtime, platform, and architecture
- SHA-256 hashes for `package-lock.json` and every raw report
- Exit status for security, SEO, PDF, build, and bundle checks
- Production vulnerability counts and enforced budgets
- Total, startup, and largest JavaScript payload measurements
- Scoped line, statement, function, and branch coverage for the production modules exercised by the SEO and PDF tests

Generate equivalent local evidence with the workflow commands followed by:

```bash
npm run evidence:collect -- reports/quality/evidence.json
```

## Git-anchored optimization delta

The parent of reliability commit `107b5d9c` recorded production dependency ceilings of 2 critical, 9 high, and 15 total advisories. Commit `107b5d9c` lowered those ceilings to 0 critical, 6 high, and 8 total. The total bundle ceilings moved from 7,430,000 raw / 2,045,000 gzip bytes to 7,000,000 raw / 1,920,000 gzip bytes. Current measured output is 6,941,379 raw and 1,889,008 gzip bytes.

These are Git-verifiable budget and current-output figures. A lowered ceiling is not represented as an exact historical payload measurement.

## Acceptance matrix

| Area | Required standard | Current evidence | Status |
| --- | --- | --- | --- |
| Correctness | SEO and PDF behavior tests pass | Both checks pass | Achieved |
| Build | Reproducible production build | Vite build passes | Achieved |
| Critical dependency risk | Zero critical production advisories | 0 critical | Achieved |
| Dependency risk | Zero unaccepted production advisories | 8 advisories remain | Open |
| Startup payload | Gzip startup JavaScript at or below 575,000 bytes | 574,521 bytes | Achieved |
| Total payload | Gzip JavaScript at or below 1,920,000 bytes | 1,889,008 bytes | Achieved |
| Largest chunk | Largest gzip chunk at or below 373,000 bytes | 371,990 bytes | Achieved |
| Browser behavior | Critical workflows pass Chromium, Firefox, and WebKit | Not enforced in quality CI | Open |
| Accessibility | Automated WCAG checks plus keyboard workflow tests | Not enforced | Open |
| Field performance | Core Web Vitals SLOs from production telemetry | Not recorded in this repository | Open |
| Scoped coverage | `api/render-meta.js` and `src/lib/generatePDF.js` cannot regress | 42.69% lines/statements, 41.17% functions, 50% branches | Enforced baseline |
| Application coverage | React application and changed-code thresholds | React component suite is not active | Open |

## Audit rules

1. Never raise a budget to make a failing build pass without a documented risk acceptance.
2. Lower a budget after a measured improvement.
3. Preserve raw reports with the manifest; hashes make later alteration detectable.
4. Treat missing reports, missing exit records, or nonzero exits as failed evidence.
5. Platform migrations such as React Router 8 and React 19 require separate compatibility evidence.
6. Never describe scoped server/PDF coverage as whole-application coverage; activate the React component suite before publishing that metric.

This evidence demonstrates the listed controls. It does not prove production availability, user-perceived performance, accessibility, or operational recovery without their corresponding external measurements.