# 06 — Verification contract and checklist

## A. Frozen test contract (extracted from `tests/browser/*.spec.ts` at `85cce3c`)

These selectors must keep resolving to exactly one element with the same semantics. Change the UI freely around them.

**Labels (`getByLabel`)** — visible `<label htmlFor>` text must stay byte-identical:
- `Diagnostic runtime`
- `Example scenario`
- `Limit price`
- `Private demo access key`
- `Quantity permission`
- `Quantity` (exact)
- `Quote-notional cap · fees excluded`
- `Request input · maximum 16 KiB`
- `Side` (exact)

**Buttons (`getByRole("button", { name })`)**:
- `Copy proposed JSON`
- `Diagnose order` (exact)
- `Export report`
- `Lock model access` (exact)
- `Retry locking model access` (exact)
- `Stop diagnosis`
- `Unlock model access` (exact)
- Negative: `meder.spec.ts:98` asserts **zero** buttons match `/execute|retry|place order/i` after a successful run. This passes today only because "Retry locking model access" renders exclusively in the `lockUnconfirmed` state, which that journey never enters. Consequences: (a) never add a button whose name contains "execute", "retry" or "place order"; (b) if the access panel moves into a Sheet, the Sheet trigger must not be named with those words either; (c) do not render the retry button unconditionally.

**Regions / headings / live regions**:
- `getByRole("region", { name: "Private model access" })` — `<section aria-labelledby>` with `<h3>` "Private model access"
- `getByRole("heading", { name: "Stopped. Nothing was submitted." })`
- `getByRole("alert")` — error box; `getByRole("status")` — access message; `getByRole("checkbox")` — advanced-input toggle

**Test ids**: `diagnosis-result` (contains the machine verdict code text, e.g. `REPAIR_PROPOSED`), `original-quantity`, `proposed-quantity`, `proposal-json`.

**Text**: `Advanced: redacted JSON input`, `Sanitized tool trace`, `/No automatic fallback occurs/`.

**Raw locators**: `#source-mode option` (a real `<select id="source-mode">` with options must exist in the DOM), `option[value="model"]`, `.badge`, `.error-box`, `.trace`, `body`.

**Navigation**: `page.goto("/")` ×3 → becomes `/app` in P3 (update the specs in the same commit).

Allowed test edits, each requiring a one-line justification in the commit message:
1. P1: open the access Sheet before querying the region.
2. P3: `/` → `/app`; add landing smoke test.
Nothing else.

## B. Command sequence (run at every phase gate, from `apps/meder`)

```bash
bun install --frozen-lockfile
bun run typecheck
bun run test                   # tsx --test under Node; `bun test` fails on nested subtests, `bun --bun tsx` is broken (see 05 P0)
bun run build
bun audit                      # expect: 0 production vulnerabilities; record any dev-only advisories in RUNBOOK
# dev server via preview_start (Hoplite) or: bun run dev -- --port 3000
bunx playwright test           # expect 20 passed (21 after P3 smoke test)
```

Expected baseline before P0: 87 Node tests, 20 browser tests, typecheck and build passing (`85cce3c`).

## C. Visual checklist (screenshot per phase gate; store under `.hoplite/artifacts/`, attach to PR)

| Check | Viewport | Pass criterion |
| --- | --- | --- |
| No side dead space | 1920×1080 | Gutter ≤ 80 px each side; content spans the rest |
| CTA above the fold | 1440×900 | "Diagnose order" fully visible without scrolling at idle |
| Reassurance count | 1920 idle | ≤ 4 safety sentences visible |
| Hero fills screen | 1920×1080 landing | No scrollbar needed to see CTAs |
| Mobile fit | 390×844 | Hero ≤ 1.2 screens; result scrolls into view after run |
| Counter | 1920 result fixture 01 | Rolls to `0.001`; `sr-only` exact string present |
| Reduced motion | any | Emulate → shaders still, counter snaps, no `@keyframes` running |
| Dark theme | 1920 idle + result | Contrast ≥ 4.5:1 for all text (axe via `browser_cli`) |
| Focus ring | keyboard tab through form | 3 px `--color-focus` ring visible on every control |
| Console | every page | `browser_errors` empty; CSP has no violations |

