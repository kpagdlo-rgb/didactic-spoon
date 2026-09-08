# Meder — submission handoff draft

**This is a prepared description, not a submitted or accepted entry.** Authenticated eligibility, the form fields, and acceptance of a read-only synthetic demo remain unverified. Do not mark those gates complete because the application builds.

## Copy-ready project description

**Meder — Order clarity. Without another trade.**

Meder helps a trader or developer understand a rejected Spot limit order without placing another trade. It checks exact local price, quantity, and notional constraints, proposes only an explicitly permitted downward BUY quantity correction, or explains why no correction fits. If an execution outcome is uncertain, it stays unresolved and warns against resubmitting.

The demo uses clearly labeled, invented `ABCUSDT` fixtures. It demonstrates three decisions: a quantity correction, an impossible budget, and unknown execution. A single server-side BigInt rational solver owns the verdict. Immutable run/evidence binding, closed bounded inputs, five-call tool limits, cancellation, and redacted report exports constrain the diagnostic workflow. There are no exchange credentials, orders, transfers, wallets, payments, or financial write tools.

The default runtime is deterministic and invokes no AI model. An optional server-side OpenAI Responses function-tool planner is implemented, but no genuine model invocation has yet been verified for this release. This is not an installed Binance Skill or the hosted Binance MCP server. Live Binance data is disabled following a previously observed access restriction; no restriction was bypassed.

## Demo steps

Use the [runbook](RUNBOOK.md#demo-sequence). The demonstrated outcomes are:

| Scenario | Result |
| --- | --- |
| Price `100`, quantity `0.00123`, cap `0.123` | `REPAIR_PROPOSED`: quantity `0.001`, notional `0.1`; price unchanged |
| Minimum notional `10`, cap `9.99` | `REFUSED`: required grid quantity `0.1` exceeds permitted `0.099` |
| Lost response / imported unknown outcome | `UNRESOLVED`: no lookup, retry, or actionable proposal |

Every result carries its synthetic provenance. Local validation is partial; exchange acceptance, balances, fees, account constraints, and historical causality remain unchecked. The cap excludes fees.

## Artifacts to attach or link if the authenticated form accepts them

- [Repository branch](https://github.com/kpagdlo-rgb/didactic-spoon/tree/hoplite/mylasa-3fbb4210) — use the latest **published** commit, not an uncommitted local revision.
- Source entry: `apps/meder/`; setup and verification: [RUNBOOK.md](RUNBOOK.md).
- Scope and release claims: [MANIFEST.md](MANIFEST.md), [TODO.md](TODO.md), [plan drift audit](PLAN-AUDIT.md).
- The current in-thread managed Preview is interactive but is **not a guaranteed public judging deployment**. Do not give a judge a private or expiring tunnel token.
- A fresh synthetic-only screenshot was captured in this build session. A walkthrough video has **not** been recorded. If a video is requested by the authenticated form, record the actual three-step flow above with source/runtime badges visible; do not describe screenshots as a video.

## Final external gates

1. Open the authenticated official submission form and confirm eligibility, deadline, accepted environment, read-only/fixture acceptance, and the actual required fields. The public source wording was **“Track A only: video/demo + GitHub, if applicable.”** Do not invent a different requirement or apply that phrase to Track B.
2. If a working AI agent is required, first configure a permitted provider privately and obtain a genuine tool-selected diagnostic run. A mock-provider test, shipped adapter, or API-key presence does not meet this gate.
3. Confirm the repository and demo are accessible to intended reviewers without exposing credentials. This repository currently has only the thread branch; initializing `main` remains outside the authorized tool path available here. A branch URL can still identify published source if the submission accepts it.
4. Review the description for truthful claims, then submit only with the user's authorization and preserve the form's actual receipt. A public post or a successful build is not proof of form acceptance.

Meder performs no qualifying Track B trade. It makes no prize, eligibility, completion-of-official-requirements, or competition-acceptance claim.
