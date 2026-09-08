import assert from "node:assert/strict";
import test from "node:test";
import { createFixtureEvidence, FIXTURE_CATALOG, loadFixture } from "../fixtures";
import { exportSafeReport, InputError, MetadataError, parseDiagnosisJson, parseMetadataJson, Rational, solveDiagnosis, validateDiagnosisRequest, validateSymbolMetadata } from "../src/domain";
import { parseClosedJson } from "../src/domain/json";
import type { DiagnosisResult, MetadataEvidence } from "../src/domain";

const context = { runId: "hardening", mode: "synthetic" as const, nowMonotonicMs: 100 };
const baseEvidence = () => createFixtureEvidence("repairable", context.runId, { receivedAt: "2026-09-08T21:00:00Z", receivedMonotonicMs: 0 })!;
const request = () => structuredClone(FIXTURE_CATALOG.repairable.rawRequest);

test("optional rejection text rejects explicit null instead of silently treating it as absent", () => {
  assert.throws(() => validateDiagnosisRequest({ ...request(), observed: { source: "redacted_import", code: "-1013", message: null } }), InputError);
  assert.equal(validateDiagnosisRequest({ ...request(), observed: { source: "redacted_import", code: "-1013" } }).kind, "rejection");
});

test("leading-zero unknown-execution codes cannot become actionable rejections", () => {
  for (const code of ["-01006", "-00001007"]) {
    const raw = request(); raw.observed.code = code;
    const input = validateDiagnosisRequest(raw);
    assert.equal(input.kind === "rejection" && input.observed.code, BigInt(code).toString());
    const result = solveDiagnosis(input, baseEvidence(), context);
    assert.equal(result.result, "UNRESOLVED");
    assert.deepEqual(result.patch, []);
  }
});

test("request byte parser rejects duplicate keys at all financial boundaries", () => {
  const body = JSON.stringify(request());
  const cases = [
    body.replace('"kind":"rejection"', '"kind":"ambiguous_submission","kind":"rejection"'),
    body.replace('"quantity":"0.00123"', '"quantity":"0.2","quantity":"0.00123"'),
    body.replace('"price":"100"', '"price":"1","pr\\u0069ce":"100"'),
    body.replace('"maxQuoteNotional":"0.123"', '"maxQuoteNotional":"0","maxQuoteNotional":"0.123"'),
    body.replace('"code":"-1013"', '"code":"-1007","code":"-1013"'),
  ];
  for (const raw of cases) assert.throws(() => parseDiagnosisJson(raw), InputError);
});

test("strict JSON scanner handles escaped strings, arrays, separate key scopes and depth bounds", () => {
  const value = { a: [{ b: 'colon: quote" slash\\ braces{},[]', c: "\n" }, { b: 2 }], "": { "": true } };
  assert.deepEqual(parseClosedJson(JSON.stringify(value)), value);
  assert.throws(() => parseClosedJson('{"x":{"secret":1,"secr\\u0065t":2}}'), /Duplicate JSON object key/);
  assert.throws(() => parseClosedJson("[".repeat(33) + "0" + "]".repeat(33)), /nesting/);
  assert.doesNotThrow(() => parseClosedJson("[".repeat(32) + "0" + "]".repeat(32)));
});

test("metadata byte parser rejects duplicate filter parameters and excessive nesting", () => {
  const body = JSON.stringify(FIXTURE_CATALOG.repairable.rawMetadata);
  assert.throws(() => parseMetadataJson(body.replace('"stepSize":"0.001"', '"stepSize":"0","stepSize":"0.001"'), "ABCUSDT"), MetadataError);
  assert.throws(() => parseMetadataJson("[".repeat(100) + "0" + "]".repeat(100), "ABCUSDT"), MetadataError);
});

