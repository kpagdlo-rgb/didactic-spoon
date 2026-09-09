"use client";

// Quantity display with per-digit motion. Simpler than Rare UI's
// AnimatedCounter wheel: the test contract pins exact `toHaveText` on these
// elements, so the DOM must contain exactly the server's string — a digit
// wheel would put 21 faces per column into textContent. Position+digit keys
// give the same staggered swap feel with text that settles to the exact
// string. Animation is cosmetic; the string is never recomputed here.

import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

export function QuantityCounter({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const reduced = useReducedMotion() ?? false;

  if (reduced) {
    return <span className={cn("tabular-nums", className)}>{text}</span>;
  }

  return (
    <span className={cn("inline-flex items-baseline tabular-nums", className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {text.split("").map((ch, i) => (
          <motion.span
            key={`${i}:${ch}`}
            initial={{ y: "0.45em", opacity: 0, filter: "blur(3px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-0.45em", opacity: 0, filter: "blur(3px)" }}
            transition={{ duration: 0.28, ease: EASE, delay: i * 0.025 }}
            className="inline-block"
          >
            {ch === " " ? " " : ch}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  );
}

export default QuantityCounter;
