import assert from 'node:assert/strict';
import test from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { abortable, boundedJson, SafeError } from '../src/server/safety';

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
