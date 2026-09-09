# 03 — Component / Shader / Icon map

> **Implementation status (head `516f3d2`):** this is the *plan* document; the
> shipped tree differs where the frozen Playwright contract forced changes.
> Adopted as planned: `MeshGradient` (landing hero), `FluidOrb` (landing +
> app idle), `StepPlayer` (landing how-it-works), `CodeBlock` (proposal
> export), `ScrollProgress` (landing pill; mounted in the interface-audit
> pass), `Sheet` (About-safety), `Tooltip` (`FieldHelp`). Deviations:
> `AnimatedCounter` was installed then **removed** — the frozen
> `toHaveText("0.001")` contract cannot match its odometer, so
> `components/meder/quantity-counter.tsx` is the exact-string fork used in
> the app and landing payoff. `components/ui/button.tsx` was installed then
> **removed** as unused; the app keeps its own `.primary`/`.btn` classes.
> `badge.tsx` was never built; the `.badge` class is used directly. Do not
> re-add these components without re-checking the browser contract.

Every line: **what to add → from where → install command → where it goes → paste-ready snippet → what to change → how to confirm.** Prerequisite: P0 in [05-REFACTOR-PLAN.md](05-REFACTOR-PLAN.md) has installed Tailwind v4, the `@/` alias, `cn()`, `motion`, and `components.json`.

All installs use Bun: `bunx --bun shadcn@latest add <ref>`. Run from `apps/meder`. The CLI writes into `components/ui/` (Rare UI) and respects `components.json`. Commit the generated files — they are yours to edit.

## Decision table

| Need | Use | Library | Why this one |
| --- | --- | --- | --- |
| Hero background, landing only | `MeshGradient` | `@paper-design/shaders-react` | Same shader remocn wraps, but wall-clock driven for the browser. Tiny, WebGL, honours `speed={0}`. |
| "Deterministic engine" ambient mark on landing + idle state | `FluidOrb` | Rare UI | Replaces the 47 px Georgia "m" orb. Ambient, honours reduced motion. |
| Proposed quantity payoff | `AnimatedCounter` | Rare UI | Odometer roll into the final number; width tracks digits. |
| Tool-trace timeline / running state | `StepPlayer` | Rare UI | Turns the collapsed `<details>` trace into a visible stepped track that fills as the diagnosis runs. |
| JSON viewers (proposal, export, advanced input preview) | `CodeBlock` | Rare UI | Themed from one accent hex; built-in copy button with check animation. |
| Scroll progress on the landing | `ScrollProgress` | Rare UI | Thin top bar; cheap, signals "this is a page you scroll". |
| Landing section reveal | `motion` `<motion.div>` | `motion` (installed as Rare UI dep) | No component needed. |
| Icons everywhere | `lucide-react` | Lucide | ISC, tree-shaken SVG, the same paths remocn animates. |
| Animated icons (3 places) | hand-rolled `motion` variants over lucide | — | See §Icons. Do **not** install remocn icon packages: they import Remotion. |
| Buttons, inputs, selects, sheet, tooltip | shadcn/ui primitives | `shadcn` registry | Rare UI assumes shadcn conventions; use the same primitives so styles match. |
| Demo video for the Track A form | remocn | remocn.dev | Separate Remotion project, **not** inside `apps/meder`. See §Video. |

### Do not use

- **remocn UI/Icons/Shaders inside the web app.** They are Remotion components; "no `useState`, no event handlers". Installing them pulls `remotion` (large) and they will not respond to clicks.
- **Rare UI: Gravity Letters, Gooey nav, Bounce/Proximity/Hook sidebar, Emoji reaction, Notification bell, Delete button, Duration picker, OTP input, Folder, GitHub activity.** Wrong domain or gimmicky for a financial diagnostic. Award sites win by restraint.
- **Any shader behind text or form controls.** Contrast and CPU.

---

## Components

### C1 · shadcn/ui primitives (foundation)

```bash
bunx --bun shadcn@latest init -d          # creates components.json, lib/utils.ts (cn), sets Tailwind v4
bunx --bun shadcn@latest add button input select label badge sheet tooltip separator
```

Where: `components/ui/*.tsx`. Replace every raw `<button>`, `<input>`, `<select>` in `app/meder.tsx` with these **keeping the same `id`, `htmlFor`, and visible label text**.

Change: in `components/ui/button.tsx` set the default `rounded-md` → `rounded-[var(--radius-md)]`, add `variant: { safe: "bg-safe text-white hover:bg-safe/90" }`. In `components/ui/badge.tsx` add variants `safe|caution|danger|neutral` per 02 §State vocabulary. Add `className="badge"` on the root of `Badge` — the Playwright suite uses `locator(".badge")`.

