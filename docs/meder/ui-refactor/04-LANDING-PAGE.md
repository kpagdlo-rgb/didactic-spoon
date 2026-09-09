# 04 — Landing page spec (`/`)

The tool moves to `/app`. `/meder` stays as a redirect to `/app`. Route layout:

```
app/
  (landing)/
    layout.tsx        # ScrollProgress + landing nav + footer
    page.tsx          # sections below
  app/
    page.tsx          # <Meder /> (the tool)
  meder/
    page.tsx          # redirect("/app")
```

Every section is full-bleed (`padding-inline: var(--gutter)`), reveals once on scroll (`motion`, `viewport={{ once: true, amount: .3 }}`), and uses only the copy below — do not invent claims. All product claims must be things the app *actually does*; nothing about live Binance, AI agents, or competition outcomes.

## Section 1 — Hero (100dvh)

- Backdrop: `HeroBackdrop` (S1 mesh gradient), masked to the upper 60 %.
- Left (7/12): eyebrow `SYNTHETIC · READ-ONLY · SPOT LIMIT`; h1 display `--text-3xl`:
  > Order clarity.
  > *Without another trade.*
- Sub (65ch): "Understand a rejected order. Explore a bounded quantity correction. Or know when to stop — without submitting anything."
- CTAs: `Button variant="safe" size="lg"` → "Open the diagnostic" (`/app`, `ArrowRight`); `Button variant="ghost"` → "See how it works" (`#how`).
- Right (5/12): `FluidOrb size={320}` over a floating mini-card that shows a *static* pre-rendered result: chip `safe` "A smaller quantity fits your limits.", `0.00123 → 0.001`, "Unchanged: price 100". This card is decoration with real strings from fixture 01.
- Bottom-left: safety strip (`ShieldCheck`): "No account connection · No financial writes · Exact arithmetic".

Acceptance: at 1920×1080 the hero fills the viewport with no scroll; at 390×844 it fits in ≤1.2 screens; no shader pixels behind text with contrast < 4.5:1 (mask handles this).

## Section 2 — Three promises (cards, `grid-cols-1 md:grid-cols-3`)

| Icon | Title | Body |
| --- | --- | --- |
| `ShieldCheck` | Read-only by construction | The app has no API keys, no wallet, no order endpoint. It cannot place, cancel or retry anything. |
| `Beaker` | Synthetic evidence, labelled | Every input is an invented fixture and is labelled as such. Nothing here is proof of an exchange decision. |
| `CircleCheck` | Exact, not approximate | Quantities are checked with integer arithmetic on the real filter grid. No floats, no rounding surprises. |

Acceptance: cards reveal with a 60 ms stagger; hover lifts 1 px.

## Section 3 — How it works (`#how`, 3 steps, horizontal on ≥md)

Use a static `StepPlayer steps={3} showControl={false} value={idx}` bound to the step in view (IntersectionObserver), plus three panes:

1. **Pick a scenario.** "Four synthetic cases: a fixable quantity, a cap that refuses, an unknown execution, an off-grid minimum."
2. **Meder checks the rules.** "LOT_SIZE, PRICE_FILTER, MIN_NOTIONAL, NOTIONAL and your own cap — locally, exactly."
3. **You get a verdict, never an order.** "A proposal you can copy, a report you can export, or a clear reason to stop."

## Section 4 — The payoff (single wide card)

Reuse `QuantityReveal from="0.00123" to="0.001"` (C2), replayed each time it scrolls into view. Caption: "Only the quantity moves. Price, side, symbol and time-in-force are protected." This is the same component the app uses — one source of truth.

## Section 5 — What it will not do (honesty block)

Two-column list, `--color-ink-2`, `TriangleAlert` icon once:
- Will not connect to Binance or any exchange
- Will not read balances, fees or account permissions
- Will not change your price or increase quantity
- Will not retry an order whose outcome is unknown
- Will not claim exchange acceptance or eligibility

Acceptance: this section exists and is not collapsible.

## Section 6 — CTA + footer

- "Try the synthetic diagnostic" → `/app`.
- Footer: attribution line from 03; "Meder · Synthetic diagnostic application. Not exchange acceptance, investment advice, or proof of competition eligibility." (existing footer text — keep verbatim).

## Copy rules

- Never write "AI", "agent", "trade", "profit", "Binance" as a capability. "Binance" may appear only in the not-do list and the footer.
- Sentence case everywhere except chips.
- One exclamation mark budget: zero.

## Lighthouse targets (landing, mobile preset)

Performance ≥ 90, Accessibility 100, Best practices 100, CLS < 0.05. If the mesh shader drags Performance below 90 on mobile, gate it with `matchMedia("(min-width: 768px)")`.
