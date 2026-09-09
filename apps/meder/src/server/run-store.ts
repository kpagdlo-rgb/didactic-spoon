import { createHash, randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import type { Input, Metadata, Result } from './domain';
import { FIXTURE_VERSION } from './domain';
import type { MetadataEvidence } from '../domain';
import { isValidatedMetadata, exportSafeReport } from '../domain';
import { immutable, LIMITS, SafeError, safeError } from './safety';

export type Planner = 'deterministic' | 'model';
export type Trace = { tool: string; code: string; at: string; evidenceId?: string };
export type Evidence = {
  id: string; runId: string; mode: 'synthetic'; symbol: string;
  kind: 'metadata' | 'server_time'; receivedAt: string;
  responseHash: string; validation: 'validated';
};
export type Snapshot = {
  id: string; status: 'running' | 'completed' | 'canceled' | 'error';
  mode: 'synthetic'; planner: Planner; createdAt: string; expiresAt: string;
  observedSource: 'synthetic_fixture' | 'redacted_import';
  result: Result | null; error: ReturnType<typeof safeError> | null;
  trace: readonly Trace[]; evidence: readonly (Evidence & { ageMs: number })[]; modelVerified: boolean;
  export: ExportReport | null;
};
export type ExportReport = {
  product: 'Meder'; version: 1; source: 'synthetic'; fixtureVersion: string;
  planner: Planner; status: Snapshot['status']; modelVerified: boolean;
  observedSource: Snapshot['observedSource'];
  result: Result | null; error: ReturnType<typeof safeError> | null;
  trace: readonly { tool: string; code: string; at: string }[];
  provenance: readonly { mode: 'synthetic'; symbol: string; kind: Evidence['kind']; receivedAt: string; responseHash: string }[];
  redaction: string;
};
type EvidenceRecord = { public: Evidence; receivedMono: number; value: Metadata | { fixtureTime: number } };
type Run = {
  owner: string; snapshot: Omit<Snapshot, 'evidence' | 'export'>; input: Input;
  fixtureId: string; symbol: string; startedMono: number;
  evidence: Map<string, EvidenceRecord>; controller: AbortController; toolCalls: number;
  expiryTimer?: ReturnType<typeof setTimeout>;
};
export class RunStore {
  private runs = new Map<string, Run>();
  constructor(private clock = { wall: () => Date.now(), mono: () => performance.now() }) {}
  private prune() {
    for (const [id, run] of this.runs) {
      if (this.clock.mono() - run.startedMono >= LIMITS.retentionMs) {
        clearTimeout(run.expiryTimer);
        run.controller.abort(new SafeError('NOT_FOUND', 404));
        this.runs.delete(id);
      }
    }
  }
  private scheduleExpiry(id: string) {
    const run = this.runs.get(id);
    if (!run) return;
    const remaining = LIMITS.retentionMs - (this.clock.mono() - run.startedMono);
    run.expiryTimer = setTimeout(() => {
      this.prune();
      // Timer precision must not turn an early wakeup into indefinite retention.
      this.scheduleExpiry(id);
    }, Math.max(1, Math.ceil(remaining)));
    run.expiryTimer.unref();
  }
  create(owner: string, input: Input, fixtureId: string, symbol: string, planner: Planner) {
    this.prune();
    if (this.runs.size >= 1_000 || [...this.runs.values()].filter(run => run.owner === owner).length >= 50) throw new SafeError('CAPACITY', 429);
    const id = randomUUID();
    const now = this.clock.wall();
    this.runs.set(id, {
      owner, input: immutable(input), fixtureId, symbol, startedMono: this.clock.mono(),
      evidence: new Map(), controller: new AbortController(), toolCalls: 0,
      snapshot: immutable({ id, status: 'running', mode: 'synthetic', planner,
        observedSource: input.kind === 'rejection' ? input.observed.source : input.source,
        createdAt: new Date(now).toISOString(), expiresAt: new Date(now + LIMITS.retentionMs).toISOString(),
        result: null, error: null, trace: [], modelVerified: false }),
    });
    this.scheduleExpiry(id);
    return this.snapshot(owner, id);
  }
  private get(owner: string, id: string) {
    this.prune();
    const run = this.runs.get(id);
    if (!run || run.owner !== owner) throw new SafeError('NOT_FOUND', 404);
    return run;
  }
  snapshot(owner: string, id: string): Snapshot {
    const run = this.get(owner, id);
    const evidence = [...run.evidence.values()].map(item => ({ ...item.public, ageMs: Math.max(0, this.clock.mono() - item.receivedMono) }));
    const report: ExportReport | null = run.snapshot.status === 'running' ? null : {
      product: 'Meder', version: 1, source: 'synthetic', fixtureVersion: FIXTURE_VERSION,
      planner: run.snapshot.planner, status: run.snapshot.status, modelVerified: run.snapshot.modelVerified,
      observedSource: run.snapshot.observedSource,
      result: run.snapshot.result ? exportSafeReport(run.snapshot.result) : null,
      error: run.snapshot.error ? { code: run.snapshot.error.code, message: run.snapshot.error.message } : null,
      trace: run.snapshot.trace.map(({ tool, code, at }) => ({ tool, code, at })),
      provenance: evidence.map(({ mode, symbol, kind, receivedAt, responseHash }) => ({ mode, symbol, kind, receivedAt, responseHash })),
      redaction: 'Identifiers, pasted rejection text, and private internal tokens are omitted. No financial action occurred.',
    };
    return immutable({ ...run.snapshot, evidence, export: report });
  }
  context(owner: string, id: string) {
    const run = this.get(owner, id);
    return { input: run.input, fixtureId: run.fixtureId, symbol: run.symbol, signal: run.controller.signal, planner: run.snapshot.planner };
  }
  remaining(owner: string, id: string) {
    const run = this.get(owner, id);
    return Math.max(0, LIMITS.totalMs - (this.clock.mono() - run.startedMono));
  }
  active(owner: string, id: string) {
    const run = this.get(owner, id);
    if (run.snapshot.status !== 'running') throw new SafeError('CANCELED');
    if (this.remaining(owner, id) <= 0) throw new SafeError('TIMEOUT', 504);
    return run.controller.signal;
  }
  consumeTool(owner: string, id: string) {
    this.active(owner, id);
    const run = this.get(owner, id);
    if (++run.toolCalls > LIMITS.toolCalls) throw new SafeError('TOOL_LIMIT');
  }
  record(owner: string, id: string, tool: string, code: string, evidenceId?: string) {
    this.active(owner, id);
    const run = this.get(owner, id);
    run.snapshot = immutable({ ...run.snapshot, trace: [...run.snapshot.trace, { tool, code, at: new Date(this.clock.wall()).toISOString(), ...(evidenceId ? { evidenceId } : {}) }] });
  }
  addEvidence(owner: string, id: string, kind: Evidence['kind'], value: EvidenceRecord['value']) {
    this.active(owner, id);
    const run = this.get(owner, id);
    if (kind === 'metadata' && (!isValidatedMetadata(value) || value.symbol !== run.symbol)) throw new SafeError('INVALID_EVIDENCE');
    if (kind === 'server_time') {
      if (!('fixtureTime' in value) || !Number.isSafeInteger(value.fixtureTime)) throw new SafeError('INVALID_EVIDENCE');
      value = immutable(value);
    }
    const evidenceId = randomUUID();
    const evidence: Evidence = immutable({ id: evidenceId, runId: id, mode: 'synthetic', symbol: run.symbol, kind,
      receivedAt: new Date(this.clock.wall()).toISOString(), responseHash: createHash('sha256').update(JSON.stringify(value)).digest('hex'), validation: 'validated' });
    // Validated metadata is already deeply frozen and carries domain validation identity.
    run.evidence.set(evidenceId, { public: evidence, value, receivedMono: this.clock.mono() });
    return evidence;
  }
  metadata(owner: string, id: string, evidenceId: string): Metadata {
    this.active(owner, id);
    const run = this.get(owner, id);
    const evidence = run.evidence.get(evidenceId);
    if (!evidence || evidence.public.kind !== 'metadata' || evidence.public.symbol !== run.symbol || evidence.public.runId !== id) throw new SafeError('INVALID_EVIDENCE');
    if (this.clock.mono() - evidence.receivedMono >= LIMITS.metadataAgeMs) throw new SafeError('STALE_METADATA');
    return evidence.value as Metadata;
  }
  solverEvidence(owner: string, id: string, evidenceId: string): MetadataEvidence {
    const metadata = this.metadata(owner, id, evidenceId);
    const evidence = this.get(owner, id).evidence.get(evidenceId)!;
    return Object.freeze({ ...evidence.public, validationState: 'valid', fixtureVersion: FIXTURE_VERSION,
      receivedMonotonicMs: evidence.receivedMono, metadata });
  }
  monotonicNow() { return this.clock.mono(); }
  complete(owner: string, id: string, result: Result, modelVerified = false) {
    this.active(owner, id);
    const run = this.get(owner, id);
    run.snapshot = immutable({ ...run.snapshot, status: 'completed', result, modelVerified });
  }
  fail(owner: string, id: string, error: unknown) {
    const run = this.get(owner, id);
    if (run.snapshot.status !== 'running') return;
    run.snapshot = immutable({ ...run.snapshot, status: 'error', result: null, error: safeError(error) });
    run.controller.abort(error);
  }
  private cancelRun(run: Run) {
    if (run.snapshot.status === 'running') {
      run.snapshot = immutable({ ...run.snapshot, status: 'canceled', result: null, error: safeError(new SafeError('CANCELED')) });
      run.controller.abort(new SafeError('CANCELED'));
    }
  }
  cancelModelRuns(owner: string) {
    this.prune();
    for (const run of this.runs.values()) {
      if (run.owner === owner && run.snapshot.planner === 'model') this.cancelRun(run);
    }
  }
  cancel(owner: string, id: string) {
    this.cancelRun(this.get(owner, id));
    return this.snapshot(owner, id);
  }
}