Confirm: `bun run typecheck` passes; `bun run test:browser` still finds every `getByLabel(...)` from 06.

### C2 · Rare UI — Animated counter

```bash
bunx --bun shadcn@latest add swamimalode07/rare-ui/animated-counter
```

Where: `components/meder/proposal-panel.tsx` (new, extracted from the "03 Proposed correction" block).

Paste:
```tsx
"use client";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function QuantityReveal({ from, to }: { from: string; to: string }) {
  // Exact strings are the source of truth; the counter is presentation only.
  const decimals = Math.max(from.split(".")[1]?.length ?? 0, to.split(".")[1]?.length ?? 0);
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_auto_1fr] md:items-end">
      <div>
        <p className="text-xs uppercase tracking-[.12em] text-ink-3">Original quantity</p>
        <p data-testid="original-quantity" className="font-mono text-2xl tabular-nums text-ink-2 line-through decoration-ink-3/40">{from}</p>
      </div>
      <ArrowRightAnimated aria-hidden />
      <div className="rounded-lg bg-safe-soft p-6">
        <p className="text-xs uppercase tracking-[.12em] text-safe">Proposed quantity</p>
        {/* Visible animated presentation… */}
        <AnimatedCounter aria-hidden value={Number(to)} decimals={decimals} separator="" duration={0.9}
          className="font-mono text-3xl font-medium tabular-nums text-safe" />
        {/* …and the exact string for tests, screen readers and copy. */}
        <span data-testid="proposed-quantity" className="sr-only">{to}</span>
      </div>
    </div>
  );
}
```

Change: nothing inside the generated file except ensuring `decimals` ≤ 15 (it clamps). **Important invariant:** the exact decimal string from the solver is the value tests assert on; the counter's `Number()` conversion is display-only and is `aria-hidden`.

Confirm: `getByTestId("proposed-quantity")` text equals `0.001` for fixture 01. Toggle OS reduced-motion → digits snap without roll.

### C3 · Rare UI — Step player

```bash
bunx --bun shadcn@latest add swamimalode07/rare-ui/step-player
```

Where: `components/meder/trace-timeline.tsx`, rendered inside the Diagnosis panel **both** while running (drives itself from `duration`) and after completion (controlled, `value = trace.length - 1`, `playing={false}`).

Paste:
```tsx
import { StepPlayer } from "@/components/ui/step-player";

export function TraceTimeline({ trace, running }: { trace: TraceEntry[]; running: boolean }) {
  const steps = trace.length ? trace.map((t) => ({ label: t.summary ?? t.tool ?? "step" })) : 4;
  return (
    <section className="trace" aria-label="Sanitized tool trace">
      <h3 className="text-sm font-semibold">Sanitized tool trace <span className="badge neutral">{trace.length} entries</span></h3>
      <StepPlayer steps={steps} size={28} showControl={false} seekable={false}
        playing={running} loop={running} duration={700}
        value={running ? undefined : Math.max(0, trace.length - 1)} />
      <ol className="mt-4 grid gap-2 text-sm text-ink-2">{trace.map((t, i) => <li key={i}><code className="font-mono">{t.code ?? t.tool}</code> {t.summary}</li>)}</ol>
    </section>
  );
}
```

Change: keep the wrapping `className="trace"` and the literal text "Sanitized tool trace" — both are test locators. Remove the old `<details class="trace">`.

Confirm: `getByText("Sanitized tool trace", { exact: false })` visible after a run; `.trace` count = 1.

### C4 · Rare UI — Code block

```bash
bunx --bun shadcn@latest add swamimalode07/rare-ui/code-block
```
Adds `prism-react-renderer` — check it with `bun pm ls` and `bun audit` (see 06).

Where: three spots — "Inspect proposed JSON" (`data-testid="proposal-json"` must wrap the code text), the export preview, and the Advanced JSON input's read-only echo.

Paste:
```tsx
<CodeBlock code={JSON.stringify(proposal, null, 2)} language="json" accent="#1f6b5c" mode="auto"
  filename="proposed-order.json" showLineNumbers={false} className="max-h-80" />
<pre data-testid="proposal-json" className="sr-only">{JSON.stringify(proposal, null, 2)}</pre>
```

Change: CodeBlock has its own copy button; **keep** the existing "Copy proposed JSON" button (test contract) and let CodeBlock's be secondary (`showCopyButton={false}` if duplication feels noisy).

Confirm: `getByTestId("proposal-json")` contains `"quantity": "0.001"`.

### C5 · Rare UI — Fluid orb

```bash
bunx --bun shadcn@latest add swamimalode07/rare-ui/fluid-orb
```

