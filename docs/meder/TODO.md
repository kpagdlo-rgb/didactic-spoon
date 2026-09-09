# Meder — implementation checklist and remaining delivery gates

**Historical rebuild verification checkpoint:** 8 September 2026. The independent synthetic diagnostic app is implemented. Local verification recorded 69 Node tests (including 1,000 generated exhaustive-reference solver cases), nine Playwright tests, six separate Python reader tests, typecheck, and production build passing. Verification followed a successful effective setup rerun of npm clean install and Python dependency installation; the production dependency audit reported zero vulnerabilities. Latest published pre-report source: `4a576289e26afdac6b8281b1c22011cdc2cf397c`. See [plan audit](PLAN-AUDIT.md), [manifest](MANIFEST.md), [spec](SPEC.md), [runbook](RUNBOOK.md), and [submission history](SUBMISSION.md).

**Post-submission checkpoint:** the user reported submitting and asked to continue development in a message received at `2026-09-08T23:59:39.346Z`. This is USER-REPORTED, not a verified receipt or exact submitted source/payload. The private model-access milestone separately passed 87 Node tests, 20 browser tests, six reader tests, typecheck and production build, with zero reported production dependency vulnerabilities. Historical results above are not replaced by this checkpoint.

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
| G01 | [ ] Open | User-provided form text describes Track A agent **or workflow**, theme choices, public video platform/post URL, replication, KYC/jurisdiction restrictions and creativity criteria. These fields are no longer wholly unknown, but authenticated confirmation, personal eligibility and read-only/fixture acceptance remain unverified. Do not retain private account data. See [submission history](SUBMISSION.md). |
| G02 | [ ] Partial | OpenAI Responses provider and server-only credential path implemented in `apps/meder/src/server/planner.ts`; currently unconfigured. One genuine permitted tool invocation has not been observed. |
| G03 | [x] | Synthetic mode is explicit. `src/server/http.ts` rejects live mode locally with 451 and makes no Binance request; no silent fallback or host workaround. |
| G04 | [x] | `apps/meder/package.json` and `package-lock.json`: Next.js 16.3.4, React 19.2.8, TypeScript 5.9.3; npm clean install/build verified on Node 24. |
| G05 | [x] | Delivery class is **tested synthetic diagnostic application**, with an optional unverified model adapter. Submission is USER-REPORTED, not independently verified; no verified agent or live integration claim. |

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

