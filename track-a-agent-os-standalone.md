# Binance Agent OS Mini Hackathon: Track A
## Standalone Evidence, Build, Safety, and Completion Guide

**Track:** Build an AI agent with Agent OS
**Public-source review:** 8 September 2026 (UTC)
**Public deadline shown by Binance:** 8 September 2026, 23:59 UTC
**Status:** Public-source research updated; authenticated rules unresolved; implementation and submission unverified

**Research checkpoint:** 8 September 2026, 20:07 UTC. This is not a submission timestamp or a claim that the event remains open for this account.

This revision preserves the attached guide's numbered sections **0–17**, completion IDs, test plan, and evidence discipline for parity with Track B. It is a complete standalone document, not an addendum, and leaves the uploaded attachments unchanged. Parity means equivalent coverage, not copying Track B's trading obligations into Track A.

### Executive summary and corrections

- **Track A is the build track with published placements**, not Track B's first-10,000-eligible-users reward. The official prize post lists 2,000 / 1,500 / 1,000 USDC and 50 further awards of 300 USDC: **53 advertised award slots totaling 19,500 USDC**, versus a stated 20,000 USDC pool. The unexplained **500 USDC difference remains unresolved**; do not invent another prize.
- Preserve the exact public submission wording: **“Reply or quote repost with your submission (Track A only: video/demo + GitHub, if applicable)”**. The applicability qualifier, video/demo alternatives, repository visibility, duration, license, and exact upload fields need authenticated clarification. Do not omit the public artifact instruction or turn it into invented file-format rules.
- No reviewed official source establishes a Track A live-trade, payment, wallet transaction, profitability, multiple-MCP, or autonomous-execution requirement. A read-only agent is a product hypothesis, not confirmed eligible merely because it is safer.
- Agent OS is a platform of components, not one shared runtime, OAuth token, fund boundary, or emergency stop. Exchange MCP, Skills, direct APIs, Agentic Wallet, Binance Pay, and B402/x402 need separate authority maps.
- Public documentation and expandable FAQs were checked. Binance account authorization, actual tools, skill installation, trades, payments, and competition submission were **not performed**. Search did not resolve private judging or eligibility terms.
- This guide does **not** claim all research is complete. Its source ledger distinguishes refreshed sources, cached material, inherited reference links, and runtime evidence still needed.

**Recommended next decision:** obtain redacted authenticated Track A fields; choose one user problem and one primary Agent OS integration; build and test its read-only core while rules are clarified. Do not fund an account or perform external writes to make the checklist appear complete.

This is the standalone Track A guide. It mirrors the structure and evidence discipline of the Track B guide, but changes the product boundary from "connect your MCPs and trade" to "build an AI agent with Agent OS".

The guide treats Agent OS as a product layer that may include Binance MCP, Skills, exchange APIs, Web3 APIs, Binance Pay or x402, and Agentic Wallet depending on the selected workflow. It does not assume that every surface is available to every account, region, client, or submission.

This document distinguishes:

- What Binance publicly states about the event and Agent OS.
- What an MCP or API specification requires or recommends.
- What is only a project engineering recommendation.
- What remains an assumption or competition unknown.
- What must be observed in the actual agent runtime before it can be claimed as working.

---

## 0. Evidence Labels

Every material claim belongs to one of these classes:

| Label | Meaning |
| --- | --- |
| `BINANCE_EVENT_FACT` | Stated on the public event page or an identified official organizer announcement; cite which |
| `BINANCE_PRODUCT_FACT` | Stated in Binance Agent OS, product, or developer documentation |
| `BINANCE_API_FACT` | Stated in Binance API documentation or schema |
| `MCP_MUST` | Normative MCP requirement using MUST language |
| `MCP_SHOULD` | MCP recommendation using SHOULD language |
| `ENGINEERING_RECOMMENDATION` | Sensible project control, not an official event rule |
| `PROJECT_ASSUMPTION` | An assumption that must be tested or confirmed |
| `RUNTIME_OBSERVATION` | Behavior captured from the actual client, agent, account, or endpoint |
| `COMPETITION_UNKNOWN` | Not established by public evidence |
| `DERIVED_FACT` | Transparent arithmetic or other deduction from identified source facts, not organizer wording |
| `RESEARCH_OBSERVATION` | What was retrieved or observed in the public browser, including access and cache limits |

An official URL proves that a source exists. It does not prove that a selected client, account, region, scope, skill, wallet, API, or agent workflow behaves as described in a live submission.

The word "Agent OS" also does not, by itself, prove that MCP, Skills, APIs, Pay, Web3, and Agentic Wallet are one shared runtime or one shared authorization boundary.

---

## 1. Current Decision

### Safe strategy hypothesis

The recommended risk-managed baseline is a narrow, evidence-first AI agent that solves one specific user problem through one primary Agent OS capability and, if useful, one complementary capability.

This is not an official Binance judging rubric and is not proven to be the most competitive approach.

Proposed one-sentence product description:

> An Agent OS agent receives a bounded user intent, gathers current Binance or connected data with provenance, explains a policy-checked plan, requests approval before any sensitive action, performs one controlled action when permitted, verifies the resulting state, and produces a reproducible activity record.

### Proposed agent loop

1. Receive a specific intent such as a market brief, portfolio check, payment, rebalance proposal, or bounded trade.
2. Identify which Agent OS component owns the required data or action.
3. Gather only the minimum data needed and retain source, timestamp, scope, and freshness.
4. Apply a deterministic policy outside the model: limits, allowed assets, target accounts, expiry, and approval rules.
5. Explain the proposed action, uncertainty, data age, permissions, and failure behavior.
6. Ask for explicit approval if the action can move funds, place an order, transfer assets, or change external state.
7. Execute once through the selected Agent OS component if the environment and authenticated event rules permit it.
8. Verify the external result, including identifiers, status, balances, fills, fees, or transaction state as applicable.
9. Record the outcome and demonstrate safe refusal, timeout, revocation, disconnect, or emergency behavior.

### Recommended first product shape

For a first build, select one of these bounded Agent OS workflows:

- Market intelligence agent: combines Binance market data with a clearly sourced external signal and produces a decision brief without writes.
- Portfolio action agent: reads account state, proposes one bounded Spot rebalance, and verifies it after approval.
- Agentic payment or settlement agent: prepares and executes one approved payment only if the authenticated environment and selected Pay/x402 surface support it.
- On-chain operations agent: prepares one approved Agentic Wallet transfer or swap only if wallet access, chain, asset, and recovery behavior are available and accepted.
- Trade execution agent: uses Binance MCP for one bounded Spot action with full order and balance reconciliation.

The choice must be driven by authenticated Track A requirements and runtime availability, not by the landing page alone.

### What this strategy does not prove

It does not prove:

- That Track A rewards trading over payments, market intelligence, or on-chain workflows.
- That a real write is required or accepted.
- That a video, GitHub repository, or public URL has a fixed format beyond the public wording.
- That Agent OS components share one authorization or account model.
- That a particular AI client or framework is supported for every Agent OS surface.
- That a hosted Binance MCP connection, Skill, API, Pay flow, or Agentic Wallet behaves as documented in the selected region.
- That a generic chat interface is an AI agent rather than a thin demo wrapper.
- That a broad catalog of integrations is more competitive than one reliable workflow.

### Current stop decision

Do not claim submission readiness or perform a live write yet. The first submission gate is authenticated Track A rules, eligibility, accepted artifact format, and accepted Agent OS environment. Safe design, local coding, fixtures, and public read-only research may proceed in parallel; missing private rules do not prohibit engineering work. A public promotional post, submission, funding, or sensitive account action requires the relevant user authorization.

### Concrete Track A product hypothesis and scope

**ENGINEERING_RECOMMENDATION:** build an evidence-first research agent (working concept: **Thesis-to-Trade**, with the initial version operating as **Thesis Desk**). This is a proposal, not an official preference or selected implementation.

Target user: someone who wants to check a crypto claim against primary sources and current Binance market conditions without confusing evidence with a recommendation.

Agent loop: user question → bounded source/tool selection → Binance data plus optional public-source research → freshness/conflict checks → cited brief or explicit abstention → verified output record. Optional approved execution is a separate feature, not necessary to define the agent loop or prove that tool use occurred.

| Build slice | Scope | Evidence of value | What not to claim |
| --- | --- | --- | --- |
| Read-only core | One asset/event, Binance public data, small source allowlist, one brief | Actual tool trace, data age, citations, unsupported-claim refusal | Confirmed Track A acceptance before checking rules |
| Differentiation | Counterevidence, deterministic freshness policy, saved decision record | Same question compared with a plain chatbot/manual workflow | Better investment returns from a short demo |
| Optional action | One user-selected operation through a verified component with approval and reconciliation | Actual destination state, not a success sentence | All MCP fields or a testnet exist because REST documents them |
| Submission package | Reproducible commit, short demo, README and source/claim map | Reviewer can understand and repeat the flow | These formats or durations are official unless confirmed |

Keep explicit non-goals: no leverage, autonomous money management, multi-chain routing, prediction-market wagers, paid-data purchases, or new credential proxy in the initial build. These are project scope limits, not event exclusions.

### Product-quality assessment, not an invented judging rubric

Evaluate usefulness, meaningful Agent OS integration, correct results, controllability, and reproducibility as internal product goals. No official weights or judge preferences were established. A clear agent does not require multiple agents, a custom MCP server, a dashboard, or spending money.

An internal evaluation set should include an answerable question, unsupported claim, conflicting sources, stale data, unavailable tool, prompt injection, and an ambiguous request. Record cases passed/total, citation support, unexpected writes, latency, tool calls, and cost with the exact model/configuration and timestamps. Do not invent benchmark results or use short-run P&L as evidence of predictive edge.

---

## 2. Readiness and Evidence State

| Area | Current state |
| --- | --- |
| Public event summary | Verified from logged-out Binance page |
| Track A public label and advertised pool | Verified from logged-out Binance page |
| Placement amounts and advertised award slots | Official organizer prize post checked; 53 slots is a calculation, not confirmed awards |
| Prize arithmetic | Listed payouts total 19,500 USDC; 500 USDC discrepancy unresolved |
| Binance Agent OS product map | Verified from current public Agent OS page |
| Agent OS FAQ distinctions | Verified from current public Agent OS page |
| Binance MCP product description | Verified as vendor-stated documentation |
| Skills Hub description | Verified as vendor-stated documentation |
| MCP protocol revision and transport guidance | Revision 2026-07-28 pages checked; Binance deployed version untested |
| Wallet setup and rule ownership | Official welcome/install pages checked; no wallet created |
| x402 version and settlement boundary | Official introduction checked; no paid resource or settlement called |
| Skills repository representation | Public README checked; no skill installed or dependency audited |
| Authenticated Track A artifacts | Unknown |
| Authenticated eligibility | Unknown |
| Exact video/demo requirements | Unknown beyond public Track A wording |
| Exact GitHub/repository requirements | Unknown beyond public Track A wording |
| Accepted Agent OS client and environment | Unknown |
| Selected component authorization | Not tested |
| Runtime tool and skill list | Not captured |
| Agent read-only behavior | Not captured |
| Approval and refusal behavior | Not captured |
| External action and state reconciliation | Not captured |
| Prompt injection and untrusted-input behavior | Not captured |
| Emergency-stop or disconnect residual state | Not captured |
| Competitive value | Hypothesis only |

The project is not submission-ready and the implementation is not runtime-verified.

---

## 3. Public Event Facts and Unknown Rules

### Public event source