Where: landing hero right column (size 320) and the app idle state (size 120), replacing `.idle .orb`.

Paste:
```tsx
import FluidOrb from "@/components/ui/fluid-orb";
<FluidOrb size={120} color="#1f6b5c" className="mx-auto opacity-90" aria-hidden />
```

Change: none. Confirm: renders on WebGL; with `prefers-reduced-motion` a still frame.

### C6 · Rare UI — Scroll progress (landing only)

```bash
bunx --bun shadcn@latest add swamimalode07/rare-ui/scroll-progress-indicator
```
Where: `app/(landing)/layout.tsx` top. Not on `/app`.

---

## Shaders

### S1 · Mesh gradient hero backdrop

```bash
bun add @paper-design/shaders-react
```

Where: `components/landing/hero-backdrop.tsx`, absolutely positioned behind the landing hero only.

Paste:
```tsx
"use client";
import { MeshGradient } from "@paper-design/shaders-react";
import { useReducedMotion } from "motion/react";

export function HeroBackdrop() {
  const still = useReducedMotion();
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-70 [mask-image:radial-gradient(80%_60%_at_50%_40%,#000,transparent)]">
      <MeshGradient colors={["#f4f3ee", "#dfeee8", "#1f6b5c", "#ebe9e1"]}
        distortion={0.6} swirl={0.15} speed={still ? 0 : 0.2}
        style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
```
Dark theme: swap colours to `["#0e1413","#16201e","#6fc6ad","#131b1a"]` via a `useTheme()` read.

Change: nothing in the package. Confirm: Lighthouse CPU idle < 5 % with the hero visible; no shader on `/app`.

Why not remocn's `@remocn/shader-mesh-gradient`: it freezes `speed={0}` and drives `frame` from Remotion's `useCurrentFrame()` — that is for rendering video frames, not for a live page.

---

## Icons

### I1 · Static icons

```bash
bun add lucide-react
```

Map (icon → location):

| Icon | Where |
| --- | --- |
| `ShieldCheck` | Safety strip, landing "Safe by construction" card |
| `Lock` / `LockOpen` | Top-bar private-access trigger (sheet), access chip |
| `Sparkles` | Landing "How it works" step 2 (checks) — replaces nothing, decorative |
| `ArrowRight` | Original→proposed quantity, CTA buttons |
| `Copy` / `Check` | Copy proposed JSON (swap on success, see I2) |
| `Download` | Export report |
| `Square` (stop) | Stop diagnosis |
| `Sun` / `Moon` | Theme toggle |
| `Info` | Contextual help tooltips that replace the inline `.help` paragraphs |
| `TriangleAlert` | Caution chips (REFUSED*, INCOMPLETE, UNRESOLVED) |
| `CircleCheck` | Safe chips |
| `CircleX` | Error box |
| `Beaker` | "Synthetic demo" chip |

Rule: icons are `size={16}` inline with text, `size={20}` in buttons, `size={28}` in landing cards, always `aria-hidden` next to visible text; `aria-label` only when alone.

### I2 · Animated icons (three, hand-rolled — do not install remocn icons)

Pattern (copy once into `components/ui/animated-icon.tsx`):
```tsx
"use client";
import { motion, AnimatePresence } from "motion/react";
import { Check, Copy } from "lucide-react";

export function CopyCheck({ done }: { done: boolean }) {
  return (
    <span className="relative inline-grid size-4 place-items-center" aria-hidden>
      <AnimatePresence mode="wait" initial={false}>
        {done
          ? <motion.span key="check" initial={{ scale: .4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .4, opacity: 0 }} transition={{ type: "spring", stiffness: 500, damping: 28 }}><Check size={16} /></motion.span>
          : <motion.span key="copy" initial={{ scale: .4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: .4, opacity: 0 }}><Copy size={16} /></motion.span>}
      </AnimatePresence>
    </span>
  );
}
```
Apply the same pattern for: `Lock`↔`LockOpen` (access state), `ArrowRight` drawing in on result (`pathLength` 0→1), `Square` pulse while running.

---

## Video (outside the app)

remocn is the right tool for the Track A "video/demo" artefact. Create `apps/meder-video/` as a Remotion project, follow https://remocn.dev/docs/guides/setup, and use `@remocn/shader-mesh-gradient`, `@remocn/typography-*`, and `@remocn/icon-check`/`icon-shield` there. Reuse the exact colour tokens from 02 so the video matches the site. This is optional and scoped separately; do not let it block the web refactor.

## Attribution (required)

Landing footer:
> Components from Rare UI · Shaders by Paper · Icons by Lucide

Link each. Rare UI asks for attribution; Lucide is ISC; paper-design/shaders is MIT.
