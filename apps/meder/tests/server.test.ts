import test from 'node:test';
import assert from 'node:assert/strict';
import { loadFixture } from '../fixtures';
import { cancelDiagnosis, capabilities, createDiagnosis, getDiagnosis } from '../src/server/http';
import { executeRun, providerConfig } from '../src/server/planner';
import { RunStore } from '../src/server/run-store';
import { abortable, boundedJson, LIMITS, SafeError } from '../src/server/safety';
import { dispatchTool, TOOLS } from '../src/server/tools';

const fixture = loadFixture('repairable');
const envelope = (overrides = {}) => ({ mode: 'synthetic', planner: 'deterministic', fixtureId: 'repairable', input: fixture.rawRequest, ...overrides });
function request(value: unknown, options: { origin?: string; cookie?: string; raw?: boolean; url?: string } = {}) {
  return new Request(options.url ?? 'http://localhost/api/diagnoses', { method: 'POST', headers: {
    'content-type': 'application/json', origin: options.origin ?? 'http://localhost', ...(options.cookie ? { cookie: options.cookie } : {}),
  }, body: options.raw ? value as string : JSON.stringify(value) });
}
function run(planner: 'deterministic' | 'model' = 'deterministic', store = new RunStore(), fixtureId: 'repairable' | 'budget_refusal' | 'ambiguous' = 'repairable') {
  const selected = loadFixture(fixtureId);
  const snapshot = store.create('owner', selected.request, selected.id, 'ABCUSDT', planner);
  return { store, id: snapshot.id };
}
const code = (expected: string) => (error: unknown) => error instanceof SafeError && error.code === expected;
const config = { key: 'test-only-placeholder', model: 'test-only-model' };
function fakeProvider(callback: (body: Record<string, unknown>, index: number) => unknown): typeof fetch {
  let index = 0;
  return (async (url, init) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    assert.equal(init?.redirect, 'error');
    const body = JSON.parse(init?.body as string);
    assert.equal(body.store, false);
    assert.deepEqual(body.include, ['reasoning.encrypted_content']);
    assert.equal(body.parallel_tool_calls, false);
    assert.deepEqual(body.tools.map((tool: { name: string }) => tool.name), ['getServerTime', 'getSymbolMetadata', 'validateAndPatch']);
    return Response.json(callback(body, index++));
  }) as typeof fetch;
}
const tool = (name: string, args: unknown, index: number) => ({ status: 'completed', output: [{ type: 'function_call', name, call_id: `call_${index}`, arguments: JSON.stringify(args) }] });

test('deterministic execution completes all primary fixtures and never counts as model evidence', async () => {
  for (const [fixtureId, expected] of [['repairable', 'REPAIR_PROPOSED'], ['budget_refusal', 'REFUSED'], ['ambiguous', 'UNRESOLVED']] as const) {
    const { store, id } = run('deterministic', new RunStore(), fixtureId);
    await executeRun(store, 'owner', id);
    const result = store.snapshot('owner', id);
    assert.equal(result.status, 'completed');
    assert.equal(result.result?.result, expected);
    assert.equal(result.modelVerified, false);
    assert.equal(result.mode, 'synthetic');
    assert.ok(!JSON.stringify(result).includes('synthetic-lost-response'));
  }
});

test('store snapshots, normalized inputs and validated metadata are immutable and session-bound', () => {
  const { store, id } = run();
  const initial = store.snapshot('owner', id);
  assert.throws(() => store.snapshot('other', id), code('NOT_FOUND'));
  assert.throws(() => { (initial as { status: string }).status = 'completed'; }, TypeError);
  assert.ok(Object.isFrozen(store.context('owner', id).input));
  const output = dispatchTool(store, 'owner', id, 'getSymbolMetadata', { symbol: 'ABCUSDT' });
  assert.ok(output.evidence);
  const metadata = store.metadata('owner', id, output.evidence.id);
  assert.ok(Object.isFrozen(metadata.lot));
  assert.throws(() => store.addEvidence('owner', id, 'metadata', structuredClone(metadata)), code('INVALID_EVIDENCE'));
  assert.equal(initial.trace.length, 0);
  assert.equal(store.snapshot('owner', id).trace.length, 1);
});

