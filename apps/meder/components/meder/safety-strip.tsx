"use client";

import { ShieldCheck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const sections: { title: string; lines: string[] }[] = [
  {
    title: "Data",
    lines: [
      "No account connection. No financial writes.",
      "Demo data, not exchange evidence. Live reads are disabled after a regional access restriction. No Binance request is made.",
      "Do not paste keys, signatures, private account data, or real identifiers. Free text and identifiers are excluded from reports and model prompts.",
    ],
  },
  {
    title: "Corrections",
    lines: [
      "Price is always protected. Quantity never increases.",
      "The cap bounds price × quantity. Not a balance guarantee.",
      "A proposal is not an order. Nothing is executed.",
    ],
  },
  {
    title: "Runtime",
    lines: [
      "Deterministic mode only. No model is invoked.",
      "In model mode, the model selects read-only tools. The exact solver owns the verdict.",
      "Tool summaries only. No private reasoning, pasted errors, or account data.",
      "Exports omit identifiers, pasted error text, and session/evidence tokens.",
    ],
  },
  {
    title: "Limits",
    lines: [
      "Partial validation — exchange acceptance unknown.",
      "Synthetic diagnostic application. Not exchange acceptance, investment advice, or proof of competition eligibility.",
    ],
  },
];

export function SafetyStrip() {
  return (
    <footer className="safety-strip">
      <span className="safety-strip-line">
        <ShieldCheck size={14} strokeWidth={2.2} aria-hidden="true" />
        Synthetic data · read-only · nothing is ever submitted
      </span>
      <Sheet>
        <SheetTrigger className="safety-strip-link">About safety</SheetTrigger>
        <SheetContent aria-label="About safety">
          <SheetTitle>About safety</SheetTitle>
          <SheetDescription>
            Every reassurance this application makes, in one place.
          </SheetDescription>
          {sections.map((section) => (
            <section key={section.title} className="sheet-section">
              <h3>{section.title}</h3>
              <ul>
                {section.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </section>
          ))}
        </SheetContent>
      </Sheet>
    </footer>
  );
}
