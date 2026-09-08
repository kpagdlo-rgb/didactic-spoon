export type Mode = "synthetic" | "live_public";
export type Source = "synthetic_fixture" | "redacted_import";
export type ResultState =
  | "ALREADY_VALID"
  | "REPAIR_PROPOSED"
  | "REFUSED_EXACT_TOLERANCE"
  | "REFUSED"
  | "INCOMPLETE"
  | "UNRESOLVED";

export interface Order {
  readonly symbol: string;
  readonly side: "BUY" | "SELL";
  readonly type: "LIMIT";
  readonly timeInForce: "GTC";
  readonly price: string;
  readonly quantity: string;
}

export type Intent =
  | { readonly quantityTolerance: "exact" | "allow_all_downward"; readonly maxQuoteNotional: string; readonly priceTolerance: "exact" }
  | { readonly quantityTolerance: "exact"; readonly priceTolerance: "exact" };

export type ErrorCategory = "LOT_SIZE" | "PRICE_FILTER" | "MIN_NOTIONAL" | "NOTIONAL" | "UNKNOWN_EXECUTION" | "OTHER";
export interface RejectionRequest {
  readonly kind: "rejection";
  readonly order: Order;
  readonly observed: { readonly source: Source; readonly code: string; readonly category: ErrorCategory };
  readonly intent: Intent;
}

export type ImportedStatus = "NEW" | "PARTIALLY_FILLED" | "FILLED" | "CANCELED" | "REJECTED" | "EXPIRED" | "PENDING_CANCEL" | "UNKNOWN";
export interface AmbiguousRequest {
  readonly kind: "ambiguous_submission";
  readonly source: Source;
  readonly identifier: { readonly exchangeOrderId: string } | { readonly clientOrderId: string };
  readonly importedStatus?: { readonly status: ImportedStatus; readonly source: Source; readonly observedAt: string };
}
export type DiagnosisRequest = RejectionRequest | AmbiguousRequest;

export interface SymbolMetadata {
  readonly symbol: string;
  readonly status: "TRADING";
  readonly price: { readonly minPrice: string; readonly maxPrice: string; readonly tickSize: string };
  readonly lot: { readonly minQty: string; readonly maxQty: string; readonly stepSize: string };
  readonly minimumNotionals: readonly string[];
  readonly maximumNotionals: readonly string[];
  readonly checkedFilters: readonly string[];
  readonly uncheckedFilters: readonly string[];
}

export interface MetadataEvidence {
  readonly id: string;
  readonly runId: string;
  readonly mode: Mode;
  readonly symbol: string;
  readonly receivedAt: string;
  readonly receivedMonotonicMs: number;
  readonly responseHash: string;
  readonly validationState: "valid" | "invalid" | "blocked" | "unsupported";
  readonly fixtureVersion?: string;
  readonly metadata?: SymbolMetadata;
}

export interface SolveContext {
  readonly runId: string;
  readonly mode: Mode;
  readonly nowMonotonicMs: number;
}

export interface QuantityPatch {
  readonly op: "replace";
  readonly path: "/order/quantity";
  readonly from: string;
  readonly value: string;
}

export interface DiagnosisResult {
  readonly result: ResultState;
  readonly decisionCode: string;
  readonly explanation: string;
  readonly warning: "Partial validation — exchange acceptance unknown.";
  readonly validation: {
    readonly passed: readonly string[];
    readonly failed: readonly string[];
    readonly unchecked: readonly string[];
  };
  readonly patch: readonly QuantityPatch[];
  readonly originalOrder?: Order;
  readonly proposedOrder?: Order;
  readonly originalNotional?: string;
  readonly proposedNotional?: string;
  readonly bounds?: { readonly lowerQuantity: string; readonly upperQuantity: string };
  readonly evidenceAgeMs?: number;
}
