# 02 — Target design system

Copy the token block into `app/globals.css` (replacing the current `:root`). Everything else in this file explains how to apply it. Tailwind v4 reads these via `@theme`.

## Direction in one paragraph

"Calm instrument." Full-bleed, near-black or paper background switchable by system preference, a single warm-sage accent that is reserved for *safe* outcomes and a single amber for *caution*. One display face with real weight contrast, one text face, one mono. Motion is slow, physical and rare: things settle, they do not bounce. The single wow moment is the proposed-quantity counter rolling into place on a soft mesh gradient; everything else stays quiet so that moment lands.

## Tokens (paste verbatim)

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Surfaces — light default, dark via [data-theme=dark] below */
  --color-bg:        #f4f3ee;
  --color-bg-2:      #ebe9e1;
  --color-surface:   #fffefa;
  --color-surface-2: #f6f5ef;
  --color-line:      rgb(32 61 58 / 0.10);
  --color-line-2:    rgb(32 61 58 / 0.18);

  /* Ink */
  --color-ink:       #1a2f2c;
  --color-ink-2:     #4b5a57;
  --color-ink-3:     #7b8886;

  /* Accents — meaning is fixed; do not repurpose */
  --color-safe:      #1f6b5c;  /* REPAIR_PROPOSED, ALREADY_VALID, unlocked */
  --color-safe-soft: #dfeee8;
  --color-caution:   #9a6420;  /* REFUSED*, INCOMPLETE, UNRESOLVED */
  --color-caution-soft: #f8ecd8;
  --color-danger:    #a4392b;  /* transport / validation errors only */
  --color-danger-soft: #fbe6e1;
  --color-focus:     #d08a2b;

  /* Type */
  --font-display: var(--font-display), ui-serif, Georgia, serif;
  --font-sans:    var(--font-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono:    var(--font-mono), ui-monospace, "SF Mono", monospace;

  /* Fluid type scale (min @360px → max @1920px) */
  --text-xs:   clamp(0.72rem, 0.70rem + 0.10vw, 0.80rem);
  --text-sm:   clamp(0.82rem, 0.78rem + 0.18vw, 0.94rem);
  --text-base: clamp(0.95rem, 0.90rem + 0.25vw, 1.08rem);
  --text-lg:   clamp(1.10rem, 1.00rem + 0.45vw, 1.35rem);
  --text-xl:   clamp(1.40rem, 1.20rem + 0.90vw, 1.95rem);
  --text-2xl:  clamp(2.00rem, 1.50rem + 2.20vw, 3.40rem);
  --text-3xl:  clamp(2.80rem, 1.80rem + 4.40vw, 6.00rem);   /* hero h1, counter */

  /* Space (4-based; use only these) */
  --space-1: 0.25rem; --space-2: 0.5rem;  --space-3: 0.75rem; --space-4: 1rem;
  --space-6: 1.5rem;  --space-8: 2rem;    --space-12: 3rem;   --space-16: 4rem;
  --space-24: 6rem;

  /* Fluid page gutter — kills the fixed 1400px shell */
  --gutter: clamp(1rem, 4vw, 5rem);

  /* Radii + shadow */
  --radius-sm: 0.5rem; --radius-md: 0.875rem; --radius-lg: 1.5rem; --radius-full: 999px;
  --shadow-1: 0 1px 2px rgb(26 47 44 / .06), 0 8px 24px -12px rgb(26 47 44 / .12);
  --shadow-2: 0 2px 4px rgb(26 47 44 / .08), 0 24px 64px -24px rgb(26 47 44 / .22);

  /* Motion */
  --ease-out:   cubic-bezier(.16, 1, .3, 1);
  --ease-inout: cubic-bezier(.65, 0, .35, 1);
  --dur-fast: 160ms; --dur-base: 320ms; --dur-slow: 640ms; --dur-reveal: 900ms;
}

[data-theme="dark"] {
  --color-bg: #0e1413; --color-bg-2: #131b1a;
  --color-surface: #16201e; --color-surface-2: #1c2725;
  --color-line: rgb(228 236 233 / 0.10); --color-line-2: rgb(228 236 233 / 0.18);
  --color-ink: #eef3f1; --color-ink-2: #b7c3c0; --color-ink-3: #7f8d8a;
  --color-safe: #6fc6ad; --color-safe-soft: rgb(111 198 173 / .14);
  --color-caution: #e0a95a; --color-caution-soft: rgb(224 169 90 / .14);
  --color-danger: #ef8a7c; --color-danger-soft: rgb(239 138 124 / .14);
  --shadow-1: 0 1px 2px rgb(0 0 0 / .4), 0 8px 24px -12px rgb(0 0 0 / .6);
  --shadow-2: 0 2px 4px rgb(0 0 0 / .5), 0 24px 64px -24px rgb(0 0 0 / .8);
}

