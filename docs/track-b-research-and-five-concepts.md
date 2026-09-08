# Binance Agent OS Track B: corrected research and five build concepts

**Public-source review date:** 8 September 2026 (UTC)

**Scope:** Track B — Connect your MCPs and trade, only.

**Status:** Research and product proposals only. No Binance account was connected; Binance runtime MCP schemas were not inspected. No trades or submission were made.

This supplements the attached `track-b-mcp-trading-final-standalone (1).md`. The attachment is preserved unchanged. This document supersedes its prize-structure uncertainty and adds the missing product concepts. It does not declare the attachment's implementation, private rules, or protocol claims verified.

## 1. The important correction: this is not a published ranked-build prize

Binance's official prize announcement says:

> Track B — $40,000 USDC
>
> First 10,000 eligible users: 4 USDC each

Source: [official @Binance prize post, 2 September 2026][prizes].

The $40,000 is the aggregate Track B pool, not a prize for the best trading agent. The published reward structure is first-eligible-user based. It does not publish a Track B ranking for innovation, profitability, trading volume, safety, or presentation.

**Practical interpretation, not an official judging rule:** prioritize eligibility, a working supported MCP connection, the required trading activity, and accurate submission. Extra product features can make the workflow useful beyond the event, but there is no evidence they increase the 4 USDC reward or secure eligibility.

Fees, spread, market losses, client subscriptions, and development cost can outweigh 4 USDC. Do not trade or increase volume solely to chase the reward. Remaining reward availability is unknown.

## 2. What Binance publicly says, and what remains unknown

| Topic | Evidence-backed position | Source |
| --- | --- | --- |
| Track | Track B: “Connect your MCPs and trade.” | [Survey][survey], [launch post][launch] |
| Reward | First 10,000 eligible users: 4 USDC each; $40,000 aggregate pool. | [Prize post][prizes] |
| Deadline | Publicly displayed as **8 September 2026, 23:59 UTC**. This is a displayed deadline, not proof of authenticated acceptance or remaining slots. | [Survey][survey] |
| Public entry steps | Follow @Binance and repost the announcement; reply or quote repost with the submission; complete the survey. | [Survey][survey], [launch post][launch] |
| Video/demo and GitHub | The public wording explicitly says “Track A only: video/demo + GitHub, if applicable.” Do not import that requirement into Track B. Private Track B fields still need checking. | [Survey][survey] |
| Regional exclusions | Public text includes US, UK, EEA, Hong Kong, **Singapore**, and jurisdictions on Binance's prohibited list. This is not a complete account-specific eligibility check. | [Survey][survey], [launch post][launch] |
| Survey access | The rendered public page says to log into a Binance account to begin. Private questions were not accessible during this review. | Direct browser observation of [survey][survey] |
| Qualifying activity | Exact trade count, minimum amount/volume, eligible products, fill requirements, timing, and accepted environments remain unknown. | Requires authenticated rules |
| Reward status | Remaining quota, allocation procedure, payout conditions, and the user's eligibility remain unknown. | Requires authenticated rules/account evidence |
| Number/type of MCP servers | Public wording does not establish that multiple MCP servers or a custom server are mandatory. | Public-source limitation |

The original brief correctly distinguished engineering recommendations from event requirements. Keep that distinction. Its “number of winners unknown” statement should now become “published allocation for the first 10,000 eligible users; actual awards and remaining availability unknown.”

## 3. What the documented technology enables

[Binance Agent OS][agent-os] combines MCP, exchange APIs, and skills. Its product framing is **Connect, Build, Control**. That is useful product context, not a contest scoring rubric.

The [official hosted MCP guide][mcp] documents:

- Market data: prices, order books, candles, and other market information.
- Account data: Agentic sub-account balances and related information.
- Trading: Spot and other products, subject to granted scopes and account authorization.
- User confirmation before non-read actions, including orders, cancellations, and internal transfers.
- A dedicated Agentic sub-account, initially empty, manually funded through Binance's web UI.
- No external-withdrawal scope; the agent cannot pull funding from the main account.
- User-managed permissions, disconnect, and emergency-stop controls.

