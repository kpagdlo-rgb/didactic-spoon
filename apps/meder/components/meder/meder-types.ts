import type { DiagnosisResult } from "../../src/domain/types";

export type FixtureId =
  | "repairable"
  | "budget_refusal"
  | "ambiguous"
  | "off_grid_min";
export type Planner = "deterministic" | "model";
export type TraceEntry = {
  tool?: string;
  name?: string;
  summary?: string;
  code?: string;
};
export type Run = {
  id: string;
  status: "running" | "completed" | "canceled" | "error";
  observedSource?: "synthetic_fixture" | "redacted_import";
  result?: DiagnosisResult | null;
  trace?: TraceEntry[];
  evidence?: {
    mode?: string;
    receivedAt?: string;
    fixtureVersion?: string;
    ageMs?: number;
  }[];
  error?: { code: string; message: string } | null;
  export?: unknown;
};

export const presets: Record<
  FixtureId,
  { label: string; quantity: string; cap: string; detail: string }
> = {
  repairable: {
    label: "Quantity correction",
    quantity: "0.00123",
    cap: "0.123",
    detail: "Step 0.001 · minimum quantity 0.001 · minimum notional 0.10",
  },
  budget_refusal: {
    label: "No correction within budget",
    quantity: "0.100",
    cap: "9.99",
    detail: "Step 0.001 · minimum quantity 0.001 · minimum notional 10.00",
  },
  ambiguous: {
    label: "Unknown execution",
    quantity: "0.100",
    cap: "10",
    detail: "Invented lost-response report. No account lookup or retry.",
  },
  off_grid_min: {
    label: "Zero-origin grid regression",
    quantity: "0.0022",
    cap: "1",
    detail:
      "Step 0.001 · minimum quantity 0.0015 · grid is not offset from minimum",
  },
};

export const titles: Record<string, string> = {
  REPAIR_PROPOSED: "A smaller quantity fits your limits.",
  REFUSED: "No correction fits your limits.",
  REFUSED_EXACT_TOLERANCE: "Your exact quantity stays protected.",
  ALREADY_VALID: "Your order meets the checked rules.",
  INCOMPLETE: "There isn’t enough evidence to decide.",
  UNRESOLVED: "The execution outcome is unknown.",
};

export const ruleLabels: Record<string, string> = {
  LOT_SIZE:
    "Quantity is outside the allowed lot bounds or does not match the zero-origin step.",
  PRICE_FILTER:
    "Price is outside its allowed bounds or tick grid. Your price will not be changed.",
  MIN_NOTIONAL: "Price × quantity is below the required minimum notional.",
  NOTIONAL: "Price × quantity is outside the permitted notional interval.",
  QUOTE_NOTIONAL_CAP:
    "Price × quantity exceeds your quote-notional cap, excluding fees.",
};

export type InputResult = Record<string, unknown>;
