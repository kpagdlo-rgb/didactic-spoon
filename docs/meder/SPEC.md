# Meder — implementation specification v3

**Status:** post-submission private model-access milestone, 9 September 2026. The independent synthetic application and test suites exist; submission is USER-REPORTED, while receipt, eligibility/acceptance, genuine model use and live data remain unverified. Requirements below preserve the original financial boundary; future live requirements are not claims of a shipped live adapter. [Manifest](MANIFEST.md) · [Build checklist](TODO.md) · [Drift audit](PLAN-AUDIT.md).

## 1. Architecture and delivery boundary

`apps/meder` is an independent Next.js/TypeScript application; the Python documentation reader remains separate on port 3001. Next.js 16.3.4, React 19.2.8, and TypeScript 5.9.3 are pinned with an npm lockfile and verified on Node 24. The implementation deliberately uses closed structural hand validators rather than Zod, BigInt/rational arithmetic in `src/domain/exact.ts` and `solver.ts`, Node's `node:test` via `tsx` rather than Vitest, and Playwright for browser tests. The optional OpenAI Responses adapter uses server-side `fetch`; no model SDK is required. These are implementation choices, not relaxation of schema, arithmetic, or verification requirements. No embedded Python or browser solver is authoritative.

```text
Browser → byte/schema gate → normalized immutable run record
                              ↓
                         bounded planner
                              ↓
                     server-owned tool gateway
                       ↙              ↘
             read-only adapter     exact constraint solver
                       ↘              ↙
                     sanitized report → browser
```

When configured and explicitly unlocked for the session, the model chooses permitted diagnostic tools. Provider prose is deliberately discarded: the solver supplies authoritative explanations and verdicts. The model cannot change intent, budget, metadata, source mode, or arithmetic. Deterministic mode is labeled separately and cannot demonstrate model agency. These are server-owned function tools, not hosted MCP or installed Binance Skills.

## 2. Input and intent

