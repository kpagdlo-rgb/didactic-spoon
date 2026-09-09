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

## E. What this refactor does NOT prove

Pretty does not mean verified. The redesign changes no diagnostic behaviour; it does not establish real-model operation, live exchange access, submission acceptance or eligibility. Keep those statements in `SUBMISSION.md`/`TODO.md` exactly as they are.
