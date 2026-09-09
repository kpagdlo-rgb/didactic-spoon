# Contributing to Meder

Meder is a read-only, synthetic-only diagnostic. The project is a hackathon
submission and a careful-safety codebase: **no change may add an execution
path, an account lookup, a credential, a retry, or a claim that results are
exchange acceptance.**

## Ground rules

- Keep the frozen browser-test contract intact. `tests/browser/*.spec.ts`
  locators are locked; extend coverage, do not rewrite selectors to fit new
  UI. Route changes beyond the documented `/` → `/app` → `/meder` redirect
  need a plan amendment in `docs/meder/ui-refactor/06-VERIFICATION.md`.
- Copy discipline: no "AI" capability claims, no "spend" phrasing, no
  numerotation in UI copy. Verify with `scripts/probe-copy.mjs`.
- Safety statements survive every restyle: "a proposal is not an order",
  synthetic-labelled evidence, no live fallback (HTTP 451, no host
  workarounds).

## Setup

```sh
cd apps/meder
bun install --frozen-lockfile   # Bun is the package manager; Next runs on Node 24
bun run dev                     # http://localhost:3000 — landing /, tool /app
```

## Local gates (all must pass before a PR)

```sh
bun run typecheck
bun run test         # 87 Node tests via tsx --test under Node 24
bun run build
bun audit            # 0 vulnerabilities
bun run test:browser # 21 Playwright tests; CI mode runs them against `next start`
```

Python reader (port 3001): `.venv/bin/python -m unittest discover -s tests -v`.

Rendered-UI and copy probes are documented in `docs/meder/RUNBOOK.md`.

## Documentation

- `docs/meder/SPEC.md` — implementation specification; behavior changes update it.
- `docs/meder/RUNBOOK.md` — operation, helpers, host/origin notes.
- `docs/meder/ui-refactor/` — UI/UX audit, design system, verification contract.

## Honesty

Submission receipt, eligibility, and acceptance are **unverified**. Do not
write text that implies verified submission, live exchange access, or a
working real-model run. See `docs/meder/SUBMISSION.md`.
