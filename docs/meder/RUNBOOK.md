# Meder — run and verify

Meder is a standalone synthetic diagnostic application, not a trading client. The tested default invokes no model and makes no Binance request. An optional OpenAI Responses function-calling adapter is implemented, but a real provider run has not been verified in this workspace.

## Run locally

Prerequisites: Node.js 22+ and npm. Verification used Node 24.19.0, Next.js 16.3.4, React 19.2.8, TypeScript 5.9.3, and the committed npm lockfile.

```sh
cd apps/meder
npm ci
npm run dev -- --port 3000
```

Open `http://localhost:3000` or `http://127.0.0.1:3000`. Both `/` and `/meder` open the same application. In Hoplite, use the managed Preview; the repository setup/run configuration and effective project overrides launch this app.

The research reader remains separate:

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements-preview.txt
.venv/bin/python scripts/docs_preview.py
```

Its default port is now **3001**. Its `/meder` view shows the build manifest, not the retired browser solver. The Python solver and inline JavaScript demo were removed after replacement by the canonical TypeScript core and stronger tests; Git history retains them.

## Verification

With the managed development preview already running on port 3000:

```sh
cd apps/meder
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

`MEDER_TEST_URL` can target another local test origin. The Playwright configuration starts its own development server only when `CI` is set. `.github/workflows/meder.yml` runs the reader, domain, server, production-build, and browser checks; a committed workflow is not evidence that hosted CI has passed.

Repository reader regression tests:

```sh
.venv/bin/python -m unittest discover -s tests -v
```

Tests with injected provider responses establish tool, deadline, cancellation, and privacy behavior. They do **not** establish a genuine model invocation. One browser cancellation test deliberately controls transport to test UI state; backend cancellation is tested separately with real `RunStore`/planner code.

## Demo sequence

Keep **Synthetic demo** and **Deterministic · exact local rules** selected.

1. **Quantity correction:** diagnose the default `ABCUSDT` BUY at price `100`, quantity `0.00123`, cap `0.123`. Expect `REPAIR_PROPOSED`, quantity `0.001`, notional `0.1`; all protected order fields stay unchanged. Open the trace, inspect/copy the JSON, and export the report.
2. **Budget refusal:** select the second preset and diagnose. Expect `REFUSED`: minimum grid quantity `0.1` exceeds permitted maximum `0.099`; no copyable proposal. Export remains available.
3. **Unknown execution:** select the third preset and diagnose. Expect `UNRESOLVED`, explicit do-not-resubmit wording, no order lookup, no retry, and no proposal.
4. **Grid regression:** fourth preset proposes `0.002`, proving the grid is zero-origin rather than offset from `minQty=0.0015`.
5. Try exact quantity permission, SELL validation, an invalid protected price, and invalid JSON. Changing an input clears any prior proposal so it cannot be mistaken for the new input's result.

The interface labels failed checks as **original-order** checks. `validation.passedFor` identifies whether passed checks refer to the original or proposed order. A repaired quantity does not erase the original failure evidence.

## Optional real model gate

No Binance SDK or exchange key is needed. The optional adapter uses Node's native `fetch` against a single fixed provider endpoint; it is **not hosted Binance MCP** and does not claim an installed Binance Skill.

1. Keep the deployment private or put it behind an authenticated gateway **before** configuring a paid provider. Anonymous signed sessions isolate reports; they are not user authentication or spending authorization.
2. Copy `apps/meder/.env.example` to `apps/meder/.env.local`, or use the deployment's server-side secret manager. Configure `OPENAI_API_KEY` and `OPENAI_MODEL` with a model actually available to that provider account and supporting Responses function tools. Never paste the key into chat, the browser, a fixture, a report, or a commit.
3. Restart the server. The model runtime option becomes available only when configuration exists and its run budget remains. Configuration alone is not verification.
4. Select model-guided mode explicitly and run a synthetic diagnosis. Verify that a genuine provider chose the allowed tools and the exact solver produced the result. Export the sanitized report and inspect `modelVerified` before making an agent claim.
5. A provider refusal, malformed call, timeout, incomplete response, or unavailable model is an error, never a deterministic fallback disguised as model success.