test('evidence IDs cannot cross runs, symbols, kinds, or sessions', () => {
  const { store, id } = run();
  const second = run('deterministic', store);
  const metadata = dispatchTool(store, 'owner', id, 'getSymbolMetadata', { symbol: 'ABCUSDT' });
  assert.ok(metadata.evidence);
  assert.throws(() => store.metadata('owner', second.id, metadata.evidence!.id), code('INVALID_EVIDENCE'));
  assert.throws(() => store.metadata('intruder', id, metadata.evidence!.id), code('NOT_FOUND'));
  const time = dispatchTool(store, 'owner', id, 'getServerTime', {});
  assert.ok(time.evidence);
  assert.throws(() => store.metadata('owner', id, time.evidence!.id), code('INVALID_EVIDENCE'));
  assert.throws(() => dispatchTool(store, 'owner', id, 'getSymbolMetadata', { symbol: 'OTHERUSDT' }), code('TOOL_DENIED'));
});

test('five-call ceiling and exactly three closed, nonfinancial tools', () => {
  assert.deepEqual(TOOLS.map(item => item.name), ['getServerTime', 'getSymbolMetadata', 'validateAndPatch']);
  const { store, id } = run();
  for (let i = 0; i < 5; i++) dispatchTool(store, 'owner', id, 'getServerTime', {});
  assert.throws(() => dispatchTool(store, 'owner', id, 'getServerTime', {}), code('TOOL_LIMIT'));
  const denied = run();
  assert.throws(() => dispatchTool(denied.store, 'owner', denied.id, 'placeOrder', {}), code('TOOL_DENIED'));
  assert.throws(() => dispatchTool(denied.store, 'owner', denied.id, 'getServerTime', { key: 'secret' }), code('TOOL_DENIED'));
  assert.throws(() => dispatchTool(denied.store, 'owner', denied.id, 'validateAndPatch', { diagnosisId: id, metadataEvidenceId: '', budget: '999' }), code('TOOL_DENIED'));
});

test('monotonic clocks govern evidence age, deadline and 15-minute retention despite wall-clock changes', () => {
  let mono = 0, wall = Date.now();
  const { store, id } = run('deterministic', new RunStore({ mono: () => mono, wall: () => wall }));
  dispatchTool(store, 'owner', id, 'getSymbolMetadata', { symbol: 'ABCUSDT' });
  wall -= 3_600_000; mono = 12_000;
  assert.equal(store.snapshot('owner', id).evidence[0].ageMs, 12_000);
  mono = LIMITS.totalMs;
  assert.throws(() => store.active('owner', id), code('TIMEOUT'));
  mono = LIMITS.metadataAgeMs;
  assert.throws(() => store.metadata('owner', id, store.snapshot('owner', id).evidence[0].id), code('TIMEOUT'), 'the 20-second run deadline rejects evidence even before the 60-second maximum age');
  mono = LIMITS.retentionMs;
  assert.throws(() => store.snapshot('owner', id), code('NOT_FOUND'));
  assert.equal(LIMITS.metadataAgeMs, 60_000);
});

test('idle runs are actively erased at retention expiry without a follow-up request', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let mono = 0;
  const { store, id } = run('deterministic', new RunStore({ mono: () => mono, wall: () => 0 }));
  const signal = store.context('owner', id).signal;
  mono = LIMITS.retentionMs - 1;
  t.mock.timers.tick(LIMITS.retentionMs);
  assert.equal(signal.aborted, false, 'early timer wakeups preserve monotonic expiry');
  mono = LIMITS.retentionMs;
  t.mock.timers.tick(1);
  assert.equal(signal.aborted, true, 'cleanup happens without a store read');
  assert.throws(() => store.snapshot('owner', id), code('NOT_FOUND'));
});

test('missing evidence and modified run binding cannot yield a proposal', () => {
  const { store, id } = run();
  assert.throws(() => dispatchTool(store, 'owner', id, 'validateAndPatch', { diagnosisId: id, metadataEvidenceId: 'missing' }), code('INVALID_EVIDENCE'));
  assert.throws(() => dispatchTool(store, 'owner', id, 'validateAndPatch', { diagnosisId: 'another-run', metadataEvidenceId: '' }), code('TOOL_DENIED'));
  assert.equal(store.snapshot('owner', id).result, null);
});

