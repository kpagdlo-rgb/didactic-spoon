# 01 — UI/UX audit of Meder as of commit `85cce3c`

Method: rendered the live dev server (Next 16.3.4, React 19.2.8) at 1920×1080 and 390×844, captured the idle, running, result and error states, read `app/meder.tsx` (886 lines, one component) and `app/globals.css` (649 lines, hand-written, no framework). Scores are 1 (bad) to 5 (excellent). Evidence is the screenshots in `assets/` plus line references.

Screenshots: `assets/audit-idle-1920.png`, `assets/audit-result-1920.png`, `assets/audit-result-mobile.png`.

## Executive summary

| Dimension | Score | One-line verdict |
| --- | --- | --- |
| Layout / use of screen | **2** | Fixed `max-width:1400px` shell on a 1920 screen leaves ~260 px dead on each side; below 1400 the sidebar is a rigid 360 px so the result column is squeezed. Nothing is full-bleed; no viewport-height composition. |
| Typography | **2** | System Arial body + Georgia headings + `ui-monospace`; 15 distinct font-size literals (10–43 px), no scale, no fluid sizing, no self-hosted display face. Reads like a 2012 admin panel. |
| Visual hierarchy / highlight | **2** | Everything is the same weight of grey-green. Primary action ("Diagnose order") and the primary result (verdict title) have almost the same visual mass as helper text. The proposed quantity — the single most important number — is 28 px monospace in a pale box. |
| Cognitive load | **2** | 12 form controls visible on first paint; 9 separate disclaimer sentences on screen at idle; two identical badges ("READ-ONLY BY DESIGN", "SYNTHETIC DEMO") plus a pill plus a mode-copy box all saying the same thing. Users must read ~180 words before the first click. |
| Procedural clarity | **3** | Steps are numbered 01/02/03, which is good, but the numbers are 12 px monospace and the three panels are visible simultaneously, so the "procedure" is not enforced: an empty "03 Proposed correction" card with two disabled buttons sits on screen at idle. |
| Progressive disclosure | **2** | Only two `<details>` (advanced JSON, proposal JSON) and one trace disclosure. Everything else — data-source select with a permanently disabled option, runtime select with a permanently disabled option, private-access panel — is always expanded. Disabled options are shown instead of hidden. |
| State design | **3** | Idle / running / stopped / result / error exist and are correct (a11y attributes are good), but visually they are near-identical cards with a different 10 px chip. No transition between states; result "pops" in. |
| Motion | **1** | One `@keyframes pulse` on a 6 px dot. Nothing else moves. |
| Colour | **3** | Palette is coherent (paper / ink / sage) and accessible, but flat: one surface tint, one line colour, no depth, no dark mode, no accent for the "win" moment. |
| Responsiveness | **3** | Stacks correctly at 740 px; mobile is functional. But the two-column grid breaks awkwardly between 740–1000 px (320 px sidebar + narrow results) and the hero `<p>` has a hard `<br />` that wraps badly. |
| Accessibility | **4** | Genuinely good: skip link, `fieldset`/`legend`, `aria-live`, `role=alert/status`, focus-visible rings, reduced-motion media query. Preserve all of it. |
| Landing / first impression | **1** | There is no landing page. `/` and `/meder` render the same form. No explanation of what the product is, why it is safe, or what happens when you click. |
| **Overall** | **2.2 / 5** | Functionally sound, visually forgettable, cognitively heavy. |

## Detailed findings

### A. Layout and dead space

- `.shell { max-width: 1400px; margin: auto; padding: 0 42px }` (globals.css). On 1920 wide this yields ~260 px of empty paper on each side. On 2560 it is ~580 px. **The user's explicit complaint ("dead space on both sides") is confirmed.**
- `.workspace { grid-template-columns: 360px minmax(0,1fr) }`. The form column never grows; on wide screens the results column becomes a 1000 px-wide sea of 12 px text.
- No section uses `min-height: 100dvh`. The page has no "screen" composition; it is a document that happens to have cards.
- Vertical rhythm is inconsistent: card-head 20/23/16, card-body 20/23, field gap 14, divider 20, `.right` gap 20, hero padding 37/30. Eight different spacing literals with no scale.
- At idle the right column is two mostly-empty cards (~300 px and ~230 px tall) — a wasted 1000×550 area that should either not exist yet or be used to explain the product.

