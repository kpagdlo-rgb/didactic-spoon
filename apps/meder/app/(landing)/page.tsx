"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowRight,
  Beaker,
  CircleCheck,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import FluidOrb from "@/components/ui/fluid-orb";
import { StepPlayer } from "@/components/ui/step-player";
import { QuantityCounter } from "@/components/meder/quantity-counter";

const reveal = {
  initial: { y: 24, opacity: 0 },
  whileInView: { y: 0, opacity: 1 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
};

function HeroBackdrop() {
  const reduced = useReducedMotion();
  return (
    <div className="lp-backdrop" aria-hidden="true">
      <motion.div
        className="lp-glow lp-glow-a"
        animate={reduced ? undefined : { x: [0, 40, -20, 0], y: [0, -30, 10, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="lp-glow lp-glow-b"
        animate={reduced ? undefined : { x: [0, -50, 20, 0], y: [0, 20, -15, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

const PROMISES = [
  {
    icon: ShieldCheck,
    title: "Read-only by construction",
    body: "The app has no API keys, no wallet, no order endpoint. It cannot place, cancel or retry anything.",
  },
  {
    icon: Beaker,
    title: "Synthetic evidence, labelled",
    body: "Every input is an invented fixture and is labelled as such. Nothing here is proof of an exchange decision.",
  },
  {
    icon: CircleCheck,
    title: "Exact, not approximate",
    body: "Quantities are checked with integer arithmetic on the real filter grid. No floats, no rounding surprises.",
  },
];

const STEPS = [
  {
    title: "Pick a scenario",
    body: "Four synthetic cases: a fixable quantity, a cap that refuses, an unknown execution, an off-grid minimum.",
  },
  {
    title: "Meder checks the rules",
    body: "LOT_SIZE, PRICE_FILTER, MIN_NOTIONAL, NOTIONAL and your own cap — locally, exactly.",
  },
  {
    title: "You get a verdict, never an order",
    body: "A proposal you can copy, a report you can export, or a clear reason to stop.",
  },
];

const WONT = [
  "Will not connect to Binance or any exchange",
  "Will not read balances, fees or account permissions",
  "Will not change your price or increase quantity",
  "Will not retry an order whose outcome is unknown",
  "Will not claim exchange acceptance or eligibility",
];

function HowItWorks() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const panes = [...root.querySelectorAll<HTMLElement>("[data-step]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(Number((entry.target as HTMLElement).dataset.step));
          }
        }
      },
      { threshold: 0.6 },
    );
    panes.forEach((p) => observer.observe(p));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      <div className="lp-steptrack" aria-hidden="true">
        <StepPlayer
          steps={[{ label: "Pick" }, { label: "Check" }, { label: "Verdict" }]}
          value={active}
          onValueChange={setActive}
          playing={false}
          showControl={false}
        />
      </div>
      <ol className="lp-howgrid">
        {STEPS.map((s, i) => (
          <motion.li
            key={s.title}
            data-step={i}
            className={`lp-step ${active === i ? "is-active" : ""}`}
            {...reveal}
            transition={{ ...reveal.transition, delay: i * 0.06 }}
          >
            <h3>{s.title}</h3>
            <p>{s.body}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function Payoff() {
  const [on, setOn] = useState(false);
  return (
    <motion.div
      className="lp-payoff card"
      {...reveal}
      onViewportEnter={() => setOn((v) => (v ? v : true))}
    >
      <div className="lp-payoff-row" aria-live="off">
        <span className="lp-qty lp-qty-old">
          <QuantityCounter text="0.00123" />
        </span>
        <span className="arrow" aria-hidden="true">
          →
        </span>
        <span className="lp-qty lp-qty-new">
          {on ? <QuantityCounter text="0.001" /> : <QuantityCounter text="0.00123" />}
        </span>
      </div>
      <p className="lp-payoff-caption">
        Only the quantity moves. Price, side, symbol and time-in-force are
        protected.
      </p>
    </motion.div>
  );
}

export default function Landing() {
  return (
    <div className="lp">
      <HeroBackdrop />
      <header className="lp-nav" aria-label="Landing">
        <div className="wordmark">
          <span className="mark" aria-hidden="true">
            m
          </span>
          Meder
        </div>
        <Link href="/app" className="lp-nav-cta">
          Open the diagnostic
        </Link>
      </header>

      <main>
        <section className="lp-hero">
          <div className="lp-hero-copy">
            <p className="eyebrow">Synthetic · read-only · Spot LIMIT</p>
            <h1>
              Order clarity. <em>Without another trade.</em>
            </h1>
            <p className="lp-sub">
              Understand a rejected order. Explore a bounded quantity
              correction. Or know when to stop — without submitting anything.
            </p>
            <div className="lp-ctas">
              <Link href="/app" className="btn btn-safe btn-lg">
                Open the diagnostic
                <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
              </Link>
              <a href="#how" className="btn btn-ghost btn-lg">
                See how it works
              </a>
            </div>
            <p className="lp-strip">
              <ShieldCheck size={14} strokeWidth={2.2} aria-hidden="true" />
              No account connection · No financial writes · Exact arithmetic
            </p>
          </div>
          <div className="lp-hero-visual" aria-hidden="true">
            <FluidOrb size={320} color="#256457" className="lp-orb" />
            <div className="lp-minicard">
              <span className="lp-chip">A smaller quantity fits your limits.</span>
              <div className="lp-miniqty">
                0.00123 <span className="arrow">→</span> 0.001
              </div>
              <div className="lp-mininote">Unchanged: price 100</div>
            </div>
          </div>
        </section>

        <section className="lp-section">
          <ol className="lp-promises">
            {PROMISES.map((p, i) => (
              <motion.li
                key={p.title}
                className="lp-promise"
                {...reveal}
                transition={{ ...reveal.transition, delay: i * 0.06 }}
              >
                <p.icon size={22} strokeWidth={1.8} aria-hidden="true" />
                <h2>{p.title}</h2>
                <p>{p.body}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        <section className="lp-section" id="how">
          <motion.h2 className="lp-h2" {...reveal}>
            How it works
          </motion.h2>
          <HowItWorks />
        </section>

        <section className="lp-section">
          <Payoff />
        </section>

        <section className="lp-section lp-wont">
          <motion.h2 className="lp-h2" {...reveal}>
            <TriangleAlert size={20} strokeWidth={2} aria-hidden="true" />
            What it will not do
          </motion.h2>
          <ul className="lp-wont-list">
            {WONT.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>

        <section className="lp-section lp-final">
          <motion.div {...reveal}>
            <h2 className="lp-final-title">
              Try the synthetic diagnostic
            </h2>
            <Link href="/app" className="btn btn-safe btn-lg">
              Open the diagnostic
              <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
            </Link>
          </motion.div>
        </section>
      </main>

      <footer className="lp-footer">
        <p>
          Meder · Synthetic diagnostic application. Not exchange acceptance,
          investment advice, or proof of competition eligibility.
        </p>
      </footer>
    </div>
  );
}
