# Meder — implementation specification v1

**Status:** planned behavior; no Meder app or app test suite exists yet. [Manifest](MANIFEST.md) · [Build checklist](TODO.md).

## 1. Architecture and delivery boundary

Create `apps/meder` as an independent Next.js/TypeScript application; preserve the existing Python documentation reader. Resolve compatible framework, React, Node, validation, and model SDK versions and commit a lockfile at scaffold time. Do not describe uninstalled versions as verified. Use Zod-style closed schemas and exact integer/rational arithmetic for financial constraints; Vitest and Playwright are recommended test tools.

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

The model chooses permitted diagnostic reads and explains the solver result. It cannot change the authoritative verdict, intent, budget, metadata, source mode, or arithmetic. Ordinary HTTP tool adapters are not automatically hosted MCP or installed Binance Skills; label the integration actually implemented.

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

Each evidence record has a server-issued ID, run ID, mode, symbol, received-at timestamp, response hash, and validation state. Live metadata expires after 60 seconds measured with a monotonic elapsed-time clock. This is a cache-age policy, not a guarantee exchange rules cannot change sooner. Server-time observations do not prove metadata freshness or historical rejection causality.

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

Planned routes:

- `POST /api/diagnoses`: bounded closed request; server owns mode validation and run creation. Successful diagnostic outcomes return 200; bad schema 400; oversize 413; disabled live mode 409; missing model configuration 503. Never return raw provider errors.
- `GET /api/diagnoses/:id`: sanitized result, no raw payload. A random ID is not authorization: bind reads to an HttpOnly session, reject cross-session access, use no-store responses, and expire records after 15 minutes. Missing/expired/unauthorized IDs return 404.
- `POST /api/diagnoses/:id/cancel`: session-owned cancellation only, no financial effect. Reject cross-origin POST requests; late results cannot overwrite a canceled run.

Planner tools are closed schemas: `getServerTime({})`, `getSymbolMetadata({symbol})`, and `validateAndPatch({diagnosisId, metadataEvidenceId})`. Bind symbol and evidence IDs to immutable server-owned run inputs. A model cannot supply edited metadata or another run's budget. Controller-only fixture loading is never a planner capability.

Budgets: five tool calls total; 20-second overall deadline including cancellation; 12 seconds per model call; 3 seconds per public read. A completed run records sanitized tool summaries, evidence IDs, and decision codes—not hidden chain-of-thought. The real model must actually choose calls; template explanations and deterministic mode are labeled separately.

The prompt must require untrusted-data handling, forbid new capabilities and acceptance claims, preserve the solver verdict, and cite unchecked constraints. Structural tool restrictions—not prompt wording—enforce the boundary.

## 6. Interface and accessible copy

One screen, three regions:

1. **Input:** Meder wordmark, tagline, mode badge, fixture presets, order form/JSON input, tolerance and quote-notional cap, “Diagnose order” button. Never “Execute repair.”
2. **Diagnosis:** progress/stop control, rule explanations, visible source age, sanitized trace, verdict and unchecked constraints. Unknown execution says “We cannot confirm whether this order executed. Do not resubmit based on this report.”
3. **Proposal:** before/after fields, explicit changed quantity and notional (fees excluded), “Copy proposed JSON,” “Export report.” Disable proposal copy when no valid patch exists; report export remains available.

Use keyboard-operable controls, visible focus, labeled fields, readable contrast, and a polite live region for completion. Do not unexpectedly move focus while diagnosing. Copy/export excludes identifiers, free-text rejection content, credentials, and internal session/evidence tokens; explain any redaction.

## 7. Acceptance and non-goals

Every core fixture must produce the specified outcome. Unit/property tests must cover exact arithmetic, lower/upper bounds, unchanged protected fields, disabled price rules, off-grid minQty, hostile inputs, stale/missing evidence, and no upward correction. Integration tests cover immutable evidence binding, cross-session reads, cancellation, timeouts, explicit mode transitions, and provider failure. Browser tests cover all three journeys, trace/source labels, copy/export, and keyboard operation.

Zero financial write tools, routes, signing code, credentials, or exchange account connections are permitted. A fake model must not count as real-model verification. Existing document-reader tests do not verify Meder.

Release artifacts: tested source + lockfile, setup instructions, limitations, sanitized real-model trace if available, and a short demonstration. Submission/eligibility is a separate authenticated gate; neither this spec nor an app build proves acceptance.