**Documented does not mean runtime-tested.** Order fields, order-query/fill access, available scope granularity, client behavior, and test environments must be checked in the selected authorized client. No tool names are invented in these proposals.

For this project, **Spot-only is a scope/risk recommendation**, not a Binance Track B requirement. No withdrawals does not prevent trading losses, and disconnecting must not be assumed to cancel existing orders or remove exposure.

### Smallest sensible architecture

```text
User's supported AI client
  -> Binance hosted MCP: market/account reads and approved trade actions
  -> Firecrawl MCP: public-source research only, when the concept needs it
  -> Local application: policy checks, private journal, optional schedule
```

Use the supported Binance client authorization flow rather than designing a custom credential-holding proxy for an initial Track B workflow. A second MCP is optional unless authenticated rules say otherwise. Local storage and scheduling do not need to become additional MCP servers just for appearance.

Only Firecrawl Search, Scrape, and Parse were exposed by the configured Firecrawl integration in this research session. Its availability does not establish access to every Firecrawl browser or crawling feature, or to a Binance trading connection.

## 4. Five concepts

All five are proposed workflows, not implemented products or guaranteed qualifying submissions. Example prompts are product illustrations, not instructions to place a trade now. Their shared trade path remains conditional on eligibility, accepted environment, discovered tools, and explicit approval.

### 1. Trade Passport — understand one trade and get a verified receipt

**Target user / problem:** Someone trying MCP-assisted trading who wants to know what was authorized and what actually happened, rather than receiving a vague “trade successful” message.

**Concept:** Turn a user-selected Spot trade into a reviewable proposal and a private, reconciled receipt.

**Example interaction:** “Prepare my selected Spot order. Show the exact amount and constraints, ask me before placing it, then reconcile the result.”

**Workflow:**
1. Read current market information and the intended Agentic account balance.
2. Prepare one order with symbol, side, amount, supported order type, price constraints, data age, and estimated fees clearly labeled.
3. Require explicit approval of those exact parameters; changed or expired proposals require fresh approval.
4. Submit once, then query order state and available fills/fees. A successful submission response is not proof of a fill.
5. Produce a receipt distinguishing submitted, open, partially filled, filled, canceled, rejected, and uncertain states. Label incomplete reconciliation rather than fabricating missing fields.

**Connections:** Binance MCP; a local private journal. An external journal MCP is unnecessary for the first version.

**Track B fit:** The most direct end-to-end expression of connecting an existing AI client to Binance, using market/account data, and carrying out an approved trading action. The receipt is our value-add, not an official submission format.

**Smallest useful build:** One pair, one order, one approval, one result view. No dashboard, backtesting, or autonomous strategy.

**Recommended proof:** Show a denied proposal with no order, then an approved action only in the permitted environment, its observed state, and an appropriately redacted receipt. Do not present that sequence as an official requirement.

**Differentiator / limitation:** Clarity and verifiability, not a novel market signal. The receipt supplements existing Binance confirmations; it does not replace them or guarantee a profitable trade.

**Relative effort:** Lowest. Best foundation for the deadline-constrained path, subject to connection and rules being available.

### 2. Thesis-to-Trade — a cited research brief that can become an approved trade

**Target user / problem:** A trader who switches between news, project announcements, an AI chat, and the exchange, losing track of which assumptions supported a decision.

**Concept:** Combine Firecrawl research with Binance execution while keeping factual evidence, interpretation, and authority to trade separate.

**Example interaction:** “Check this announcement against primary sources, show the counterarguments and current Binance market conditions, and prepare a trade only if I choose to proceed.”

**Workflow:**
1. Research one user-selected event or claim using a small allowlist of primary public sources.
2. Show citations, publication/update times, retrieval times, factual claims, uncertainty, and counterevidence. Reposts of the same story are not independent confirmation.
3. Use Binance MCP for current price, liquidity context, and permitted account information; do not use scraped news as a real-time price feed.
4. Offer “do nothing” alongside an editable, user-selected order proposal.
5. After approval, execute through Binance MCP and attach the observed result to the private research record.

