import { maxRational, minRational, Rational, ZERO } from "./exact";
import { isValidatedMetadata } from "./metadata";
import { deepFreeze, isTimestamp } from "./schema";
import type { DiagnosisRequest, DiagnosisResult, MetadataEvidence, Order, ResultState, SolveContext } from "./types";

export const PARTIAL_VALIDATION_WARNING = "Partial validation — exchange acceptance unknown." as const;
export const LIVE_METADATA_TTL_MS = 60_000;
export const DEFAULT_UNCHECKED = ["balances", "fees", "account_permissions", "account_filters", "dynamic_price_bounds", "historical_rejection_cause", "exchange_acceptance"] as const;

export function solveDiagnosis(input: DiagnosisRequest, evidence: MetadataEvidence | null | undefined, context: SolveContext): DiagnosisResult {
  const unchecked: string[] = [...DEFAULT_UNCHECKED];
  let passed: string[] = [];
  let failed: string[] = [];
  let extras: Partial<Pick<DiagnosisResult, "originalOrder" | "originalNotional" | "bounds" | "evidenceAgeMs">> = {};
  const result = (state: ResultState, code: string, explanation: string, proposal: Partial<Pick<DiagnosisResult, "patch" | "proposedOrder" | "proposedNotional">> = {}): DiagnosisResult => deepFreeze({ result: state, decisionCode: code, explanation, warning: PARTIAL_VALIDATION_WARNING, validation: { passed, failed, unchecked }, patch: [], ...extras, ...proposal });

  if (input.kind === "ambiguous_submission") return result("UNRESOLVED", "EXECUTION_UNKNOWN", "We cannot confirm whether this order executed. Do not resubmit based on this report. Imported status is contextual, not authoritative reconciliation.");
  extras = { originalOrder: input.order, originalNotional: Rational.decimal(input.order.price).multiply(Rational.decimal(input.order.quantity)).toDecimal() };
  if (input.observed.category === "UNKNOWN_EXECUTION") return result("UNRESOLVED", "EXECUTION_UNKNOWN", "The imported code can indicate an unknown execution outcome. We cannot confirm whether this order executed. Do not resubmit based on this report.");
  if (!evidence) return result("INCOMPLETE", "MISSING_EVIDENCE", "Required symbol metadata is missing. No proposal is available.");
  if (evidence.runId !== context.runId || evidence.mode !== context.mode || evidence.symbol !== input.order.symbol) return result("INCOMPLETE", "EVIDENCE_BINDING_MISMATCH", "Metadata does not belong to this run, mode, and symbol.");
  if (evidence.validationState !== "valid" || !isValidatedMetadata(evidence.metadata)) return result("INCOMPLETE", "INVALID_EVIDENCE", "Required metadata is blocked, malformed, or unsupported.");
  if (typeof evidence.id !== "string" || !evidence.id || evidence.id.length > 128 || typeof evidence.responseHash !== "string" || !/^[a-f0-9]{64}$/.test(evidence.responseHash) || !isTimestamp(evidence.receivedAt)) return result("INCOMPLETE", "INVALID_PROVENANCE", "Required metadata provenance is missing or malformed.");
  if (context.mode === "synthetic" && !evidence.fixtureVersion) return result("INCOMPLETE", "MISSING_FIXTURE_VERSION", "Synthetic metadata must identify its server-owned fixture version.");
  const age = context.nowMonotonicMs - evidence.receivedMonotonicMs;
  if (!Number.isFinite(age) || !Number.isFinite(evidence.receivedMonotonicMs) || evidence.receivedMonotonicMs < 0 || age < 0) return result("INCOMPLETE", "INVALID_EVIDENCE_AGE", "Metadata elapsed-time provenance is invalid.");
  extras = { ...extras, evidenceAgeMs: age };
  if (context.mode === "live_public" && age >= LIVE_METADATA_TTL_MS) return result("INCOMPLETE", "STALE_METADATA", "Live metadata is at least 60 seconds old. No proposal is available.");
  const metadata = evidence.metadata;
  if (metadata.symbol !== input.order.symbol) return result("INCOMPLETE", "EVIDENCE_BINDING_MISMATCH", "Metadata symbol does not match the immutable order.");
  unchecked.push(...metadata.uncheckedFilters.filter((item) => !unchecked.includes(item)));
  const p = Rational.decimal(input.order.price), q = Rational.decimal(input.order.quantity);
  const minPrice = Rational.decimal(metadata.price.minPrice), maxPrice = Rational.decimal(metadata.price.maxPrice), tick = Rational.decimal(metadata.price.tickSize);
  const priceValid = (minPrice.compare(ZERO) === 0 || p.compare(minPrice) >= 0) && (maxPrice.compare(ZERO) === 0 || p.compare(maxPrice) <= 0) && (tick.compare(ZERO) === 0 || p.isMultipleOf(tick));
  if (!priceValid) {
    failed = ["PRICE_FILTER"];
    return result("REFUSED", "PROTECTED_PRICE_INVALID", "The unchanged price violates PRICE_FILTER. Price is protected and will not be repaired.");
  }
  passed.push("PRICE_FILTER");
  const step = Rational.decimal(metadata.lot.stepSize), minQty = Rational.decimal(metadata.lot.minQty), maxQty = Rational.decimal(metadata.lot.maxQty);
  const minimums = metadata.minimumNotionals.map(Rational.decimal), maximums = metadata.maximumNotionals.map(Rational.decimal);
  const cap = "maxQuoteNotional" in input.intent ? Rational.decimal(input.intent.maxQuoteNotional) : undefined;
  const notional = p.multiply(q);
  const lotValid = q.isMultipleOf(step) && q.compare(minQty) >= 0 && q.compare(maxQty) <= 0;
  const minimumValid = minimums.every((minimum) => notional.compare(minimum) >= 0);
  const maximumValid = maximums.every((maximum) => notional.compare(maximum) <= 0);
  const capValid = !cap || notional.compare(cap) <= 0;
  const notionalFilters = metadata.checkedFilters.filter((filter) => filter === "MIN_NOTIONAL" || filter === "NOTIONAL");
  (lotValid ? passed : failed).push("LOT_SIZE");
  // Both filters intersect; report per-filter checks using their original ordering.
  let minimumIndex = 0;
  for (const filter of notionalFilters) {
    const valid = notional.compare(minimums[minimumIndex++]) >= 0 && (filter !== "NOTIONAL" || maximumValid);
    (valid ? passed : failed).push(filter);
  }
  if (cap) (capValid ? passed : failed).push("QUOTE_NOTIONAL_CAP");
  if (lotValid && minimumValid && maximumValid && capValid) return result("ALREADY_VALID", "LOCAL_RULES_SATISFIED", "The original order satisfies the checked local rules. This does not establish exchange acceptance or the historical cause of the imported rejection.");
  if (input.intent.quantityTolerance === "exact" || input.order.side === "SELL") return result("REFUSED_EXACT_TOLERANCE", "EXACT_QUANTITY_PROTECTED", "The original quantity fails checked local constraints. Exact-quantity intent forbids changing it.");
  const lower = maxRational(minQty, step, ...minimums.map((minimum) => minimum.divide(p))).ceilStep(step);
  const upper = minRational(maxQty, q, ...(cap ? [cap.divide(p)] : []), ...maximums.map((maximum) => maximum.divide(p))).floorStep(step);
  extras = { ...extras, bounds: { lowerQuantity: lower.toDecimal(), upperQuantity: upper.toDecimal() } };
  if (upper.compare(lower) < 0) return result("REFUSED", "EMPTY_FEASIBLE_INTERVAL", "The minimum legal grid quantity exceeds the maximum permitted downward quantity. No quantity-only proposal can satisfy the protected intent and quote-notional cap (fees excluded).");
  const quantity = upper.toDecimal();
  passed = [...metadata.checkedFilters, ...(cap ? ["QUOTE_NOTIONAL_CAP"] : [])];
  return result("REPAIR_PROPOSED", "LARGEST_LEGAL_DOWNWARD_QUANTITY", "The largest legal downward grid quantity satisfies the checked local rules and declared cap (fees excluded). Only quantity changes. Proposal, not submitted.", {
    patch: [{ op: "replace", path: "/order/quantity", from: input.order.quantity, value: quantity }],
    proposedOrder: { ...input.order, quantity },
    proposedNotional: p.multiply(upper).toDecimal(),
  });
}