@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) { color-scheme: dark; } }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 1ms !important; transition-duration: 1ms !important; }
}
```

Theme switching: default follows the system (`prefers-color-scheme`). Set `data-theme` on `<html>` from a tiny inline script in `layout.tsx` reading `localStorage.theme` — this is a *preference*, not a secret, so localStorage is allowed here. Provide a Sun/Moon toggle in the top bar (lucide icons).

## Fonts (self-hosted through `next/font`, CSP-safe)

```ts
// app/fonts.ts
import { Instrument_Serif, Geist, Geist_Mono } from "next/font/google";
export const display = Instrument_Serif({ weight: "400", style: ["normal", "italic"], subsets: ["latin"], variable: "--font-display", display: "swap" });
export const sans = Geist({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
export const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
```

Apply `className={`${display.variable} ${sans.variable} ${mono.variable}`}` on `<html>`. `next/font/google` downloads at **build time** and serves from `/_next/static` — zero runtime requests, so `font-src 'self'` still holds. If the build machine has no network, swap to `next/font/local` with the same three families dropped into `app/fonts/`.

Roles:
- **Display (Instrument Serif)** — hero h1, verdict title, landing section titles. Italic for the accent phrase ("*Without another trade.*").
- **Sans (Geist)** — everything else.
- **Mono (Geist Mono)** — numbers only: quantities, prices, caps, the counter, JSON, trace codes. **Never** for labels or chips.

## Layout rules

- **No `max-width` on the page shell.** Use `padding-inline: var(--gutter)`. Content that should not exceed a reading measure (paragraphs) gets `max-width: 65ch` on the element, not on the shell.
- **Screens, not documents.** Landing hero: `min-height: 100dvh`. App screen: `min-height: 100dvh; display: grid; grid-template-rows: auto 1fr auto` (topbar / workspace / safety strip).
- **Workspace grid:** `grid-template-columns: minmax(20rem, 2fr) minmax(0, 3fr)` up to `lg`; `minmax(22rem, 1fr) minmax(0, 2fr)` at `2xl`. The form column grows with the screen; it is not frozen at 360 px.
- **Cards** get `--radius-lg`, `--shadow-1`, `border: 1px solid var(--color-line)`, and `padding: var(--space-6)`; on `≥lg` `padding: var(--space-8)`. Only these two paddings.
- **Vertical rhythm:** stack children with `gap`, never margin-bottom on individual fields.

## Typography rules

- h1 landing: `--text-3xl`, display, `line-height: .95`, `letter-spacing: -0.02em`.
- Verdict title: `--text-2xl`, display, `line-height: 1.05`.
- Section/card titles: `--text-lg`, sans 600, `letter-spacing: -0.01em`.
- Body: `--text-base` sans 400, `line-height 1.55`.
- Helper: `--text-sm` `--color-ink-2`. **Nothing under `--text-xs` (≈11.5 px at 360, 12.8 px at 1920).**
- Eyebrows/chips: `--text-xs` sans 600 uppercase `letter-spacing: .12em`. Not mono.
- Counter: `--text-3xl` mono 500, `font-variant-numeric: tabular-nums`.

## Motion rules

- Reveal on mount: opacity 0→1 + translateY 12→0, `--dur-reveal`, `--ease-out`, staggered 60 ms per sibling. Use `motion`'s `initial/animate` with `viewport={{ once: true }}` on the landing; on the app screen, animate only the result panel.
- State change (idle→running→result): `AnimatePresence mode="wait"`, exit 160 ms, enter 320 ms.
- Counter: Rare UI Animated counter, `duration` 0.9.
- Shader: **hero background only**, `speed ≤ 0.25`, muted palette from tokens, `prefers-reduced-motion` → `speed={0}`. Never behind form controls or result text.
- Hover: `translateY(-1px)` + shadow-2 at `--dur-fast`. No scale.
- No looping motion anywhere on the app screen except the running-state step player.

## State vocabulary (one chip component, four variants)

| Variant | Uses | Colour |
| --- | --- | --- |
| `safe` | REPAIR_PROPOSED, ALREADY_VALID, access UNLOCKED, "Synthetic · read-only" strip | `--color-safe` on `--color-safe-soft` |
| `caution` | REFUSED, REFUSED_EXACT_TOLERANCE, INCOMPLETE, UNRESOLVED, access LOCKED | caution |
| `danger` | transport/validation errors, "Stopped" | danger |
| `neutral` | UNVERIFIED, counts, "3 entries" | ink-3 on surface-2 |

Machine codes (`REPAIR_PROPOSED`) stay in the DOM for tests (`data-testid="diagnosis-result"`) but are rendered as the chip's `title`/visually-small mono suffix; the human title is the headline.
