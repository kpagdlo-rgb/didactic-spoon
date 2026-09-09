# Meder — run and verify

Meder is a standalone synthetic diagnostic application, not a trading client. The tested default invokes no model and makes no Binance request. An optional OpenAI Responses function-calling adapter is implemented, but a real provider run has not been verified in this workspace.

## Run locally

Prerequisites: Node.js 22+ and Bun 1.3.1+. Verification used Node 24.19.0, Bun 1.3.1, Next.js 16.3.4, React 19.2.8, TypeScript 5.9.3, and the committed `bun.lock`. Bun is the package manager and script runner; the Next.js dev/build runtime remains Node (Bun 1.3.1 crashes running `next build` — see ui-refactor/05-REFACTOR-PLAN.md P0 notes).

```sh
cd apps/meder
bun install --frozen-lockfile
bun run dev -- --port 3000
```

Open `http://localhost:3000` or `http://127.0.0.1:3000`. `/` is the landing page; `/app` is the diagnostic tool; `/meder` redirects to `/app`. In Hoplite, use the managed Preview; the repository setup/run configuration and effective project overrides launch this app.

**Development lifecycle:** fully restart the development process after changes to `src/server`, `src/domain`, or `fixtures`, or after changing server secrets. Client-only edits can use normal hot reload. Server hot reload can retain an old in-memory store alongside a newly evaluated metadata-validation identity, causing safe-but-failing diagnoses; it can also retain old access-gate callbacks. A fresh development process is required before integrated verification. Restart discards reports/grants and resets the process budget, so it is not a way to enforce a durable spending cap. Automatic coordinated server-state reload is not implemented.

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
bun run typecheck
bun run test
bun run build
bunx playwright install chromium
bun run test:browser
```

`MEDER_TEST_URL` can target another local test origin. The Playwright configuration starts its own development server only when `CI` is set. `.github/workflows/meder.yml` runs the reader, domain, server, production-build, and browser checks; a committed workflow is not evidence that hosted CI has passed.

Historical baseline `4a576289e26afdac6b8281b1c22011cdc2cf397c` recorded 69 Node, nine browser and six reader tests plus typecheck/build passing. Its [hosted CI run 34292462782 passed](https://github.com/kpagdlo-rgb/didactic-spoon/actions/runs/34292462782). The later private model-access checkpoint separately passed **87 Node tests, 20 browser tests, six reader tests, typecheck, and production build**, with zero reported production dependency vulnerabilities. Access UI cases use controlled transport; server tests exercise the real handlers with injected provider responses. These checks do not prove genuine provider use or hosted CI for the later revision. Submission is USER-REPORTED at `2026-09-08T23:59:39.346Z`; see [submission history](SUBMISSION.md) for unverified receipt/eligibility gates and the historical draft. No finalized demo video is verified: a stalled attempt was stopped and its private artifact remains unverified.

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

1. Keep the deployment behind a private authenticated gateway **before** configuring a paid provider. The new shared-key gate is a private-demo safeguard, not full production accounts, distributed abuse control or a provider spending cap.
2. Copy `apps/meder/.env.example` to the ignored `apps/meder/.env.local` only if that local file does not already exist; never overwrite existing secrets. Alternatively use the deployment's server-side secret manager. Configure `OPENAI_API_KEY` and `OPENAI_MODEL` with a model actually available to that provider account and supporting Responses function tools. Never paste a **provider** key into chat, the browser, a fixture, a report, or a commit; never use `NEXT_PUBLIC_` for secrets.
3. Generate a **separate** random shared demo key for `MEDER_MODEL_ACCESS_KEY` (32–256 non-space printable ASCII characters; for example a secret manager's 64-character random hex value). Store it only in `.env.local` or the server secret manager and distribute privately to intended testers. This is not an OpenAI or Binance API key. Do not log it or include it in screenshots/recordings. No exchange key is required or permitted.
4. Restart the server after environment changes. Provider settings alone do not allow anonymous paid calls. In **Private model access**, enter only the shared demo key and choose **Unlock model access**. The input clears on submit; no key is persisted in browser storage. Unlocking itself makes no provider call and can succeed without a provider, but model mode remains disabled until provider, gate, grant and run capacity are all available.
5. Select model-guided mode explicitly and run a synthetic diagnosis. Verify that a genuine provider chose the allowed tools and the exact solver produced the result. Export the sanitized report and inspect `modelVerified` before making an agent claim. No genuine provider is configured or verified at this checkpoint.
6. Choose **Lock model access** when finished. Logout cancels this session's active model runs but preserves the session and deterministic reports. Expiry or server-observed key rotation/removal also revokes grants and cancels affected model work. An already selected model stays selected but disabled on revocation; explicitly choose deterministic mode to continue anonymously. Provider refusal, malformed calls, timeout or unavailable configuration never silently fall back to deterministic success.

The grant lasts a fixed 15 minutes on a monotonic clock and uses the existing signed HttpOnly, SameSite=Strict session cookie (Secure on HTTPS). Login is limited to ten attempts per minute **globally per process**, including successful and malformed same-origin attempts. A 429 means wait rather than retry repeatedly. Missing/invalid gate or provider settings fail closed for model admission. Key changes in `.env.local` require a server restart to reach the running process; a restart also loses all process-local reports/grants and resets the process budget.

Budget: one active model run and **10 total admitted model runs per server process** by default. `MEDER_MODEL_RUN_BUDGET` permits integers 1–100; invalid configuration fails closed. Failed/canceled admitted runs still consume allowance. Each run has at most five tool/model iterations, 20 seconds total, 12 seconds per provider call, and 2,048 output tokens per response. Restarting the process resets the admission counter: this is not durable billing control. Apply provider-side spending limits as well.

Only these tools exist:

- `getServerTime({})` — a versioned synthetic time observation, not live server time.
- `getSymbolMetadata({symbol})` — immutable controller-selected fixture evidence, not arbitrary HTTP.
- `validateAndPatch({diagnosisId, metadataEvidenceId})` — server-owned inputs/evidence and exact solver.

The provider cannot alter intent, source mode, metadata, or the verdict. Arbitrary provider prose is discarded. Explanations are solver-authored; encrypted reasoning continuation is transient provider context and never a report, log, or export. `store:false` does not itself guarantee any particular provider-wide retention policy.

## API and data lifecycle

`POST /api/model-access` requires same-origin `application/json` with a closed `{accessKey: string}` body of at most 1,024 UTF-8 bytes. `POST /api/model-access/logout` uses the same boundary and closed `{}`. Neither accepts query strings. Login returns only `modelAccess: {configured, authorized, expiresAt}` and the signed HttpOnly cookie; logout returns `modelAccess: {configured, authorized: false}` without deleting the diagnosis session. No key, hash or access token is returned in JSON. `GET /api/capabilities` reports `providerConfigured`, session-specific `modelAccess` and the shared budget, with no-store responses; `planners.model` is false unless all admission conditions hold. Missing/wrong grant yields 403 `MODEL_ACCESS_REQUIRED`; unavailable model configuration yields 503 `MODEL_UNAVAILABLE`; login-attempt or run capacity exhaustion yields 429. Deterministic requests do not require a model grant.

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
bun install --frozen-lockfile
bun run build
MEDER_ALLOWED_ORIGIN=https://your-private-app.example bun run start -- --port 3000
```