**Connections:** Firecrawl MCP + Binance MCP; local structured evidence storage.

**Track B fit:** The clearest meaningful multi-MCP composition: one connection supplies public research, the other supplies exchange data and approved execution. Research alone does not demonstrate the track's trading activity.

**Smallest useful build:** One event, one asset, a short evidence card, one possible order, one receipt. No social sentiment firehose or continuous news bot.

**Recommended proof:** Trace one cited claim through a reviewable proposal to an observed order result; also show a stale or unsupported claim failing to trigger a write.

**Differentiator / limitation:** A source-to-decision-to-outcome record. Research does not establish predictive edge. Web content is untrusted data, never permission to alter budgets, choose new tools, or issue orders. Keep credentials and private balances out of Firecrawl requests; enforce approved order parameters outside free-form model output where application code is used.

**Relative effort:** Medium. Best differentiated extension of Trade Passport, not the fastest eligibility path.

### 3. DriftGuard — rebalance toward the user's own portfolio targets

**Target user / problem:** Someone with a small Spot portfolio who wants to maintain their chosen allocation without calculating every quantity by hand or granting broad autonomous trading authority.

**Concept:** Compare current balances with user-defined target weights and suggest the smallest practical corrective action within a user-defined budget and reserve.

**Example interaction:** “Compare my holdings with the targets I entered. Keep my cash reserve and propose one corrective trade for review.”

**Workflow:**
1. Read holdings and fresh market prices in the Agentic sub-account only.
2. Compute allocation drift using deterministic decimal arithmetic, the user's targets, a fee reserve, and a minimum-action threshold.
3. Validate live symbol constraints and propose one leg, not an implicitly authorized batch.
4. Obtain approval, submit that leg, and reconcile the observed result.
5. Refresh balances and recalculate before proposing anything else; pause on partial fills or uncertainty.

**Connections:** Binance MCP; local configuration and calculation logic.

**Track B fit:** Connects account awareness to an understandable trading action, using several documented capabilities rather than issuing a canned buy command.

**Smallest useful build:** Two user-selected Spot assets plus a quote-asset reserve; one corrective leg. No cross-exchange, tax-optimization, margin, or derivatives scope.

**Recommended proof:** Before/after allocation based on observed fills, plus a below-minimum or over-budget proposal that produces no order. Do not claim a multi-leg rebalance is atomic.

**Differentiator / limitation:** “Stay within my plan,” not “let the AI invent my portfolio.” Targets are user inputs, not personalized investment recommendations. Trading costs can make small corrections undesirable.

**Relative effort:** Medium to high because rounding, filters, partial fills, and state changes matter.

### 4. LimitLens — show execution costs before committing to a price

**Target user / problem:** A trader who can read a headline price but does not see the spread, available depth, or the difference between a quote and an execution price.

**Concept:** Explain current execution conditions and prepare a user-priced limit order, if the actual MCP schema supports the needed constraints.

**Example interaction:** “Estimate the cost for my chosen size. Prepare a limit buy no higher than my chosen price; do not chase the market or replace it automatically.”

**Workflow:**
1. Read a fresh order-book snapshot and clearly label its limited depth and observation time.
2. Estimate spread and size-dependent execution cost; separate fees and flag insufficient depth instead of inventing an estimate.
3. Let the user choose an acceptable price and inspect supported order type/time-in-force parameters.
4. Validate filters, request approval, submit once, and monitor the observed order state within available rate limits.
5. Request separate approval for any cancellation or replacement; reconcile remaining quantity and partial fills.

**Connections:** Binance MCP; local calculation and order-state logic.

**Track B fit:** Demonstrates a genuine market-data-to-trade workflow and makes the agent useful for execution decisions rather than price prediction.

**Smallest useful build:** One order-book comparison and one supported limit order. No smart order router, iceberg strategy, or execution-quality guarantee.

