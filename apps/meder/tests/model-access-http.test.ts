import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { loadFixture } from '../fixtures';
import { ModelAccess, MODEL_ACCESS_LIMITS } from '../src/server/model-access';
import { ModelRunBudget } from '../src/server/model-budget';
import { RunStore } from '../src/server/run-store';
import { issueSession, session } from '../src/server/session';

const key = 'test-only-access-key-never-a-real-secret';
const cookieOf = (response: Response) => response.headers.get('set-cookie')!.split(';')[0];
const read = (cookie?: string) => new Request('http://localhost/api/capabilities', { headers: cookie ? { cookie } : {} });
function post(value: unknown, options: { cookie?: string; raw?: boolean; url?: string; headers?: Record<string, string>; signal?: AbortSignal } = {}) {
  return new Request(options.url ?? 'http://localhost/api/model-access', {
    method: 'POST', headers: { origin: 'http://localhost', 'content-type': 'application/json', ...(options.cookie ? { cookie: options.cookie } : {}), ...options.headers },
    body: options.raw ? value as string : JSON.stringify(value), signal: options.signal,
  });
}
const envelope = { mode: 'synthetic', planner: 'model', fixtureId: 'repairable', input: loadFixture('repairable').rawRequest };

test('HTTP model access enforces private-demo grants before spending', async t => {
  const original = Object.fromEntries(['OPENAI_API_KEY', 'OPENAI_MODEL', 'MEDER_MODEL_ACCESS_KEY', 'MEDER_ALLOWED_ORIGIN', 'NODE_ENV'].map(name => [name, process.env[name]]));
  process.env.OPENAI_API_KEY = 'test-only-provider-key';
  process.env.OPENAI_MODEL = 'test-only-model';
  process.env.MEDER_MODEL_ACCESS_KEY = key;
  delete process.env.MEDER_ALLOWED_ORIGIN;
  Object.assign(process.env, { NODE_ENV: 'test' });
  let mono = 0, wall = 1_700_000_000_000;
  const store = new RunStore();
  const budget = new ModelRunBudget('100');
  const access = new ModelAccess(owner => store.cancelModelRuns(owner), () => process.env.MEDER_MODEL_ACCESS_KEY, { mono: () => mono, wall: () => wall });
  const globals = globalThis as typeof globalThis & { mederServer?: { store: RunStore }; mederModelAccess?: ModelAccess };
  globals.mederServer = { store };
  globals.mederModelAccess = access;
  // Keep HTTP on the injected test budget without changing the shared module contract.
  const { modelBudget } = await import('../src/server/model-budget');
  t.mock.method(modelBudget, 'snapshot', () => budget.snapshot());
  const acquire = t.mock.method(modelBudget, 'acquire', () => budget.acquire());
  const created = t.mock.method(store, 'create');
  const fetchMock = t.mock.method(globalThis, 'fetch', async () => new Response('private provider error', { status: 503 }));
  const { createDiagnosis, getDiagnosis, capabilities, loginModelAccess, logoutModelAccess } = await import('../src/server/http');
  t.after(() => {
    delete process.env.MEDER_MODEL_ACCESS_KEY;
    access.status();
    for (const [name, value] of Object.entries(original)) {
      if (value === undefined) delete process.env[name]; else process.env[name] = value;
    }
    delete globals.mederModelAccess;
    delete globals.mederServer;
  });
  const login = async (cookie?: string) => {
    const response = await loginModelAccess(post({ accessKey: key }, { cookie }));
    assert.equal(response.status, 200);
    return response;
  };
  const nextWindow = () => { mono += MODEL_ACCESS_LIMITS.attemptWindowMs; };

  await t.test('provider configuration alone never admits a model run or spends budget', async () => {
    for (const configured of [undefined, 'short', 'a'.repeat(257), `${key}\n`]) {
      if (configured === undefined) delete process.env.MEDER_MODEL_ACCESS_KEY; else process.env.MEDER_MODEL_ACCESS_KEY = configured;
      const caps = await capabilities(read()).json();
      assert.equal(caps.providerConfigured, true);
      assert.deepEqual(caps.modelAccess, { configured: false, authorized: false });
      assert.equal(caps.planners.model, false);
      const response = await createDiagnosis(post(envelope));
      assert.equal(response.status, 503);
      assert.equal((await response.json()).error.code, 'MODEL_UNAVAILABLE');
      assert.equal(response.headers.get('set-cookie'), null);
    }
    assert.equal(created.mock.callCount(), 0);
    assert.equal(acquire.mock.callCount(), 0);
    assert.equal(fetchMock.mock.callCount(), 0);
    process.env.MEDER_MODEL_ACCESS_KEY = key;
  });

  await t.test('wrong keys, anonymous clients and other signed sessions cannot acquire or create model runs', async () => {
    nextWindow();
    const ownCookie = `meder_session=${issueSession()}`;
    const otherCookie = `meder_session=${issueSession()}`;
    const wrong = await loginModelAccess(post({ accessKey: 'wrong-key-that-still-fits-the-schema' }, { cookie: ownCookie }));
    assert.equal(wrong.status, 403);
    assert.equal(wrong.headers.get('set-cookie'), null);
    assert.deepEqual(await wrong.json(), { error: { code: 'MODEL_ACCESS_REQUIRED', message: 'Model access is required or has expired.' } });
    const response = await login(ownCookie);
    assert.equal(cookieOf(response), ownCookie, 'login preserves diagnosis ownership');
    const view = await response.json();
    assert.deepEqual(Object.keys(view), ['modelAccess']);
    assert.deepEqual(Object.keys(view.modelAccess).sort(), ['authorized', 'configured', 'expiresAt']);
    for (const hidden of [key, createHash('sha256').update(key).digest('hex'), ownCookie, ownCookie.split('=')[1]]) assert.ok(!JSON.stringify(view).includes(hidden));
    assert.match(response.headers.get('set-cookie')!, /HttpOnly; SameSite=Strict; Path=\/; Max-Age=900/);
    assert.match(response.headers.get('cache-control')!, /no-store/);
    assert.equal(response.headers.get('vary'), 'Cookie, Origin');
    assert.equal((await capabilities(read(ownCookie)).json()).planners.model, true);
    delete process.env.OPENAI_MODEL;
    const unconfigured = await capabilities(read(ownCookie)).json();
    assert.equal(unconfigured.providerConfigured, false);
    assert.equal(unconfigured.modelAccess.authorized, true);
    assert.equal(unconfigured.planners.model, false);
    assert.equal((await createDiagnosis(post(envelope, { cookie: ownCookie }))).status, 503);
    process.env.OPENAI_MODEL = 'test-only-model';
    for (const cookie of [undefined, otherCookie, `meder_session=${'a'.repeat(64)}.${'b'.repeat(64)}`, `${ownCookie}; ${ownCookie}`]) {
      const caps = await capabilities(read(cookie)).json();
      assert.deepEqual(caps.modelAccess, { configured: true, authorized: false });
      assert.equal(caps.planners.model, false);
      assert.equal((await createDiagnosis(post(envelope, { cookie }))).status, 403);
    }
    assert.equal(created.mock.callCount(), 0);
    assert.equal(acquire.mock.callCount(), 0);
    assert.equal(fetchMock.mock.callCount(), 0);
    const logout = await logoutModelAccess(post({}, { cookie: otherCookie }));
    assert.equal(logout.status, 200);
    assert.equal((await capabilities(read(ownCookie)).json()).modelAccess.authorized, true, 'another session cannot revoke this grant');
    await logoutModelAccess(post({}, { cookie: ownCookie }));
  });

  await t.test('same-origin gate stays exact in production and HTTPS sessions are Secure', async () => {
    nextWindow();
    Object.assign(process.env, { NODE_ENV: 'production' });
    assert.equal((await loginModelAccess(post({ accessKey: key }))).status, 403);
    process.env.MEDER_ALLOWED_ORIGIN = 'https://meder.example';
    for (const origin of ['https://evil.example', 'https://meder.example.evil', 'https://meder.example/']) {
      assert.equal((await loginModelAccess(post({ accessKey: key }, { headers: { origin, host: 'meder.example', 'x-forwarded-host': 'meder.example' } }))).status, 403);
    }
    const response = await loginModelAccess(post({ accessKey: key }, { headers: { origin: 'https://meder.example' } }));
    assert.equal(response.status, 200);
    const cookie = cookieOf(response);
    assert.match(response.headers.get('set-cookie')!, /; Secure$/);
    assert.equal((await logoutModelAccess(post({}, { cookie, headers: { origin: 'https://evil.example' } }))).status, 403);
    assert.equal((await capabilities(read(cookie)).json()).modelAccess.authorized, true);
    assert.equal((await loginModelAccess(post({ accessKey: key }, { headers: { origin: 'https://meder.example', 'sec-fetch-site': 'cross-site' } }))).status, 403);
    Object.assign(process.env, { NODE_ENV: 'test' });
    delete process.env.MEDER_ALLOWED_ORIGIN;
    await logoutModelAccess(post({}, { cookie }));
  });

  await t.test('login JSON is closed, byte bounded, duplicate rejecting and never echoes input', async () => {
    const invalid: [unknown, Parameters<typeof post>[1], number][] = [
      [{}, {}, 400], [{ accessKey: key, extra: key }, {}, 400], [[{ accessKey: key }], {}, 400],
      [{ accessKey: null }, {}, 400], [{ accessKey: 1 }, {}, 400], [{ accessKey: 'short' }, {}, 400],
      [{ accessKey: 'a'.repeat(257) }, {}, 400], [{ accessKey: `${key}é` }, {}, 400],
      [`{"accessKey":"${key}","accessKey":"${key}"}`, { raw: true }, 400],
      ['{"accessKey":', { raw: true }, 400],
      [{ accessKey: key }, { headers: { 'content-type': 'text/plain' } }, 400],
      [{ accessKey: key }, { headers: { 'content-encoding': 'gzip' } }, 400],
      [{ accessKey: key }, { url: 'http://localhost/api/model-access?accessKey=redacted' }, 400],
      [{ accessKey: key }, { headers: { 'content-length': '1025' } }, 413],
      [{ accessKey: 'é'.repeat(600) }, { headers: { 'content-length': '1' } }, 413],
    ];
    for (const [value, options, expected] of invalid) {
      nextWindow();
      const response = await loginModelAccess(post(value, options));
      assert.equal(response.status, expected);
      const text = await response.text();
      assert.ok(!text.includes(key));
      assert.deepEqual(Object.keys(JSON.parse(text)), ['error']);
      assert.equal(response.headers.get('set-cookie'), null);
    }
    nextWindow();
    const exact = JSON.stringify({ accessKey: key }).padEnd(MODEL_ACCESS_LIMITS.requestBytes);
    const response = await loginModelAccess(post(exact, { raw: true }));
    assert.equal(response.status, 200, 'exactly 1024 UTF-8 bytes is allowed');
    assert.equal((await loginModelAccess(post(`${exact} `, { raw: true }))).status, 413);
    const cookie = cookieOf(response);
    for (const value of [{ accessKey: key }, [], null]) assert.equal((await logoutModelAccess(post(value, { cookie }))).status, 400);
    assert.equal((await capabilities(read(cookie)).json()).modelAccess.authorized, true, 'invalid logout leaves authorization intact');
    await logoutModelAccess(post({}, { cookie }));
  });

  await t.test('aborted key exchange never creates a grant', async () => {
    nextWindow();
    const cookie = `meder_session=${issueSession()}`;
    const controller = new AbortController();
    controller.abort();
    const response = await loginModelAccess(post({ accessKey: key }, { cookie, signal: controller.signal }));
    assert.equal(response.status, 400);
    assert.equal(response.headers.get('set-cookie'), null);
    assert.equal((await capabilities(read(cookie)).json()).modelAccess.authorized, false);
  });

  await t.test('global attempts count malformed, failed and successful logins without session or forwarding bypasses', async () => {
    nextWindow();
    for (let i = 0; i < MODEL_ACCESS_LIMITS.attempts; i++) {
      const cookie = `meder_session=${issueSession()}`;
      const value = i === 0 ? {} : { accessKey: i === 1 ? 'wrong-key-that-still-fits-the-schema' : key };
      const response = await loginModelAccess(post(value, { cookie, headers: { 'x-forwarded-for': `192.0.2.${i}` } }));
      assert.equal(response.status, i === 0 ? 400 : i === 1 ? 403 : 200);
      if (response.status === 200) await logoutModelAccess(post({}, { cookie: cookieOf(response) }));
    }
    wall += 86_400_000;
    for (let i = 0; i < 3; i++) {
      const response = await loginModelAccess(post({ accessKey: key }, { cookie: `meder_session=${issueSession()}`, headers: { 'x-forwarded-for': `198.51.100.${i}` } }));
      assert.equal(response.status, 429);
      assert.equal((await response.json()).error.code, 'CAPACITY');
    }
    assert.equal((await createDiagnosis(post({ ...envelope, planner: 'deterministic' }))).status, 200);
    nextWindow();
    const response = await login();
    await logoutModelAccess(post({}, { cookie: cookieOf(response) }));
  });

  await t.test('logout aborts an active provider request, retains deterministic work and report ownership', async () => {
    nextWindow();
    const cookie = cookieOf(await login());
    const owner = session(read(cookie))!;
    let providerSignal: AbortSignal | undefined;
    let started!: () => void;
    const providerStarted = new Promise<void>(resolve => { started = resolve; });
    fetchMock.mock.mockImplementation(async (_url: unknown, init?: RequestInit) => {
      for (const hidden of [key, owner, createHash('sha256').update(key).digest('hex')]) assert.ok(!String(init?.body).includes(hidden));
      providerSignal = init!.signal!;
      started();
      return new Promise<Response>((_resolve, reject) => providerSignal!.addEventListener('abort', () => reject(providerSignal!.reason), { once: true }));
    });
    const response = await createDiagnosis(post(envelope, { cookie }));
    assert.equal(response.status, 200);
    const run = await response.json();
    await providerStarted;
    const fixture = loadFixture('repairable');
    const deterministic = store.create(owner, fixture.request, fixture.id, 'ABCUSDT', 'deterministic');
    const otherOwner = issueSession();
    const other = store.create(otherOwner, fixture.request, fixture.id, 'ABCUSDT', 'model');
    const budgetBefore = budget.snapshot().remaining;
    const logout = await logoutModelAccess(post({}, { cookie }));
    assert.deepEqual(await logout.json(), { modelAccess: { configured: true, authorized: false } });
    assert.equal(providerSignal?.aborted, true);
    const snapshot = await (await getDiagnosis(read(cookie), run.id)).json();
    assert.equal(snapshot.status, 'canceled');
    assert.equal(snapshot.result, null);
    assert.equal(snapshot.modelVerified, false);
    for (const hidden of [key, owner, createHash('sha256').update(key).digest('hex')]) assert.ok(!JSON.stringify(snapshot.export).includes(hidden));
    assert.equal(store.context(owner, deterministic.id).signal.aborted, false);
    assert.equal(store.context(otherOwner, other.id).signal.aborted, false);
    store.cancel(owner, deterministic.id);
    store.cancel(otherOwner, other.id);
    await delay(0);
    assert.equal(budget.snapshot().active, 0);
    assert.equal(budget.snapshot().remaining, budgetBefore, 'logout never refunds admission');
    assert.equal((await createDiagnosis(post(envelope, { cookie }))).status, 403);
    assert.equal((await createDiagnosis(post({ ...envelope, planner: 'deterministic' }, { cookie }))).status, 200);
    fetchMock.mock.mockImplementation(async () => new Response('private provider error', { status: 503 }));
  });

  await t.test('queued model work is stopped by logout or rotation before its first provider call', async () => {
    nextWindow();
    for (const action of ['logout', 'rotate'] as const) {
      process.env.MEDER_MODEL_ACCESS_KEY = key;
      const cookie = cookieOf(await login());
      const response = await createDiagnosis(post(envelope, { cookie }));
      assert.equal(response.status, 200);
      const run = await response.json();
      const calls = fetchMock.mock.callCount();
      if (action === 'logout') await logoutModelAccess(post({}, { cookie }));
      else process.env.MEDER_MODEL_ACCESS_KEY = 'replacement-test-only-access-key-123456';
      await delay(10);
      assert.equal(fetchMock.mock.callCount(), calls);
      assert.equal((await (await getDiagnosis(read(cookie), run.id)).json()).status, 'canceled');
      assert.equal((await capabilities(read(cookie)).json()).modelAccess.authorized, false);
      assert.equal((await createDiagnosis(post(envelope, { cookie }))).status, 403);
    }
    process.env.MEDER_MODEL_ACCESS_KEY = key;
  });

  await t.test('rotation during a provider response prevents tool dispatch and another paid call', async () => {
    nextWindow();
    const cookie = cookieOf(await login());
    const before = fetchMock.mock.callCount();
    fetchMock.mock.mockImplementation(async () => {
      process.env.MEDER_MODEL_ACCESS_KEY = 'replacement-test-only-access-key-123456';
      return Response.json({ status: 'completed', output: [{ type: 'function_call', name: 'getSymbolMetadata', call_id: 'call_1', arguments: '{"symbol":"ABCUSDT"}' }] });
    });
    const response = await createDiagnosis(post(envelope, { cookie }));
    assert.equal(response.status, 200);
    const run = await response.json();
    await delay(10);
    const snapshot = await (await getDiagnosis(read(cookie), run.id)).json();
    assert.equal(snapshot.status, 'canceled');
    assert.deepEqual(snapshot.trace, []);
    assert.deepEqual(snapshot.evidence, []);
    assert.equal(fetchMock.mock.callCount(), before + 1);
    assert.equal(budget.snapshot().active, 0);
    process.env.MEDER_MODEL_ACCESS_KEY = key;
    fetchMock.mock.mockImplementation(async () => new Response('private provider error', { status: 503 }));
  });

  await t.test('expired grants are denied before budget even when the wall clock moves backward', async () => {
    nextWindow();
    const cookie = cookieOf(await login());
    const acquired = acquire.mock.callCount();
    const runs = created.mock.callCount();
    mono += MODEL_ACCESS_LIMITS.ttlMs;
    wall -= 172_800_000;
    assert.equal((await createDiagnosis(post(envelope, { cookie }))).status, 403);
    assert.equal((await capabilities(read(cookie)).json()).planners.model, false);
    assert.equal(acquire.mock.callCount(), acquired);
    assert.equal(created.mock.callCount(), runs);
  });
});
