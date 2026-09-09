# Agent OS research and blueprints

## Selected product: Meder

OrderMedic is now named **Meder**. The independent Next.js application in
`apps/meder` diagnoses synthetic Spot-style `LIMIT`/`GTC` orders at `/` or `/meder`.
Its authoritative server-side BigInt/rational solver can propose an explicitly
permitted BUY quantity reduction; SELL remains exact-only. It never executes,
retries, signs, or looks up an order and has no exchange credentials or account access.
The Python Preview is a separate document reader, not a competing solver.

**Current delivery:** tested synthetic diagnostic application with an optional
OpenAI Responses tool-calling adapter and a post-submission private model-access gate.
The user reported submission at `2026-09-08T23:59:39.346Z`; receipt, eligibility,
acceptance, and the exact submitted payload remain unverified. The latest published
pre-report source baseline is `4a576289e26afdac6b8281b1c22011cdc2cf397c`, not a claim
that this exact revision was submitted. Model capability remains unconfigured;
no genuine model run or live data has been verified.
All results are partial validation, not exchange acceptance; the notional cap
excludes fees. The implementation and remaining gates are documented in:

- [Product/build manifest](docs/meder/MANIFEST.md)
- [Implementation specification](docs/meder/SPEC.md)
- [Prioritized TODO plan](docs/meder/TODO.md)
- [Machine-readable manifest](docs/meder/manifest.json)
- [Plan drift audit](docs/meder/PLAN-AUDIT.md)
- [Runbook](docs/meder/RUNBOOK.md)
- [Submission handoff and external gates](docs/meder/SUBMISSION.md)

## Run and verify Meder

Verified with Node 24, Next.js 16.3.4, React 19.2.8, and TypeScript 5.9.3;
dependencies are pinned in `apps/meder/package-lock.json`.

```sh
npm --prefix apps/meder ci
npm --prefix apps/meder run dev -- --port 3000
```

Open port 3000. In another terminal:

```sh
npm --prefix apps/meder run typecheck
npm --prefix apps/meder test
npm --prefix apps/meder run build
# With the dev server running; install Chromium once if needed:
cd apps/meder
npx playwright install chromium
npm run test:browser
```

At the 8 September 2026 rebuild checkpoint, local verification recorded
69 passing Node tests (including 1,000 generated exhaustive-reference solver cases)
and passing typecheck/build, nine Playwright tests, and six separate Python reader
tests. The effective setup script was rerun successfully (npm clean install and
Python dependencies; the production dependency audit reported zero vulnerabilities).
An actual managed-preview Host-shaped HTTP request returned 200. The repair
screenshot was captured, inspected, and shared privately in the thread; no
finalized demonstration video or real-model trace is verified. A later recording
attempt stalled and was stopped; its unverified private artifact is not video proof.
Hosted CI for the published baseline subsequently [passed (run 34292462782)](https://github.com/kpagdlo-rgb/didactic-spoon/actions/runs/34292462782).
These historical results do not verify later changes. The post-submission access-gate
checkpoint separately passed **87 Node tests, 20 Playwright tests, six reader tests,
typecheck, and production build**; the production dependency audit reported zero
vulnerabilities. Access UI tests use controlled transport, while server tests exercise
the real handlers with injected provider responses. Neither establishes genuine model use.

Live mode is disabled and locally returns HTTP 451 without making a Binance
request. This enforces the historical sandbox restriction, not a newly observed
exchange response. Do not evade it through another host or proxy.

## Private model-enabled Meder deployment

The independent Next.js app in `apps/meder` optionally uses OpenAI Responses when
`OPENAI_API_KEY`, `OPENAI_MODEL`, and a separate `MEDER_MODEL_ACCESS_KEY` are configured
**on the server only**, and the browser session explicitly unlocks model access.
The adapter uses server-side `fetch`, not an installed provider SDK, hosted MCP,
or Binance Skill. Missing or invalid gate settings fail closed; provider settings
alone never authorize anonymous paid calls. Generate a separate shared demo key
(32–256 non-space printable ASCII characters); it is not an OpenAI or Binance key.
See [secret setup and unlock steps](docs/meder/RUNBOOK.md#optional-real-model-gate).
Before supplying a provider key, put the
entire app and its API behind a private authenticated gateway, including preview
deployments. The app's session cookie isolates diagnoses; it does not authenticate
users. The new shared-key gate grants model access to that signed HttpOnly session
for a fixed 15 minutes, with 10 login attempts/minute globally per process.
Logout, expiry, or key rotation revoke access and cancel that session's active model
runs, not deterministic runs. The UI clears the entered key and never persists it in
browser storage. A revoked model selection stays selected but disabled; there is no
silent deterministic fallback. Anonymous deterministic diagnosis remains available.
This is a private-demo gate, not full production authentication. Do not expose a
model-enabled instance to the public internet.
Production also requires `MEDER_ALLOWED_ORIGIN` set to the exact externally served
origin (scheme, host, and port when applicable, without a trailing slash). An unset
production origin fails closed. Runs and signed session state live in process
memory for 15 minutes and are lost on restart; this is a single-process application,
not durable multi-instance hosting.

An additional hard admission limit permits **one concurrent model run** and a
finite process-lifetime budget controlled by `MEDER_MODEL_RUN_BUDGET` (integer
1–100, default 10; invalid values disable model admission). All sessions share
this budget. Every admitted run consumes one allowance, including failed or
canceled runs; there are no refunds or session-based resets. Each run is still
limited to five tool calls. `/api/capabilities` reports the remaining allowance
and active count. Busy or exhausted admission returns HTTP 429.

These limits are in-process safeguards, not authentication, a dollar-spend cap,
or a production deployment claim. Restarting the process resets the allowance;
multiple workers or replicas each have their own allowance. Use a single process
behind the authenticated gateway; production or multi-instance use needs shared
durable admission controls and provider-side spending limits before enablement.

## Research and original blueprints

- [OrderMedic blueprint](docs/ordermedic-build-blueprint.md)
- [Agent Crash Lab blueprint](docs/agent-crash-lab-build-blueprint.md)
- [Canonical Track A guide](track-a-agent-os-standalone.md)
- [Previous uploaded Track A guide](track-a-agent-os-standalone.md.old)
- [Track A ecosystem research and five ideas](docs/track-a-five-ideas-ecosystem-research.md)
- [Track B research and five concepts](docs/track-b-research-and-five-concepts.md)

The research documents and Meder plan do not establish competition eligibility or
independently verify the user-reported submission. Local validation is partial and
never establishes exchange acceptance.

## Document Preview

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements-preview.txt
.venv/bin/python scripts/docs_preview.py
```

Open port 3001. The reader includes Meder's documents,
each blueprint, side-by-side reading,
an OrderMedic-to-Crash-Lab content diff, and the historical Track A `.old`-to-current diff.
The blueprint content diff compares different products, not Git revisions.
Markdown is re-read on every request; refresh after editing. The server serves
only allowlisted documents, sanitizes rendered HTML, and has no trading or account integration.

```sh
.venv/bin/python -m unittest discover -s tests -v
```

Repository-owned Hoplite setup/run commands are in `.hoplite/settings.json`;
the managed Preview runs the independent Meder app on port 3000. Effective project
overrides, if present, take precedence over that file.
Attachments, private proof artifacts, and local dependencies are excluded from Git.