**Recommended proof:** Show the configured price constraint, actual submitted parameters, and observed status. An unfilled limit order must not be claimed as a filled or qualifying trade; the survey must settle what counts.

**Differentiator / limitation:** Cost transparency. A book snapshot is not a fill guarantee. A price limit does not bound all investment losses. If the tool cannot express the selected protection, stop rather than silently substituting a market order. A local timer is not exchange-side automatic expiry.

**Relative effort:** Medium to high; strongest dependency on actual hosted MCP order capabilities.

### 5. BudgetDCA — recurring purchase reminders with fresh consent each time

**Target user / problem:** Someone following their own recurring purchase plan who wants help maintaining a budget without giving an agent unattended authority to spend.

**Concept:** A budget-aware schedule prepares each installment, but never treats yesterday's approval as consent for today's order.

**Example interaction:** “Prepare each scheduled purchase within the budget I set. Remind me when it is due, and require my approval every time. Skip missed periods.”

**Workflow:**
1. Store user-chosen asset, schedule/timezone, period budget, and installment cap locally.
2. When due, refresh the balance, outstanding commitments, market information, and remaining budget.
3. Prepare a valid proposal or mark the installment skipped if funds, freshness, or minimum-order checks fail.
4. Execute only after fresh approval; reserve budget for pending or uncertain orders to prevent overspending.
5. Reconcile fills and fees, persist the installment outcome, and refuse duplicate execution after restart. Missed periods do not become catch-up trades.

**Connections:** Binance MCP; a local persisted scheduler and private budget ledger. Calendar or notification MCP integration is optional and would require separate access verification.

**Track B fit:** Turns the connection into a repeat-use trading workflow while respecting Binance's documented confirmation model. There is no evidence that more installments increase Track B rewards.

**Smallest useful build:** One asset, one schedule, one due installment, and skip/pause controls. No always-on autonomous trading promise.

**Recommended proof:** An approved installment, a duplicate prevented, and a skipped installment causing no order. Use labeled simulation for schedule/restart tests, without claiming simulated trades qualify for the event.

**Differentiator / limitation:** Consent and budget continuity around recurring orders. This is not proof that periodic buying beats other strategies, and it needs reliable state handling beyond a chat prompt.

**Relative effort:** Medium for reminders; high if expanded into a reliable always-running service. Keep the event version narrow.

## 5. Recommendation

| Goal | Choice | Reason |
| --- | --- | --- |
| Most direct Track B workflow | **Trade Passport** | Fewest moving parts; a clear connection, approval, execution, and verification path. |
| Most distinctive product demo | **Thesis-to-Trade** | Firecrawl and Binance play genuinely different, complementary roles. |
| Portfolio utility | **DriftGuard** | A specific recurring calculation and execution problem. |
| Trading-native execution utility | **LimitLens** | Price/cost transparency rather than invented predictive edge. |
| Recurring personal workflow | **BudgetDCA** | Persistent budget and consent management. |

**Recommended sequence:** validate private Track B rules and eligibility; establish the supported connection; build Trade Passport as a narrow execution/receipt foundation; add Thesis-to-Trade only if time and capabilities permit. These rankings are product recommendations, not Binance scores.

Do not build all five, a custom exchange, a trading credential proxy, or a full agent platform for the published 4 USDC reward. If the goal is a useful product beyond the promotion, Thesis-to-Trade has the clearest differentiation of this shortlist.

## 6. Technical corrections and implementation boundaries

