# Meder domain integration

The public entry point is `src/domain/index.ts`; there are no runtime dependencies or network calls in the domain.

```ts
validateDiagnosisRequest(raw: unknown): DiagnosisRequest
parseDiagnosisJson(body: string | Uint8Array): DiagnosisRequest
validateSymbolMetadata(raw: unknown, expectedSymbol: string): SymbolMetadata
solveDiagnosis(input: DiagnosisRequest, evidence: MetadataEvidence | null | undefined,
  context: { runId: string; mode: 'synthetic' | 'live_public'; nowMonotonicMs: number }): DiagnosisResult
```

`InputError` has a safe `message`, `code`, and `status` (400 or 413). Parsing strips the rejection message and retains only a numeric code and safe category. Never pass normalized requests back through the raw-input parser: normalized observed evidence has `category`, not `message`.

The byte parsers also reject duplicate JSON keys (including escaped aliases) and nesting beyond 32 levels. Use them at raw-body boundaries; validating an already parsed object cannot recover duplicate keys discarded by another JSON parser. Numeric rejection codes are canonicalized before classifying unknown execution, so leading zeros cannot turn timeout evidence into a repair proposal.

`fixtures/index.ts` is **server-only** (uses `node:crypto`). It exports `FIXTURE_IDS`, `FIXTURE_CATALOG`, `isFixtureId`, `loadFixture(id)`, and `createFixtureEvidence(id, runId, { receivedAt, receivedMonotonicMs })`. Fixture IDs are `repairable`, `budget_refusal`, `ambiguous`, and `off_grid_min`. `loadFixture` returns `{ id, version, label, description, rawRequest, rawMetadata, request, metadata? }`. `request` is already normalized; `metadata` is absent for ambiguity. `createFixtureEvidence` returns `MetadataEvidence | undefined`. Load fixture metadata on the controller, not from a planner-provided payload.

`MetadataEvidence` requires `id`, `runId`, `mode`, `symbol`, ISO `receivedAt`, `receivedMonotonicMs`, lowercase SHA-256 `responseHash`, `validationState: 'valid'`, `metadata`, and (for synthetic runs) `fixtureVersion`. Invalid states `invalid | blocked | unsupported` produce `INCOMPLETE`. Metadata returned by `validateSymbolMetadata` is deeply frozen and identity-tracked: keep that object, do not JSON/structured-clone it and assume it remains validated. Revalidate the raw record after persistence if necessary. Run/session ownership is the server gateway's responsibility; the solver additionally enforces run/mode/symbol binding and the 60-second monotonic live TTL.

Results contain `result`, `decisionCode`, `explanation`, `warning`, `validation`, `patch`, and where relevant `originalOrder`, `proposedOrder`, `originalNotional`, `proposedNotional`, `bounds`, `evidenceAgeMs`. `patch` is empty unless `REPAIR_PROPOSED`; no report contains raw rejection messages or order identifiers. Canonical exact decimals may omit trailing zeros (`0.100` is returned as `0.1`), while protected input fields preserve their original strings. Ambiguous input always returns `UNRESOLVED` without requiring metadata.

Run the unit suite with `npx tsx --test tests/domain.test.ts` from `apps/meder` (use the installed lockfile version).