### B. Typography

- Body: `15px/1.6 Arial, Helvetica, sans-serif`. Headings: Georgia. Code: `ui-monospace`. No web font; Georgia renders differently on every OS and looks dated against the sage palette.
- Font-size literals found: 10, 11, 12, 13, 14, 15, 20, 23, 24, 25, 27, 28, 31, 34, 36, 43. No type scale. Nothing is fluid (`clamp()`).
- Letter-spacing is applied inconsistently: `-1.6px` on the wordmark, `-1.3px` on h1, `-0.5px` on verdict title, `0.16em` on eyebrows — mixing px and em.
- Helper text at 10–11 px is below the comfortable reading floor for a financial tool; the footer is 10 px.
- Monospace is used for step numbers, state chips, quantities, trace, JSON — five different semantic roles share one style.

### C. Hierarchy and highlight

- The primary CTA `.primary` is a filled green button, fine, but it sits 900 px below the top of the page on 1080-high screens (below the fold at 100 % zoom). Users see the form, not the action.
- The verdict title `.verdict-title` (27 px Georgia) competes with the hero h1 (43 px Georgia) that is still visible above it. Two "titles" on one screen.
- Proposed quantity: `.quantity { font: 28px ui-monospace }` in `.quantity-box` with `background: var(--pale)`. This is the payoff moment of the whole product and it is rendered at the same size as the hero eyebrow's parent. It should be the largest thing on screen after the run.
- State chip `.state` is 10 px bold monospace; `REPAIR_PROPOSED` in developer casing is exposed to users as the primary status.

### D. Cognitive load (idle state, counted from screenshot)

Disclaimer / safety sentences visible simultaneously before any interaction:
1. Topbar badge "READ-ONLY BY DESIGN"
2. Topnote "A calmer way to understand an order."
3. Hero "…without submitting anything."
4. Safety pill "No account connection. No financial writes."
5. Card badge "SYNTHETIC DEMO"
6. Mode-copy box "Demo data, not exchange evidence. Live reads are disabled…"
7. Help "Price is always protected. Quantity never increases."
8. Help "Caps price × quantity. Not a balance…"
9. Help "No AI model is invoked in deterministic mode."
10. Form footer "A proposal is not an order. Nothing is executed."
11. Private model access paragraph
12. Idle card "…keeps your intent intact."
13. Proposal card "Meder may reduce a BUY quantity… never change your price…"
14. Proposal help "Exports omit identifiers…"
15. Footer ×2

**Sixteen reassurance messages** on one screen. Reassurance repeated this often reads as anxiety, not confidence. Target: one persistent safety strip + contextual help revealed on focus/hover, ≤4 sentences visible at idle.

Form controls visible at idle: Data source, Example scenario, Symbol, Side, Limit price, Quantity, Quantity permission, Quote-notional cap, Diagnostic runtime, Diagnose button, plus Advanced disclosure and Private access section = **12 interactive regions**. Two of the selects ("Data source", "Diagnostic runtime") each have exactly one enabled option in the default deployment — they are decoration presented as choices.

### E. Procedural / progressive disclosure

- Steps 01→02→03 are all rendered at once. Step 03 shows disabled "Copy proposed JSON" / "Export report" buttons before there is anything to copy. Disabled primary-looking buttons at idle teach the user that the UI is broken.
- The "Example scenario" select is the real entry point (it sets 5 fields) but is visually equal to every other field. Should be a prominent scenario picker (cards or segmented control) at the top of the flow.
- "Advanced: redacted JSON input" is correctly hidden. Good pattern; apply the same to Data source, Diagnostic runtime, Private model access (move to a drawer/sheet behind a lock icon).
- No empty-state guidance beyond "Choose an example or adjust the order."

