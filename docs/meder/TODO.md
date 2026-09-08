# Meder — prioritized build TODO and delivery plan

**Planning checkpoint:** 8 September 2026, about 22:28 UTC. The public deadline in the canonical guide is 23:59 UTC: roughly 91 minutes remained at that checkpoint. Recalculate before starting. The earlier 90–120-minute core estimate plus 45–60 minutes for verification/submission does **not** fit this window; do not promise a complete competition-ready agent tonight.

This is a plan, not permission to place orders or connect financial accounts. [Manifest](MANIFEST.md) · [Spec](SPEC.md).

## Completed planning only

- [x] Select OrderMedic as the single product concept; defer Crash Lab.
- [x] Set the product name to **Meder**.
- [x] Preserve the read-only boundary and exact-arithmetic design.
- [x] Document HTTP 451, model readiness, and competition-acceptance blockers.
- [x] Create manifest, spec, and build checklist.

No application implementation item below is complete.

## P0 — readiness and honest scope (before implementation)

| ID | TODO | Acceptance / dependency |
| --- | --- | --- |
| G01 | [ ] Confirm authenticated Track A eligibility and accepted demo environment | Document answers without retaining account/private form data; unknowns remain explicit |
| G02 | [ ] Select real model provider and safe server credential path | One harmless structured tool call observed; no secret in browser/logs |
| G03 | [ ] Choose explicit source mode | Keep live reads disabled in this sandbox; synthetic fixtures clearly selected |
| G04 | [ ] Resolve supported Node/framework/package versions | Compatible install and committed lockfile; no unrelated upgrades |
| G05 | [ ] Choose delivery class | Full agent only if real-model path works; otherwise explicitly labeled diagnostic prototype |

**Stop gate:** spend at most 10 minutes on readiness. Missing model access is not solved by presenting scripted responses as an agent. HTTP 451 is not solved with host/proxy switching. Missing eligibility is not solved by guessing.

## P1 — deterministic vertical slice

| ID | TODO / proposed files under `apps/meder` | Done when |
| --- | --- | --- |
| B01 | [ ] Scaffold app, scripts, lockfile, `.env.example` | App renders without affecting the document reader; example contains names/placeholders only |
| B02 | [ ] `src/domain/contracts.ts` | Closed request/result schemas, mode/state enums, byte/digit bounds, BUY/SELL policies tested |
| B03 | [ ] `src/domain/decimal.ts` | Exact parsing, rational comparison, floor/ceil; repeating-division boundary regressions pass |
| B04 | [ ] `src/domain/filters.ts`, `repair.ts` | Zero-origin grid, notional intersections, protected fields, and explicit unchecked constraints pass tests |
| B05 | [ ] `fixtures/` and fixture manifest | Three primary cases + off-grid regression have expected machine-readable outputs |
| B06 | [ ] `src/server/run-store.ts` | Immutable per-session inputs/evidence, 15-minute expiry, no retained raw paste |

Dependencies: B01 → B02/B03 → B04/B05; B02 → B06. **Do not start polish before repair and refusal tests pass.**

## P2 — real agent and adapter boundary

| ID | TODO | Done when |
| --- | --- | --- |
| A01 | [ ] `src/server/metadata.ts` | Synthetic mode works; live adapter disabled here; freshness/schema/size validation and 451 behavior tested |
| A02 | [ ] `src/agent/tools.ts` | Exactly three read/validate tools; server validates run/evidence ownership and forbids model-edited inputs |
| A03 | [ ] `src/agent/planner.ts` | Real provider chooses a permitted tool, calls solver, and preserves its verdict; fake mode separately labeled |
| A04 | [ ] `src/agent/trace.ts` | Sanitized evidence/decision summaries; no credentials, raw free text, or hidden reasoning |
| A05 | [ ] App route handlers | POST/GET/cancel contracts, session isolation, origin checks, deadlines, and no-store tested |

Dependencies: B06/A01 → A02; G02/A02 → A03; A03/A04 → A05. Provider failure cannot fabricate success. A live-data claim is blocked until independently legitimate runtime evidence exists.

## P3 — Meder UI

- [ ] U01: Input panel, mode badge, three fixture presets, explicit tolerance, notional cap with fees-excluded label.
- [ ] U02: Result panel, source provenance, unchecked constraints, and sanitized tool trace.
- [ ] U03: Quantity-only before/after comparison, copy proposal, redacted report export.
- [ ] U04: Ambiguity panel with `UNRESOLVED` and no repair/retry action.
- [ ] U05: Loading/cancel/error states, focus behavior, contrast, keyboard and narrow-screen checks.

Proposed components: `OrderInput`, `ModeBadge`, `DiagnosticResult`, `ConstraintTable`, `ProposalDiff`, `TracePanel`. Dependencies: P1 solver plus A05; static sample UI alone does not complete these tasks.

## P4 — verification and release evidence

- [ ] V01: Unit/property suite: repair, exact-policy refusal, budget refusal, zero-origin grid, disabled rules, repeating divisions, max notional, and untouched fields.
- [ ] V02: Negative paths: oversized input, secret-like content, unsupported precision, stale/malformed/wrong-symbol metadata, malicious tool data, missing model.
- [ ] V03: Cross-session and cross-run evidence rejection, record expiry, cancellation, late callbacks, and tool-call ceilings.
- [ ] V04: Browser exercise of all three journeys; inspect copied/exported content and source badges.
- [ ] V05: Record one real-model tool trace if claiming an agent; distinguish any deterministic fixture-only proof.
- [ ] V06: README/runbook with exact setup/test commands, source references, limitations, and explicit no-financial-writes statement.
- [ ] V07: Record a short sanitized demo: repair → budget refusal → unknown execution. Capture actual behavior, not screenshots presented as interaction.
- [ ] V08: Review diff and secrets, commit tested implementation, and verify Preview from the browser.
- [ ] V09: Submit only if authorized and eligible; preserve public wording “Track A only: video/demo + GitHub, if applicable.” Record acceptance separately from submitting.

## Deadline-aware fallback, not a reduced quality claim

If starting around the checkpoint and readiness works immediately:

1. **First 10 minutes:** G01–G05. Choose whether a genuine agent demo is feasible.
2. **Next 30 minutes:** B02–B05 and their tests inside the scaffold. Demonstrate local repair/refusal before attempting the rest.
3. **Next 20 minutes:** smallest end-to-end UI and bounded agent loop, only if dependency gates passed.
4. **By 23:30 UTC:** freeze features. If no tested real-agent path exists, label the deliverable a prototype and do not invent runtime claims.
5. **Remaining time:** tests, honest demo, README, authorized submission with buffer. A full implementation may need a later session; do not mark unbuilt P2/P3/P4 items complete to meet the clock.

## Deferred, not hidden in the MVP

- [ ] Authenticated read-only order reconciliation and consent.
- [ ] Fee-inclusive funds budget, balances, and account-dependent constraints.
- [ ] Other order types, price correction, SELL correction, and additional markets.
- [ ] Hosted MCP/installed Skill integration if not the chosen initial adapter.
- [ ] Durable multi-user storage and production security review.
- [ ] Crash Lab integration.

Financial execution is **not an automatic next milestone**. It would require a separate specification, explicit authorization, approval binding, and execution-state reconciliation.
