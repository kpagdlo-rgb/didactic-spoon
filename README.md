# Agent OS research and blueprints

## Selected product: Meder

OrderMedic is now named **Meder**. The independent Next.js application in
`apps/meder` diagnoses synthetic Spot-style `LIMIT`/`GTC` orders at `/` or `/meder`.
Its authoritative server-side BigInt/rational solver can propose an explicitly
permitted BUY quantity reduction; SELL remains exact-only. It never executes,
retries, signs, or looks up an order and has no exchange credentials or account access.
The Python Preview is a separate document reader, not a competing solver.

**Current delivery:** tested synthetic diagnostic application with an optional
OpenAI Responses tool-calling adapter. Model capability is currently unconfigured;
no genuine model run, live data, eligibility, or submission has been verified.
All results are partial validation, not exchange acceptance; the notional cap
excludes fees. The implementation and remaining gates are documented in:

- [Product/build manifest](docs/meder/MANIFEST.md)
- [Implementation specification](docs/meder/SPEC.md)
- [Prioritized TODO plan](docs/meder/TODO.md)
- [Machine-readable manifest](docs/meder/manifest.json)
- [Plan drift audit](docs/meder/PLAN-AUDIT.md)

The final `docs/meder/RUNBOOK.md` and `docs/meder/SUBMISSION.md` handoff
documents are being completed separately; see the checklist for their status.

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

At the 8 September 2026 rebuild checkpoint, the parent verification run reported
67 passing Node tests (including 1,000 generated exhaustive-reference solver cases),
seven passing Playwright tests, and passing typecheck/build. Counts are a checkpoint,
not a promise that later additions have been run. The six Python reader tests are
separate. No demonstration video or real-model trace has been recorded.

Live mode is disabled and locally returns HTTP 451 without making a Binance
request. This enforces the historical sandbox restriction, not a newly observed
exchange response. Do not evade it through another host or proxy.

## Private model-enabled Meder deployment

The independent Next.js app in `apps/meder` optionally uses OpenAI Responses when
both `OPENAI_API_KEY` and `OPENAI_MODEL` are configured **on the server only**.
The adapter uses server-side `fetch`, not an installed provider SDK, hosted MCP,
or Binance Skill. Without both values, model mode remains disabled. Before supplying a key, put the
entire app and its API behind a private authenticated gateway, including preview
deployments. The app's session cookie isolates diagnoses; it does not authenticate
users. Same-origin checks are not authentication or protection against anonymous
provider spending. Do not expose a model-enabled instance to the public internet.
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

The research documents and Meder plan do not establish competition eligibility or a
submitted entry. Local validation is partial and never establishes exchange acceptance.

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
