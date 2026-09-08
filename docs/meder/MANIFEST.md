# Meder — product and build manifest

- **Product name:** Meder
- **Internal slug:** `meder`
- **Previous concept name:** OrderMedic
- **Version:** implementation checkpoint v2, 8 September 2026
- **State:** tested synthetic diagnostic application; real-model and external release gates open

> **Order clarity. Without another trade.**

Meder explains a rejected Binance Spot limit order, proposes the smallest permitted quantity correction, or explains why it cannot. An uncertain execution result stays unresolved rather than triggering another order.

## Product identity

Use **Meder** in the application title, package/workspace name, README, demo, and future submission. Keep the earlier OrderMedic blueprint unchanged as historical technical context; it is not a second product. Name availability, domains, and trademarks have not been checked.

The tone is calm, precise, and nonjudgmental. Prefer “This quantity does not match the allowed step” over “You entered an invalid order.” Prefer “No correction fits your limit” over “Trade failed.” Avoid “safe trade,” “guaranteed acceptance,” or claims to recover funds.

The implemented interface uses warm off-white backgrounds, deep slate text, restrained teal for proposed changes, and explicit uncertainty/refusal labels. Every state also has a text label; never rely on color alone. This is a finance diagnostic product, not medical software.

## User and job

- **User:** a trader or developer investigating an agent-generated Spot order.
- **Job:** understand which checked constraint failed and whether a correction can preserve the specified intent.
- **Deliverable:** an explainable diagnostic report, changed-field comparison, and copyable proposal—not an executed order.
- **Success:** the user can distinguish a local repair, an impossible constraint combination, and unresolved execution without mistaking any for exchange acceptance.

## MVP contract

| Included | Explicitly excluded |
| --- | --- |
| Spot `LIMIT` / `GTC` diagnostics | Market, margin, futures, and algorithmic orders |
| BUY exact quantity or explicitly permitted downward correction | Increasing quantity, changing price, symbol, side, or order type |
| SELL exact-quantity validation only | SELL quantity correction |
| Price, lot-size, and notional checks supported by the solver | Claims that every exchange/account constraint was checked |
| Bounded real-model read-only tool loop when configured | Scripted answers presented as a working agent |
| Explicit synthetic-fixture mode | Silent substitution of fixtures for failed live reads |
| Historical ambiguous-result explanation | Authenticated status lookup, retry, cancel, or placement |
| Copy/export of sanitized proposal/report | Exchange credentials, signing, funding, or wallet connection |

**Money boundary:** `maxQuoteNotional` caps price × quantity, **excluding fees**. It is not a total-spend or available-balance guarantee.

## Authority and evidence

- [Implementation specification](SPEC.md) is the current Meder build contract.
- [TODO plan](TODO.md) defines ordered work and release gates.
- [Machine-readable manifest](manifest.json) records implemented configuration and separately unverified release claims; it is not live runtime telemetry.
- [Plan audit](PLAN-AUDIT.md) records the corrected architectural drift. The [runbook](RUNBOOK.md) documents operation; the final `SUBMISSION.md` handoff is tracked in the checklist.
- [OrderMedic blueprint](../ordermedic-build-blueprint.md) remains the technical/evidence foundation. Meder adds delivery structure and branding; it does not expand financial permissions.
- [Canonical Track A guide](../../track-a-agent-os-standalone.md) governs research interpretation. The `.old` guide is historical.

Design choices in these files are engineering recommendations, not Binance rules. Official filter semantics are sourced in the blueprint and [Binance filters documentation](https://developers.binance.com/en/docs/products/spot/filters). The distinction between an ambiguous response and a confirmed rejection follows [Binance REST documentation](https://developers.binance.com/en/docs/products/spot/rest-api).

### Known blockers, not assumptions to hide

1. A public time request from this sandbox returned HTTP 451 on 8 September at `20:57:27.679677Z`; further exchange probes stopped. Live mode remains disabled here. This does not establish the user's personal eligibility. Do not evade the restriction through hosts or proxies.
2. The optional OpenAI Responses adapter and bounded tool runtime are implemented and boundary-tested with fake providers. Server configuration is currently absent; no genuine model tool invocation has been observed. Do not claim a verified working agent.
3. Track A read-only/fixture acceptance and authenticated eligibility rules remain unverified. Meder's diagnostic MVP does not demonstrate a qualifying Track B trade.
4. The independent `apps/meder` application replaces the earlier embedded demo. The Python reader remains separate on port 3001. Local build and browser verification are not a production deployment claim.

## Implemented delivery and verification checkpoint

The Node 24 application pins Next.js 16.3.4, React 19.2.8, and TypeScript 5.9.3 with an npm lockfile. Closed structural validators, a single BigInt/rational solver, versioned controller-owned fixtures, immutable evidence, bounded read-only tools, session-bound create/poll/cancel routes, sanitized export, and explicit deterministic/model controls are implemented. Provider prose is discarded; explanations and verdicts come from the solver.

The parent verification checkpoint on 8 September 2026 reports typecheck/build passing, 69 Node tests passing (including 1,000 generated exhaustive-reference cases), and six separate Python reader tests passing. Seven Playwright tests passed previously; the expanded nine-test suite is running at this checkpoint, not yet reported passing. Existing browser coverage includes repair, refusal, ambiguity, off-grid quantity, exact SELL, JSON input, narrow-screen focus, and copy/export; additions exercise controlled-transport UI cancellation and imported evidence. Backend cancellation is tested separately. The repair screenshot was captured and inspected; no video or real-model trace has been recorded. These are checkpoint results, not a rolling certification.

The exact effective setup script was successfully rerun (npm clean install and Python dependencies), with npm audit reporting zero vulnerabilities. `.github/workflows/meder.yml` now defines CI; no hosted CI result has been observed. Dependency audit and local build success are not a security review or competition acceptance.

The app performs no Binance reads: disabled live requests return a local 451. OpenAI network access is optional and server-only. Signed HttpOnly sessions and reports expire after 15 minutes in single-process memory; restart loses state. Model admission permits one concurrent run and defaults to 10 admitted runs per process lifetime (`MEDER_MODEL_RUN_BUDGET`, integer 1–100). Failure/cancellation does not refund admission. Production requires an exact `MEDER_ALLOWED_ORIGIN`; a model-enabled deployment additionally requires an authenticated private gateway and provider spending limits. Session isolation and origin checks are not user authentication or a dollar cap.

## Definition of release

Release only after the three core journeys work, exact-arithmetic and negative-path tests pass, source modes are visible, and no financial write capability exists. A **working-agent** claim additionally requires a recorded real-model tool invocation. A **live-data** claim additionally requires a legitimate observed live adapter result. A fixture-only non-agent build may be a useful prototype, but must be labeled as such.

Building both Meder and Crash Lab is not in this plan. Crash Lab remains a possible later evaluation tool.
