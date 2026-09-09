# Meder UI refactor — handoff folder

Purpose: move Meder from the current "sloppy admin form" look to a full-screen, award-grade product with a proper landing page, **without breaking the product's safety contract** (read-only, synthetic-only, exact arithmetic, no financial writes) or the existing test suite.

Read in order. Each file is self-contained enough that a fresh agent can act on it.

| File | What it is | When to read |
| --- | --- | --- |
| [01-AUDIT.md](01-AUDIT.md) | Evidence-based audit of the current UI: every state, scored 1–5 across UX, cognitive load, procedural clarity, progressive disclosure, layout, typography, motion, a11y. Screenshots in `assets/`. | First. Understand *what is bad and why* before touching code. |
| [02-DESIGN-SYSTEM.md](02-DESIGN-SYSTEM.md) | Target tokens: full-bleed layout grid, type scale, spacing, colour (light + dark), motion rules, state vocabulary. | Before any styling change. Copy the token block verbatim. |
| [03-COMPONENT-MAP.md](03-COMPONENT-MAP.md) | Exactly which **Components / Shaders / Icons** to add, from which library, the install command, where each goes, and the paste-ready snippet. Includes what NOT to use and why. | When adding a component. |
| [04-LANDING-PAGE.md](04-LANDING-PAGE.md) | Section-by-section landing page spec (`/`), with copy, component per section, and acceptance criteria. | When building the landing. |
| [05-REFACTOR-PLAN.md](05-REFACTOR-PLAN.md) | Phased execution plan (P0→P4), Bun-native commands, per-phase "how to confirm" and "expected result". | The step-by-step to execute. |
| [06-VERIFICATION.md](06-VERIFICATION.md) | The locked test contract (labels, roles, test ids, class names the Playwright suite depends on), the verification command sequence, and the screenshot checklist. | Before every commit. |

## Non-negotiables (carry into every phase)

1. **Safety copy stays, but consolidated.** "Synthetic only / no financial writes / proposal is not an order" must remain visible on the app screen — once, prominently — not eight times.
2. **Never place trades, connect wallets, or call Binance.** UI work does not touch `src/server/*` or `src/domain/*`.
3. **Test contract is frozen** (see 06). Accessible names, `data-testid`s, `role="alert"`/`role="status"`, and the three class locators (`.badge`, `.error-box`, `.trace`) must survive or the test must be updated *in the same commit with a stated reason*.
4. **`prefers-reduced-motion` is honoured** for every shader and animation. Shaders hold a still frame; counters snap.
5. **CSP stays strict.** No third-party scripts, fonts or images. `next/font` self-hosts; shaders are local WebGL; icons are inline SVG. The existing `Content-Security-Policy` in `next.config.ts` needs **no** loosening.
6. **Bun is the package manager and runtime for dev.** `bun install`, `bunx --bun shadcn@latest add …`, `bun run dev`. Do not mix `npm`/`bun` lockfiles — delete `package-lock.json` when `bun.lock` is committed and update `.hoplite/settings.json` + `.github/workflows/meder.yml` in the same commit.

## Library facts (verified 2026-09-09, via site scrape)

- **rareui.com** — free, open-source, shadcn-registry React components built on **Tailwind CSS + `motion`**. Installed with `npx shadcn@latest add swamimalode07/rare-ui/<name>` (use `bunx --bun shadcn@latest …`). 18 components. Licence: free for commercial use, attribution appreciated, don't resell. **Usable directly in the web app.**
- **remocn.dev** — 301 MIT components **for Remotion video**, not for interactive web UI. Its "UI primitives" are explicitly *"No `useState`. No event handlers. No CSS transitions. Every pixel is a function of the current frame."* Its Shaders wrap `paper-design/shaders`; its Icons are Lucide paths re-authored for frame-driven animation.
  - **Use remocn for:** the demo video (Track A form says "video/demo … if applicable").
  - **Do not use remocn for:** buttons, inputs, or any interactive part of the app.
  - **For web shaders:** use `@paper-design/shaders-react` directly (same shaders remocn wraps).
  - **For web icons:** use `lucide-react` (the source remocn derives from), or the animated-icon pattern in 03.

Attribution required in the app footer or `/about`: "UI components from Rare UI (rareui.com). Shaders by Paper (paper-design/shaders). Icons by Lucide."