Model admission: one concurrent run; default 10 admitted runs per process lifetime, configurable integer 1–100. Failure/cancellation is not refunded. The new private shared-key session grant is additionally required; provider configuration alone cannot authorize anonymous paid calls. Production requires exact `MEDER_ALLOWED_ORIGIN`; model enablement still requires a private authenticated deployment gateway and provider spend controls. The gate is not full production authentication, durable admission, or a dollar cap.

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
- [x] V04: Nine passing `tests/browser/meder.spec.ts` tests cover repair, budget refusal, ambiguity, off-grid, exact SELL, JSON input, copy/export, source labels, mobile focus, controlled-transport UI cancellation, and imported evidence. The keyboard-focus correction was tested; backend cancellation is independently covered by server tests.
- [ ] V05: Observe and retain a sanitized genuine model-selected tool trace. Adapter/fake-provider tests do not satisfy this gate.
- [x] V06: README/manifest/spec/checklist, [runbook](RUNBOOK.md), and [submission handoff](SUBMISSION.md) document setup, verification, source references, no financial writes, and remaining external gates.
- [ ] V07: No finalized short interaction video is verified. The attempted recording stalled and was stopped; its private unverified artifact is not video proof. `.hoplite/artifacts/meder-standalone-repair.png` was captured, inspected, and shared privately at the historical checkpoint; this establishes repair-screen appearance, not the repair → refusal → ambiguity video gate or current access-panel appearance. Private screenshot publication is not a public judging artifact.
- [x] V08: Baseline source published as `4a576289e26afdac6b8281b1c22011cdc2cf397c`; [hosted CI run 34292462782 passed](https://github.com/kpagdlo-rgb/didactic-spoon/actions/runs/34292462782). Setup, nine baseline browser tests and historical repair-screen Preview evidence are established; a managed-preview Host-shaped HTTP request returned 200. This does not certify later development or identify the exact submitted revision.
- [ ] V09: Submission USER-REPORTED at `2026-09-08T23:59:39.346Z`; receipt, exact form payload, eligibility and acceptance remain unverified. User-provided form evidence is summarized in [SUBMISSION.md](SUBMISSION.md). This receipt gate stays open; do not recommend duplicate submission.

## P5 — post-submission private model access

Implementation statuses below are supported by M05. Access UI cases use controlled transport and server cases exercise the real handlers with injected provider responses; neither establishes genuine provider use.

- [x] M01: `src/server/model-access.ts`, `http.ts`, `app/api/model-access/`: separate 32–256 non-space printable ASCII shared key, bounded 1,024-byte closed login/logout, fail-closed configuration and ten login attempts/minute globally per process.
- [x] M02: Signed HttpOnly session grant with fixed 15-minute monotonic expiry; rotation/expiry/logout revoke access and cancel only affected sessions' model runs. Provider/tool-dispatch rechecks and idle sweep enforce revocation. Anonymous deterministic diagnosis remains available.
- [x] M03: `app/model-access-panel.tsx`, `src/client/use-model-access.ts`, `app/meder.tsx`: explicit unlock/lock, key cleared without browser persistence, configuration/capacity status, revoked model selection disabled without silent fallback. Unconfirmed lock remains retryable when status checks fail; successful refresh clears stale capability warnings.
- [x] M04: README, runbook and spec distinguish the shared demo key from provider/exchange credentials; preserve private gateway/provider spend requirements and unchanged one-concurrent/default-ten process budget. No real provider or live exchange access configured or verified.
- [x] M05: 87 Node tests, 20 browser tests, six reader tests, typecheck, production build and production dependency audit passed. Reviewed queued-run expiry containment and access failure recovery. Fresh managed Preview returned `REPAIR_PROPOSED` / `0.001` with model access locked/unconfigured and no fresh browser errors; current screenshot shared privately. A fresh development runtime restores exact repair after server edits; the runbook documents the hot-reload limitation. Baseline CI does not verify this later source.

## Continue in dependency order

1. After publication, inspect hosted CI for the post-submission access-gate milestone separately from the pre-report baseline. A finalized interaction video remains unverified.
2. If authorized provider configuration becomes available, use a private authenticated instance to verify a genuine tool-selected run; otherwise retain the tested synthetic delivery label.
3. Resolve G01 and the V09 receipt gate only through authorized confirmation, not assumptions about the supplied form text or user report.
4. Continue product development without backdating improvements into the reported submission or recommending resubmission. Any later competition update requires separate authorization; build completion cannot force an external gate to pass.

The original 22:28 UTC planning estimate and 23:30 feature-freeze recommendation were historical scheduling advice, not evidence that the public 23:59 UTC deadline can still be met. Do not backdate proof or mark gated work complete to fit that schedule.

## Deferred, not hidden in the MVP

- [ ] Coordinated automatic server/domain hot-reload disposal. Fully restart development after server/domain/fixture edits; see the [runbook](RUNBOOK.md#run-locally). Do not bypass metadata identity validation to hide a stale-runtime failure.
- [ ] Authenticated read-only order reconciliation and consent.
- [ ] Fee-inclusive funds budget, balances, and account-dependent constraints.
- [ ] Other order types, price correction, SELL correction, and additional markets.
- [ ] Legitimately accessible live public adapter with observed runtime evidence.
- [ ] Hosted MCP/installed Skill integration, if separately selected.
- [ ] Durable multi-user storage, shared admission limits, authentication and production security review.
- [ ] Crash Lab integration.

Financial execution is **not an automatic next milestone**. It requires a separate specification, explicit authorization, approval binding, and execution-state reconciliation.
