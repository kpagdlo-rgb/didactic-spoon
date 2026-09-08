import { isDecimal, maxRational, minRational, Rational, ZERO } from "./exact";
import { parseClosedJson } from "./json";
import { closed, deepFreeze, isSymbol } from "./schema";
import type { SymbolMetadata } from "./types";

export const MAX_METADATA_BYTES = 1024 * 1024;
export const MAX_FILTERS = 100;
export class MetadataError extends Error {
  constructor(readonly code: "MALFORMED_METADATA" | "MISSING_FILTER" | "UNSUPPORTED_FILTER" | "WRONG_SYMBOL" | "SYMBOL_NOT_TRADING" | "UNSUPPORTED_CAPABILITY" | "CONTRADICTORY_FILTERS" | "UNSUPPORTED_STEP" | "METADATA_TOO_LARGE") {
    super(code);
    this.name = "MetadataError";
  }
}

const validated = new WeakSet<object>();
export function isValidatedMetadata(value: unknown): value is SymbolMetadata { return !!value && typeof value === "object" && validated.has(value); }
function invalid(code: ConstructorParameters<typeof MetadataError>[0] = "MALFORMED_METADATA"): never { throw new MetadataError(code); }
function decimal(value: unknown): string { if (!isDecimal(value)) invalid(); return value; }
function booleanOptional(filter: Record<string, unknown>, key: string): void {
  if (Object.hasOwn(filter, key) && typeof filter[key] !== "boolean") invalid();
}
function integerOptional(filter: Record<string, unknown>, key: string): void {
  if (Object.hasOwn(filter, key) && (!Number.isSafeInteger(filter[key]) || (filter[key] as number) < 0)) invalid();
}
function supportedCapability(value: unknown, required: string): void {
  if (!Array.isArray(value) || !value.length || value.length > 100 || value.some((item) => typeof item !== "string" || !/^[A-Z_]{1,32}$/.test(item)) || new Set(value).size !== value.length) invalid();
  if (!value.includes(required)) invalid("UNSUPPORTED_CAPABILITY");
}

const nonlocalFields: Record<string, { decimals?: string[]; integers?: string[] }> = {
  PERCENT_PRICE: { decimals: ["multiplierUp", "multiplierDown"], integers: ["avgPriceMins"] },
  PERCENT_PRICE_BY_SIDE: { decimals: ["bidMultiplierUp", "bidMultiplierDown", "askMultiplierUp", "askMultiplierDown"], integers: ["avgPriceMins"] },
  MAX_NUM_ORDERS: { integers: ["maxNumOrders"] },
  MAX_NUM_ALGO_ORDERS: { integers: ["maxNumAlgoOrders"] },
  MAX_NUM_ICEBERG_ORDERS: { integers: ["maxNumIcebergOrders"] },
  MAX_POSITION: { decimals: ["maxPosition"] },
  ICEBERG_PARTS: { integers: ["limit"] },
  TRAILING_DELTA: { integers: ["minTrailingAboveDelta", "maxTrailingAboveDelta", "minTrailingBelowDelta", "maxTrailingBelowDelta"] },
  MARKET_LOT_SIZE: { decimals: ["minQty", "maxQty", "stepSize"] },
};