1. **Client order ID is not permanent exactly-once execution.** The [Spot REST order reference][spot-trade] says `newClientOrderId` is unique among open orders and that the same ID can be accepted when the previous order is filled. Use it for correlation/reconciliation if exposed by MCP, plus a durable application operation record. Never assume blindly resubmitting the same ID is safe. This sharpens the attachment's “exchange idempotency” wording.
2. **REST documentation is not a hosted MCP schema.** [Spot filters][filters] document tick size, quantity step size, and notional constraints. They support calculation design, not a claim that the hosted MCP exposes a particular order field or query.
3. **A displayed quote is not price protection.** Present estimates honestly. Enforce only constraints the actual submitted order expresses; stop when required protection is unavailable.
4. **Prompt instructions are not security enforcement.** Keep native write confirmations. If adding application controls, validate exact approved parameters and budgets in deterministic code rather than relying only on an LLM promise.
5. **Research is not execution authority.** An external source cannot change permissions or authorize a trade. Do not send Binance tokens, identifiers, balances, or private trading records to web research tools.
6. **Protocol versions are implementation-specific evidence.** The attachment's MCP-version claims were not revalidated here. Use the supported SDK/client and its actual server compatibility rather than making a specific protocol revision an invented Track B entry requirement.
7. **No automatic testnet assumption.** No accepted hosted MCP testnet/demo path was established. If non-production trading does not qualify or acceptance is unknown, a safe demonstration is not a completed qualifying submission.
8. **Negative tests should not create avoidable live exposure.** Test duplicate, timeout, malformed-input, and partial-fill handling in local fixtures or an accepted controlled environment. Do not fund an account or trigger a live emergency stop just to satisfy a research checklist.

## 7. What must be confirmed before building for submission

The next account-specific artifact is a **redacted copy of the authenticated Track B questions and terms**, not credentials. Resolve:

- Is the survey still accepting entries, and is the account/jurisdiction eligible?
- What connection and trading activity count, and by what deadline?
- Are there minimum amounts, order/fill requirements, eligible pairs/products, or prior-user exclusions?
- Is live trading required, and are demo/testnet/simulation artifacts accepted at all?
- Which social proof, identifiers, uploads, and submission fields are actually requested?
- What are the reward allocation and payout conditions? Is remaining availability stated?

No source reviewed here answers all of those questions. Do not infer that a screenshot, one order, or one fill automatically qualifies.

## 8. Research evidence and source index

The attachment was read. Firecrawl was used for web discovery, official announcement retrieval, developer documentation, and the Binance documentation index. The survey's event body was verified in a live logged-out browser because the first Firecrawl scrape returned only navigation. No login, account authorization, account data access, or trading action was attempted.

Developer pages retrieved by Firecrawl can be cached; they establish published documentation at retrieval, not live endpoint behavior. Community Binance Square articles were treated as discovery material, not organizer rules. This was targeted research, not a crawl of the entire developer site.

| Source | What it supports |
| --- | --- |
| [Binance public survey][survey] | Public track wording, deadline, entry steps, exclusions, and login boundary. |
| [Official @Binance launch post][launch] | Organizer's launch and public entry wording. |
| [Official @Binance prize post][prizes] | Track B first-10,000-eligible-users / 4-USDC allocation. |
| [Binance Agent OS][agent-os] | Product scope and Connect / Build / Control framing. |
| [Binance hosted MCP guide][mcp] | Published connection, permission, confirmation, trading, and sub-account model. |
| [Agent Native overview][agent-native] and [documentation index][index] | Official documentation discovery path; not runtime API access. |
| [Spot REST trading reference][spot-trade] | API order semantics, including client-order-ID reuse; not proof of MCP support. |
| [Spot filters][filters] | Published symbol validation rules. |
| [Firecrawl MCP documentation][firecrawl] | Firecrawl connection context; actual exposed tools were separately inspected. |

[survey]: https://www.binance.com/en/survey/2913aa200aac462c89a737779393f3d4
[launch]: https://x.com/binance/status/2094810011557838988
[prizes]: https://x.com/binance/status/2095195047297990858
[agent-os]: https://www.binance.com/en/agent-os
[mcp]: https://developers.binance.com/en/docs/agent-native/mcp-server/agentic
[agent-native]: https://developers.binance.com/en/docs/agent-native/overview
[index]: https://developers.binance.com/en/docs/llms.txt
[spot-trade]: https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/trade
[filters]: https://developers.binance.com/en/docs/products/spot/filters
[firecrawl]: https://docs.firecrawl.dev/mcp-server