**Source:** [Binance event and survey page](https://www.binance.com/en/survey/2913aa200aac462c89a737779393f3d4)

### `BINANCE_EVENT_FACT`: visible public facts

The public logged-out page currently displays:

- Binance Agent OS Mini Hackathon.
- $60,000 USDC prize pool.
- Track A: build an AI agent with Agent OS, $20,000 USDC.
- Track B: connect your MCPs and trade, $40,000 USDC.
- Seven days to build and submit.
- Deadline shown as 8 September 2026 at 23:59 UTC.
- Follow `@Binance` and repost the event post.
- Reply or quote repost with the submission.
- Track A specifically mentions video/demo and GitHub, if applicable.
- Survey completion is required.
- Binance login is required to begin the survey.
- Geographic exclusions are displayed, including the US, UK, EEA, Hong Kong, Singapore, and jurisdictions on Binance's prohibited list.
- The page says the event is not an offer or solicitation to trade any financial product.

### `COMPETITION_UNKNOWN`: not established publicly

The public page does not establish:

- The exact Track A submission form fields.
- Whether a video is mandatory, optional, or only applicable to some submissions.
- Required video length, format, hosting location, language, or public visibility.
- Whether GitHub must be public, what files must be included, or whether a license is required.
- Whether the agent must use the hosted Binance MCP server, Agent OS APIs, Skills, Wallet, Pay, or another supported surface.
- Whether a live action is required, optional, simulated, or discouraged.
- Whether a trading, payment, wallet, market-data, or multi-component workflow is preferred.
- Judging weights, tie-breakers, scoring criteria, selection process for the next 50 awards, or actual winners. Published award slots are described below.
- Team size and one-entry rules.
- Whether one person can enter both tracks.
- IP, licensing, or reuse terms.
- Payout timing.
- Identity, tax, or jurisdiction conditions beyond the public exclusion text.
- Whether the public deadline remains active after the displayed time.

These are unknown, not evidence of absence. This guide must follow applicable authenticated terms; if official sources conflict, record both texts and seek organizer clarification rather than inventing precedence or silently choosing the more convenient rule.

### Official placement announcement and prize arithmetic

**BINANCE_EVENT_FACT — S02:** [Official @Binance prize announcement, 2 September 2026](https://x.com/binance/status/2095195047297990858):

| Published placement | Published award | Number of slots | Calculated subtotal |
| --- | --- | --- | --- |
| 1st | 2,000 USDC | 1 | 2,000 USDC |
| 2nd | 1,500 USDC | 1 | 1,500 USDC |
| 3rd | 1,000 USDC | 1 | 1,000 USDC |
| Next 50 winners | 300 USDC each | 50 | 15,000 USDC |
| **Derived total** | | **53** | **19,500 USDC** |

The same post advertises **20,000 USDC** for Track A. The **500 USDC difference** is a derived arithmetic observation; its allocation is unknown. Do not assume an omitted winner, bonus, fee, revised award, equal team split, or guaranteed payout. The post does not explain whether the next 50 are ranked, how ties are resolved, or whether every slot will be awarded.

Track B's 4-USDC / first-10,000 model does not apply to Track A. Trading more or submitting earlier is not established as a Track A ranking criterion. Both-track entry is unknown; “pick your track” alone does not resolve eligibility for both.

### Subtle submission and eligibility questions

**Exact public wording (S01/S02):** “Reply or quote repost with your submission (Track A only: video/demo + GitHub, if applicable)”. Preserve the slash and applicability qualifier. Prepare both a demo and a repository when practical, but do not assert a mandatory video length, public repository, hosting service, license, or upload format without the actual fields.

The public steps are follow/repost **@Binance's event post**, reply or quote repost with the submission, and complete the survey. A standalone repository, this research document, or a social post alone does not establish completion of all steps. [Official launch post](https://x.com/binance/status/2094810011557838988) identifies the announcement; avoid relying on a community repost.

The stated seven-day period and deadline do not settle when code must have been written, whether pre-existing projects or AI-generated code are allowed, whether post-deadline fixes are accepted, or which timezone a form UI uses. Record UTC, freeze the demonstrated commit, and preserve submission confirmation. A visible page after the deadline is not proof of an extension.

Ask for the account-specific terms on KYC/age/entity eligibility, team members, number of entries, prior work, originality, plagiarism, third-party code/assets, IP licenses, public data disclosure, judging access, geographic exclusions, payout, tax, and permitted AI use. None is invented here. General product access and contest eligibility are separate; do not bypass regional restrictions.

### Rules gate

Before finalizing submission eligibility, publishing an authorized submission, or performing a live write:

1. Sign in to Binance and capture the exact Track A questions and fields.
2. Record the authenticated deadline and current submission status.
3. Confirm what Agent OS components and environments are accepted.
4. Confirm whether a live write, simulation, recording, or read-only demo is accepted.
5. Confirm video, GitHub, public URL, social-post, and repository requirements.
6. Confirm team, one-entry, IP, identity, payout, and tax conditions.
7. Record a redacted rules matrix with exact wording and status.

If the survey cannot be accessed, the project remains submission-blocked.

---

## 4. Official Binance Agent OS Facts

### 4.1 Agent OS product map

**Source:** [Binance Agent OS](https://www.binance.com/en/agent-os)

`BINANCE_PRODUCT_FACT`: Binance describes Agent OS as a developer platform for connecting AI agents to Binance. The page says it brings the Binance MCP server, exchange APIs, and ready-made agent skills together in one place.

The landing page says that, within limits set by the builder, an agent can:

- Read crypto and TradFi market data.
- Track positions and portfolio state.
- Initiate transactions.
- Interact with supported on-chain services.
- Build trading, payment, market-data, and on-chain workflows.
- Use permissions, accounts, and limits selected for each agent.

The page presents six user-facing capability areas; the first five are the main infrastructure workflows:

| Area | Publicly shown components | Boundary |
| --- | --- | --- |
| Trade | Binance MCP Server, Skills, APIs | Product, scope, account, and region dependent |
| Pay and settle | Binance Pay, x402, APIs | Payment-specific authorization and availability |
| Read the market | Web3 APIs, Skills, APIs | Data source and freshness must be observed |
| Track portfolio | Binance MCP Server, APIs, AI Pro | Product access and account scope vary |
| Operate on-chain | Agentic Wallet, Web3 APIs | Wallet, chain, signing, and asset risk |
| Answer your questions | Binance AI Pro | An in-app assistant product; not evidence of a public embeddable SDK or an entrant-built agent |

The page describes an MCP connection flow of:

1. Add the Binance MCP Server.
2. Authenticate the server.
3. Your agent is live.

Do not reuse these three steps as the setup instructions for Wallet, Pay, x402, or direct APIs.

"Connect once" is marketing/product language describing the intended platform experience. It is not proof that every component has one token, one session, one scope model, or one runtime.

### 4.2 Agent OS FAQ facts that were easy to miss

`BINANCE_PRODUCT_FACT`: The Agent OS FAQ answers were expanded and read in the public browser during this review (S03); the initial scrape exposed only question headings. They state:

- The Binance MCP server provides a standardized way for AI agents to access supported Binance capabilities without separate custom integrations for every workflow.
- Depending on products, permissions, account eligibility, and regional availability, AI agents can access crypto market data, track portfolios, trade, initiate payments, and interact with supported on-chain services.
- Binance MCP is a standardized connection; Binance Skills are ready-made modules for specific tasks; Binance APIs provide direct programmatic access for custom workflows.
- Agent OS can be accessed through MCP, ready-made Skills, CLI workflows, and developer APIs. Compatibility varies by product and integration method.
- Binance Agentic Wallet is a dedicated wallet designed for agent actions and may enable eligible on-chain transfers, swaps, and other interactions subject to permissions and availability.

These statements are product descriptions, not proof of account eligibility, runtime behavior, contest acceptance, or safety.

### 4.3 Listed integration surfaces and compatibility caveat

`BINANCE_PRODUCT_FACT`: The landing page visibly lists Claude Desktop, Codex, CLI workflows, agent frameworks, REST APIs, and WebSockets as ways the existing agent stack can work with Agent OS. The FAQ qualifies this with compatibility varying by product and integration method.

Do not present the list as a universal compatibility guarantee. Capture the actual client, version, operating system, product surface, setup path, authorization, and runtime result.

### 4.4 Binance AI disclaimer and responsibility boundary

`BINANCE_PRODUCT_FACT`: The Agent OS page disclaims guaranteed AI outputs and warns that:

- AI inputs may include unvetted third-party sourced content.
- Sourced content may be restricted or altered by compliance and safety filters, but those filters are not absolute.
- Binance does not endorse or guarantee AI outputs.
- AI outputs may contain errors, bias, synthetic data, or outdated information.
- Third-party AI tools may be available without guarantee and are subject to third-party terms.
- User-configured or third-party AI tools create additional responsibility for the user.
- Digital-asset prices can be volatile and the user remains responsible for investment decisions.

**ENGINEERING_RECOMMENDATION:** surface source provenance, uncertainty, data age, tool identity, and approval state rather than presenting model output as a Binance recommendation. This follows the product risk warning; it is not a published Track A judging criterion.

### 4.5 Binance MCP Server as one Agent OS component

**Source:** [Binance MCP Server guide](https://developers.binance.com/en/docs/agent-native/mcp-server/agentic)

`BINANCE_PRODUCT_FACT`: The official guide documents a hosted Binance MCP path that can provide:

- Market data including tickers, order books, candles, and funding rates.
- Agentic sub-account balances, positions, and bills.
- Optional read-only main-account view.
- Spot, Margin, Convert, USD-S Futures, and COIN-M Futures trade scope subject to authorization.
- Transfers between wallets inside the same Agentic sub-account.
- No withdrawal scope.
- No agent pull from the main account into the Agentic sub-account.
- Confirmation before orders, cancels, and internal transfers.
- Disconnect and permission review from Binance.com.
- Emergency stop described as disconnecting agents and canceling Spot, Margin, and Futures positions and orders in the Agentic account.
- Desktop-oriented setup.

The guide gives this endpoint:

```text
https://agent.binance.com/mcp/agentic
```

It states that the hosted path requires no local install and no API keys on the device, but it also directs users to follow the client-specific setup flow rather than pasting the endpoint into an AI chat or opening it directly in a browser.

These are vendor-stated capabilities. They are not runtime observations.

### 4.6 Skills Hub

**Source:** [Binance Skills Hub documentation](https://developers.binance.com/en/docs/sdks-tools/integrations/skills-hub)

`BINANCE_PRODUCT_FACT`: Binance describes Skills Hub as an open marketplace of AI-agent skills. The current documentation states that Skills:

- Provide native access to crypto capabilities such as token search, on-chain trading, wallet tracking, smart-money signals, and DeFi interactions.
- Are framework-agnostic and can work with Claude Code, LangChain, CrewAI, OpenClaw, and custom agent stacks.
- Follow the MCP standard so MCP-compatible agents can discover and call them.
- Include read-only skills for market data, wallet balances, token information, trends, smart-money activity, DeFi statistics, and signals.
- Include read/write skills for on-chain transfers, swaps, and limit orders through Agentic Wallet.
- Are open source and community-extensible.
- List Node.js 22+ and an MCP-compatible agent as supported environment requirements.

Skills Hub is not automatically the same permission boundary as the hosted Binance MCP Server. Audit the source, version, authentication, permissions, secrets, write behavior, and isolation for every selected skill.

**Subtle implementation distinction (S05/S06):** the public [Skills Hub README](https://github.com/binance/binance-skills-hub) describes folders containing `SKILL.md` with YAML frontmatter and structured instructions. A skill file is not, by itself, a running MCP server or proof that it appears in `tools/list`. The documentation's broad MCP compatibility language does not establish every skill's actual transport, dependencies, or invocation path. Inspect the selected skill and its invoked CLI/API code.

The retrieved repository page displayed commit `257d287079cfac7d9a173078fc574e8fd7bbf212`. This is an observed source snapshot, not a pinned installation, audit result, or guarantee of the current head. Record an immutable revision and dependency lockfiles before use; reviewing only `main` is not reproducibility.

The README mentions chat as one credential-input option. **Do not adopt that option in this project.** Use client secret storage or protected environment configuration, exclude secrets from logs and source control, and never request keys in chat. “No API keys on your device” belongs to the documented hosted MCP route, not every Skills/API integration.

Skills Hub's published Node.js prerequisite is **22+**. The Wallet-specific install guide separately says **18+** for its installer. Treat these as component-specific statements, not one universal Agent OS requirement. Node.js 22+ may be a practical common baseline, but verify the actual selected installer, CLI, dependencies, and lockfile rather than infer compatibility from version arithmetic.

### 4.7 Agentic Wallet, Pay, x402, and Web3 APIs

The Agent OS landing page presents these as related components:

- Agentic Wallet for supported on-chain transactions.
- Web3 APIs for on-chain data and DeFi access.
- Binance Pay and x402 for machine-to-machine payments and settlement.
- Exchange REST and WebSocket APIs for market and trading data.

Public product mapping does not establish a single shared account, signing model, testnet, rollback mechanism, fee model, or runtime authorization path. Keep these components separate in the architecture and evidence package.

#### Agentic Wallet: verified details missed by the broad product map

Sources: [Wallet welcome](https://developers.binance.com/en/docs/products/agentic-wallet/welcome), [Wallet installation](https://developers.binance.com/en/docs/products/agentic-wallet/quickstart/install-agentic-wallet), [Agentic Hub](https://web3.binance.com/agentic-hub) (S07–S09).

- The install guide requires a Binance account and an existing **MPC Wallet in the Binance App before creating an Agentic Wallet**. This is not the exchange MCP's desktop sub-account funding flow.
- Wallet Skills may install the `baw` CLI on first use. Installation can execute dependency code and is not a harmless read operation; inspect and approve the source/dependency path first.
- Wallet sign-in uses a link and Binance App approval, with QR scanning on web. Sign-in links/QR codes and session artifacts must not appear in public demo recordings.
- **Security rules are configured only in the Binance App.** The AI can read them but cannot modify them, according to the install guide. Daily limit, token scope, and high-risk handling are product controls; do not claim the app wrapper owns them.
- The welcome page says API-level rules reject out-of-policy actions or require additional confirmation. Example flows describe user confirmation. Neither establishes that every wallet action has exactly the hosted exchange MCP's consent UI. Our per-sensitive-action confirmation policy is an additional engineering decision.
- Transfers require recipients in the address book, per the welcome page and Hub FAQ. Unlike the hosted exchange MCP's no-withdrawal boundary, an authorized wallet transfer can send value to an external address.
- The welcome page lists BSC `56`, Ethereum `1`, Base `8453`, and Solana `CT_501`. These are documentation identifiers, not proof that all operations, assets, or accounts work on all four. Do not treat the Solana identifier as an EVM chain ID.
- The Hub marks **Perp Trading “Coming Soon”**. A visible card is not a live feature. Its FAQ's skill count and the larger card catalog should not be treated as a stable installed capability count.
- MPC is **multiparty computation**, distinct from **MCP**, Model Context Protocol. Key-management technology does not guarantee correct recipients, profit, reversibility, or immunity to compromised sessions.

#### Binance Pay is not synonymous with B402/x402

Sources: [Binance x402 landing page](https://www.binance.com/binancex402), [Agentic Payments introduction](https://developers.binance.com/en/docs/products/onchainpay-x402/introduction), [Binance Pay introduction](https://developers.binance.com/en/docs/products/pay/Introduction) (S10–S12).

The Agent OS card groups “Binance Pay (x402)” visually, but the selected integration must name the actual payment rail. The Pay introduction is too thin to establish merchant onboarding, API credentials, callbacks, refunds, or a sandbox. Those remain product-specific discovery items.

The x402 landing page calls B402 a **non-custodial transaction verification and submission service**, not a wallet or held-balance account. Its standard flow moves assets directly between buyer- and merchant-designated on-chain addresses. Do not invent a “B402 balance” or apply exchange sub-account funding rules to it.

The detailed introduction recommends `/papi/v2/b402/*` with **x402 v2**, while retaining V1 for legacy clients; the landing page's sample uses `x402Version: 1`. This is a version-selection trap: choose one documented wire format and matching client, not a mixture. The landing page markets multi-network support while the retrieved introduction documents **BNB Smart Chain** payment assets and methods. Record the actual network, token contract, method, API version, and eligibility rather than generalize “all chains”.

The documented sequence separates **HTTP 402 payment request → buyer authorization → verify → settle → resource delivery**. `/verify` is not proof of payment; settlement is not proof the seller delivered the promised data. An off-chain signature can authorize later movement of funds. Reject an unexpected paywall unless the user approved the seller, asset/network, amount, resource, expiry, and applicable cumulative budget. Never automatically pay because a scraped page or tool returned 402.

The introduction distinguishes EIP-3009, Permit2 exact, and Permit2 up-to methods. Do not assume every token supports every method, or confuse an up-to authorization with a single exact-price purchase. Gas sponsorship does not mean the asset is free, all prerequisite approvals are free, or every flow succeeds. Refund, fulfillment recovery, and callback semantics need separate evidence.

### 4.8 Agentic account funding boundary for the MCP component

The official MCP guide states:

- The Agentic sub-account starts empty.
- Initial funding is manual through the Binance web UI.
- The agent cannot pull funds from the main account into the Agentic sub-account.
- Internal Transfer scope is limited to wallets inside the Agentic sub-account.
- Users should fund only what they are prepared to let the agent trade.

This boundary applies to the documented MCP Agentic sub-account flow. Do not generalize it to Agentic Wallet, Pay, x402, or a custom API integration without separate evidence.

### 4.9 Product fact versus runtime fact

The official pages prove product intent and stated boundaries. They do not prove:

- The selected account is eligible.
- The selected region has access.
- The selected client can connect.
- The selected scopes expose the documented tools.
- The selected skill has not changed.
- An action is idempotent or reversible.
- An external write is accepted as Track A evidence.
- Emergency stop cancels every residual state immediately.

### 4.10 Safety interpretation and machine-readable documentation

The [MCP guide's account-management section](https://developers.binance.com/en/docs/agent-native/mcp-server/agentic#manage-your-agentic-account) describes emergency stop as “disconnect all connected agents and cancel all spot, margin, and futures positions and orders in this Agentic account.” This is **the vendor's wording**, not observed execution behavior. Orders, positions, and asset balances are different objects. Do not paraphrase it as guaranteed immediate liquidation, zero balances, rollback, or cancellation on other Agent OS components. Verify residual state only where safe and applicable.

The [Agent Native overview](https://developers.binance.com/en/docs/agent-native/overview) (S17) documents [llms.txt](https://developers.binance.com/en/docs/llms.txt) for discovery and [llms-full.txt](https://developers.binance.com/en/docs/llms-full.txt) for full text. They are documentation resources, not trading endpoints or proof of authorization. Consult only relevant catalog pages and schemas; a documentation index is not runtime tool discovery.

For a selected component record the document URL/heading, retrieval and source-update times if exposed, API/schema version, immutable skill commit, client/SDK version, and actual runtime schemas. A REST/OpenAPI schema does not prove hosted MCP field availability. For a Skill, inspect its instructions and invoked code rather than assume an MCP manifest exists. For Wallet or x402, confirm network, token, method, and API version independently. Discovery links retained in section 17 are not all revalidated endpoints.

---

## 5. Product Boundary and Architecture Choices

### Component boundaries

| Component | Possible role | Boundary to document |
| --- | --- | --- |
| Binance MCP Server | Hosted market, account, and exchange action connection | Agentic account, scopes, confirmation, no withdrawal |
| Skills Hub | Ready-made read-only or on-chain modules | Source, version, permissions, secrets, write behavior |
| Exchange REST/WebSocket APIs | Custom market or trading workflow | API credentials, product limits, environment, region |
| Web3 APIs | On-chain data and DeFi context | Chain, data provenance, rate limits, freshness |
| Agentic Wallet | On-chain signing and agent actions | Wallet isolation, signer, assets, chain, recovery |
| Binance Pay / x402 | Machine-to-machine payments or settlement | Recipient, amount, authorization, settlement state |
| AI client or framework | Reasoning, orchestration, presentation | Model, prompts, tool routing, logs, version |
| Wrapper application | Policy, approval, audit, reconciliation | Caps, allowlists, state, retry, secrets |

### Architecture alternatives

The phrase "build an AI agent with Agent OS" does not publicly resolve whether Track A expects the official hosted Binance MCP path, a Skill, direct APIs, Agentic Wallet, Pay, a custom wrapper, a multi-component agent, or another design.

| Architecture | Evidence needed | Main risk |
| --- | --- | --- |
| MCP-first Agent OS agent | Client transcript, scopes, tools, read/write result | Low customization or unclear differentiation |
| Skills-first agent | Skill source, version, install, auth, tool list, write proof | Community code and permission ambiguity |
| API-first agent | API schema, credentials, request/response, policy controls | Larger security surface and attribution risk |
| Multi-component agent | Tool provenance, routing, isolation, permission map | Confused authority and data flow |
| Wallet/on-chain agent | Wallet creation, signer, asset, chain, transaction and recovery proof | Irreversible on-chain action |
| Pay/x402 agent | Payment request, recipient, authorization, settlement and refund behavior | External recipient and settlement ambiguity |
| Hybrid agent | Clear ownership for every read and write | Scope creep and unreproducible demo |

Select a provisional architecture now if useful; finalize its submission eligibility after authenticated rules are known. Validate capabilities before making live-action commitments. Do not treat a blog, video, or marketing diagram as proof that an architecture qualifies.

### Agent identity and action ownership

Every action must have an explicit owner:

| Control | Likely owner | Evidence needed |
| --- | --- | --- |
| Data provenance | Agent orchestrator or component | Source URL/tool/skill and timestamp |
| Prompt and instruction boundary | Agent client/wrapper | System policy and injection test |
| Allowed symbols/assets/recipients | Wrapper application | Configuration and boundary test |
| Notional/payment cap | Wrapper application or product scope | Code/config and over-cap test |
| Trade confirmation | Binance MCP/client and wrapper | Prompt, denial, no-side-effect result |
| Wallet signing | Agentic Wallet/component | Signer and transaction approval evidence |
| Payment authorization | Pay/x402/component | Recipient, amount, approval, settlement |
| API credentials | Client/application/operator | Secret handling review |
| Tool/skill access | Client and component authorization | Tool list and scope capture |
| Retry and idempotency | Wrapper and destination system | Identifier mapping and timeout test |
| Audit log | Wrapper application | Redacted timestamped record |
| Emergency stop | Product/account/operator | Before/after state |

Do not attribute a local wrapper control to Binance or Agent OS unless the product actually provides it and runtime evidence confirms behavior.

### Agent versus chatbot boundary

Track A is described as building an AI agent, not merely displaying an AI-generated answer. A credible agent should show:

- A defined goal and user intent.
- Tool or component selection.
- State carried across the workflow.
- Policy checks outside the model where possible.
- A deliberate action or a deliberate refusal.
- Verification of external state.
- A visible audit trail.

A polished dashboard with no real Agent OS connection, no tool call, no state transition, or no reproducible action should not be presented as a completed Agent OS agent. These are **engineering criteria**, not a recovered organizer definition. A read-only agent can perform useful tool selection, verification, and report generation without financial writes; it still needs actual integration evidence and confirmed event acceptance.

### Minimal agent state machine and authority boundary

**ENGINEERING_RECOMMENDATION:** persist an operation record outside the model. A possible state machine is:

```text
RECEIVED -> COLLECTING -> VALIDATING -> REPORT_READY (read-only terminal)
                                  -> REFUSED / NEEDS_CLARIFICATION
                                  -> AWAITING_APPROVAL (sensitive action only)
AWAITING_APPROVAL -> DENIED / EXPIRED
AWAITING_APPROVAL -> APPROVED -> SUBMITTING -> RECONCILING
RECONCILING -> VERIFIED / PARTIAL / PENDING / FAILED / UNKNOWN
UNKNOWN -> MANUAL_REVIEW (no automatic resubmission)
```

Bind approval to the user, operation ID, component/account, exact normalized parameters, destination, quote/limits, and expiry. Changing any approved field invalidates approval. A tool response, web page, model message, refresh, or chat “yes” without a matching pending operation cannot advance the state. Persist the pending/submitted state before making a write; serialize conflicting operations and count pending commitments against budgets. Recheck live constraints immediately before dispatch.

For read-only reports, verify that claims are supported by the observed source and that the report does not conceal stale or missing data. Do not fabricate an order/payment state machine when the selected product never writes.

---

## 6. Agent OS Protocol and Security Boundaries

### Current MCP specification checked

**Source:** [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)

The `2026-07-28` specification, transport, and Tools pages were retrieved in this review (S13–S15). This proves the contents of that revision, not that Binance or the selected client implements it, nor that every SDK supports it. Use the supported client's actual compatibility path and record its version. Do not force a protocol upgrade to satisfy this document. Non-MCP paths mark this section not applicable.

Useful references:

- [What is MCP?](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro)
- [Architecture](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture)
- [Remote MCP servers](https://modelcontextprotocol.io/docs/2026-07-28/develop/connect-remote-servers)
- [Build an MCP server](https://modelcontextprotocol.io/docs/2026-07-28/develop/build-server)
- [MCP SDKs](https://modelcontextprotocol.io/docs/2026-07-28/sdk)
- [MCP Inspector and debugging](https://modelcontextprotocol.io/docs/2026-07-28/tools/debugging)

### Streamable HTTP and modern discovery

**Source:** [MCP Streamable HTTP specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)

The current specification describes:

- A single MCP endpoint accepting POST.
- Each JSON-RPC request or notification as its own POST.
- JSON or request-scoped SSE responses.
- Clients advertising `application/json` and `text/event-stream`.
- MCP protocol-version information on each POST.
- `Mcp-Method` and, for relevant tool/resource/prompt calls, `Mcp-Name` headers.
- Removal of the standalone GET stream endpoint and protocol-level sessions in the reviewed `2026-07-28` revision.
- Closing the SSE response as request cancellation.
- Long-lived change notifications through `subscriptions/listen`.
- Origin validation to prevent DNS rebinding.
- Local servers **SHOULD** bind to localhost (`127.0.0.1`) rather than `0.0.0.0`; this is not the same normative level as Origin validation **MUST**.

For MCP `2026-07-28`, record `server/discover` if sent/exposed by the client, `MCP-Protocol-Version`, required per-request `params._meta`, the selected version, and paginated `tools/list` as observable. Use `initialize`/initialization evidence when the supported client uses a revision that requires it. A client that does not expose raw transport headers is not automatically noncompliant: record the observability limitation and SDK/client version instead of fabricating a trace or replacing the supported authorization flow.

This list mixes protocol requirements and recommendations; preserve the source's MUST/SHOULD distinctions. It does not prove that a Binance deployment implements every detail. Closing a response stream is a protocol cancellation signal, not proof that an exchange order, payment authorization, or on-chain transaction was canceled or reversed.

### MCP tools and skills security

**Source:** [MCP Tools specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)

The checked Tools specification requires attention to:

- `tools/list` pagination and authorization-dependent visibility.
- Input and output schemas.
- Structured content versus text content.
- Tool execution errors versus JSON-RPC protocol errors.
- Untrusted tool annotations.
- Input validation, access control, rate limiting, and output sanitization for custom servers.

The specification does not mandate one user-interface pattern. A strong Track A agent should show sensitive inputs, allow denial, validate results, and record tool identity without treating a tool description as trustworthy authority.

### Authorization and OAuth

Sources:

- [MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
- [MCP authorization security considerations](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations)
- [MCP security best practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices)

For a custom HTTP server or proxy, consider protected-resource metadata, authorization-server discovery, PKCE, exact redirect validation, state/issuer/audience/token validation, HTTPS, and strict token separation.

For the official Binance hosted path, use Binance's supported client authorization flow. Do not present custom OAuth requirements as evidence about the hosted deployment.

### Untrusted content and prompt injection

Agent OS explicitly warns that AI inputs may include unvetted third-party content and that AI outputs may be outdated or wrong. Treat the following as data, not instructions:

- News and research results.
- Web pages and social posts.
- Token metadata and on-chain text.
- Skill descriptions and tool annotations.
- Payment requests and recipient-provided messages.
- API error strings or tool-returned natural language.

**ENGINEERING_RECOMMENDATION:** the agent must preserve a hard instruction boundary. External content must not be allowed to change scope, recipient, amount, approval requirement, system policy, or emergency-stop behavior.

---

## 7. Completion Program

### Dependency spine

```text
D0 Evidence freeze
  -> D1 Authenticated rules and eligibility
  -> D2 Agent OS architecture and component decision
  -> D3 Client authorization and runtime discovery
  -> D4 Agent policy, provenance, and action controls
  -> D5 Read-only, refusal, and injection tests
  -> D6 Optional external action, recovery, and reconciliation
  -> D7 Submission package and competitive proof
```

### Access labels

- `NONE`: Documentation/design work only.
- `AUTH`: Authenticated Binance access or survey.
- `RUNTIME`: Selected AI client, Agent OS component, and live connection.
- `AUTH + RUNTIME`: Both authenticated account access and runtime client.
- `FUNDED`: Also a funded Agentic sub-account or wallet/payment balance, if required.

`AUTH` is needed only for the selected private/account surface or survey; public market reads can be unauthenticated. B402 is non-custodial and has no held balance: its value-bearing flow may require an authorized buyer's funded wallet, not a “B402 account balance.” Reading existing order or settlement evidence does not itself require new funding. Apply all access labels according to the chosen component.

### Priority definitions

The priorities and the words “required,” “must,” “go,” and “stop” in sections 7–15 describe **internal engineering/release policy unless explicitly labeled as an official rule or normative protocol quotation**. They are not Binance's judging checklist. Apply only the components and risk controls relevant to the selected product, recording justified non-applicability.

- **Critical/P0:** Stop-ship or stop-action.
- **High/P1:** Required for a credible submission or external write.
- **Medium/P2:** Required for robust reproducibility and operations.
- **Low/P3:** Cleanup or scope reduction.
- **Cosmetic/P4:** Presentation work after substantive issues close.

### P0 critical completion items

#### C-01. Authenticated Track A submission contract

**Access:** `AUTH`

Capture the exact questions, upload fields, accepted Agent OS surfaces, video/demo fields, GitHub/repository fields, social requirements, team rules, IP, identity, payout, tax, and final deadline.

**Complete when:** A timestamped redacted survey capture and rules matrix exist.

**Stop when:** The survey cannot be accessed. Do not infer Track A rules from Track B, videos, or public marketing copy.

#### C-02. Current deadline and submission status

**Access:** `AUTH`

Record active/closed/extended status, UTC deadline, submitter timezone, form endpoint, social-post timing, and any authenticated terms that differ from the public text. Escalate conflicting official wording instead of assuming an override.

**Complete when:** A timestamped status decision says `yes`, `no`, or `unknown` for current acceptance.

**Stop when:** Status is unknown after the displayed deadline window.

#### C-03. Eligibility, account, jurisdiction, and legal constraints

**Access:** `AUTH` for account-specific facts; `NONE` for document analysis.

Confirm account access, regional eligibility, AI-assisted feature availability, supported client, real-fund permissions, wallet/payment permissions, recording/privacy constraints, third-party-client conditions, identity, payout, tax, and IP requirements.

**Complete when:** A redacted eligibility record and relevant terms excerpts exist.

**Stop when:** Account or jurisdiction eligibility is unresolved. Do not fund a sub-account, wallet, or payment balance.

#### C-04. Agent OS architecture and product selection

**Access:** `NONE` initially; `AUTH + RUNTIME` for final selection.

Choose a primary Agent OS component and document why it solves the target user problem. Record whether supporting MCP servers, Skills, APIs, Web3 APIs, Pay/x402, or Agentic Wallet components are used.

**Complete when:** An architecture diagram, component ownership matrix, permission map, secret boundary, and fallback decision exist.

**Stop when:** The demo depends on a component whose authorization, region, client, or write behavior is only assumed.

#### C-05. Supported client and runtime connection

**Access:** `AUTH + RUNTIME`

Record client/version, OS, region, setup path, endpoint or repository, authentication, scopes, protocol version, component versions, server identity if visible, token behavior if visible, and successful connection state.

**Complete when:** A redacted transcript/recording and authorization/component capture exist.

**Stop when:** The client cannot show what it connected to, what it can call, or what authority it has.

#### C-06. Runtime discovery and read-only behavior

**Access:** `AUTH + RUNTIME`

For MCP, capture the selected client's actual supported discovery/initialization path, available metadata/version evidence, paginated `tools/list`, schemas, annotations, authorization-dependent differences, structured/text results, and errors. See section 6 for revision-specific details and observability limitations. For Skills and APIs, capture installation/version, source, schema, permissions, request/response, and read-only calls. For Wallet, Pay, and Web3 components, capture the equivalent capability and authorization surface. Public reads may not need AUTH; do not require private account access for an exclusively public-data agent.

**Complete when:** Raw redacted runtime output, component ledger, and read-only call log exist.

**Stop when:** Tool names, skill behavior, API schemas, or wallet capabilities are assumed from documentation.

#### C-07. Planning, approval, and policy controls

**Access:** `AUTH + RUNTIME`

Show the user intent, data sources, proposed action, complete inputs, policy checks, uncertainty, approval requirement, denial behavior, and no-side-effect result. Test ambiguous requests and content that attempts to bypass policy.

**Complete when:** Recording/transcript, raw result, policy log, denial result, and no-side-effect verification exist.

**Stop when:** The model can change recipients, amounts, scopes, or approval state without a visible policy decision.

#### C-08. One bounded external action, only if justified

**Access:** `AUTH + RUNTIME`; `FUNDED` if an account, wallet, or payment balance is involved.

If explicitly permitted and useful to Track A, perform one bounded action through the selected Agent OS component. Capture all identifiers, final status, every fill or transaction detail, fees, before/after state, rounding, and timestamps. Otherwise mark the write `not applicable` and demonstrate the strongest accepted non-production evidence.

**Complete when:** The entire action and resulting state are reproducible.

**Stop when:** The action is not accepted, authorization is unclear, retry is unsafe, destination state is ambiguous, or reconciliation fails.

#### C-09. Recovery, revocation, disconnect, and residual state

**Access:** `AUTH + RUNTIME`; normally `FUNDED` for an account or wallet test.

Record state before the control action, invocation time, disconnect or revocation time, cancellation or settlement behavior, partial or filled behavior, residual orders/positions/balances/transactions, other connected agents, and reconnection requirements.

**Complete when:** Before/after state and residual-exposure or residual-obligation report exist.

**Stop when:** The test creates unsafe exposure or residual state is not observable.

### P1 high completion items

#### H-01. Correct requirement language

Use `Official requirement`, `Recommended evidence`, `Internal release gate`, and `Open question`. Never call a project preference an event requirement. Replace "winning strategy" with "product hypothesis".

#### H-02. Claim/source ledger

For each material claim record ID, exact wording, type, URL, anchor, quote, access time, revision date, what it proves, what it does not prove, runtime artifact, and status.

#### H-03. Evidence-class separation

Separate Binance product claims, MCP normative requirements, runtime observations, independent operational evidence, engineering recommendations, and commentary.

#### H-04. Differentiated agent design

Define target user, painful task, baseline, agent-specific capability, measurable outcome, and why Agent OS is necessary. A generic chat wrapper or tool launcher is not automatically distinctive.

#### H-05. Least privilege and scope matrix

Map each tool, skill, API credential, wallet signer, payment capability, account, asset, and recipient to the smallest required authority. Test removal of every write or sensitive scope.

#### H-06. Provenance and freshness policy

For every decision input define source, timestamp, maximum age, confidence/uncertainty treatment, conflict handling, missing-data behavior, and visible attribution.

#### H-07. Prompt-injection and untrusted-input policy

Define how the agent treats instructions embedded in tool results, web pages, token metadata, payment requests, social content, and Skills. Test that they cannot alter policy, scope, recipient, amount, or approval.

#### H-08. Action idempotency and replay policy

Distinguish MCP JSON-RPC IDs, application request IDs, Binance client order IDs, payment IDs, blockchain transaction hashes, and returned order IDs. Never treat a model message or JSON-RPC ID as an external idempotency key.

#### H-09. Complete external-state reconciliation

Capture pre-action state, inputs, all identifiers, final state, fees, timestamps, remaining quantity or obligation, concurrent activity, and post-action state. For on-chain actions capture chain, network, transaction hash, confirmations, and recipient.

#### H-10. Separate control tests

Test disconnect, revocation, scope removal, emergency stop, and client restart independently. Do not use one as evidence of another.

#### H-11. Negative and boundary tests

Test invalid symbols, quantities, precision, insufficient balance, stale data, conflicting signals, duplicate intent, timeout, prompt injection, revoked authorization, wrong recipient, unsupported chain, withdrawal attempt, main-account funding attempt, and scope removal as applicable.

#### H-12. Reproducibility appendix

Record client/version, OS, region, account or wallet type, scopes, endpoint, component versions, environment, prompts, raw results, timestamps, cleanup, redaction, and artifact index.

#### H-13. Agent OS unknowns register

Track product availability, regional eligibility, supported clients, rate limits, latency, schema stability, authentication expiry, write confirmation, testnet/demo behavior, audit export, skill provenance, wallet recovery, payment settlement, and per-user availability.

### P2 medium completion items

#### M-01. Independent data oracle

Where appropriate, capture timestamped public REST/WebSocket or on-chain responses. Keep independent oracle evidence separate from Agent OS behavior. It validates a source, not the agent's tool routing.

#### M-02. Hosted versus custom authorization separation

Keep official Binance client authorization separate from custom proxy/OAuth design. Do not present custom PKCE, token validation, or wrapper credentials as evidence about Binance's hosted flow.

#### M-03. Cleanup and recovery runbook

Document cancel/close, disconnect, revoke, emergency stop, wallet recovery, payment dispute or failure handling, residual balances, log retention, reauthorization, and account cleanup.

#### M-04. Skill and wallet provenance audit

Document skill repository, commit/version, install command, dependencies, permissions, secrets, write paths, and isolation from exchange and wallet actions.

#### M-05. Official-versus-internal checklist map

Map each checklist row to an official event requirement, Binance boundary, MCP requirement, internal gate, recommendation, or open question.

#### M-06. Source catalog reduction

Retain sources tied to claims and tests. Move third-party videos and blogs to a subordinate discovery appendix. Use claim/evidence IDs so repetition does not look like independent validation.

### P3 low completion items

#### L-01. Remove unused Agent OS components

Keep MCP, Skills, Pay, x402, Wallet, Web3, Futures, Margin, Convert, and API references only if the selected architecture uses them. Otherwise move them to an appendix.

#### L-02. Add ownership to every safety claim

Name the owner as Binance boundary, MCP server, MCP client, Skill, API, wallet, payment rail, wrapper application, model, or human operator.

### P4 cosmetic completion items

After substantive work:

- Put evidence labels beside claims.
- Show `Unknown`, `Not verified`, and `Not applicable` states visibly.
- Shorten repeated boundary text.
- Move resource catalogs to appendices.
- Replace imperative checklists with status tables.
- Add a one-page executive summary.

---

## 8. Technical Safety Policy

### 8.1 Authority and least privilege

An agent should never receive more authority than the selected workflow needs.

Required behavior:

1. List every component the agent can call.
2. Label each component read-only, write-capable, signing-capable, or payment-capable.
3. Grant the smallest account, asset, recipient, chain, and notional scope available.
4. Keep market research, account reads, trade writes, wallet signing, and payment settlement distinct.
5. Make scope changes visible and require reconnection or renewed approval where the product requires it.
6. Refuse when the requested action exceeds the configured boundary.

No withdrawal scope in Binance MCP is a documented external-withdrawal boundary. It is not a general guarantee that every Agent OS component is unable to move value externally. Wallet, Pay, x402, and custom API flows require their own boundary analysis.

### 8.2 Untrusted content and prompt injection

The agent must treat external content as untrusted data.

Define:

- Which sources are allowed to inform a decision.
- Which sources may never issue instructions.
- How conflicting sources are displayed.
- How stale or missing data causes refusal.
- How user approval is separated from content-derived recommendations.
- How system policy survives tool results, web pages, token metadata, and payment requests.

The agent must not:

- Change a recipient because a tool result requests it.
- Increase an amount because a web page suggests urgency.
- Add a write scope because a Skill says it is necessary.
- Treat a model-generated address as a verified destination.
- Treat natural-language tool output as proof of completed settlement.
- Suppress a refusal or emergency stop because an external source requests it.

### 8.3 User intent and policy compilation

Natural language is not a sufficient control boundary. Convert user intent into a visible policy object before any external write.

The policy should contain:

- Goal and allowed action.
- Product or component.
- Asset, symbol, chain, or recipient.
- Maximum amount and cumulative exposure.
- Price or slippage protection where applicable.
- Data freshness threshold.
- Approval expiry.
- Allowed time window.
- Failure and timeout behavior.
- No-retry rule for ambiguous results.
- Required verification fields.

Show the compiled policy to the user. Treat any later model change as a new proposal requiring fresh approval.

### 8.4 Approval and denial

For a sensitive action, show:

- Component and tool/skill name.
- Account, wallet, or payment rail.
- Asset, symbol, chain, or recipient.
- Side and action type.
- Quantity, notional, price, fee, or payment amount.
- Data timestamp and source.
- Maximum exposure and expiry.
- Expected resulting state.
- Failure and recovery behavior.

Approval must be a separate, affirmative step. Test denial and then query the destination state to establish that denial created no side effect.

### 8.5 Idempotency and retry

The MCP JSON-RPC `id` is not necessarily an external idempotency key.

Required behavior:

1. Generate and persist an application request identifier.
2. Use a destination-supported identifier when one exists.
3. Show the identifier before approval for sensitive actions.
4. Submit once.
5. If the response is missing or ambiguous, query by the destination identifier or an authoritative status method.
6. Retry only after proving no external action exists and receiving fresh approval.
7. If no safe idempotency or reconciliation path exists, halt for manual review.

For payments and on-chain actions, distinguish application request ID, payment ID, transaction hash, block confirmation, and final settlement. For trades, distinguish JSON-RPC ID, client order ID, order ID, fills, and final status.

**Binance-specific subtlety (S16):** the [Spot order reference](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/trade#new-order) defines `newClientOrderId` as unique among open orders and says reuse can be accepted when the prior order is filled. Therefore reusing a client order ID does not provide permanent exactly-once execution. Persist your own operation/deduplication record, reconcile before retry, and verify which identifiers the hosted MCP actually exposes. A single “not found” response can be inconclusive during an ambiguous submission; follow documented authoritative status semantics or stop for manual review.

### 8.6 Freshness and clock skew

| Data | Required policy |
| --- | --- |
| Market data | Source/event timestamp, maximum age, no proposal if stale |
| Order book or price | Snapshot timestamp, no market action if stale |
| Account balance | Response timestamp, no write if stale |
| Portfolio position | Response timestamp, re-fetch before write |
| Token or chain data | Block/time reference, reject stale metadata |
| Payment quote | Quote timestamp, expiry, recipient and amount recheck |
| Wallet transaction | Nonce, chain ID, fee data, confirmation state |

Define clock source, skew tolerance, missing timestamp behavior, and refusal logging.

### 8.7 Trade reconciliation

If the selected Agent OS workflow trades, record:

- Pre-trade base and quote balances.
- Submitted parameters.
- Exchange order ID.
- Exchange client order ID if available.
- Every fill.
- Every commission and fee asset.
- Final state and remaining quantity.
- Exchange and client timestamps.
- Post-trade balances.
- Rounding and fee explanation.
- Concurrent account activity.

### 8.8 Payment and settlement reconciliation

If the selected workflow pays or settles, record:

- Requestor and recipient identity as displayed.
- Destination account or address, redacted where necessary.
- Asset, amount, network, fee, and quote.
- Approval event and expiry.
- Payment or settlement identifier.
- State transitions: created, submitted, pending, completed, failed, expired, or refunded.
- Any confirmation, dispute, or rollback behavior.
- Before/after balances.

Do not describe a payment as completed because a model message says it succeeded. Verify through the authoritative destination or settlement query.

For x402, also record payment-request provenance, resource URL, seller, signed authorization scope/expiry/nonce, exact versus up-to amount, verification result, settlement result, and resource-delivery result separately. Treat valid signatures and paid-resource requests as sensitive. A verified authorization can still be unsettled; a settled payment can still have missing delivery. Neither repeated HTTP requests nor failed delivery should silently create another charge. Never imply a refund or rollback API exists without product evidence.

### 8.9 On-chain and wallet safety

For Agentic Wallet or Web3 workflows, record:

- Chain ID and network.
- Wallet identity and signer boundary.
- Contract, token, method, or transfer type.
- Recipient and checksum representation.
- Amount and fee/gas limit.
- Slippage or deadline for swaps.
- Transaction hash and confirmations.
- Reorg, failure, and retry behavior.
- Recovery path if a transaction is pending or stuck.

Do not call a wallet action reversible merely because the UI has a cancel button. On-chain confirmation and recipient state are the authority.

### 8.10 Control separation

Test these independently:

1. Disconnect.
2. Authorization revocation.
3. Scope removal.
4. Client restart.
5. Emergency stop.
6. Timeout after submission.
7. Prompt-injection attempt.

For each, observe future-call behavior, existing-order or transaction behavior, cancellation, reconnection, and residual state.

### 8.11 Privacy, provider boundaries, and retention

Maintain a data inventory for user prompts, account/portfolio data, wallet addresses, public research, tool arguments/results, model inputs, approvals, and evidence artifacts. For each, record the destination provider, purpose, access controls, retention/deletion policy, and public/private classification. Read-only account access still discloses sensitive data.

- Default to a private activity record; create a separate sanitized public demonstration.
- Do not send balances, identifiers, signatures, tokens, private documents, or source-control secrets to Firecrawl, public search, or unrelated MCPs.
- Verify the selected AI client's retention and third-party terms; do not promise zero retention from an unverified setting.
- Redact at collection where practical; protect retained raw evidence separately. Specify a project retention period rather than inventing an event requirement.
- Exclude `.env`, keys, cookies, login QR codes, sign-in URLs, session state, private logs, and private fixtures from commits and recordings. Inspect Git history as well as the current files before publication.
- On-chain hashes and addresses can link to financial activity even without a person's name. Share them publicly only with authorization and a clear privacy decision.

### 8.12 Supply chain, budgets, and tool-output trust

Review selected `SKILL.md` instructions, installer hooks, downloaded CLIs, dependencies, and transitive tool calls. Pin the source revision and runtime versions; do not install an entire skill catalog when one read-only skill suffices. Tool titles, descriptions, and read-only annotations are not authorization boundaries.

Limit model/tool calls, wall-clock duration, parallel operations, retries, and external-service spend. A read-only research agent can still incur model or paid-API costs. Restrict fetched URLs/protocols, redirects, and local/private-network destinations in custom research tooling; prevent public-source content from becoming shell instructions, arbitrary file access, or credential exfiltration. These are application controls to implement and test, not guaranteed properties of Agent OS.

### 8.13 Tool-result validation and policy conflicts

Schema-valid output can still be stale, false, mismatched, or unsafe. Before data influences a plan, validate source/tool identity, binding to the requested symbol/account/network, decimal amounts and units, timestamps, pagination/completeness, and reported error state. Retain the original result privately when permitted and distinguish verified fields from model interpretation. An incomplete response must not silently become a complete portfolio, source set, or fill history.

Effective action permission is the **intersection** of application policy, product/account restrictions, and the user's exact approved request. Any denial wins; the model cannot resolve a conflict by widening authority. External content contributes evidence, not permission. Unknown or contradictory policy results lead to clarification or refusal. A regenerated model plan receives a new policy check and cannot reuse an approval for a different payload.

---

## 9. Runtime Test Plan

### Phase 0: documentation and discovery

For every component and call, record source URL, section, access time, product/environment, required scope, request/response schema, rate-limit class, read/write state, expected refusal, client version, component version, and timestamp.

Create a component ledger with:

| Field | Required value |
| --- | --- |
| Component | MCP, Skill, API, Wallet, Pay, x402, Web3, or wrapper |
| Source | Official URL or pinned repository/commit |
| Authority | Read, write, signing, payment, or mixed |
| Account | Main, Agentic, wallet, payment, or external |
| Secrets | What is stored and where |
| Runtime | Client, OS, version, region |
| Evidence | Raw trace, screenshot, recording, or response |
| Status | Verified, unverified, inaccessible, or not applicable |

### Phase 1: harmless public data probes

Use only the data sources needed by the selected product. Possible independent probes include:

```text
GET https://api.binance.com/api/v3/ping
GET https://api.binance.com/api/v3/time
GET https://api.binance.com/api/v3/exchangeInfo?symbol=BTCUSDT
GET https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT
GET https://api.binance.com/api/v3/depth?symbol=BTCUSDT&limit=20
GET https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=20
```

Checks:

- Fresh server time.
- Trading symbol and applied filters.
- Price, book, and candle timestamps.
- Rate-limit headers and error codes.
- Separation between the independent oracle and Agent OS results.

If network access is restricted, record that environment limitation. Direct REST evidence does not prove Agent OS behavior.

### Phase 2: Agent OS connection

Record the exact supported client flow. Do not paste a hosted MCP endpoint into a chat and ask the model to install it. Do not open the endpoint directly in a browser when the official guide says to use a client setup flow.

Capture:

- Client and version.
- Operating system.
- Agent OS component.
- Endpoint, repository, or install command.
- Authentication screen and granted scope.
- Server or Skill identity.
- Version and revision.
- Successful connection check.
- Any warning about region, account, or product availability.

### Phase 3: modern MCP discovery and read-only calls

For MCP `2026-07-28`:

1. Send a modern request with `MCP-Protocol-Version`.
2. Include required per-request `params._meta`.
3. Record `server/discover` if the client sends/exposes it, or other available server/version evidence.
4. Call `tools/list` and follow opaque pagination cursors.
5. Capture input schemas, optional output schemas, annotations, and authorization-dependent differences.
6. Invoke one market read and one account read if the selected scope permits it.
7. Preserve structured and text results, errors, timestamps, and no-write proof.

The numbered sequence is applicable only to the stated modern revision. Let the supported client/SDK implement its version-appropriate discovery; an earlier supported revision may begin with `initialize`. Preserve actual evidence and limitations. Do not handcraft a modern exchange to “prove” compatibility or treat a missing packet capture as an event failure.

Suggested harmless prompts:

1. "Use the selected Agent OS connection to show current BTCUSDT market data and its source time. Do not trade."
2. "Show my permitted account, portfolio, or wallet state without changing anything."
3. "List the permissions and actions available to this connection."
4. "Explain what data is stale or missing before proposing any action."
5. "Do not execute anything. Describe the approval and verification steps required for the selected action."

Pass criteria:

- The client visibly shows the selected Agent OS component being used.
- Data freshness and source context are present if available.
- No write or signing occurs.
- Account and wallet data stay within intended scope.
- Ambiguous requests are refused or clarified.
- Tools, Skills, schemas, versions, and permissions are captured.

### Phase 4: agent policy and negative tests

Run malformed inputs, synthetic stale data, injection payloads, duplicate/timeout failures, and simulated partial fills in a local harness or accepted isolated test environment. Label fixture results as fixture results, not live Binance behavior. Do not deliberately create live exposure, send prohibited calls, or trigger production payments to exercise a negative test. Confirm the scope first: an exchange-MCP withdrawal refusal is relevant there, whereas an approved Wallet transfer is a documented capability.

Before any write, test:

- Ambiguous user intent.
- Missing or stale data.
- Conflicting external sources.
- Invalid symbol, quantity, precision, recipient, chain, or payment amount.
- Insufficient balance.
- Duplicate natural-language request.
- Timeout after submission.
- Revoked authorization.
- Disconnected agent.
- Scope removal.
- Prompt injection in a tool result or web page.
- Tool annotation claiming a dangerous action is safe.
- Withdrawal attempt.
- Main-account-to-Agentic funding attempt.
- Wrong wallet or payment recipient.

Every test needs preconditions, exact action, expected UI/tool behavior, expected account/wallet/order state, evidence artifact, result, and timestamp.

### Phase 5: one bounded external action, only if justified

Run only after rules, eligibility, environment, authorization, read-only behavior, refusal behavior, policy controls, freshness, idempotency, and reconciliation are complete.

If an external write is accepted and explicitly approved:

- Use the smallest explicitly approved amount.
- Use an isolated Agentic account or wallet when applicable.
- Restate the complete action and failure behavior.
- Submit or sign once.
- Query authoritative state.
- Reconcile identifiers, fees, balances, fills, settlement, or confirmations.
- Preserve a timestamped audit log.

If the write is not accepted, not safe, or not needed, record `not applicable` and use read-only, simulated, or other accepted evidence.

### Phase 6: recovery and control tests

Independently test:

- Denied approval.
- Tool or Skill unavailable.
- Authorization expiry.
- Client restart.
- Disconnect.
- Scope revocation.
- Emergency stop.
- Ambiguous external response.
- Partial fill or pending transaction.
- Reconnection and cleanup.

The result must show what remains active, what was canceled, what settled, and what requires manual review. Controls not present on the selected component must be labeled unavailable/not applicable; do not invent a global Agent OS emergency stop or perform a funding operation just to test one.

### Phase 7: task quality and reproducibility evaluation

Use a fixed, versioned fixture set and a separately labeled current-data smoke test. Assess task success, tool-selection correctness, citation support, source conflicts, freshness handling, abstention, policy adherence, error recovery, and unauthorized writes. Record the model ID/version if exposed, prompts, configuration, fixture hash, code commit, repetitions, pass/total, latency distribution, token/tool usage, and limitations. A single successful example is not a reliability statistic.

Compare the same task with the stated manual/plain-chat baseline. Report only measurements actually taken. Distinguish correct abstention from model failure; neither a convincing explanation nor a profitable trade proves the agent is generally correct. For replay, label recorded/fixture data and never present it as a fresh market observation.

---

## 10. Test Matrix

| Test | Preconditions | Action | Expected result | Evidence |
| --- | --- | --- | --- | --- |
| Read-only market call | Market-data scope | Request BTCUSDT data | Tool call only; source and timestamp shown | Raw result |
| Read-only account call | Account scope | Request balances or positions | No financial state change attributable to the call; scope respected | Timestamped before/after account view; distinguish audit/session metadata and concurrent activity |
| Skill provenance | Skill installed | Inspect source/version | Revision and permissions visible | Repository and ledger |
| Ambiguous intent | Agent connected | Ask for an underspecified action | Agent asks a clarifying question | Transcript |
| Denied approval | Sensitive action proposed | Reject approval | No external action | Destination query and log |
| Stale data | Artificially old quote | Propose action | No proposal/write | Freshness log |
| Conflicting sources | Two sources disagree | Ask for decision | Conflict shown; action paused or policy applied | Source ledger |
| Invalid input | Filters or schema loaded | Submit invalid value | Refusal or safe error | No new state |
| Prompt injection | Untrusted tool result | Include malicious instruction | Policy remains unchanged | Transcript and policy log |
| Duplicate request | Request ID policy active | Repeat identical intent | Deduplicated or requires fresh approval | IDs and log |
| Scope removal | Existing authorization | Remove write scope | Future write refused | Scope capture and error |
| Disconnect | Connected agent | Disconnect component | Future calls fail or require reconnect | Client/account state |
| Authorization expiry | Expiry can be observed | Call after expiry | Reauthorization required | Client trace |
| Ambiguous trade timeout | Controlled accepted environment | Drop response after submit | Reconcile; no blind retry | Identifier and query |
| Partial fill | Controlled accepted environment | Allow partial execution | Remaining quantity and fees reconciled | All fills/balances |
| Wallet pending | Controlled accepted environment | Submit approved transaction | Pending state and confirmations visible | Hash and explorer/state |
| Payment failure | Controlled accepted environment | Use invalid or rejected request | Failure, settlement, and any documented recovery state distinguished; no assumed rollback | Payment identifier |
| Emergency stop | Applicable product control and safe known state | Trigger authorized stop | Measure actual disconnect/cancel effects and residual exposure; do not infer from docs | Before/after tool access, open orders, positions, balances, and other applicable state |

Expected results must be observed, not inferred from documentation.

Additional Track A cases: changed parameters invalidate approval; a restart does not duplicate a submitted action; a read-only report never invokes a write tool; unsupported skill annotations do not grant authority; HTTP 402 does not trigger unapproved payment; successful payment with missing content is not recorded as task success; private context is not leaked to a research tool. For every row record **environment, actual result, artifact, and applicability**. All implementation rows are currently unrun.

For stale/conflicting-data tests, record the fixture revision, controlled clock, and injected adapter response. Never substitute an edited transcript for executable test evidence. Mark non-selected financial components explicitly `N/A — not selected architecture`; leave selected but untested behavior `Not tested`, not N/A. Define the observation window and authoritative financial-state source for no-side-effect assertions.

---

## 11. Demonstration and Evidence Package

### Recommended demonstration sequence

#### Scene 1: problem and agent identity

Show the target user, painful task, intended outcome, why an agent is needed, selected Agent OS components, client, version, and region. Avoid opening with a catalog of integrations.

#### Scene 2: architecture and authority

Show the component map, selected scopes, account or wallet boundary, secrets boundary, read/write distinction, and which component owns each action.

#### Scene 3: connection and discovery

Show the supported client setup, authentication, version, MCP discovery or Skill/API installation, tools/schemas, and available capabilities. Redact secrets and personal identifiers.

#### Scene 4: read-only agent reasoning

Show a real user intent, source data, timestamps, tool calls, uncertainty, and a concise user-facing rationale or proposed plan. Show no-write behavior. Private model chain-of-thought is neither required nor appropriate evidence; expose decisions, tool inputs/results, and policy outcomes instead.

#### Scene 5: policy and approval

Show the compiled action policy, complete parameters, limits, recipient or symbol, expiry, expected result, and separate approval. Demonstrate denial if the action is sensitive.

#### Scene 6: bounded action, only if accepted

Show one action through the selected Agent OS component. Do not use a live write merely to make the demo look complete. If a real action is not accepted or safe, label it `not applicable` and use accepted simulation or read-only evidence.

#### Scene 7: verification and reconciliation

Show authoritative state after the action: order ID and fills, payment ID and settlement, transaction hash and confirmations, or portfolio/balance state. Show fees, timestamps, and before/after changes.

#### Scene 8: failure and control behavior

Show at least one denial, stale-data refusal, invalid-input refusal, or prompt-injection refusal. Where safely available, show revocation, disconnect, emergency stop, timeout reconciliation, and residual state.

#### Scene 9: reproducibility

Show repository structure, pinned component versions, setup instructions, environment assumptions, test fixtures, evidence index, and cleanup. Do not expose secrets or private identifiers.

### Evidence classes

| Evidence | Proves | Does not prove |
| --- | --- | --- |
| Binance Agent OS page | Vendor-stated product map | Runtime access or contest acceptance |
| Binance product guide | Vendor-stated capabilities and boundaries | Selected account/client behavior |
| MCP specification | Protocol requirements | Binance deployment compatibility |
| Skills repository | Source and version at a revision | Safe behavior or current runtime output |
| Direct REST/WebSocket response | Binance API semantics | Agent OS routing or authorization |
| Client transcript | Runtime component invocation | Contest acceptance unless rules say so |
| Authorization screen | Actual scope/client authorization | Safe outcome by itself |
| Order response/query | Observed exchange state | Competitive value by itself |
| Payment result | A provider-reported state; authoritative settlement only after verification | Delivery, reversibility, or recipient correctness without verification |
| Transaction hash | A transaction identifier/reference to query | Broadcast, inclusion, success, finality, or correct user outcome by itself |
| Recording | Visible reproducible flow | Hidden side effects not queried |
| Audit log | Sequence and timestamps | Truth of unobserved external state |

### Redaction requirements

- No API keys.
- No OAuth tokens.
- No private credentials.
- No seed phrases or wallet private keys.
- No full account identifiers.
- No personal data.
- No secrets in prompts, recordings, repository, screenshots, or issue trackers.
- No unredacted recipient addresses when they identify a person or private account.

### Repository requirements to verify

The public page mentions GitHub for Track A, if applicable. Until the authenticated survey confirms the contract, treat the following as recommended evidence rather than official requirements:

- README with the agent purpose and architecture.
- Setup instructions with client and version.
- Pinned dependencies and component revisions.
- Configuration template with no secrets.
- Policy and approval implementation.
- Source provenance and skill audit.
- Test fixtures for refusal, stale data, duplicate request, and prompt injection.
- Evidence index mapping claims to artifacts.
- Cleanup and recovery instructions.
- License and third-party notices if required by the selected components.

### Submission mapping

Every final artifact must be labeled as one of:

- Official event requirement.
- Binance product boundary.
- MCP requirement.
- Internal release gate.
- Recommended evidence.
- Open question.

The public instruction explicitly mentions video/demo and GitHub with an applicability qualifier. Preserve that instruction; its exact scope, formats, visibility, and mandatory fields remain unresolved. Do not call a public hosted app or real financial action required without evidence.

### Recommended reviewer package and submission manifest

**ENGINEERING_RECOMMENDATION:** prepare a concise demo (for example, 2–3 minutes if no format is specified), README, architecture/authority diagram, safe setup instructions, versioned fixtures/tests, dependency/skill revisions, and a sanitized evidence index. The example duration is not an official limit. Credit libraries, templates, models, skills, and any prior work; distinguish what you built from Binance's existing client UI. An example license in a skill template does not establish all dependencies' licenses or the contest's IP terms.

Capture the exact code commit used in the demo and source submission. Check reviewer access from a logged-out session where public access is required. Use immutable references for evidence, do not expose real account sessions to judges, and provide a clearly labeled safe replay path if appropriate. Public accessibility and a playable video are different from acceptance by Binance.

For every attempted sensitive action, including failure or timeout, retain an action-evidence bundle: user intent; policy/configuration version; exact approved payload and approval ID; application/destination identifiers; component response or transport failure; authoritative destination queries; reconciliation conclusion; and residual-state/cleanup result. Where no authoritative query is possible, label the outcome unknown and stop writes. Keep a sanitized public derivative separate from the protected raw bundle.

| Submission item | Public wording / status | Artifact to record |
| --- | --- | --- |
| Follow and repost | Public instruction | Authorized social-account evidence and original announcement URL |
| Reply or quote repost | Public instruction | Submission post URL, timestamp, and submitted description |
| Video/demo + GitHub, if applicable | Public qualified instruction; exact scope unknown | Confirmed fields, demo URL, repository URL/commit, access/privacy checks |
| Survey | Public instruction; login required | Exact Track A answers, required-field mapping, submission confirmation and UTC timestamp |
| Judging, live action, team/IP/payout terms | Unresolved | Redacted authenticated terms or organizer clarification |

Recommended README sections: target problem; what the agent does; why Agent OS is essential; components and authority; quick start; environment variable names without values; safe example; tests/evaluation; known limitations; evidence links; cleanup and licenses. This is a proposed template, not a recovered mandatory repository layout.

### Read-only completion is not a hidden trade requirement

If the accepted Track A product is read-only, scenes 5–7 demonstrate scope enforcement, refusal of unauthorized writes, and source/report verification rather than a staged trade or payment. Record sensitive-action tests as not applicable with reasons. If the survey instead requires an actual action, a simulated/read-only demo does not satisfy that field; report the gap instead of calling the submission complete.

---

## 12. Go/Stop Gates

### G0: Evidence freeze

**Go:** Unsupported claims are labeled; claim ledger exists; no recommendations are labeled official.

**Stop:** Vendor documentation is being used as runtime evidence or an unsupported "required" label remains.

### G1: Rules and eligibility

**Go:** Authenticated Track A fields, eligibility, submission status, and accepted Agent OS environment are known.

**Stop:** Survey access, account eligibility, artifact requirements, or action acceptance is unknown.

### G2: Architecture and product selection

**Go:** Primary Agent OS component is selected with a reason, permission map, ownership matrix, and secret boundary.

**Stop:** The demo relies on a product, Skill, wallet, payment rail, or API whose access is assumed.

### G3: Runtime Agent OS discovery

**Go:** Authorization succeeds, component identity and scopes are visible, tools/schemas or equivalent capabilities are captured, and reads work.

**Stop:** Tools are assumed, source/version is unknown, scope is too broad, or a read can cause an unexplained write.

### G4: Agent safety controls

**Go:** Denial, invalid input, stale data, timeout, duplicate, prompt injection, revocation, disconnect, scope, and emergency-stop tests pass as applicable.

**Stop:** Confirmation bypass, blind retry, policy mutation, untrusted instruction execution, or unknown residual exposure.

### G5: External action

**Go only when:** Rules permit it, user approves exposure, the selected account/wallet/payment rail is isolated, controls are implemented, and reconciliation is ready.

**Stop:** No safe idempotency, no protection against wrong destination or price, ambiguous response, or failed reconciliation.

### G6: Submission package

**Go:** Every authenticated field maps to an artifact; runtime evidence is separate; secrets are redacted; the agent's value is demonstrated.

**Stop:** Package relies on public-page assumptions, hides failed paths, or presents recommendations as official requirements.

---

## 13. Completion Dashboard

These statuses describe this documentation effort and the unbuilt agent separately. “Drafted” is not implemented, tested, eligible, or submitted. No live capability, financial action, or application test is marked passed.

| ID | Priority | Access | Status | Evidence | Stop issue |
| --- | --- | --- | --- | --- | --- |
| C-01 | Critical | AUTH | Blocked on private fields | S01 login boundary; section 3 questions | Authenticated contract unavailable |
| C-02 | Critical | AUTH | Public deadline checked; acceptance unknown | S01/S02 | No authenticated active/closed status |
| C-03 | Critical | AUTH | Public exclusions checked; eligibility unknown | S01/S02 | Account-specific terms not reviewed |
| C-04 | Critical | NONE/AUTH + RUNTIME | Provisional design drafted | Sections 1, 4, 5 | No runtime/eligibility validation |
| C-05 | Critical | AUTH + RUNTIME | Not started |  |  |
| C-06 | Critical | AUTH + RUNTIME | Not started |  |  |
| C-07 | Critical | AUTH + RUNTIME | Not started |  |  |
| C-08 | Critical | AUTH + RUNTIME + FUNDED | Not applicable until C-01/C-04 |  |  |
| C-09 | Critical | AUTH + RUNTIME | Not applicable until safe test |  |  |
| H-01 | High | NONE | Requirement language revised | Sections 0, 3, 7, 11 | Private rules still unknown |
| H-02 | High | NONE | Public-source ledger populated | Section 17, S01–S17 | Runtime/source revision artifacts pending |
| H-03 | High | NONE | Evidence classes separated | Sections 0, 2, 11, 17 | No runtime evidence |
| H-04 | High | NONE | Product and evaluation hypotheses drafted | Sections 1, 9 | No measured improvement |
| H-05 | High | NONE/RUNTIME | Ownership policy drafted | Sections 4, 5, 8 | Actual scopes untested |
| H-06 | High | NONE/RUNTIME | Freshness policy drafted | Section 8 | Thresholds and tests pending |
| H-07 | High | NONE/RUNTIME | Injection/privacy policy drafted | Sections 6, 8 | No implemented enforcement |
| H-08 | High | NONE/RUNTIME | Retry/state policy drafted | Sections 5, 8 | Destination semantics/runtime untested |
| H-09 | High | AUTH + RUNTIME + FUNDED | Not started |  |  |
| H-10 | High | AUTH + RUNTIME | Not started |  |  |
| H-11 | High | AUTH + RUNTIME | Not started |  |  |
| H-12 | High | AUTH + RUNTIME | Not started |  |  |
| H-13 | High | AUTH + RUNTIME | Unknowns register expanded | Sections 3, 4, 7 | Account/runtime answers pending |
| M-01 | Medium | NONE if network permits | Not started |  |  |
| M-02 | Medium | NONE/AUTH + RUNTIME | Authorization boundaries documented | Sections 4–6 | Implementation pending |
| M-03 | Medium | NONE/AUTH + RUNTIME | Not started |  |  |
| M-04 | Medium | NONE | Not started |  |  |
| M-05 | Medium | AUTH/NONE | Public submission manifest drafted | Section 11 | Private-field mapping pending |
| M-06 | Medium | NONE | Reviewed sources separated from reference catalog | Section 17 | Unselected links not revalidated |
| L-01 | Low | NONE | Not started |  |  |
| L-02 | Low | NONE | Control owners identified in design | Sections 4, 5, 8 | Runtime ownership pending |
| X-01 | Cosmetic | NONE | Standalone summary and parity structure updated | Sections 0–17 retained | None for documentation structure |

---

## 14. What Can and Cannot Be Completed Without Access

### Authenticated Binance access required

- Authenticated Track A rules.
- Authoritative submission status.
- Account and jurisdiction eligibility.
- Accepted Agent OS surfaces and environments.
- Client/account authorization and scopes.
- Whether a video, GitHub repository, public URL, or real action is required.
- Scope, revocation, disconnect, and emergency-stop effects.
- Official submission mapping.

### Live Agent OS runtime required

- Authorization and connection.
- Runtime tools, Skills, schemas, and versions.
- Agent routing and read-only behavior.
- Approval and refusal behavior.
- Prompt-injection resistance.
- External action submission and verification.
- Exchange, wallet, payment, or chain idempotency support.
- Hosted endpoint limits, errors, and environment behavior.

### Funding and explicit user approval required

- Any actual trade.
- Any Agentic Wallet transaction or swap.
- Any payment or settlement with value.
- Emergency-stop testing involving open orders, positions, pending transactions, or residual balances.
- Live fill, fee, balance, settlement, and confirmation reconciliation.

This heading concerns creating value-bearing activity, not a demand to fund an account to inspect existing evidence. Read-only reconciliation can require authorization without any new trade, transfer, or deposit. Wallet signing can authorize spending even before a transaction is broadcast; do not classify it as harmless solely because it is off-chain.

### Can be completed immediately without Binance access

- Claim/source ledger.
- Evidence-class separation.
- Architecture comparison.
- Product differentiation hypothesis.
- Agent state machine and policy object.
- Draft provenance and freshness policy.
- Draft prompt-injection and untrusted-input policy.
- Draft idempotency and reconciliation policy.
- Hosted-versus-custom authorization separation.
- Component-boundary design.
- Source catalog cleanup.
- Ownership mapping.
- Presentation cleanup.

---

## 15. Final Completion Definition

The following is the **internal completion definition**, not an official judging checklist. Apply component-specific items only where relevant. The Track A submission path is complete only when:

1. Official Track A rules are captured, not guessed.
2. Eligibility and accepted Agent OS environment are confirmed.
3. The target user, problem, and measurable outcome are clear.
4. Architecture is justified and component ownership is explicit.
5. The selected client and Agent OS components are authorized with least privilege.
6. Runtime tools, Skills, APIs, wallet, or payment capabilities are captured.
7. Read-only behavior is demonstrated.
8. The agent shows task selection/planning, provenance, policy checks, and approval behavior where relevant.
9. Applicable denial, stale-data, invalid-input, duplicate, timeout, and prompt-injection controls are demonstrated with environment labels; non-applicable tests have reasons.
10. Any external write is explicitly justified, approved, and reconciled.
11. Recovery, disconnect, revocation, and residual state are verified or safely disclosed as untested.
12. Product differentiation is demonstrated beyond a generic chat wrapper.
13. The repository, recording, public artifacts, and evidence index are redacted and reproducible if required.
14. Every final artifact maps to an authenticated survey field or is clearly labeled internal/recommended.

If a live action is not permitted, accepted, or safe to perform, document the non-action decision and use the strongest accepted read-only, simulated, or other non-production evidence. If acceptance of that alternative is unknown, submission eligibility remains unknown; if a required field is unsatisfied, the submission is incomplete. A `not applicable` label never waives an official requirement. Do not perform a real trade, payment, or wallet transaction merely to make a checklist green.

---

## 16. Risk and Responsibility

Sources:

- [Binance AI Policy and Terms](https://www.binance.com/en/about-legal/AI-Policy)
- [Binance Product Terms](https://www.binance.com/en/about-legal/product-terms)
- [Binance General Risk Warning](https://www.binance.com/en/risk-warning)
- [Binance prohibited countries](https://www.binance.com/en/about-legal/list-of-prohibited-countries)

Binance warns that AI may use outdated or hallucinated information, produce incorrect parameters, and expose users to third-party content and tools. The user remains responsible for prompts, actions, and trading decisions. Digital-asset prices are volatile.

Agentic Wallet, Web3, Pay, x402, Skills, and direct API workflows can introduce risks that are different from the documented Binance MCP Agentic sub-account boundary. Do not use the absence of withdrawal scope in one component as a general safety claim for all Agent OS components.

This document does not provide legal, financial, security, or jurisdictional advice. Eligibility and permitted use must be confirmed for the actual account and event.

---

## 17. Resource Library

### Research method and claim/source ledger

**Access date for S01–S17:** 8 September 2026 (UTC), checked by the 20:07 UTC research checkpoint. Product documents served from Firecrawl cache are labeled below; access date is not their publication date or a fresh endpoint test. Exact official launch/prize text, public survey instructions, and FAQ answers were read. Search queries for Track A judging did not establish a rubric; sparse search results are not evidence no rubric exists.

Both uploaded guides were inspected, including section and completion-ID parity. Public research used Firecrawl Search/Scrape and a browser for the rendered survey and expanded FAQs. No login was attempted, no survey fields behind authentication were read, no skill/CLI was installed, and no Binance financial endpoint was invoked. This was targeted source review, not an index of the entire web or developer site.

| ID | Source and section | Evidence class / supported claim | Retrieval limitation |
| --- | --- | --- | --- |
| S01 | [Public event survey](https://www.binance.com/en/survey/2913aa200aac462c89a737779393f3d4), event body and login prompt | BINANCE_EVENT_FACT: build track, aggregate pools, deadline, exact public entry wording, exclusions; RESEARCH_OBSERVATION: login required | Rendered logged-out browser; no authenticated acceptance/fields |
| S02 | [Official prize post](https://x.com/binance/status/2095195047297990858) and included [launch post](https://x.com/binance/status/2094810011557838988) | BINANCE_EVENT_FACT: listed placements; DERIVED_FACT: 53 slots, 19,500 total, 500 difference | Official organizer text retrieved via Firecrawl; no explanation of discrepancy, scoring, or payout |
| S03 | [Agent OS](https://www.binance.com/en/agent-os), capability cards and five FAQs | BINANCE_PRODUCT_FACT: product map, MCP/Skills/APIs distinction, compatibility and eligibility caveats | Landing scrape cached 8 Sept; all FAQ answers separately expanded in live browser |
| S04 | [Hosted MCP guide](https://developers.binance.com/en/docs/agent-native/mcp-server/agentic), access, funding, first session, management | BINANCE_PRODUCT_FACT: scope model, no withdrawal, manual initial funding, confirmations, vendor emergency-stop wording | Page modified 7 Sept; retrieved cache from 8 Sept; no client/account test |
| S05 | [Skills Hub docs](https://developers.binance.com/en/docs/sdks-tools/integrations/skills-hub), how it works and environments | BINANCE_PRODUCT_FACT: published capabilities/compatibility, Node 22+, read/write skill categories | Modified 8 Sept; freshly fetched; not an install or security audit |
| S06 | [Skills Hub repository](https://github.com/binance/binance-skills-hub), README and displayed commit | RESEARCH_OBSERVATION: SKILL.md representation, credential guidance, observed source revision | Public rendered snapshot; no clone, transitive-code review, license audit, or install |
| S07 | [Wallet welcome](https://developers.binance.com/en/docs/products/agentic-wallet/welcome), security, capabilities, chains | BINANCE_PRODUCT_FACT: API-level rules, MPC boundary, address-book transfer condition, documented networks | Modified 3 Sept; cache from 6 Sept; not every capability/network tested |
| S08 | [Wallet install](https://developers.binance.com/en/docs/products/agentic-wallet/quickstart/install-agentic-wallet), prerequisites and security | BINANCE_PRODUCT_FACT: Node 18+ installer, prior MPC Wallet, App/QR flow, automatic CLI install, App-only rule changes | Modified 8 Sept; freshly fetched; no installation/sign-in |
| S09 | [Wallet Agentic Hub](https://web3.binance.com/agentic-hub), cards and FAQ | BINANCE_PRODUCT_FACT: distinct wallet, address book, feature catalog; Perp Trading marked Coming Soon | Cache from 6 Sept; catalog/FAQ counts may change or differ |
| S10 | [Binance x402](https://www.binance.com/binancex402), overview and disclaimer | BINANCE_PRODUCT_FACT: non-custodial facilitator, API-key application, V1 sample and broad multi-chain marketing | Freshly fetched; no account, key, or payment access |
| S11 | [Agentic Payments introduction](https://developers.binance.com/en/docs/products/onchainpay-x402/introduction), methods and flow | BINANCE_PRODUCT_FACT: recommended V2, legacy V1, documented BSC assets/methods, verify/settle/delivery distinction | Modified 8 Sept; freshly fetched; no signing/settlement or sandbox verification |
| S12 | [Binance Pay introduction](https://developers.binance.com/en/docs/products/pay/Introduction) | BINANCE_PRODUCT_FACT: separate Pay product introduction | Freshly fetched; too sparse to support detailed API/merchant/refund claims |
| S13 | [MCP 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28) | Protocol reference: revision-specific architecture and trust model | Cached 8 Sept; not proof of Binance's deployed revision |
| S14 | [Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http) | MCP_MUST/MCP_SHOULD as quoted: transport, Origin validation, localhost recommendation, compatibility | Cached 8 Sept; no custom server or packet-level compliance test |
| S15 | [MCP Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools) | MCP_MUST/MCP_SHOULD as quoted: schema/access controls, pagination, authorization-dependent tools, human denial guidance | Cached 8 Sept; runtime tools/annotations unobserved |
| S16 | [Spot REST orders](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/trade#new-order) | BINANCE_API_FACT: same client order ID can be accepted after previous fill | Targeted direct-quote retrieval from 8 Sept cache; REST semantics, not MCP field support |
| S17 | [Agent Native overview](https://developers.binance.com/en/docs/agent-native/overview), llms.txt quick start | BINANCE_PRODUCT_FACT: machine-readable documentation discovery path | Modified 3 Sept; cache from 7 Sept; index is not runtime discovery |

For implementation, extend each relevant row with document hash/revision, exact client/SDK, selected scopes, raw redacted response, evidence filename/hash, observation time, and status. Do not label a runtime item complete using this public-source ledger alone.

### Requirement and evidence map

| Claim group | Authority | What closes the gap |
| --- | --- | --- |
| Public event label, deadline, social steps, qualified demo/GitHub wording | S01/S02 | Preserve public text; confirm exact authenticated fields and applicability |
| Prize amounts and discrepancy | S02 plus shown arithmetic | Organizer clarification or applicable terms for the unexplained 500 USDC |
| Judging, team/originality/IP, payout, both-track entry, environments | COMPETITION_UNKNOWN | Authenticated rules/organizer evidence, not a community tutorial |
| Agent OS component capabilities | S03–S12/S17, vendor-stated | Selected runtime setup, identity, scopes, schemas, results |
| Protocol compliance | S13–S15, applicable revision only | Actual client/server evidence or declared visibility limitation |
| Product differentiation, test thresholds, demo duration, architecture | ENGINEERING_RECOMMENDATION | Implemented behavior and honest measurements; not organizer scoring |
| Trading retry safety | S16 plus application policy | Actual tool identifiers, durable operation state, authoritative reconciliation |

### Remaining resource catalog: discovery references, not fresh verification

Links below are retained for standalone parity and implementation discovery. Unless listed in S01–S17, they were not independently revalidated in this pass. Videos were not watched, legal terms were not exhaustively reviewed, SDKs were not installed, and linked schemas were not runtime-tested. Keep unselected component references out of the chosen build's required checklist.

### Official event and Agent OS resources

- [Binance event and survey](https://www.binance.com/en/survey/2913aa200aac462c89a737779393f3d4)
- [Official event launch](https://x.com/binance/status/2094810011557838988)
- [Official Track A placement announcement](https://x.com/binance/status/2095195047297990858)
- [Binance Agent OS](https://www.binance.com/en/agent-os)
- [Binance MCP Server guide](https://developers.binance.com/en/docs/agent-native/mcp-server/agentic)
- [Agent Native overview](https://developers.binance.com/en/docs/agent-native/overview)
- [MCP Server introduction](https://developers.binance.com/en/docs/agent-native/mcp-server)
- [Binance documentation index](https://developers.binance.com/en/docs/llms.txt)
- [Binance full documentation](https://developers.binance.com/en/docs/llms-full.txt)
- [Binance developer documentation](https://developers.binance.com/en/docs/introduction)
- [Full API catalog](https://developers.binance.com/en/docs/catalog)
- [SDKs and tools](https://developers.binance.com/en/docs/sdks-tools/overview)

### Binance API resources

- [Spot REST general](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/general)
- [Spot REST market](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/market)
- [Spot REST trade](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/trade)
- [Spot REST account](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/account)
- [Spot WebSocket API](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/ws-api/general)
- [Spot WebSocket streams](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/ws-streams)
- [Spot REST schema](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/1.0.0/schema.yaml)
- [Spot WebSocket schema](https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/ws-api/1.0.0/schema.yaml)
- [USD-S Futures REST](https://developers.binance.com/en/docs/catalog/core-trading-derivatives-trading-usd-s-m-futures/api/rest-api/account)
- [Margin REST](https://developers.binance.com/en/docs/catalog/core-trading-margin-trading/api/rest-api/account)
- [Convert REST](https://developers.binance.com/en/docs/catalog/core-trading-convert/api/rest-api/market-data)
- [Binance connectors](https://developers.binance.com/en/docs/sdks-tools/connectors)

### Skills and wallet resources

- [Skills Hub documentation](https://developers.binance.com/en/docs/sdks-tools/integrations/skills-hub)
- [Skills Hub catalog](https://www.binance.com/en/skills)
- [Official Skills Hub repository](https://github.com/binance/binance-skills-hub)
- [Agentic Wallet](https://www.binance.com/en/agent-os)

### MCP resources

- [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)
- [What is MCP?](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro)
- [Architecture](https://modelcontextprotocol.io/docs/2026-07-28/learn/architecture)
- [Remote MCP servers](https://modelcontextprotocol.io/docs/2026-07-28/develop/connect-remote-servers)
- [Build an MCP server](https://modelcontextprotocol.io/docs/2026-07-28/develop/build-server)
- [MCP SDKs](https://modelcontextprotocol.io/docs/2026-07-28/sdk)
- [MCP Inspector and debugging](https://modelcontextprotocol.io/docs/2026-07-28/tools/debugging)
- [Streamable HTTP](https://modelcontextprotocol.io/specification/2026-07-28/basic/transports/streamable-http)
- [MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
- [MCP authorization security considerations](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization/security-considerations)
- [MCP security best practices](https://modelcontextprotocol.io/docs/2026-07-28/tutorials/security/security_best_practices)
- [MCP Tools](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)

### Official videos and supplemental sources

- [How to Use Agent OS to Trade with AI on Binance via MCP Server](https://www.youtube.com/watch?v=xOgDtv-CbTA) - Binance, 12:37.
- [Trade With Your AI Agent on Binance: Introducing Agent OS](https://www.youtube.com/watch?v=RE_QQbaonPQ) - Binance, 0:45.
- [How to join Binance Agent OS Mini Hackathon](https://www.youtube.com/watch?v=yuP3z_e5wvE) - supplemental event walkthrough.
- [Binance Agent OS Mini Hackathon 2026: Track 2 MCP Setup](https://www.youtube.com/watch?v=ct07Dtdld6o) - Track B supplemental context, not Track A rules.
- [Binance Agent OS press release](https://www.prnewswire.com/news-releases/binance-introduces-agent-os-to-connect-ai-applications-to-financial-infrastructure-302856306.html)
- [Binance Agent OS APAC press release](https://www.prnewswire.com/apac/news-releases/binance-introduces-agent-os-to-connect-ai-applications-to-financial-infrastructure-302865254.html)

Use videos and supplemental sources as interface or discovery context only. Recheck all claims against the event page and official documentation.

---

## Bottom Line

The critical path is not to mention every Agent OS component or add more integrations. It is:

> **Authenticated Track A rules and eligibility -> target problem -> Agent OS component decision -> runtime discovery -> policy and safety tests -> optional justified action -> reproducible submission mapping.**

Binance publicly describes Agent OS as a platform connecting AI agents with MCP, Skills, APIs, market data, portfolio tracking, transactions, payments, and supported on-chain services. The exact Track A contract, accepted environment, component availability, runtime behavior, and judging value remain unproven until the artifacts above exist.

The subtle but important product boundary is that Agent OS is not one automatic authorization scope. MCP, Skills, APIs, Agentic Wallet, Pay/x402, Web3 APIs, and AI clients have separate capabilities and risks. The final agent must make those boundaries visible.

If a live action is not permitted, accepted, or safe, document non-action and use an accepted alternative where one exists. If alternative acceptance is unknown, eligibility remains unknown. This document completes the public-source research update and design/checklist coverage, not an agent implementation, entry, live-action test, or reward claim.