Set `MEDER_ALLOWED_ORIGIN` to the exact public origin without a trailing slash. It is required in production, including when TLS terminates at a reverse proxy. HTTPS origins receive Secure cookies. Forwarded host headers alone never authorize a request. Development permits exact loopback Host/origin matches and the explicitly platform-marked managed-preview domain; sibling-host mismatches are rejected.

Do not deploy this in a serverless runtime that suspends work immediately after POST, or across independently routed workers: background tasks, access grants, attempt limits and the run store are process-local. Durable storage, authenticated application accounts, distributed execution, and production security review remain outside this release. Neither the model budget nor the shared-key gate substitutes for an authenticated gateway and provider spending limits.

## Source references

- [Meder specification](SPEC.md), [drift audit](PLAN-AUDIT.md), [release checklist](TODO.md).
- [Binance Spot filters](https://developers.binance.com/en/docs/products/spot/filters) — rule semantics, not observed live filters.
- [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling) — Responses function tools and tool outputs.
- [Responses migration](https://developers.openai.com/api/docs/guides/migrate-to-responses) and [reasoning models](https://developers.openai.com/api/docs/guides/reasoning) — stateless continuation references checked 8 September 2026, not proof a model ran here.
- [Next development origins](https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins) — development host configuration, not API authorization.
