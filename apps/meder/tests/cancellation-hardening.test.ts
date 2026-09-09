import assert from 'node:assert/strict';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { loadFixture } from '../fixtures';
import { executeRun } from '../src/server/planner';
import { RunStore } from '../src/server/run-store';
import { abortable, boundedJson, LIMITS, SafeError } from '../src/server/safety';

test('already-aborted requests observe their rejected body reads', async () => {
  const controller = new AbortController();
  controller.abort(new SafeError('CANCELED'));
  let canceled = false;
  const response = new Response(new ReadableStream({ cancel() { canceled = true; } }));
  const reading = boundedJson(response, 100, controller.signal);
  await assert.rejects(abortable(reading, controller.signal), { code: 'CANCELED' });
  await delay(0);
  assert.equal(canceled, true);
});

test('already-aborted work can reject later without an unhandled rejection', async () => {
  const controller = new AbortController();
  controller.abort(new SafeError('TIMEOUT'));
  const work = delay(5).then(() => { throw new SafeError('PROVIDER_FAILED'); });
  await assert.rejects(abortable(work, controller.signal), { code: 'TIMEOUT' });
  await delay(15);
});

test('queued model execution after retention resolves without provider work or resurrecting the run', async t => {
  const fixture = loadFixture('repairable');
  const provider = t.mock.fn(async () => { throw new Error('Unexpected provider call'); });
  for (const elapsed of [LIMITS.retentionMs, LIMITS.retentionMs + 1]) {
    let mono = 0;
    const store = new RunStore({ mono: () => mono, wall: () => 1_700_000_000_000 });
    const run = store.create('owner', fixture.request, fixture.id, 'ABCUSDT', 'model');
    const signal = store.context('owner', run.id).signal;
    mono = elapsed;
    let released = false;
    await assert.doesNotReject(executeRun(store, 'owner', run.id, {
      config: { key: 'test-only-placeholder', model: 'test-only-model' }, fetch: provider,
    }).finally(() => { released = true; }));
    assert.equal(released, true);
    assert.equal(signal.aborted, true);
    assert.throws(() => store.snapshot('owner', run.id), { code: 'NOT_FOUND' });
    assert.throws(() => store.context('owner', run.id), { code: 'NOT_FOUND' });
  }
  assert.equal(provider.mock.callCount(), 0);
});