## D. Definition of done for the whole refactor

- All phases merged; PR description carries the 8 final screenshots (light/dark × idle/result × 1920/390) plus one landing full-page capture.
- `bun audit` 0 production vulnerabilities, or each advisory listed with rationale in `docs/meder/RUNBOOK.md`.
- `docs/meder/RUNBOOK.md`, `SPEC.md` §UI, `MANIFEST.md` updated to Bun commands and the new route map.
- Attribution line present in the landing footer.
- No change under `src/server/*` or `src/domain/*` except imports (diff must be empty there: `git diff --stat main -- apps/meder/src`).
- Hosted CI (`.github/workflows/meder.yml`) green on Bun.

### Recorded outcomes (P5 close-out, branch `hoplite/mylasa-3fbb4210`)

| Gate | Result |
| --- | --- |
| `bun run typecheck` | pass |
| `bun run test` (Node, tsx) | 87 pass / 0 fail |
| `bun run test:browser` (Playwright) | 21 pass / 0 fail (incl. new `landing.spec.ts` smoke test) |
| `bun run build` (clean `.next`) | pass — `/`, `/app` static; `/meder` redirect; APIs dynamic |
| `bun audit` | 0 vulnerabilities |
| axe-core WCAG 2 A/AA (`scripts/verify-a11y.mjs`) | 0 serious/critical on /app idle+result × light/dark and / |
| Reduced motion + CSP (`scripts/verify-motion-csp.mjs`) | counter settles exact; 0 running CSS animations after settle; landing mounts no shader canvas; CSP header present on both routes; 0 violations |
| Lighthouse desktop (`bunx lighthouse@12`, Playwright Chromium) | `/` performance 99, accessibility 100; `/app` performance 97, accessibility 100 |
| Screenshots (`scripts/capture-matrix.mjs`) | 9 images in `.hoplite/artifacts/screenshots/`: app-{1920,390}-{light,dark}-{idle,result}.png + landing-1920-full.png |
| 390 px overflow | `scrollWidth === innerWidth` at 390×844 (probe + mobile test) |
| Copy discipline (`scripts/probe-copy.mjs`) | rendered DOM of `/`, `/app` idle and result (incl. open About-safety sheet) contains no `AI` kicker, no `total-spend` phrasing, no 01–04 numerotation |
| Hosted CI (`meder.yml` run 34340494474, head `587759d`) | green — typecheck, 87 Node tests, production build, 21 browser tests against the production artifact (`next start`); the CI webServer authorizes its own loopback origin via `MEDER_ALLOWED_ORIGIN` because the production origin gate denies loopback without configuration |
| Rendered-UI audit (`scripts/audit-ui.mjs`, 6 viewports × 2 routes) | no horizontal overflow, no clipped text, no dead side space at any width; one real overlap found and fixed (closed `<details>` leaked an invisible label into layout — now explicitly hidden); remaining flags are decorative bleed (clipped) and the intentional floating scroll-progress pill |
| Interface audit pass (dead code + awwwards) | dead `components/ui/button.tsx` and `animated-counter.tsx` removed; unmounted Rare UI `scroll-progress` mounted on the landing (Why/How/Limits/Try it jump pill, footer clearance padding); dead tokens pruned (`--color-bg-2`, `--color-ink-3`, `--spacing-gutter`, `--dur-slow`, `--dur-reveal`, `--ease-inout`, `--font-heading`, `--shadow-2`, `--radius-sm/xl/3xl/4xl`, unused oklch shadcn scaffold); remaining scaffold tokens palette-matched to the theme; hardcoded type overrides (`h1` at ≤1000/≤740 px, `.quantity`, `.idle h3` 23px, dead `.idle .orb`) removed so the fluid scale flows |

Deviations from the letter of section D: no PR exists because the repository has no base branch (only `hoplite/mylasa-3fbb4210`); the screenshots live in `.hoplite/artifacts/` instead. The "diff empty under src/" check is against the branch point `85cce3c` rather than `main`.

## E. What this refactor does NOT prove

Pretty does not mean verified. The redesign changes no diagnostic behaviour; it does not establish real-model operation, live exchange access, submission acceptance or eligibility. Keep those statements in `SUBMISSION.md`/`TODO.md` exactly as they are.
