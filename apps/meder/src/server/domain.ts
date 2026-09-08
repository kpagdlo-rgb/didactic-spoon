import { loadFixture, isFixtureId, FIXTURE_VERSION } from '../../fixtures';
import { validateDiagnosisRequest, solveDiagnosis } from '../domain';
import type { DiagnosisRequest, DiagnosisResult, SymbolMetadata, MetadataEvidence } from '../domain';
import { SafeError } from './safety';

export type Input = DiagnosisRequest;
export type Result = DiagnosisResult;
export type Metadata = SymbolMetadata;
export { FIXTURE_VERSION };
export function parseInput(value: unknown): Input {
  try { return validateDiagnosisRequest(value); }
  catch { throw new SafeError('INVALID_REQUEST'); }
}
export function getFixture(id: unknown) {
  if (id === 'repairable_quantity') id = 'repairable';
  if (id === 'ambiguous_submission') id = 'ambiguous';
  if (!isFixtureId(id)) throw new SafeError('INVALID_REQUEST');
  return loadFixture(id);
}
export function solve(input: Input, evidence: MetadataEvidence | undefined, id: string, now: number) {
  return solveDiagnosis(input, evidence, { runId: id, mode: 'synthetic', nowMonotonicMs: now });
}

export function providerInput(input: Input) {
  if (input.kind === 'ambiguous_submission') return { kind: input.kind };
  return { kind: input.kind, order: input.order, intent: input.intent, reportedErrorCategory: input.observed.category };
}