Use the discriminated request variants defined in the [foundation blueprint, section 5](../ordermedic-build-blueprint.md#5-typed-contract-and-examples): `rejection` and `ambiguous_submission`.

- Maximum request: 16 KiB before JSON parsing. Reject unknown keys and nested payloads outside the closed schema.
- Decimal values are unsigned base-10 strings, no exponent or JSON numbers. Price/quantity must be positive; cap may be zero and then cannot fund a positive order. Limit total digits to 40 and fractional places to 18; reject excess rather than truncate.
- Support only uppercase ASCII symbols `[A-Z0-9]{2,20}`, `LIMIT`, `GTC`, BUY or SELL. This is an MVP subset, not a claim about every exchange symbol.
- BUY requires `maxQuoteNotional` and `quantityTolerance: exact | allow_all_downward`. SELL accepts exact quantity only and rejects a BUY-only cap or downward policy.
- Preserve price, symbol, side, order type, and time-in-force exactly. Even an invalid price is never silently repaired.
- An imported rejection is **user-reported evidence**, not an independently verified exchange response. Historical rule changes can prevent proving its original cause.
- Ambiguous input may contain one bounded exchange/client order identifier and an optional redacted imported status. It always returns `UNRESOLVED` in this MVP; imported status is contextual, not authoritative live reconciliation.

Treat free-text errors as untrusted. Keep raw paste out of telemetry, exceptions, model prompts, and exports. Retain only normalized fields and a safe bounded error category/code; avoid sending original free text to the model. Reject recognized credential/signature fields. User copy warns not to paste keys or account data; pattern detection is not a guarantee that arbitrary text contains no secret.

## 3. Modes, provenance, and metadata

The UI requires an explicit mode:

1. **Synthetic demo:** controller loads a versioned fixture; all results remain labeled synthetic.
2. **Live public data:** disabled in this sandbox because of recorded HTTP 451. Enable only after independently legitimate eligibility/access is established and a real read is observed. No proxy or alternate-host evasion.

Each evidence record has a server-issued ID, run ID, mode, symbol, received-at timestamp, response hash, and validation state. Metadata evidence expires after 60 seconds measured with a monotonic elapsed-time clock. This is a cache-age policy, not a guarantee exchange rules cannot change sooner. Server-time observations do not prove metadata freshness or historical rejection causality.

Bound public responses to 1 MiB and filter arrays to 100 entries. Reject malformed, duplicate/contradictory, wrong-symbol, non-trading-symbol, or unsupported required inputs. Check that LIMIT/GTC are supported where the returned schema provides the relevant capability. Unknown nonlocal account/dynamic checks remain prominently unchecked; never infer balance or permissions from public data.

No failed live request becomes a fixture inside the same run. Stop and let the user start a separate synthetic run. Stop on 403/418/429/451 without retry/host substitution. A transport retry is permitted at most once within the same total deadline; no model retry.

## 4. Exact repair contract

Implement the corrected zero-origin algorithm from the blueprint:

- `quantity % stepSize == 0`; the grid is **not** offset from `minQty`.
- `price % tickSize == 0` when that rule is enabled.
- Zero values disable the corresponding `PRICE_FILTER` min/max/tick rule individually. A zero LOT_SIZE step is unsupported and returns `INCOMPLETE`.
- For LIMIT orders, market-only applicability flags do not disable notional checks. Intersect both notional filters when supplied.

Let `P` be unchanged price, `Q` original quantity, `B` quote-notional cap, and `s` quantity step. For BUY downward correction:

```text
lower = ceilStep(max(minQty, applicable minimum notionals / P))
upper = floorStep(min(maxQty, Q, B / P, applicable maximum notionals / P))
```

Omit absent optional notional bounds, not missing required filters. Compute floor/ceil by exact scaled-integer quotient/remainder or rational arithmetic, never rounded floating-point division. If `upper < lower`, refuse. Otherwise `upper` is the largest legal downward quantity and minimizes reduction under the chosen objective; do not enumerate every tick. Exact policy validates only the original quantity.

Classify results consistently:

| State | Meaning / presentation |
| --- | --- |
| `ALREADY_VALID` | Original satisfies checked local rules; not “accepted by Binance” |
| `REPAIR_PROPOSED` | Quantity-only candidate satisfies checked local rules and declared tolerance |
| `REFUSED_EXACT_TOLERANCE` | Correction would violate exact-quantity intent |
| `REFUSED` | Known constraints cannot be satisfied without changing protected intent |
| `INCOMPLETE` | Required local evidence is missing, stale, malformed, blocked, or unsupported |
| `UNRESOLVED` | Historical execution outcome cannot be verified; no retry |

`validation.unchecked` remains separate from the result. A useful local proposal can coexist with unchecked balances, fees, account filters, and dynamic price bounds, but must carry **“Partial validation — exchange acceptance unknown.”** `INCOMPLETE` and `UNRESOLVED` have no actionable patch. Applying/copying a proposal never submits it.

`validation.passedFor` identifies whether passed checks refer to the `original` or `proposal`; `validation.failedFor` remains `original`. A repair preserves the original failure evidence rather than implying the proposed quantity failed those checks. These scopes survive the server's allowlisted report export.

### Required synthetic examples

Use invented `ABCUSDT`, price `100`, lot max `100`, positive step `0.001`, and valid synthetic price constraints. These are not live Binance filters.

| Fixture | Inputs | Expected |
| --- | --- | --- |
| Repair | Q `0.00123`, minQty `0.001`, min notional `0.10`, B `0.123`, downward allowed | Q `0.001`; notional `0.100`; quantity-only patch |
| Budget refusal | Q `0.100`, minQty `0.001`, min notional `10`, B `9.99` | Required Q `0.100` exceeds permitted Q `0.099`; refuse |
| Ambiguity | Synthetic lost-response report; no authoritative lookup | `UNRESOLVED`, no patch or financial call |
| Grid regression | Q `0.0022`, minQty `0.0015`, step `0.001`, loose notional bounds | Q `0.002`, not a minQty-offset multiple |

## 5. Run lifecycle, tools, and API

```text
RECEIVED → PARSED → EVIDENCE_LOADING → VALIDATING → terminal result
                 ↘ ambiguous history → UNRESOLVED
```

User stop, invalid input, and provider failure are run outcomes—not fabricated diagnostic verdicts. Report canceled/error states separately. Deadline failure during required diagnosis may produce `INCOMPLETE` with an explicit reason; do not invent a solver result if it never ran.

Implemented routes:

- `POST /api/diagnoses`: bounded closed envelope `{mode, planner, fixtureId, input}`; server owns mode validation and run creation. Admission returns HTTP 200 with an initial `running` snapshot, not a finished verdict; the client polls GET. Bad schema returns 400; oversize 413; disabled live mode 451; missing model configuration 503; busy/exhausted admission 429. This local 451 makes no Binance request and is not fresh exchange evidence. Never return raw provider errors.
- `GET /api/diagnoses/:id`: sanitized result, no raw payload. A random ID is not authorization: bind reads to an HttpOnly session, reject cross-session access, use no-store responses, and expire records after 15 minutes. Missing/expired/unauthorized IDs return 404.
- `POST /api/diagnoses/:id/cancel`: session-owned cancellation only, no financial effect. Reject cross-origin POST requests; late results cannot overwrite a canceled run.
- `GET /api/capabilities`: no-store session-specific source/planner availability, `providerConfigured`, `modelAccess: {configured, authorized, expiresAt?}`, process budget and persistence limitations. `planners.model` requires provider configuration, a configured gate, a valid session grant, remaining budget and no active model run. Configured capability is not proof of a genuine model run.
- `POST /api/model-access`: same-origin JSON, no query string, closed `{accessKey}` envelope bounded to 1,024 UTF-8 bytes. `MEDER_MODEL_ACCESS_KEY` and submitted keys must contain 32–256 non-space printable ASCII characters. A successful login issues/reuses the signed HttpOnly session and returns only `{modelAccess: {configured, authorized, expiresAt}}`, never a key, hash or token. Ten login attempts per minute globally per process include successful and malformed same-origin attempts. Wrong key/missing grant returns `MODEL_ACCESS_REQUIRED` (403), unavailable gate/provider on model admission returns `MODEL_UNAVAILABLE` (503), and exhausted attempt capacity returns 429. Login may authorize a grant without a configured provider, but cannot enable model calls by itself.
- `POST /api/model-access/logout`: same-origin JSON closed `{}`, no query string, 1,024-byte limit. Revoke the current session's grant and cancel its active model runs, retaining the session and deterministic reports. Return `{modelAccess: {configured, authorized: false}}`.

The post-submission private-demo gate binds access to a fixed 15-minute monotonic grant, never to browser-stored credentials. Missing/invalid server keys fail closed; rotation/removal revokes existing grants. Recheck authorization before each provider request and before dispatching its returned tool calls. An idle sweep checks expiry/rotation at most one second apart while grants exist; logout cancels immediately. Only the affected owners' model runs are canceled; deterministic work remains anonymous and available. Provider configuration alone cannot authorize paid calls. This shared-key gate is not full production authentication or distributed abuse protection.

Sessions use signed HttpOnly, SameSite=Strict cookies (Secure for HTTPS). Run retention and session lifetime are 15 minutes; the signing secret and store are process-local and lost on restart. Use one server process, not serverless/multi-replica persistence assumptions. Production POSTs require `MEDER_ALLOWED_ORIGIN` equal to the exact external origin. Before adding a provider key, put the whole deployment and API behind an authenticated private gateway: neither same-origin checks nor session cookies authenticate users.

Development additionally permits exact loopback origin/Host matching and the managed HTTPS preview domain only when the exact platform environment marker is present and the request Host matches. This development exception does not replace the explicit production origin requirement.

Planner tools are closed schemas: `getServerTime({})`, `getSymbolMetadata({symbol})`, and `validateAndPatch({diagnosisId, metadataEvidenceId})`. Bind symbol and evidence IDs to immutable server-owned run inputs. A model cannot supply edited metadata or another run's budget. Controller-only fixture loading is never a planner capability.

Budgets: five tool calls total; 20-second overall deadline including cancellation; 12 seconds per model call; 3 seconds per public read. A completed run records sanitized tool summaries, evidence IDs, and decision codes—not hidden chain-of-thought. The real model must actually choose calls; template explanations and deterministic mode are labeled separately.

Model admission additionally permits one concurrent run and a finite process-lifetime allowance, default 10. `MEDER_MODEL_RUN_BUDGET` accepts integers 1–100; invalid values disable model admission. Every admitted run consumes an allowance, including failure/cancellation. Restart resets the allowance and replicas each have their own; this is not authentication, a dollar budget, or durable multi-user admission control. Provider-side spending limits remain necessary.

The prompt must require untrusted-data handling, forbid new capabilities and acceptance claims, preserve the solver verdict, and cite unchecked constraints. Structural tool restrictions—not prompt wording—enforce the boundary.

## 6. Interface and accessible copy

One screen, three regions:

1. **Input:** Meder wordmark, tagline, mode badge, fixture presets, order form/JSON input, tolerance and quote-notional cap, “Diagnose order” button. Never “Execute repair.”
2. **Diagnosis:** progress/stop control, rule explanations, visible source age, sanitized trace, verdict and unchecked constraints. Unknown execution says “We cannot confirm whether this order executed. Do not resubmit based on this report.”
3. **Proposal:** before/after fields, explicit changed quantity and notional (fees excluded), “Copy proposed JSON,” “Export report.” Disable proposal copy when no valid patch exists; report export remains available.

Use keyboard-operable controls, visible focus, labeled fields, readable contrast, and a polite live region for completion. Do not unexpectedly move focus while diagnosing. Copy/export excludes identifiers, free-text rejection content, credentials, and internal session/evidence tokens; explain any redaction.

The private access panel explicitly unlocks and locks model access. Its password field accepts only the deployment's shared demo key, never an OpenAI/Binance key; clear the field on submit and do not persist the secret in browser storage or React state. Show configuration, authorization, expiry and capacity separately. Lock/expiry/revocation keeps an already selected model option selected but disables model diagnosis; the user must explicitly choose deterministic mode, never receive a silent fallback. Capability failures fail closed for model mode without disabling deterministic diagnostics.

The UI exports the server-provided `Snapshot.export`, built from allowlisted fields, rather than serializing the full diagnostic snapshot. Imported evidence remains visibly user-reported; neither import nor export turns it into an observed exchange response.

## 7. Acceptance and non-goals

Every core fixture must produce the specified outcome. Unit/property tests must cover exact arithmetic, lower/upper bounds, unchanged protected fields, disabled price rules, off-grid minQty, hostile inputs, stale/missing evidence, and no upward correction. Integration tests cover immutable evidence binding, cross-session reads, cancellation, timeouts, explicit mode transitions, and provider failure. Browser tests cover all three journeys, trace/source labels, copy/export, and keyboard operation.

Zero financial write tools, routes, signing code, credentials, or exchange account connections are permitted. A fake model must not count as real-model verification. Existing document-reader tests do not verify Meder.

Release artifacts: tested source + lockfile, setup instructions, limitations, sanitized real-model trace if available, and a short demonstration. Submission was user-reported at `2026-09-08T23:59:39.346Z`; receipt, exact submitted payload and eligibility/acceptance remain unverified. Latest published pre-report source: `4a576289e26afdac6b8281b1c22011cdc2cf397c`. The private model-access milestone is later development, not retroactive submission evidence. The historical 69 Node / nine browser / six reader test checkpoint remains distinct from the post-submission 87 Node / 20 browser / six reader tests, typecheck and production build passing. Access UI tests use controlled transport; provider tests use injected responses. Neither this spec nor these checks prove genuine provider use or acceptance.
