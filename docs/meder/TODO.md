# Meder — implementation checklist and remaining delivery gates

**Rebuild checkpoint:** 8 September 2026. The independent synthetic diagnostic app is implemented. The parent reports 69 Node tests (including 1,000 generated exhaustive-reference solver cases), six separate Python reader tests, typecheck, and production build passing. Seven browser tests passed previously; the expanded nine-test suite is running at this checkpoint and its final result is pending. Effective setup successfully reran npm clean install and Python dependency installation; npm audit reported zero vulnerabilities. See [plan audit](PLAN-AUDIT.md), [manifest](MANIFEST.md), [spec](SPEC.md), and [runbook](RUNBOOK.md).

`[x]` means implemented and covered by the checkpoint evidence; `[ ]` means open or explicitly partial. Local tests do not establish a working real-model agent, live exchange access, eligibility, production readiness, or submission. This checklist never authorizes financial access.

## Completed planning and corrected architecture

- [x] Select Meder (previously OrderMedic) as the sole product; defer Crash Lab.
- [x] Preserve read-only permissions, exact arithmetic, and explicit source modes.
- [x] Restore independent `apps/meder`; remove the Python and embedded browser diagnostic solvers.
- [x] Preserve the Python document reader separately on port 3001.
- [x] Record drift and external blockers without replacing them with completion claims.

## P0 — readiness and honest scope

| ID | Status | Evidence / remaining gate |
| --- | --- | --- |
| G01 | [ ] Open | Authenticated Track A eligibility, read-only/fixture acceptance, accepted demo environment, and private requirements remain unknown. User authorization and confirmation are required; do not retain private form/account data. Final handoff belongs in `SUBMISSION.md`. |
| G02 | [ ] Partial | OpenAI Responses provider and server-only credential path implemented in `apps/meder/src/server/planner.ts`; currently unconfigured. One genuine permitted tool invocation has not been observed. |
| G03 | [x] | Synthetic mode is explicit. `src/server/http.ts` rejects live mode locally with 451 and makes no Binance request; no silent fallback or host workaround. |
| G04 | [x] | `apps/meder/package.json` and `package-lock.json`: Next.js 16.3.4, React 19.2.8, TypeScript 5.9.3; npm clean install/build verified on Node 24. |
| G05 | [x] | Delivery class is **tested synthetic diagnostic application**, with an optional unverified model adapter; not a verified agent, live integration, or submitted entry. |

Paths below are relative to `apps/meder` unless otherwise stated. Missing access is not solved by scripted model claims or proxy switching.

## P1 — deterministic vertical slice

| ID | Status | Implemented files / acceptance evidence |
| --- | --- | --- |
| B01 | [x] | `app/`, `package.json`, `package-lock.json`, `tsconfig.json`, `.env.example`; independent app and reader preserved. |
| B02 | [x] | `src/domain/types.ts`, `schema.ts`, `json.ts`: closed discriminated inputs, unknown/duplicate keys, byte/digit limits, and BUY/SELL intent checks. |
| B03 | [x] | `src/domain/exact.ts`: BigInt/rational parsing, comparisons, floor/ceil and repeating-division boundary tests. |
| B04 | [x] | `src/domain/metadata.ts`, `solver.ts`: zero-origin grids, notional intersections, protected fields, unsupported evidence, and explicit unchecked constraints. |
| B05 | [x] | `fixtures/index.ts`: versioned repair, budget-refusal, ambiguity, and off-grid cases; canonical expected results tested in `tests/domain.test.ts` and browser journeys. |
| B06 | [x] | `src/server/run-store.ts`: immutable session-owned inputs/evidence, monotonic 15-minute expiry, bounded retention, no retained raw paste. Single-process memory only; restart loses state. |

## P2 — agent and adapter boundary

| ID | Status | Implemented files / remaining gate |
| --- | --- | --- |
| A01 | [x] Synthetic boundary | `src/domain/metadata.ts`, `src/server/tools.ts`, `safety.ts`, `http.ts`: fixture validation, size/freshness/ownership checks and disabled-live 451 tested. **No live network adapter is implemented or verified.** Future live reads retain all spec eligibility, bounds, deadline and no-evasion requirements. |
| A02 | [x] | `src/server/tools.ts`: exactly `getServerTime`, `getSymbolMetadata`, `validateAndPatch`; run/evidence/symbol binding and closed argument schemas reject unauthorized capabilities. |
| A03 | [ ] Partial / gated | `src/server/planner.ts` implements optional OpenAI Responses `fetch`, bounded model-selected tools, safe provider failures, and authoritative solver output. Fake-provider tests verify boundaries only. A configured real provider must actually choose tools and produce an observed successful run before P2/A03 is complete. Provider prose is discarded, not displayed as trusted explanation. |
| A04 | [x] | `src/server/run-store.ts`, `src/domain/solver.ts`: sanitized tool/decision summaries and redacted export; no raw provider prose, free-text errors, identifiers, session/evidence tokens, or hidden reasoning in exported reports. |
| A05 | [x] | `app/api/diagnoses/`, `app/api/capabilities/`, `src/server/http.ts`, `origin.ts`, `model-budget.ts`: create/poll/cancel, signed session isolation, no-store, fail-closed origins, deadlines and process-wide admission tested. Initial POST returns 200/running; completion is polled. |