### F. States (from code, `app/meder.tsx` ~L590–760)

| State | Exists | Visual differentiation | Problem |
| --- | --- | --- | --- |
| Idle | yes | `.idle` orb + text | Orb is a 47 px circle with a Georgia glyph; looks like a placeholder icon. |
| Running | yes | `.progress` pulsing dot + "Stop diagnosis" | No skeleton, no progress steps, result card stays blank. |
| Stopped | yes | heading "Stopped. Nothing was submitted." | Same card style as result; not visually distinct. |
| Result (6 verdicts) | yes | `.state` chip colour (green/amber/red) | Verdict copy is good; presentation is a wall of 12 px text. |
| Error | yes | `.error-box` | Fine, but sits inside the same card, easy to miss. |
| Expired / locked / unlocked access | yes | `.badge` text | Access panel is always visible in the form even when unconfigured. |

### G. Responsiveness (390 px screenshot)

- Works. Single column, fields stack. But: hero h1 wraps to 3 lines at 34 px and pushes the form ~600 px down; the user scrolls ~1200 px before "Diagnose order". Result cards then render *below* the form so the user scrolls back and forth.
- Recommended: on mobile, collapse the hero to one line + eyebrow and scroll the result panel into view on completion (`scrollIntoView` after `setRun`).

### H. Accessibility (keep)

Skip link, `<fieldset aria-disabled>`, `<legend class="sr-only">`, `aria-live="polite"` on outputs, `role="alert"` on errors, `role="status"` on messages, `focus-visible` 3 px amber ring, `prefers-reduced-motion`. **All of this must survive the refactor verbatim** — it is also what the Playwright suite queries.

### I. Code structure

- `app/meder.tsx` is one 886-line client component holding state, fetch logic, copy, and all markup. Not a blocker for styling, but every visual change forces a full-file diff. Split into `components/meder/*` during P2.
- No Tailwind, no component library, no `cn()` helper, no `@/` alias in `tsconfig.json`. Rare UI components assume all three (`@/components/ui/*`, `@/lib/utils`, Tailwind classes). **P0 must add them.**
- No `bun.lock`; `package-lock.json` is committed and CI uses `npm ci`. Switching to Bun is a P0 infra change with CI + `.hoplite/settings.json` updates.

## What is good and must be kept

- Copy quality of verdicts ("A smaller quantity fits your limits.", "Your exact quantity stays protected.") — best-in-class; keep every string.
- The "Unchanged: … price 100" protected-fields line — brilliant trust signal; make it bigger.
- The sanitized tool trace — turn it into a visible step timeline (Rare UI Step player) instead of a collapsed `<details>`.
- The a11y scaffolding.
- The strict CSP.

## Severity-ranked fix list (feeds 05-REFACTOR-PLAN)

1. **No landing page** → build `/` as a landing, move the tool to `/app` (keep `/meder` as alias). *(Tests `goto("/")` → update to `/app` in same commit.)*
2. **Dead side space / fixed shell** → fluid full-bleed grid, `clamp()` gutters, `100dvh` hero, results panel that grows.
3. **Sixteen disclaimers** → one safety strip + contextual help; disclaimers collapse into an "About safety" sheet.
4. **Flat typography** → self-hosted variable display + text + mono via `next/font`; 7-step fluid scale.
5. **Payoff moment undersold** → proposed quantity becomes a 96–128 px animated counter with the "unchanged" list beneath.
6. **All three steps visible at idle** → step 03 hidden until a proposal exists; step 02 shows guided empty state; scenario picker promoted.
7. **Two fake selects** → hide single-option selects; show a read-only "Runtime: Deterministic" chip with a tooltip; live-data unavailability becomes a footnote.
8. **No motion** → page-load reveal, state transitions, counter roll, step-player trace, ambient shader in hero only.
9. **Private access panel always visible** → move behind a lock icon in the top bar (sheet/drawer); keep every accessible name.
10. **Mobile scroll distance** → compact hero, scroll-to-result on completion.