/** Accepts a bounded symbol record, not arbitrary exchange response fields. */
export function validateSymbolMetadata(value: unknown, expectedSymbol: string): SymbolMetadata {
  try {
    if (!isSymbol(expectedSymbol)) invalid("WRONG_SYMBOL");
    const input = closed(value, ["symbol", "status", "filters"], ["orderTypes", "timeInForce", "isSpotTradingAllowed"]);
    if (!isSymbol(input.symbol) || input.symbol !== expectedSymbol) invalid("WRONG_SYMBOL");
    if (input.status !== "TRADING") invalid("SYMBOL_NOT_TRADING");
    if (Object.hasOwn(input, "orderTypes")) supportedCapability(input.orderTypes, "LIMIT");
    if (Object.hasOwn(input, "timeInForce")) supportedCapability(input.timeInForce, "GTC");
    if (Object.hasOwn(input, "isSpotTradingAllowed") && input.isSpotTradingAllowed !== true) invalid("UNSUPPORTED_CAPABILITY");
    if (!Array.isArray(input.filters) || input.filters.length > MAX_FILTERS) invalid();
    let price: SymbolMetadata["price"] | undefined;
    let lot: SymbolMetadata["lot"] | undefined;
    const minimumNotionals: string[] = [], maximumNotionals: string[] = [], checkedFilters: string[] = [], uncheckedFilters: string[] = [];
    const seen = new Set<string>();
    for (const value of input.filters) {
      if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
      const type: unknown = Object.getOwnPropertyDescriptor(value, "filterType")?.value;
      if (typeof type !== "string" || seen.has(type)) invalid();
      seen.add(type);
      if (type === "PRICE_FILTER") {
        const f = closed(value, ["filterType", "minPrice", "maxPrice", "tickSize"]);
        price = { minPrice: decimal(f.minPrice), maxPrice: decimal(f.maxPrice), tickSize: decimal(f.tickSize) };
        if (Rational.decimal(price.minPrice).compare(ZERO) > 0 && Rational.decimal(price.maxPrice).compare(ZERO) > 0 && Rational.decimal(price.minPrice).compare(Rational.decimal(price.maxPrice)) > 0) invalid("CONTRADICTORY_FILTERS");
        checkedFilters.push(type);
      } else if (type === "LOT_SIZE") {
        const f = closed(value, ["filterType", "minQty", "maxQty", "stepSize"]);
        lot = { minQty: decimal(f.minQty), maxQty: decimal(f.maxQty), stepSize: decimal(f.stepSize) };
        if (Rational.decimal(lot.stepSize).compare(ZERO) === 0) invalid("UNSUPPORTED_STEP");
        if (Rational.decimal(lot.minQty).compare(Rational.decimal(lot.maxQty)) > 0) invalid("CONTRADICTORY_FILTERS");
        checkedFilters.push(type);
      } else if (type === "MIN_NOTIONAL") {
        const f = closed(value, ["filterType", "minNotional"], ["applyToMarket", "avgPriceMins"]);
        booleanOptional(f, "applyToMarket"); integerOptional(f, "avgPriceMins");
        minimumNotionals.push(decimal(f.minNotional));
        checkedFilters.push(type);
      } else if (type === "NOTIONAL") {
        const f = closed(value, ["filterType", "minNotional", "maxNotional"], ["applyMinToMarket", "applyMaxToMarket", "avgPriceMins"]);
        booleanOptional(f, "applyMinToMarket"); booleanOptional(f, "applyMaxToMarket"); integerOptional(f, "avgPriceMins");
        minimumNotionals.push(decimal(f.minNotional)); maximumNotionals.push(decimal(f.maxNotional));
        checkedFilters.push(type);
      } else if (Object.hasOwn(nonlocalFields, type)) {
        const fields = nonlocalFields[type];
        const f = closed(value, ["filterType", ...(fields.decimals ?? []), ...(fields.integers ?? [])]);
        for (const key of fields.decimals ?? []) decimal(f[key]);
        for (const key of fields.integers ?? []) integerOptional(f, key);
        if (type !== "MARKET_LOT_SIZE") uncheckedFilters.push(type);
      } else invalid("UNSUPPORTED_FILTER");
    }
    if (!price || !lot || minimumNotionals.length === 0) invalid("MISSING_FILTER");
    if (maximumNotionals.length && maxRational(...minimumNotionals.map(Rational.decimal)).compare(minRational(...maximumNotionals.map(Rational.decimal))) > 0) invalid("CONTRADICTORY_FILTERS");
    const metadata = deepFreeze({ symbol: input.symbol, status: "TRADING" as const, price, lot, minimumNotionals, maximumNotionals, checkedFilters, uncheckedFilters });
    validated.add(metadata);
    return metadata;
  } catch (error) {
    if (error instanceof MetadataError) throw error;
    throw new MetadataError("MALFORMED_METADATA");
  }
}

export function parseMetadataJson(body: string | Uint8Array, expectedSymbol: string): SymbolMetadata {
  const bytes = typeof body === "string" ? new TextEncoder().encode(body) : body;
  if (bytes.byteLength > MAX_METADATA_BYTES) invalid("METADATA_TOO_LARGE");
  let value: unknown;
  try { value = parseClosedJson(new TextDecoder("utf-8", { fatal: true }).decode(bytes)); }
  catch { return invalid(); }
  return validateSymbolMetadata(value, expectedSymbol);
}