test('cancellation is terminal and late completion cannot overwrite it', async () => {
  const { store, id } = run();
  store.cancel('owner', id);
  await executeRun(store, 'owner', id);
  assert.equal(store.snapshot('owner', id).status, 'canceled');
  assert.equal(store.snapshot('owner', id).result, null);
  assert.throws(() => store.complete('owner', id, {} as never), code('CANCELED'));
});

test('real-provider protocol lets provider select calls, while only the solver decides the verdict', async () => {
  const { store, id } = run('model');
  const fetch = fakeProvider((body, index) => {
    const prompt = JSON.stringify(body.input);
    assert.ok(!prompt.includes('Filter failure'));
    if (index === 0) return tool('getSymbolMetadata', { symbol: 'ABCUSDT' }, index);
    const messages = body.input as { type?: string; output?: string }[];
    const output = JSON.parse(messages.find(item => item.type === 'function_call_output')!.output!);
    return { ...tool('validateAndPatch', { diagnosisId: id, metadataEvidenceId: output.evidence.id }, index), fabricatedVerdict: 'EXCHANGE_ACCEPTED' };
  });
  await executeRun(store, 'owner', id, { config, fetch });
  const snapshot = store.snapshot('owner', id);
  assert.equal(snapshot.status, 'completed');
  assert.equal(snapshot.result?.result, 'REPAIR_PROPOSED');
  assert.equal(snapshot.modelVerified, false, 'a fake provider is never real-model verification');
  assert.deepEqual(snapshot.trace.map(item => item.tool), ['getSymbolMetadata', 'validateAndPatch']);
  assert.ok(!JSON.stringify(snapshot).includes('EXCHANGE_ACCEPTED'));
});

test('stateless reasoning items continue in memory but never enter the public run record', async () => {
  const { store, id } = run('model');
  const reasoning = { type: 'reasoning', id: 'rs_test', summary: [], encrypted_content: 'PRIVATE_OPAQUE_REASONING' };
  await executeRun(store, 'owner', id, { config, fetch: fakeProvider((body, index) => {
    if (index === 0) {
      const response = tool('getSymbolMetadata', { symbol: 'ABCUSDT' }, index);
      return { ...response, output: [reasoning, ...response.output] };
    }
    const messages = body.input as { type?: string; output?: string }[];
    assert.deepEqual(messages.find(item => item.type === 'reasoning'), reasoning);
    const output = JSON.parse(messages.find(item => item.type === 'function_call_output')!.output!);
    return tool('validateAndPatch', { diagnosisId: id, metadataEvidenceId: output.evidence.id }, index);
  }) });
  const snapshot = store.snapshot('owner', id);
  assert.equal(snapshot.status, 'completed');
  assert.equal(snapshot.modelVerified, false);
  assert.ok(!JSON.stringify(snapshot).includes('PRIVATE_OPAQUE_REASONING'));
});

test('ambiguous identifiers and imported status never reach provider', async () => {
  const { store, id } = run('model', new RunStore(), 'ambiguous');
  await executeRun(store, 'owner', id, { config, fetch: fakeProvider((body, index) => {
    const prompt = JSON.stringify(body.input);
    assert.ok(!prompt.includes('synthetic-lost-response'));
    assert.ok(!prompt.includes('importedStatus'));
    return tool('validateAndPatch', { diagnosisId: id, metadataEvidenceId: '' }, index);
  }) });
  assert.equal(store.snapshot('owner', id).result?.result, 'UNRESOLVED');
});

