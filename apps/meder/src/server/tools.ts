import { getFixture, solve } from './domain';
import { RunStore } from './run-store';
import { closed, SafeError } from './safety';

const schema = (properties: Record<string, unknown>) => ({ type: 'object', properties, required: Object.keys(properties), additionalProperties: false });
const string = { type: 'string' };
export const TOOLS = Object.freeze([
  { type: 'function', name: 'getServerTime', description: 'Read a fixed synthetic fixture clock observation. It does not establish metadata freshness.', strict: true, parameters: schema({}) },
  { type: 'function', name: 'getSymbolMetadata', description: 'Read controller-owned synthetic metadata for the immutable run symbol.', strict: true, parameters: schema({ symbol: string }) },
  { type: 'function', name: 'validateAndPatch', description: 'Obtain the sole authoritative solver verdict for this diagnosis and its metadata evidence ID. For ambiguous_submission only, pass an empty metadataEvidenceId; no metadata read or retry is needed.', strict: true, parameters: schema({ diagnosisId: string, metadataEvidenceId: string }) },
]);

export function dispatchTool(store: RunStore, owner: string, id: string, name: string, args: unknown) {
  store.consumeTool(owner, id);
  const context = store.context(owner, id);
  try {
    if (name === 'getServerTime') {
      closed(args, []);
      const value = { fixtureTime: Date.parse('2026-09-08T21:00:00Z') };
      const evidence = store.addEvidence(owner, id, 'server_time', Object.freeze(value));
      store.record(owner, id, name, 'SYNTHETIC_TIME', evidence.id);
      return { evidence, ...value };
    }
    if (name === 'getSymbolMetadata') {
      closed(args, ['symbol']);
      if (args.symbol !== context.symbol) throw new SafeError('TOOL_DENIED');
      const fixture = getFixture(context.fixtureId);
      if (!fixture.metadata || fixture.metadata.symbol !== context.symbol) throw new SafeError('INVALID_EVIDENCE');
      const evidence = store.addEvidence(owner, id, 'metadata', fixture.metadata);
      store.record(owner, id, name, 'SYNTHETIC_METADATA', evidence.id);
      return { evidence, metadata: fixture.metadata, fixtureVersion: fixture.version };
    }
    if (name === 'validateAndPatch') {
      closed(args, ['diagnosisId', 'metadataEvidenceId']);
      if (args.diagnosisId !== id || typeof args.metadataEvidenceId !== 'string' || args.metadataEvidenceId.length > 64) throw new SafeError('TOOL_DENIED');
      const ambiguous = context.input.kind === 'ambiguous_submission';
      if (ambiguous && args.metadataEvidenceId !== '') throw new SafeError('INVALID_EVIDENCE');
      const evidence = ambiguous ? undefined : store.solverEvidence(owner, id, args.metadataEvidenceId);
      const result = solve(context.input, evidence, id, store.monotonicNow());
      store.record(owner, id, name, result.decisionCode, evidence?.id);
      return { result };
    }
    throw new SafeError('TOOL_DENIED');
  } catch (error) {
    if (error instanceof SafeError && error.code !== 'INVALID_REQUEST') throw error;
    throw new SafeError('TOOL_DENIED');
  }
}