/** Exportable data deliberately contains no identifiers or internal evidence tokens. */
export function exportSafeReport(report: DiagnosisResult): DiagnosisResult {
  const orderFields = (order: Order): Order => ({ symbol: order.symbol, side: order.side, type: order.type, timeInForce: order.timeInForce, price: order.price, quantity: order.quantity });
  return deepFreeze({
    result: report.result, decisionCode: report.decisionCode, explanation: report.explanation, warning: report.warning,
    validation: { passed: [...report.validation.passed], failed: [...report.validation.failed], unchecked: [...report.validation.unchecked] },
    patch: report.patch.map((patch) => ({ op: patch.op, path: patch.path, from: patch.from, value: patch.value })),
    ...(report.originalOrder ? { originalOrder: orderFields(report.originalOrder) } : {}),
    ...(report.proposedOrder ? { proposedOrder: orderFields(report.proposedOrder) } : {}),
    ...(report.originalNotional !== undefined ? { originalNotional: report.originalNotional } : {}),
    ...(report.proposedNotional !== undefined ? { proposedNotional: report.proposedNotional } : {}),
    ...(report.bounds ? { bounds: { lowerQuantity: report.bounds.lowerQuantity, upperQuantity: report.bounds.upperQuantity } } : {}),
    ...(report.evidenceAgeMs !== undefined ? { evidenceAgeMs: report.evidenceAgeMs } : {}),
  });
}
