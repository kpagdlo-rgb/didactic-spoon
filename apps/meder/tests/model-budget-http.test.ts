import test from 'node:test';
import assert from 'node:assert/strict';
import { loadFixture } from '../fixtures';

test('HTTP admission budget is shared across fresh sessions and consumed by canceled and failed runs', async t => {
  const original = { key: process.env.OPENAI_API_KEY, model: process.env.OPENAI_MODEL, budget: process.env.MEDER_MODEL_RUN_BUDGET, access: process.env.MEDER_MODEL_ACCESS_KEY };
  process.env.OPENAI_API_KEY = 'test-only-placeholder';
  process.env.OPENAI_MODEL = 'test-only-model';
  process.env.MEDER_MODEL_RUN_BUDGET = '2';
  const accessKey = 'test-only-access-key-never-a-real-secret';
  process.env.MEDER_MODEL_ACCESS_KEY = accessKey;
  t.after(() => {
    for (const [key, value] of Object.entries({ OPENAI_API_KEY: original.key, OPENAI_MODEL: original.model, MEDER_MODEL_RUN_BUDGET: original.budget, MEDER_MODEL_ACCESS_KEY: original.access })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  });
  let requests = 0;
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init: RequestInit) => {
    requests++;
    if (requests === 1) return new Promise<Response>((_resolve, reject) => {
      init.signal!.addEventListener('abort', () => reject(init.signal!.reason), { once: true });
    });
    return new Response('private provider error', { status: 503 });
  });
  const { createDiagnosis, cancelDiagnosis, getDiagnosis, capabilities, loginModelAccess } = await import('../src/server/http');
  const input = loadFixture('repairable').rawRequest;
  const request = (body: unknown, cookie?: string) => new Request('http://localhost/api/diagnoses', {
    method: 'POST', headers: { origin: 'http://localhost', 'content-type': 'application/json', ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body),
  });
  const envelope = { mode: 'synthetic', planner: 'model', fixtureId: 'repairable', input };
  const login = async () => {
    const response = await loginModelAccess(request({ accessKey }));
    assert.equal(response.status, 200);
    return response.headers.get('set-cookie')!.split(';')[0];
  };
  const first = await createDiagnosis(request(envelope, await login()));
  assert.equal(first.status, 200);
  const firstRun = await first.json();
  const cookie = first.headers.get('set-cookie')!.split(';')[0];
  assert.equal((await createDiagnosis(request(envelope, await login()))).status, 429, 'a fresh authorized session cannot bypass concurrency');
  assert.equal((await capabilities().json()).modelBudget.active, 1);
  await new Promise(done => setTimeout(done, 10));
  assert.equal(requests, 1);
  assert.equal((await cancelDiagnosis(request({}, cookie), firstRun.id)).status, 200);
  await new Promise(done => setTimeout(done, 10));
  const second = await createDiagnosis(request(envelope, await login()));
  assert.equal(second.status, 200);
  assert.notEqual(second.headers.get('set-cookie')!.split(';')[0], cookie);
  const secondRun = await second.json();
  const secondCookie = second.headers.get('set-cookie')!.split(';')[0];
  await new Promise(done => setTimeout(done, 10));
  const snapshot = await (await getDiagnosis(new Request('http://localhost', { headers: { cookie: secondCookie } }), secondRun.id)).json();
  assert.equal(snapshot.status, 'error');
  assert.equal(snapshot.result, null);
  assert.equal((await createDiagnosis(request(envelope, await login()))).status, 429, 'a new authorized session cannot refill spent budget');
  const caps = await capabilities(new Request('http://localhost', { headers: { cookie: secondCookie } })).json();
  assert.deepEqual(caps.modelBudget, { limit: 2, remaining: 0, active: 0, maxConcurrent: 1, scope: 'process-lifetime' });
  assert.equal(caps.modelAccess.authorized, true);
  assert.equal(caps.planners.model, false);
  assert.equal(requests, 2, 'refused admission never contacts the provider');
  assert.equal((await createDiagnosis(request({ ...envelope, planner: 'deterministic' }))).status, 200);
});
