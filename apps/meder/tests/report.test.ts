import assert from 'node:assert/strict';
import test from 'node:test';
import { RunStore } from '../src/server/run-store';
import { executeRun } from '../src/server/planner';
import { getFixture } from '../src/server/domain';

test('all terminal reports are exportable without private run, evidence, or imported identifiers', async () => {
  for (const fixtureId of ['repairable', 'budget_refusal', 'ambiguous', 'off_grid_min']) {
    const store = new RunStore();
    const fixture = getFixture(fixtureId);
    const initial = store.create('private-session-owner', fixture.request, fixtureId, 'ABCUSDT', 'deterministic');
    assert.equal(initial.export, null);
    await executeRun(store, 'private-session-owner', initial.id);
    const final = store.snapshot('private-session-owner', initial.id);
    assert.ok(final.export);
    const text = JSON.stringify(final.export);
    assert.equal(final.export.source, 'synthetic');
    assert.equal(final.export.modelVerified, false);
    for (const secret of [initial.id, 'private-session-owner', 'synthetic-lost-response', 'Filter failure: LOT_SIZE', ...final.evidence.map(item => item.id)]) {
      assert.ok(!text.includes(secret));
    }
    assert.doesNotMatch(text, /"(?:session|runId|evidenceId|clientOrderId|identifier|observed)":/);
    assert.ok(Object.isFrozen(final.export));
    if (final.result?.result === 'REPAIR_PROPOSED') {
      assert.equal(final.export.result?.validation.passedFor, 'proposal');
      assert.equal(final.export.result?.validation.failedFor, 'original');
    }
  }
});

test('canceled and provider-error runs export only a sanitized terminal state', () => {
  const store = new RunStore();
  const fixture = getFixture('repairable');
  const first = store.create('owner', fixture.request, fixture.id, 'ABCUSDT', 'deterministic');
  const canceled = store.cancel('owner', first.id);
  assert.equal(canceled.export?.status, 'canceled');
  assert.equal(canceled.export?.result, null);
  const second = store.create('owner', fixture.request, fixture.id, 'ABCUSDT', 'model');
  store.fail('owner', second.id, new Error('private upstream text'));
  const failed = store.snapshot('owner', second.id).export;
  assert.equal(failed?.status, 'error');
  assert.equal(failed?.result, null);
  assert.ok(!JSON.stringify(failed).includes('private upstream text'));
});
