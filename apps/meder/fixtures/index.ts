import { createHash, randomUUID } from "node:crypto";
import { deepFreeze, validateDiagnosisRequest } from "../src/domain/schema";
import { validateSymbolMetadata } from "../src/domain/metadata";
import type { DiagnosisRequest, MetadataEvidence, Order, SymbolMetadata } from "../src/domain/types";

export const FIXTURE_VERSION = "meder-synthetic-v1";
export const FIXTURE_IDS = ["repairable", "budget_refusal", "ambiguous", "off_grid_min"] as const;
export type FixtureId = typeof FIXTURE_IDS[number];

const order = { symbol: "ABCUSDT", side: "BUY", type: "LIMIT", timeInForce: "GTC", price: "100", quantity: "0.00123" } satisfies Order;
function rejection(quantity: string, cap: string) {
  return { kind: "rejection", order: { ...order, quantity }, observed: { source: "synthetic_fixture", code: "-1013", message: "Filter failure: LOT_SIZE" }, intent: { quantityTolerance: "allow_all_downward", maxQuoteNotional: cap, priceTolerance: "exact" } };
}
function metadata(minQty: string, minNotional: string) {
  return {
    symbol: "ABCUSDT", status: "TRADING", orderTypes: ["LIMIT"], timeInForce: ["GTC"], isSpotTradingAllowed: true,
    filters: [
      { filterType: "PRICE_FILTER", minPrice: "0.01", maxPrice: "1000000", tickSize: "0.01" },
      { filterType: "LOT_SIZE", minQty, maxQty: "100", stepSize: "0.001" },
      { filterType: "MIN_NOTIONAL", minNotional, applyToMarket: false, avgPriceMins: 5 },
    ],
  };
}

export const FIXTURE_CATALOG = deepFreeze({
  repairable: { label: "Quantity repair", description: "Synthetic lot-step mismatch; propose 0.001 without changing price.", rawRequest: rejection("0.00123", "0.123"), rawMetadata: metadata("0.001", "0.10") },
  budget_refusal: { label: "Budget refusal", description: "Synthetic minimum requires 0.100, but the cap permits only 0.099.", rawRequest: rejection("0.100", "9.99"), rawMetadata: metadata("0.001", "10") },
  ambiguous: { label: "Unknown execution", description: "Synthetic lost response; no authoritative lookup and no retry.", rawRequest: { kind: "ambiguous_submission", source: "synthetic_fixture", identifier: { clientOrderId: "synthetic-lost-response" }, importedStatus: { status: "UNKNOWN", source: "synthetic_fixture", observedAt: "2026-09-08T21:00:00Z" } }, rawMetadata: undefined },
  off_grid_min: { label: "Zero-origin grid regression", description: "Synthetic minQty is off-grid; the correct proposal is 0.002.", rawRequest: rejection("0.0022", "1"), rawMetadata: metadata("0.0015", "0.10") },
});

export interface SyntheticFixture {
  readonly id: FixtureId;
  readonly version: typeof FIXTURE_VERSION;
  readonly label: string;
  readonly description: string;
  readonly request: DiagnosisRequest;
  readonly rawRequest: unknown;
  readonly rawMetadata: unknown;
  readonly metadata?: SymbolMetadata;
}

export function isFixtureId(value: unknown): value is FixtureId { return typeof value === "string" && (FIXTURE_IDS as readonly string[]).includes(value); }

/** Controller-only loader; never expose this function as a planner capability. */
export function loadFixture(id: FixtureId): SyntheticFixture {
  if (!isFixtureId(id)) throw new Error("Unknown synthetic fixture");
  const fixture = FIXTURE_CATALOG[id];
  return deepFreeze({ id, version: FIXTURE_VERSION, ...fixture, request: validateDiagnosisRequest(fixture.rawRequest), ...(fixture.rawMetadata ? { metadata: validateSymbolMetadata(fixture.rawMetadata, "ABCUSDT") } : {}) });
}

export function createFixtureEvidence(id: FixtureId, runId: string, clock: { receivedAt: string; receivedMonotonicMs: number } = { receivedAt: new Date().toISOString(), receivedMonotonicMs: performance.now() }): MetadataEvidence | undefined {
  const fixture = loadFixture(id);
  if (!fixture.metadata) return undefined;
  return deepFreeze({
    id: randomUUID(), runId, mode: "synthetic", symbol: fixture.metadata.symbol,
    receivedAt: clock.receivedAt, receivedMonotonicMs: clock.receivedMonotonicMs,
    responseHash: createHash("sha256").update(JSON.stringify({ version: FIXTURE_VERSION, metadata: fixture.rawMetadata })).digest("hex"),
    validationState: "valid", fixtureVersion: FIXTURE_VERSION, metadata: fixture.metadata,
  });
}
