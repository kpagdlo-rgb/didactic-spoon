# 05 — Phased refactor plan (Bun-native)

Each phase is one PR-sized commit, independently shippable, and ends with the exact confirmation commands and the expected result. Do not start a phase until the previous one is green. Estimated agent time in brackets is for planning, not a promise.

Working directory for every command: `apps/meder` unless stated.

## P0 — Toolchain: Bun, Tailwind v4, shadcn scaffold, fonts [~1 h]

Why first: every later phase pastes Tailwind-class components. Nothing visual changes in P0.

1. **Bun as package manager**
   ```bash
   rm -f package-lock.json
   bun install                       # writes bun.lock
   bun add -d @tailwindcss/postcss tailwindcss postcss
   bun add motion clsx tailwind-merge lucide-react @paper-design/shaders-react
   ```
   Edit `package.json` scripts (final, verified on this host 2026-09-09):
   ```json
   "dev": "next dev --hostname 0.0.0.0",
   "build": "next build",
   "start": "next start --hostname 0.0.0.0",
   "typecheck": "next typegen && bunx tsc --noEmit",
   "test": "tsx --test tests/*.test.ts",
   "test:browser": "bunx playwright test"
   ```
   **Verified gotchas (Bun 1.3.1 on this Modal sandbox, 2026-09-09):**
   1. `bun --bun next build` crashes with SIGILL — a Bun runtime bug (bun.report/1.3.1/…), persistent across retries. `next dev/build/start` therefore run under the Node 24 runtime; Bun is still the package manager, lockfile owner and script runner (`bun run dev` → Node child). Re-test `bun --bun` on a newer Bun before assuming it is still broken.
   2. `bun --bun tsx --test` fails: tsx cannot resolve its own `./cjs/index.cjs` entry under Bun. Plain `tsx --test` (Node) is the test command.
   3. `bun test` runs 22/23 of `tests/domain.test.ts` — the failure is `NotImplementedError: test() inside another test()` (oven-sh/bun#5090). Nested `t.test()` subtests exist in `tests/domain.test.ts` (1 site) and `tests/model-access-http.test.ts` (10 sites). Do not flatten or delete subtests to make `bun test` pass; migrating those files to `bun:test` `describe/test` blocks is a separate follow-up.
   4. `shadcn init` adds two packages you must delete: `cn` (a bogus runtime dep — the real `cn` helper is `lib/utils.ts`) and `shadcn` (the CLI itself, never needed as a dependency).

2. **Repo wiring** (root):
   - `.hoplite/settings.json` → `"setup": "python3 -m venv .venv && .venv/bin/pip install -r requirements-preview.txt && cd apps/meder && bun install --frozen-lockfile"`, `"run": "cd apps/meder && bun run dev -- --port ${PORT:-3000}"`.
   - `.github/workflows/meder.yml` → replace `actions/setup-node` + `npm ci` with `oven-sh/setup-bun@v2` + `bun install --frozen-lockfile`; scripts via `bun run …`; Playwright: `bunx playwright install --with-deps chromium`. Keep `actions/setup-node` (Node 24) too, because `next build` runs under Node (`bun --bun next build` SIGILLs on this host; workflow may also need Node for Playwright's runtime). **Done and verified** — current `meder.yml` is the reference.
   - `docs/meder/RUNBOOK.md` → replace npm commands.

3. **Tailwind v4 + alias + cn**
   - `postcss.config.mjs`: `export default { plugins: { "@tailwindcss/postcss": {} } }`
   - `tsconfig.json` `compilerOptions.paths`: `{ "@/*": ["./*"] }`
   - `lib/utils.ts`: `export const cn = (...i: ClassValue[]) => twMerge(clsx(i))`
   - `bunx --bun shadcn@latest init -d` (answers: Next, Tailwind v4 detected, base colour neutral, CSS variables yes). It writes `components.json`; set `"aliases": { "components": "@/components", "utils": "@/lib/utils", "ui": "@/components/ui" }`.
   - Replace the top of `app/globals.css` with the `@import "tailwindcss"; @theme { … }` block from 02. **Keep all existing class rules below it for now** — P1/P2 will delete them as they are replaced. Tailwind v4 preflight will slightly change default margins; check the screenshot.

4. **Fonts**: add `app/fonts.ts` from 02, wire variables onto `<html>` in `layout.tsx`, set `body { font-family: var(--font-sans) }`, `h1,.verdict-title { font-family: var(--font-display) }`. Remove `Arial`/`Georgia` literals.

**Confirm P0**
```bash
bun run typecheck && bun run test && bun run build && bun audit
bun run dev -- --port 3000   # via preview_start in Hoplite
bunx playwright test
```
Expected: all green (87 Node / 20 browser). Screenshot of `/` shows the *same* layout with new fonts. `bun audit` reports 0 production vulnerabilities (if `prism-react-renderer` or `flubber` later add advisories, record them in RUNBOOK rather than ignoring).

## P1 — Full-bleed shell, tokens, typography, consolidated safety copy [~2 h]

1. Delete `.shell` max-width. New app-screen skeleton in `app/app/page.tsx` → `components/meder/app-shell.tsx`:
   ```tsx
   <div className="grid min-h-dvh grid-rows-[auto_1fr_auto] bg-bg text-ink">
     <TopBar />            {/* wordmark · theme toggle · Lock icon → AccessSheet */}
     <main className="grid gap-6 px-[var(--gutter)] py-6 lg:grid-cols-[minmax(20rem,2fr)_minmax(0,3fr)] 2xl:grid-cols-[minmax(22rem,1fr)_minmax(0,2fr)]">
       <OrderForm /> <ResultPanel />
     </main>
     <SafetyStrip />       {/* the ONE persistent disclaimer */}
   </div>
   ```
2. Apply the type scale (02). Kill every px font-size in `globals.css`.
3. **Consolidate disclaimers** to exactly these on the app screen:
   - SafetyStrip (bottom, sticky on mobile): `ShieldCheck` "Synthetic data · read-only · nothing is ever submitted" + link "About safety" → Sheet with the full text of every removed sentence.
   - Chip on the form header: `Beaker` "Synthetic".
   - Help text moves into `Tooltip` on an `Info` icon next to each label (Quantity permission, Cap, Runtime). Visible label text unchanged.
   - Keep: form-footer "A proposal is not an order. Nothing is executed." (one line under the CTA) — it is the most important one.
   - Keep the `.notice` "Partial validation — exchange acceptance unknown." inside results.
4. Hide the two single-option selects — **amended after reading the tests:** `model-access.spec.ts` calls `getByLabel("Diagnostic runtime").selectOption("model")` on error paths too, and `meder.spec.ts` queries `#source-mode option` after `goto("/")`. Both selects must remain real, functional, visible selects. The audit's "dead controls" complaint is instead addressed by compacting them (smaller row height, placed under a collapsed "Runtime & data" disclosure) — deferred to P4; do **not** make them sr-only or chips.
5. Step 03 panel — **amended:** "Copy proposed JSON" and "Export report" are asserted disabled at idle, on REFUSED and UNRESOLVED, and after a stop, so the panel and both buttons must always render. Keep them; P2/P4 only restyle the empty state (dimmed card, no disabled-primary look).
6. Move `ModelAccessPanel` into a shadcn `Sheet` opened from the top-bar `Lock` button. **Keep every string, role, `id`, and the `region` with heading "Private model access"** — the Sheet content must be that exact section. Tests open the panel via `getByRole("region", { name: "Private model access" })` → add a `beforeEach` that clicks the lock button (`getByRole("button", { name: "Private model access" })`) — update `tests/browser/model-access.spec.ts` in this commit and say so in the message. **Deferred to P2** so P1 stays DOM-identical and test-green.

**Confirm P1**
```bash
bun run typecheck && bunx playwright test
```
Then screenshots at 1920, 1440, 1024, 390 — expected: no side dead space (gutter ≤ 80 px at 1920), CTA above the fold at 1080 high, ≤ 4 reassurance sentences visible at idle, form column grows on wide screens.

## P2 — Component swap: counter, step player, code block, orb, icons [~2 h]

Follow 03 items C1–C5, I1–I2 exactly. Extract `app/meder.tsx` into:
```
components/meder/
  app-shell.tsx  top-bar.tsx  safety-strip.tsx  order-form.tsx  scenario-picker.tsx
  result-panel.tsx  verdict.tsx  quantity-reveal.tsx  trace-timeline.tsx  proposal-panel.tsx
  access-sheet.tsx  json-block.tsx
```
`app/meder.tsx` keeps the state machine and fetch logic (unchanged lines), renders the pieces.

Scenario picker: replace the "Example scenario" `<select>` visually with four cards (`role="radiogroup"`), but keep `<select id="fixture">` in the DOM as `sr-only` bound to the same state — `getByLabel("Example scenario")` still works and keyboard users get the native control.

State transitions: wrap `ResultPanel` children in `AnimatePresence mode="wait"` keyed by `run?.status ?? "idle"`.

**Confirm P2**
```bash
bun run typecheck && bun run test && bunx playwright test
```
Expected: 20/20 browser. Fixture 01 shows the counter rolling to `0.001`; `getByTestId("proposed-quantity")` = `0.001`; trace visible as step track with 3 entries; JSON in CodeBlock. Reduced-motion emulation (`bunx playwright test --project=chromium` with `reducedMotion: "reduce"` in a temporary config) shows no roll.

## P3 — Landing page + routing [~2 h]

Follow 04. Move tool to `/app`; `/meder` → `redirect("/app")`; `/` → landing.

**Test impact:** `page.goto("/")` in both specs → `page.goto("/app")`. Add one landing smoke test: h1 text, "Open the diagnostic" link navigates to `/app`, no console errors.

**Confirm P3**
```bash
bun run build && bunx playwright test
```
Lighthouse (Chrome DevTools via `browser_cli lighthouse` or `bunx lighthouse http://127.0.0.1:3000 --preset=desktop`): Perf ≥ 90, A11y 100. Screenshots of every landing section at 1920 and 390.

## P4 — Polish: dark theme, micro-interactions, mobile scroll-to-result [~1 h]

- Theme toggle (Sun/Moon) writing `data-theme`; verify both palettes on idle + result.
- `resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })` after `setRun` when `matchMedia("(max-width: 1023px)")`.
- Hover lift on cards; `CopyCheck` on copy; `Lock`↔`LockOpen` swap.
- Remove every remaining rule from the old `globals.css` that is no longer referenced (`bunx knip` or grep each class).

**Confirm P4**: full suite + `bun audit` + screenshots light/dark × idle/result × 1920/390 (8 images) attached to the PR.

## Order of commits and messages

```
P0 chore(meder): move to bun, tailwind v4, shadcn scaffold, self-hosted fonts
P1 feat(meder): full-bleed shell, fluid type scale, consolidated safety copy
P2 feat(meder): rare-ui counter/step-player/code-block, lucide icons, panel extraction
P3 feat(meder): landing page at /, tool at /app, mesh-gradient hero
P4 feat(meder): dark theme, micro-interactions, mobile scroll-to-result, css cleanup
```

## Token/time discipline for the executing agent

- Do not re-read whole files you already changed; grep for the class or label you need.
- Do not screenshot after every edit — one screenshot per phase gate.
- Run `bunx playwright test tests/browser/meder.spec.ts -g "<name>"` for the single journey you touched; run the full suite only at the phase gate.
- If a Rare UI component's generated file is >300 lines, do not read it; trust the documented props (03) and only open it when a prop is missing.
- Never "fix" a failing test by changing the assertion unless 06 says the label legitimately moved.