test('provider failures, invalid calls, missing verdict and loops cannot fabricate success', async () => {
  const providers: (typeof fetch)[] = [
    (async () => { throw new Error('PRIVATE provider response or API key'); }) as typeof fetch,
    (async () => new Response('PRIVATE provider response', { status: 429 })) as typeof fetch,
    fakeProvider(() => ({ status: 'completed', output: [{ type: 'message', content: 'Accepted! Buy now.' }] })),
    fakeProvider((_, i) => tool('placeOrder', {}, i)),
    fakeProvider((_, i) => tool('getSymbolMetadata', { symbol: 'ABCUSDT', metadata: {} }, i)),
    fakeProvider((_, i) => tool('getServerTime', {}, i)),
    fakeProvider(() => ({ status: 'incomplete', output: [] })),
  ];
  for (const fetch of providers) {
    const { store, id } = run('model');
    await executeRun(store, 'owner', id, { config, fetch });
    const snapshot = store.snapshot('owner', id);
    assert.equal(snapshot.status, 'error');
    assert.equal(snapshot.result, null);
    assert.equal(snapshot.modelVerified, false);
    assert.ok(!JSON.stringify(snapshot).includes('PRIVATE'));
  }
});

test('model timeout and overall timeout abort provider work without a retry', async () => {
  for (const timing of [{ modelCallMs: 10, totalMs: 500 }, { modelCallMs: 500, totalMs: 10 }]) {
    const { store, id } = run('model');
    let requests = 0, aborted = false;
    const fetch = (async (_url, init) => {
      requests++;
      init?.signal?.addEventListener('abort', () => { aborted = true; });
      return new Promise<Response>(() => {});
    }) as typeof globalThis.fetch;
    await executeRun(store, 'owner', id, { config, fetch, ...timing });
    assert.equal(requests, 1);
    assert.equal(aborted, true);
    assert.equal(store.snapshot('owner', id).error?.code, 'TIMEOUT');
    assert.equal(store.snapshot('owner', id).result, null);
  }
});

test('user stop aborts an in-flight provider and ignores a late provider response', async () => {
  const { store, id } = run('model');
  let resolve!: (value: Response) => void;
  let signal: AbortSignal | null | undefined;
  const fetch = (async (_url, init) => { signal = init?.signal; return new Promise<Response>(done => { resolve = done; }); }) as typeof globalThis.fetch;
  const running = executeRun(store, 'owner', id, { config, fetch });
  store.cancel('owner', id);
  await running;
  assert.equal(signal?.aborted, true);
  resolve(Response.json(tool('getServerTime', {}, 0)));
  await new Promise(done => setTimeout(done, 0));
  assert.equal(store.snapshot('owner', id).status, 'canceled');
  assert.equal(store.snapshot('owner', id).trace.length, 0);
});

test('POST returns a sanitized initial snapshot and signed HttpOnly cookie; GET is isolated and no-store', async () => {
  const response = await createDiagnosis(request(envelope()));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('cache-control')!, /no-store/);
  assert.match(response.headers.get('set-cookie')!, /HttpOnly; SameSite=Strict/);
  const cookie = response.headers.get('set-cookie')!.split(';')[0];
  const snapshot = await response.json();
  assert.equal(snapshot.status, 'running');
  assert.equal(snapshot.input, undefined);
  const own = await getDiagnosis(new Request('http://localhost', { headers: { cookie } }), snapshot.id);
  assert.equal(own.status, 200);
  assert.equal((await getDiagnosis(new Request('http://localhost'), snapshot.id)).status, 404);
  const other = await createDiagnosis(request(envelope()));
  const otherCookie = other.headers.get('set-cookie')!.split(';')[0];
  assert.equal((await getDiagnosis(new Request('http://localhost', { headers: { cookie: otherCookie } }), snapshot.id)).status, 404);
  const stopped = await cancelDiagnosis(request({}, { cookie }), snapshot.id);
  assert.equal((await stopped.json()).status, 'canceled');
  await new Promise(done => setTimeout(done, 10));
  assert.equal((await (await getDiagnosis(new Request('http://localhost', { headers: { cookie } }), snapshot.id)).json()).status, 'canceled');
});