Budget: one active model run and **10 total admitted model runs per server process** by default. `MEDER_MODEL_RUN_BUDGET` permits integers 1–100; invalid configuration fails closed. Failed/canceled admitted runs still consume allowance. Each run has at most five tool/model iterations, 20 seconds total, 12 seconds per provider call, and 2,048 output tokens per response. Restarting the process resets the admission counter: this is not durable billing control. Apply provider-side spending limits as well.

Only these tools exist:

- `getServerTime({})` — a versioned synthetic time observation, not live server time.
- `getSymbolMetadata({symbol})` — immutable controller-selected fixture evidence, not arbitrary HTTP.
- `validateAndPatch({diagnosisId, metadataEvidenceId})` — server-owned inputs/evidence and exact solver.

The provider cannot alter intent, source mode, metadata, or the verdict. Arbitrary provider prose is discarded. Explanations are solver-authored; encrypted reasoning continuation is transient provider context and never a report, log, or export. `store:false` does not itself guarantee any particular provider-wide retention policy.

## API and data lifecycle

`POST /api/diagnoses` accepts a 16-KiB closed envelope:

```json
{
  "mode": "synthetic",
  "planner": "deterministic",
  "fixtureId": "repairable",
  "input": {
    "kind": "rejection",
    "order": {"symbol":"ABCUSDT","side":"BUY","type":"LIMIT","timeInForce":"GTC","price":"100","quantity":"0.00123"},
    "observed": {"source":"synthetic_fixture","code":"-1013","message":"Filter failure: LOT_SIZE"},
    "intent": {"quantityTolerance":"allow_all_downward","maxQuoteNotional":"0.123","priceTolerance":"exact"}
  }
}
```

All object levels are closed. Duplicate keys, malformed UTF-8, excessive nesting, numbers in place of decimal strings, and precision beyond 40 digits / 18 fractional places are rejected before arithmetic. The entire streamed body is byte-bounded before parsing. Raw rejection text is normalized to a bounded category and never retained in server run records or sent to the provider.

POST returns an initial `running` snapshot with an opaque ID and signed HttpOnly SameSite=Strict session cookie. `GET /api/diagnoses/:id` polls that session-owned run. `POST /api/diagnoses/:id/cancel` requires same-origin JSON `{}`. No query strings are accepted. Missing/expired/other-session reads return 404. Responses are no-store. Reports expire and are actively erased after 15 minutes; restarts erase them immediately. Metadata age uses monotonic time, not the computer's wall clock.

Only completed/canceled/error runs have an export. Exports omit order identifiers, raw paste, provider messages, internal run/evidence/session tokens. Synthetic metadata response hashes and timestamps remain as provenance. The UI labels imported reports as user-reported, not verified exchange evidence.

`mode: "live"` returns an application-generated HTTP 451 refusal reflecting the previously observed sandbox restriction; it makes **no new Binance request**. Invalid schema returns 400, oversized bodies 413, origin failures 403, missing model configuration 503, and exhausted admission capacity 429.

## Deployment boundary

Use a **single long-lived Node process**:

```sh
cd apps/meder
npm ci
npm run build
MEDER_ALLOWED_ORIGIN=https://your-private-app.example npm start -- --port 3000
```

Set `MEDER_ALLOWED_ORIGIN` to the exact public origin without a trailing slash. It is required in production, including when TLS terminates at a reverse proxy. HTTPS origins receive Secure cookies. Forwarded host headers alone never authorize a request. Development permits exact loopback Host/origin matches and the explicitly platform-marked managed-preview domain; sibling-host mismatches are rejected.

Do not deploy this in a serverless runtime that suspends work immediately after POST, or across independently routed workers: background tasks and the run store are process-local. Durable storage, authenticated application accounts, distributed execution, and production security review remain outside this release. The model budget is not a substitute for an authenticated gateway.

## Source references

- [Meder specification](SPEC.md), [drift audit](PLAN-AUDIT.md), [release checklist](TODO.md).
- [Binance Spot filters](https://developers.binance.com/en/docs/products/spot/filters) — rule semantics, not observed live filters.
- [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling) — Responses function tools and tool outputs.
- [Responses migration](https://developers.openai.com/api/docs/guides/migrate-to-responses) and [reasoning models](https://developers.openai.com/api/docs/guides/reasoning) — stateless continuation references checked 8 September 2026, not proof a model ran here.
- [Next development origins](https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins) — development host configuration, not API authorization.
