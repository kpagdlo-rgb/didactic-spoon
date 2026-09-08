# Meder — product and build manifest

- **Product name:** Meder
- **Internal slug:** `meder`
- **Previous concept name:** OrderMedic
- **Version:** planning v1, 8 September 2026
- **State:** specified, not implemented

> **Order clarity. Without another trade.**

Meder explains a rejected Binance Spot limit order, proposes the smallest permitted quantity correction, or explains why it cannot. An uncertain execution result stays unresolved rather than triggering another order.

## Product identity

Use **Meder** in the application title, package/workspace name, README, demo, and future submission. Keep the earlier OrderMedic blueprint unchanged as historical technical context; it is not a second product. Name availability, domains, and trademarks have not been checked.

The tone is calm, precise, and nonjudgmental. Prefer “This quantity does not match the allowed step” over “You entered an invalid order.” Prefer “No correction fits your limit” over “Trade failed.” Avoid “safe trade,” “guaranteed acceptance,” or claims to recover funds.

Suggested visual direction—not implemented: warm off-white backgrounds, deep slate text, restrained teal for proposed changes, amber for uncertainty, red only for blocked input or refusal. Every state also has a text label; never rely on color alone. This is a finance diagnostic product, not medical software.

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
- [Machine-readable manifest](manifest.json) records planned configuration, not a working runtime.
- [OrderMedic blueprint](../ordermedic-build-blueprint.md) remains the technical/evidence foundation. Meder adds delivery structure and branding; it does not expand financial permissions.
- [Canonical Track A guide](../../track-a-agent-os-standalone.md) governs research interpretation. The `.old` guide is historical.

Design choices in these files are engineering recommendations, not Binance rules. Official filter semantics are sourced in the blueprint and [Binance filters documentation](https://developers.binance.com/en/docs/products/spot/filters). The distinction between an ambiguous response and a confirmed rejection follows [Binance REST documentation](https://developers.binance.com/en/docs/products/spot/rest-api).

### Known blockers, not assumptions to hide

1. A public time request from this sandbox returned HTTP 451 on 8 September at `20:57:27.679677Z`; further exchange probes stopped. Live mode remains disabled here. This does not establish the user's personal eligibility. Do not evade the restriction through hosts or proxies.
2. A model provider, server-side credential path, and actual tool-calling runtime are not established for Meder.
3. Track A read-only/fixture acceptance and authenticated eligibility rules remain unverified. Meder's diagnostic MVP does not demonstrate a qualifying Track B trade.
4. The existing Python Preview is a **document reader**, not Meder. Application scaffolding, tests, and deployment remain TODO.

## Definition of release

Release only after the three core journeys work, exact-arithmetic and negative-path tests pass, source modes are visible, and no financial write capability exists. A **working-agent** claim additionally requires a recorded real-model tool invocation. A **live-data** claim additionally requires a legitimate observed live adapter result. A fixture-only non-agent build may be a useful prototype, but must be labeled as such.

Building both Meder and Crash Lab is not in this plan. Crash Lab remains a possible later evaluation tool.
