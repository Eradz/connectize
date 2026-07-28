# Connectize Reliability Program

Last verified: 2026-07-27

## Scope

This program covers:

- `Connectize-Frontend`: React/Vite web application and Capacitor shell
- `ConnectizeMobile`: React Native iOS/Android application
- `NEM`: Django/Wagtail API, workers, channels, and integrations

The operating rule is to preserve observed behavior, introduce a measurable gate, make one bounded improvement, and lower the gate after verification.

## Implemented Controls

### Web

- GitHub Actions installs from the lockfile, audits dependencies, runs SEO behavior tests, builds production assets, and enforces bundle budgets.
- Vercel responses now set `Referrer-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, and `Permissions-Policy`.
- Bundle checks measure whole-app JavaScript, the exact startup chunks referenced by HTML, and largest chunks in raw and gzip bytes.
- Dependency checks fail if critical, high, or total advisories exceed the recorded baseline.

Commands:

```bash
npm run quality
npm run security:budget
```

### Mobile

- CI now runs type, lint, test, and dependency risk budgets before native compilation.
- The iOS job installs npm dependencies and Pods, then builds the real `ios/ConnectizeMobile.xcworkspace` and `ConnectizeMobile` scheme.
- React Query now keeps data fresh for one minute, retains inactive data for 30 minutes, and avoids unconditional focus/mount refetches.
- A focused test protects the cache policy.
- The event registration screen now calls the existing `getEvent` API method.
- Obsolete event screen copies and a stale patch for removed document-picker v9 were deleted.

Commands:

```bash
npm run quality:budget
npm run security:budget
npm run postinstall
```

### Backend

- CI validates Python syntax, Django configuration, migration drift, dependency risk, and the complete test suite.
- Tests require an explicit disposable PostgreSQL URL. They cannot silently use Railway or an incompatible SQLite schema.
- Production settings reject `DEBUG=True` and enforce HTTPS redirect, secure cookies, HSTS, MIME sniffing protection, frame denial, and an explicit CORS allowlist.
- The invalid, unreferenced `featured_ads/admin_old.py` archive was removed.

Commands:

```bash
python scripts/security_budget.py
DJANGO_SETTINGS_MODULE=connectize.settings.production DEBUG=False python manage.py check --deploy
DJANGO_SETTINGS_MODULE=connectize.settings.test TEST_DATABASE_URL=<disposable-postgres-url> python manage.py test --noinput
```

## Verified Metrics

| Metric | Before | Current | Change |
| --- | ---: | ---: | ---: |
| Web production dependency advisories | 34 | 15 | -55.9% |
| Web high advisories | 19 | 9 | -52.6% |
| Web startup JavaScript chunks, raw | 3,674,062 B | 1,749,295 B | -52.4% |
| Web startup JavaScript chunks, gzip | 1,028,008 B | 571,746 B | -44.4% |
| Web total JavaScript, raw | 8,492,524 B | 7,422,186 B | -12.6% |
| Web total JavaScript, gzip | 2,356,236 B | 2,041,914 B | -13.3% |
| Web largest chunk, raw | 2,641,427 B | 1,145,146 B | -56.6% |
| Mobile critical dependency advisories | 2 | 0 | -100% |
| Mobile TypeScript errors | 124 | 93 | -25.0% |
| Mobile passing tests | 149 | 151 | +2 |
| Mobile failing tests | 6 | 6 | unchanged |
| Backend Python syntax validation | failed | passed | invalid archive removed |
| Django deployment warnings | 4 | 0 | -100% |
| Backend dependency advisories | not measured | 159 in 25 packages | budget established |

The cache change prevents automatic remount refetches while data is less than one minute old. Exact request and battery reductions require production telemetry; no unmeasured percentage is claimed.

Web startup measurements cover the entry script and JavaScript module-preload links emitted in `index.html`. They exclude CSS, HTML, request headers, and network latency, so they are bundle metrics rather than a claim about end-user Largest Contentful Paint.

## Current Ratchets

### Web bundle

- Total raw JavaScript: 7,430,000 bytes maximum
- Total gzip JavaScript: 2,045,000 bytes maximum
- Startup raw JavaScript: 1,760,000 bytes maximum
- Startup gzip JavaScript: 575,000 bytes maximum
- Largest raw chunk: 1,150,000 bytes maximum
- Largest gzip chunk: 373,000 bytes maximum

### Mobile quality

- TypeScript errors: 93 maximum
- ESLint errors: 98 maximum
- ESLint warnings: 770 maximum
- Failing tests: 6 maximum
- Passing tests: 151 minimum

### Dependency risk

- Web: critical 2, high 9, total 15 maximum
- Mobile: critical 0, high 17, total 24 maximum
- Backend: 159 advisories across 25 packages maximum

These are debt ceilings, not desired end states. Every remediation PR should reduce the corresponding value.

## Residual Risks

1. Web has two critical advisories in `jspdf` and `swiper`. Available fixes require major upgrades and compatibility testing.
2. Web startup JavaScript is now 572 KB gzip. The entry still contains the broad Radix icon package, and the preloaded Chakra UI chunk is 130 KB gzip.
3. Mobile still has 93 type errors, 98 lint errors, 770 warnings, and six failing tests. CI prevents regression but does not declare this debt acceptable.
4. Backend has 159 dependency advisories. Upgrade Django 4.2 and infrastructure libraries in tested batches.
5. The full 464-test backend suite requires disposable PostgreSQL. Local validation covered syntax, configuration, migration drift, and production deployment checks; CI owns the complete database run.
6. Wagtail user-form settings emit deprecation warnings and must be migrated before Wagtail 7.
7. Auth token lifetime, email verification policy, and cookie-based browser authentication require product-aware migrations and should not be changed as incidental cleanup.
8. Frontend `.env.production` is tracked. Current Stripe publishable values are public identifiers, but server secrets must never be placed in client environment files.

## Next Remediation Order

1. Repair the six failing mobile test suites, then set the allowed failure count to zero.
2. Fix mobile type errors by active feature area, lowering the ceiling in each PR.
3. Upgrade `jspdf` behind PDF regression tests and `swiper` behind carousel interaction tests.
4. Replace broad Radix icon imports in eager navigation components and target startup JavaScript below 500 KB gzip.
5. Upgrade backend dependencies in small groups, starting with Django security releases, `urllib3`, `cryptography`, and request-processing dependencies.
6. Add API contract generation and breaking-change detection between Django, web, and mobile.
7. Add Sentry release tagging, request correlation IDs, Web Vitals, mobile startup/crash metrics, and API latency/error service-level objectives.
8. Require the quality workflows as protected-branch checks before deployment.

## Release Policy

A release is eligible only when:

- all repository quality workflows pass;
- no ratchet increases without an explicit reviewed exception;
- migrations are backward compatible and reviewed separately;
- critical workflows have smoke coverage;
- production telemetry and rollback ownership are identified;
- dependency exceptions name an owner, remediation issue, and target date.