Model admission: one concurrent run; default 10 admitted runs per process lifetime, configurable integer 1–100. Failure/cancellation is not refunded. Production requires exact `MEDER_ALLOWED_ORIGIN`; model enablement requires a private authenticated deployment gateway and provider spend controls. Origin/session controls are not authentication, durable admission, or a dollar cap.

## P3 — Meder UI

Implemented in `app/meder.tsx` and `app/globals.css`, with routes `app/page.tsx` and `app/meder/page.tsx`. The original proposed component names were not a requirement to create empty abstractions.

- [x] U01: Input, explicit synthetic/deterministic/model controls, fixture presets, tolerance and fees-excluded notional cap.
- [x] U02: Diagnosis, source provenance/age, unchecked constraints and sanitized tool trace.
- [x] U03: Quantity-only proposal comparison, copy JSON, redacted report export.
- [x] U04: Historical ambiguity stays `UNRESOLVED`, without repair/retry action.
- [x] U05: Loading/cancel/error states, visible focus and narrow-screen keyboard checks; tested browser behavior, not a claim of a comprehensive accessibility audit.

## P4 — verification and release evidence

- [x] V01: `tests/domain.test.ts`, `domain-hardening.test.ts`: canonical outcomes, exact arithmetic, min/max bounds, disabled rules, unchanged fields, and 1,000 generated exhaustive-reference cases.
- [x] V02: Domain/server tests cover oversized/hostile inputs, precision, malformed/stale/wrong-symbol evidence, malicious tool arguments, and missing model configuration.
- [x] V03: `tests/server.test.ts`, `cancellation-hardening.test.ts`, `origin.test.ts`, `model-budget.test.ts`, `model-budget-http.test.ts`: cross-session/run evidence, expiry, cancellation/late results, deadlines, origins, and admission/tool limits.
- [x] V04: Seven previously passing `tests/browser/meder.spec.ts` journeys: repair, budget refusal, ambiguity, off-grid, exact SELL, JSON input, copy/export, source labels and mobile focus. The keyboard-focus correction was tested. **Expanded-suite result pending:** nine tests are running, including controlled-transport UI cancellation and imported evidence; this is not yet a nine-test pass claim.
- [ ] V05: Observe and retain a sanitized genuine model-selected tool trace. Adapter/fake-provider tests do not satisfy this gate.
- [ ] V06: README/manifest/spec/checklist and [runbook](RUNBOOK.md) updated; final `SUBMISSION.md` handoff verification remains with the parent.
- [ ] V07: No short interaction video has been recorded. The parent captured and inspected `.hoplite/artifacts/meder-standalone-repair.png`; this establishes repair-screen appearance, not the repair → refusal → ambiguity video gate.
- [ ] V08: Parent owns final integrated diff/secrets review and source commit/publication. Setup and repair-screen Preview evidence are established; the expanded browser suite result is pending. `.github/workflows/meder.yml` is added but no hosted CI result is observed. Only branch `hoplite/mylasa-3fbb4210` was reported available; do not assume `main` exists.
- [ ] V09: Authenticated submission remains a user gate. Preserve public wording “Track A only: video/demo + GitHub, if applicable.” No submission or acceptance receipt has been verified.

## Continue in dependency order

1. Finalize integrated tests, diff review, runbook, and safely publishable appearance/demo evidence.
2. If authorized provider configuration becomes available, use a private authenticated instance to verify a genuine tool-selected run; otherwise retain the tested synthetic delivery label.
3. Resolve G01 through the user's authenticated competition context, not assumptions. Confirm current deadline and accepted artifacts before submission.
4. Submit only with authorization and eligibility established, then separately record receipt. Build completion cannot force an external gate to pass.

The original 22:28 UTC planning estimate and 23:30 feature-freeze recommendation were historical scheduling advice, not evidence that the public 23:59 UTC deadline can still be met. Do not backdate proof or mark gated work complete to fit that schedule.

## Deferred, not hidden in the MVP

- [ ] Authenticated read-only order reconciliation and consent.
- [ ] Fee-inclusive funds budget, balances, and account-dependent constraints.
- [ ] Other order types, price correction, SELL correction, and additional markets.
- [ ] Legitimately accessible live public adapter with observed runtime evidence.
- [ ] Hosted MCP/installed Skill integration, if separately selected.
- [ ] Durable multi-user storage, shared admission limits, authentication and production security review.
- [ ] Crash Lab integration.

Financial execution is **not an automatic next milestone**. It requires a separate specification, explicit authorization, approval binding, and execution-state reconciliation.
