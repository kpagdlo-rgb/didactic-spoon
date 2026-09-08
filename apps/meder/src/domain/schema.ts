import { isDecimal } from "./exact";
import { parseClosedJson } from "./json";
import type { DiagnosisRequest, ErrorCategory, ImportedStatus, Source } from "./types";

export const MAX_REQUEST_BYTES = 16 * 1024;
export class InputError extends Error {
  readonly status: 400 | 413;
  readonly code: "INVALID_REQUEST" | "REQUEST_TOO_LARGE";
  constructor(oversize = false) {
    super(oversize ? "Request exceeds 16 KiB." : "Request does not match the supported closed schema.");
    this.name = "InputError";
    this.status = oversize ? 413 : 400;
    this.code = oversize ? "REQUEST_TOO_LARGE" : "INVALID_REQUEST";
  }
}

export function fail(): never { throw new InputError(); }
export function closed(value: unknown, required: readonly string[], optional: readonly string[] = []): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail();
  const object = value as Record<string, unknown>;
  if (Reflect.ownKeys(object).some((key) => typeof key !== "string" || ![...required, ...optional].includes(key))) fail();
  if (required.some((key) => !Object.hasOwn(object, key))) fail();
  if (Object.values(Object.getOwnPropertyDescriptors(object)).some((descriptor) => !Object.hasOwn(descriptor, "value"))) fail();
  return object;
}

export function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const item of Object.values(value)) deepFreeze(item);
    Object.freeze(value);
  }
  return value;
}

export function isSymbol(value: unknown): value is string { return typeof value === "string" && /^[A-Z0-9]{2,20}$/.test(value); }
function source(value: unknown): Source { if (value !== "synthetic_fixture" && value !== "redacted_import") fail(); return value; }
function decimal(value: unknown, positive = false): string { if (!isDecimal(value, positive)) fail(); return value; }

function credentialLike(value: string): boolean {
  return /(?:api[\s_-]*key|api[\s_-]*secret|secret[\s_-]*key|authorization|signature|private[\s_-]*key|password|access[\s_-]*token|bearer\s+|-----BEGIN)/i.test(value)
    || /[A-Za-z0-9_+/=-]{48,}/.test(value);
}

function category(message: string, code: string): ErrorCategory {
  if (code === "-1007" || code === "-1006") return "UNKNOWN_EXECUTION";
  for (const name of ["LOT_SIZE", "PRICE_FILTER", "MIN_NOTIONAL", "NOTIONAL"] as const) {
    if (new RegExp(`\\b${name}\\b`).test(message)) return name;
  }
  return "OTHER";
}

export function isTimestamp(value: unknown): value is string {
  if (typeof value !== "string" || value.length > 35 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return false;
  const parts = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|([+-])(\d{2}):(\d{2}))$/.exec(value)!;
  const [, y, m, d, h, minute, second, zone, , zh, zm] = parts;
  const year = Number(y), month = Number(m), day = Number(d);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
    && Number(h) <= 23 && Number(minute) <= 59 && Number(second) <= 59
    && (zone === "Z" || (Number(zh) <= 23 && Number(zm) <= 59)) && Number.isFinite(Date.parse(value));
}

/** Raw rejection messages are discarded here, before persistence or model use. */
export function validateDiagnosisRequest(value: unknown): DiagnosisRequest {
  const discriminant = closed(value, ["kind"], ["order", "observed", "intent", "source", "identifier", "importedStatus"]);
  if (discriminant.kind === "rejection") {
    const input = closed(value, ["kind", "order", "observed", "intent"]);
    const order = closed(input.order, ["symbol", "side", "type", "timeInForce", "price", "quantity"]);
    if (!isSymbol(order.symbol) || !["BUY", "SELL"].includes(order.side as string) || order.type !== "LIMIT" || order.timeInForce !== "GTC") fail();
    const observed = closed(input.observed, ["source", "code"], ["message"]);
    if (typeof observed.code !== "string" || !/^-?[0-9]{1,8}$/.test(observed.code)) fail();
    const message = Object.hasOwn(observed, "message") ? observed.message : "";
    if (typeof message !== "string" || message.length > 512 || credentialLike(message)) fail();
    const code = BigInt(observed.code).toString();
    const intent = closed(input.intent, order.side === "BUY" ? ["quantityTolerance", "maxQuoteNotional", "priceTolerance"] : ["quantityTolerance", "priceTolerance"]);
    if (intent.priceTolerance !== "exact" || !["exact", "allow_all_downward"].includes(intent.quantityTolerance as string) || (order.side === "SELL" && intent.quantityTolerance !== "exact")) fail();
    return deepFreeze({
      kind: "rejection",
      order: { symbol: order.symbol, side: order.side as "BUY" | "SELL", type: "LIMIT", timeInForce: "GTC", price: decimal(order.price, true), quantity: decimal(order.quantity, true) },
      observed: { source: source(observed.source), code, category: category(message, code) },
      intent: order.side === "BUY" ? { quantityTolerance: intent.quantityTolerance as "exact" | "allow_all_downward", maxQuoteNotional: decimal(intent.maxQuoteNotional), priceTolerance: "exact" } : { quantityTolerance: "exact", priceTolerance: "exact" },
    });
  }
  if (discriminant.kind === "ambiguous_submission") {
    const input = closed(value, ["kind", "source", "identifier"], ["importedStatus"]);
    const id = closed(input.identifier, [], ["exchangeOrderId", "clientOrderId"]);
    if (Object.keys(id).length !== 1) fail();
    let identifier: { exchangeOrderId: string } | { clientOrderId: string };
    if (Object.hasOwn(id, "exchangeOrderId")) {
      if (typeof id.exchangeOrderId !== "string" || !/^[1-9][0-9]{0,19}$/.test(id.exchangeOrderId)) fail();
      identifier = { exchangeOrderId: id.exchangeOrderId };
    } else {
      if (typeof id.clientOrderId !== "string" || !/^[A-Za-z0-9_-]{1,36}$/.test(id.clientOrderId)) fail();
      identifier = { clientOrderId: id.clientOrderId };
    }
    const normalized = { kind: "ambiguous_submission" as const, source: source(input.source), identifier };
    if (!Object.hasOwn(input, "importedStatus")) return deepFreeze(normalized);
    const status = closed(input.importedStatus, ["status", "source", "observedAt"]);
    if (!["NEW", "PARTIALLY_FILLED", "FILLED", "CANCELED", "REJECTED", "EXPIRED", "PENDING_CANCEL", "UNKNOWN"].includes(status.status as string) || !isTimestamp(status.observedAt)) fail();
    return deepFreeze({ ...normalized, importedStatus: { status: status.status as ImportedStatus, source: source(status.source), observedAt: status.observedAt } });
  }
  return fail();
}

export function parseDiagnosisJson(body: string | Uint8Array): DiagnosisRequest {
  const bytes = typeof body === "string" ? new TextEncoder().encode(body) : body;
  if (bytes.byteLength > MAX_REQUEST_BYTES) throw new InputError(true);
  let value: unknown;
  try { value = parseClosedJson(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { throw new InputError(); }
  return validateDiagnosisRequest(value);
}