test('POST and cancel reject cross-origin, missing origin and open schemas', async () => {
  assert.equal((await createDiagnosis(request(envelope(), { origin: 'https://attacker.example' }))).status, 403);
  const missing = request(envelope()); missing.headers.delete('origin');
  assert.equal((await createDiagnosis(missing)).status, 403);
  assert.equal((await createDiagnosis(request(envelope({ unexpected: true })))).status, 400);
  assert.equal((await createDiagnosis(request(envelope({ mode: 'auto' })))).status, 400);
  assert.equal((await createDiagnosis(request(envelope({ planner: 'fake' })))).status, 400);
  assert.equal((await cancelDiagnosis(request({}, { origin: 'https://attacker.example' }), 'unknown')).status, 403);
  assert.equal((await cancelDiagnosis(request({ execute: true }), 'unknown')).status, 400);
  const dup = JSON.stringify(envelope()).replace('"mode":"synthetic"', '"mode":"live","mode":"synthetic"');
  assert.equal((await createDiagnosis(request(dup, { raw: true }))).status, 400);
  assert.equal((await createDiagnosis(request(envelope({ fixtureId: 'ambiguous' })))).status, 400);
  assert.equal((await createDiagnosis(request(envelope(), { url: 'http://localhost/api/diagnoses?extra=true' }))).status, 400);
});

test('byte gates reject oversized streamed bodies, invalid UTF-8, malformed JSON and nested hostile data', async () => {
  assert.equal((await createDiagnosis(request('x'.repeat(16_385), { raw: true }))).status, 413);
  const unicode = JSON.stringify(envelope({ input: 'é'.repeat(9_000) }));
  assert.equal((await createDiagnosis(request(unicode, { raw: true }))).status, 413);
  assert.equal((await createDiagnosis(request('{bad', { raw: true }))).status, 400);
  await assert.rejects(boundedJson(new Response(new Uint8Array([0xff])), 100), code('INVALID_REQUEST'));
  const secret = envelope({ input: { ...fixture.rawRequest as object, apiKey: 'DO_NOT_LEAK' } });
  const response = await createDiagnosis(request(secret));
  assert.equal(response.status, 400);
  assert.ok(!(await response.text()).includes('DO_NOT_LEAK'));
});

test('aborting a bounded input read cancels its source stream', async () => {
  let canceled = false;
  const controller = new AbortController();
  const response = new Response(new ReadableStream({ cancel() { canceled = true; } }));
  const reading = boundedJson(response, 100, controller.signal);
  controller.abort(new SafeError('TIMEOUT'));
  await assert.rejects(reading, code('TIMEOUT'));
  assert.equal(canceled, true);
  await assert.rejects(abortable(Promise.resolve('late'), controller.signal), code('TIMEOUT'));
});

test('live is always HTTP 451 and never turns into synthetic; capability claims remain explicit', async () => {
  const response = await createDiagnosis(request(envelope({ mode: 'live' })));
  assert.equal(response.status, 451);
  assert.equal((await response.json()).error.code, 'HTTP_451_BLOCKED');
  const caps = await capabilities().json();
  assert.deepEqual(caps.modes, { synthetic: true, live: false });
  assert.match(caps.integration, /not hosted MCP/);
  assert.equal(caps.modelEvidence, 'runtime verification required');
  assert.equal(caps.limits.totalMs, 20_000);
  assert.equal(caps.limits.modelCallMs, 12_000);
});

test('missing server model configuration is unavailable rather than a scripted fallback', async t => {
  if (providerConfig()) { t.skip('server model configuration is present; do not modify real environment credentials'); return; }
  const response = await createDiagnosis(request(envelope({ planner: 'model' })));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).error.code, 'MODEL_UNAVAILABLE');
  const { store, id } = run('model');
  await executeRun(store, 'owner', id);
  assert.equal(store.snapshot('owner', id).error?.code, 'MODEL_UNAVAILABLE');
  assert.equal(store.snapshot('owner', id).result, null);
});

test('HTTPS sessions carry Secure and invalid or forged sessions cannot access a run', async () => {
  const response = await createDiagnosis(request(envelope(), { url: 'https://localhost/api/diagnoses', origin: 'https://localhost' }));
  assert.equal(response.status, 200);
  assert.match(response.headers.get('set-cookie')!, /; Secure$/);
  const snapshot = await response.json();
  const cookie = response.headers.get('set-cookie')!.split(';')[0];
  const forged = `meder_session=${'a'.repeat(64)}.${'b'.repeat(64)}`;
  assert.equal((await getDiagnosis(new Request('http://localhost', { headers: { cookie: forged } }), snapshot.id)).status, 404);
  assert.equal((await getDiagnosis(new Request('http://localhost', { headers: { cookie: `${cookie}; ${cookie}` } }), snapshot.id)).status, 404);
});