test("metadata provenance requires a real calendar timestamp and bounded string identity", () => {
  for (const receivedAt of ["1", "2026-09-08", "2026-02-30T00:00:00Z", "2026-09-08T25:00:00Z"]) {
    const result = solveDiagnosis(loadFixture("repairable").request, { ...baseEvidence(), receivedAt }, context);
    assert.equal(result.result, "INCOMPLETE");
    assert.equal(result.decisionCode, "INVALID_PROVENANCE");
    assert.deepEqual(result.patch, []);
  }
  for (const id of [0, 1, null, {}, "x".repeat(129)]) {
    const result = solveDiagnosis(loadFixture("repairable").request, { ...baseEvidence(), id } as MetadataEvidence, context);
    assert.equal(result.result, "INCOMPLETE");
  }
});

test("safe export allowlists nested fields even when an internal report gains additional data", () => {
  const report = solveDiagnosis(loadFixture("repairable").request, baseEvidence(), context);
  const augmented = {
    ...report, evidenceId: "sensitive-token",
    originalOrder: { ...report.originalOrder!, clientOrderId: "sensitive-identifier" },
    proposedOrder: { ...report.proposedOrder!, apiKey: "sensitive-credential" },
    bounds: { ...report.bounds!, runId: "sensitive-run" },
  } as DiagnosisResult;
  const exported = exportSafeReport(augmented);
  assert.equal(JSON.stringify(exported).includes("sensitive"), false);
  assert.deepEqual(exported, report);
});

test("fractional property sweep matches a BigInt exhaustive oracle and never rounds upward", () => {
  const decimal = (units: number | bigint, scale: bigint) => new Rational(BigInt(units), scale).toDecimal();
  for (let seed = 1; seed <= 400; seed++) {
    const price = BigInt(seed % 17 + 1), quantity = BigInt(seed * 13 % 60 + 1), step = BigInt(seed % 7 + 1);
    const minimum = BigInt(seed * 3 % 20), maximum = minimum + BigInt(seed * 11 % 30);
    const cap = BigInt(seed * 19 % 300), minNotional = BigInt(seed * 7 % 80), maxNotional = minNotional + BigInt(seed * 23 % 150);
    const raw = request();
    raw.order.price = decimal(price, 100n); raw.order.quantity = decimal(quantity, 1000n); raw.intent.maxQuoteNotional = decimal(cap, 100_000n);
    const metadata = validateSymbolMetadata({ symbol: "ABCUSDT", status: "TRADING", filters: [
      { filterType: "PRICE_FILTER", minPrice: "0", maxPrice: "0", tickSize: "0.01" },
      { filterType: "LOT_SIZE", minQty: decimal(minimum, 1000n), maxQty: decimal(maximum, 1000n), stepSize: decimal(step, 1000n) },
      { filterType: "NOTIONAL", minNotional: decimal(minNotional, 100_000n), maxNotional: decimal(maxNotional, 100_000n) },
    ] }, "ABCUSDT");
    let best: bigint | undefined;
    for (let candidate = 1n; candidate <= quantity; candidate++) {
      const notional = price * candidate;
      if (candidate % step === 0n && candidate >= minimum && candidate <= maximum && notional >= minNotional && notional <= maxNotional && notional <= cap) best = candidate;
    }
    const report = solveDiagnosis(validateDiagnosisRequest(raw), { ...baseEvidence(), metadata }, context);
    if (best === undefined) assert.equal(report.result, "REFUSED", `seed ${seed}`);
    else if (best === quantity) assert.equal(report.result, "ALREADY_VALID", `seed ${seed}`);
    else {
      assert.equal(report.result, "REPAIR_PROPOSED", `seed ${seed}`);
      assert.equal(report.proposedOrder?.quantity, decimal(best, 1000n), `seed ${seed}`);
      assert.deepEqual({ ...report.proposedOrder, quantity: raw.order.quantity }, raw.order);
      assert.equal(report.proposedNotional, decimal(price * best, 100_000n));
    }
  }
});
