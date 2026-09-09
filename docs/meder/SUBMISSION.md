# Meder — user-reported submission and historical handoff

## Current status: USER-REPORTED submission

The user said **“submitted, now continue development”**, received at `2026-09-08T23:59:39.346Z`. This records the user's report, not an independently authenticated submission receipt, exact submission time, eligibility determination or acceptance. The actual submitted description, selected theme, source revision and public video URL are not known. Do not reconstruct an exact form payload from the preparatory text below or recommend a duplicate submission.

The latest **published pre-report source baseline** is [`4a576289e26afdac6b8281b1c22011cdc2cf397c`](https://github.com/kpagdlo-rgb/didactic-spoon/tree/4a576289e26afdac6b8281b1c22011cdc2cf397c). Its [hosted CI run 34292462782 succeeded](https://github.com/kpagdlo-rgb/didactic-spoon/actions/runs/34292462782). This pins code available before the report; it does **not** establish the exact code submitted. Later private model-access development is a separate checkpoint and must not be represented as part of that baseline or retroactive submission proof.

### User-provided form evidence

The user pasted text labeled as the Binance Agent OS Mini Hackathon form. It is evidence supplied by the user, **not independent authenticated confirmation**. It describes:

- X handle URL and track selection; Track A says **“Create an agent or workflow.”**
- Theme choices: **Data Analysis**, **Trading Workflows**, **Payment Workflows**, and **Onchain Workflows**. Meder's diagnostic workflow may be described in trading-workflow terms without claiming it executes trades; the actual selected theme is unverified.
- A project description, video platform (YouTube, X, Facebook, Instagram or Others), **public video post URL**, and step-by-step replication guide.
- Completed Binance KYC and jurisdiction eligibility. The pasted exclusions name US, UK, EEA, Hong Kong and Singapore residents/citizens and other prohibited jurisdictions; this does not determine the user's eligibility or authorize evasion.
- Selection factors including creativity, authenticity and uniqueness, along with other campaign/social requirements. No prize or acceptance follows from building or reporting submission.

The fields therefore are not wholly unknown. The earlier public guide phrase “Track A only: video/demo + GitHub, if applicable” is historical context, not grounds to omit the public-video fields in the supplied form text. Whether a deterministic synthetic workflow is accepted remains unverified; a verified AI-agent claim still requires a genuine model-selected run.

### Artifact and receipt limits

Historical local baseline verification was 69 Node tests, nine browser tests, six reader tests, typecheck and build passing. The repair screenshot was inspected and privately shared, not a public judging artifact. A later recording attempt stalled and its process was stopped; the unverified private artifact is **not finalized video proof**. No actual finalized public video, submitted post URL, genuine provider trace or live exchange run is verified here. User-reported submission does not close these evidence gaps.

Post-submission private access adds a separate shared demo key, short-lived session grant and explicit unlock/lock without authorizing trading writes. See the current [runbook](RUNBOOK.md#optional-real-model-gate) and [checklist](TODO.md#p5--post-submission-private-model-access). Server checkpoint: 86 Node tests and typecheck passed; final aggregate browser/build checks remain pending.

## Historical preparatory draft — not a resubmission recommendation

The following description and checklist were prepared before the user's report. They are retained as historical drafting context, **not** a record of the exact submitted payload or current instructions to submit again. The earlier draft's claim that all form fields were unknown is superseded by the user-provided evidence above. Receipt, eligibility and acceptance remain open independently of that evidence.

### Prepared project description

**Meder — Order clarity. Without another trade.**

Meder helps a trader or developer understand a rejected Spot limit order without placing another trade. It checks exact local price, quantity, and notional constraints, proposes only an explicitly permitted downward BUY quantity correction, or explains why no correction fits. If an execution outcome is uncertain, it stays unresolved and warns against resubmitting.

The demo uses clearly labeled, invented `ABCUSDT` fixtures. It demonstrates three decisions: a quantity correction, an impossible budget, and unknown execution. A single server-side BigInt rational solver owns the verdict. Immutable run/evidence binding, closed bounded inputs, five-call tool limits, cancellation, and redacted report exports constrain the diagnostic workflow. There are no exchange credentials, orders, transfers, wallets, payments, or financial write tools.

The default runtime is deterministic and invokes no AI model. An optional server-side OpenAI Responses function-tool planner is implemented, but no genuine model invocation has yet been verified for this release. This is not an installed Binance Skill or the hosted Binance MCP server. Live Binance data is disabled following a previously observed access restriction; no restriction was bypassed.

### Prepared demo steps

Use the [runbook](RUNBOOK.md#demo-sequence). The demonstrated outcomes are:

| Scenario | Result |
| --- | --- |
| Price `100`, quantity `0.00123`, cap `0.123` | `REPAIR_PROPOSED`: quantity `0.001`, notional `0.1`; price unchanged |
| Minimum notional `10`, cap `9.99` | `REFUSED`: required grid quantity `0.1` exceeds permitted `0.099` |
| Lost response / imported unknown outcome | `UNRESOLVED`: no lookup, retry, or actionable proposal |

Every result carries its synthetic provenance. Local validation is partial; exchange acceptance, balances, fees, account constraints, and historical causality remain unchecked. The cap excludes fees.

### Historical artifact checklist

- [Published pre-report source](https://github.com/kpagdlo-rgb/didactic-spoon/tree/4a576289e26afdac6b8281b1c22011cdc2cf397c) — pinned historical baseline, not an assertion that it was the submitted revision. The development branch continues changing.
- Source entry: `apps/meder/`; setup and verification: [RUNBOOK.md](RUNBOOK.md).
- Scope and release claims: [MANIFEST.md](MANIFEST.md), [TODO.md](TODO.md), [plan drift audit](PLAN-AUDIT.md).
- The current in-thread managed Preview is interactive but is **not a guaranteed public judging deployment**. Do not give a judge a private or expiring tunnel token.
- A synthetic-only screenshot was captured at the historical checkpoint. No finalized walkthrough video is verified. The supplied form text requests a public video post; a screenshot or stalled recording does not establish that requirement was met.

### Historical pre-submission gates (not instructions to resubmit)

1. The draft called for authenticated confirmation of eligibility, deadline, accepted environment, read-only/fixture acceptance and required fields. Supplied form text now establishes what the user reported seeing, not independent confirmation or personal eligibility. The public source wording was **“Track A only: video/demo + GitHub, if applicable.”** Do not apply that phrase to Track B or use it to erase the supplied public-video fields.
2. If a working AI agent is required, first configure a permitted provider privately and obtain a genuine tool-selected diagnostic run. A mock-provider test, shipped adapter, or API-key presence does not meet this gate.
3. The draft called for reviewer access to source/demo without exposing credentials. At that checkpoint only the thread branch was available; the pinned source link above now preserves the published baseline independently of later development. Public reviewer access is not established by the private Preview.
4. The draft called for authorized submission and preserving the actual receipt. Submission is now USER-REPORTED; receipt remains unverified. A public post or a successful build is not proof of form acceptance, and further submission activity requires separate authorization.

Meder performs no qualifying Track B trade. It makes no prize, eligibility, completion-of-official-requirements, or competition-acceptance claim.
