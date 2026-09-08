import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { getFixture, parseInput } from './domain';
import { executeRun, providerConfig } from './planner';
import { RunStore } from './run-store';
import { abortable, boundedJson, closed, LIMITS, SafeError, safeError } from './safety';

const globalState = globalThis as typeof globalThis & { mederServer?: { store: RunStore; secret: Buffer } };
const state = globalState.mederServer ??= { store: new RunStore(), secret: randomBytes(32) };
export const store = state.store;
const COOKIE = 'meder_session';
function signature(value: string) { return createHmac('sha256', state.secret).update(value).digest('hex'); }
function session(request: Request): string | undefined {
  const cookies = request.headers.get('cookie')?.split(';').map(value => value.trim()).filter(value => value.startsWith(`${COOKIE}=`)) ?? [];
  if (cookies.length !== 1) return undefined;
  const token = cookies[0].slice(COOKIE.length + 1);
  if (!/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token)) return undefined;
  const [nonce, mac] = token.split('.');
  return timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(signature(nonce), 'hex')) ? token : undefined;
}
function issueSession() { const nonce = randomBytes(32).toString('hex'); return `${nonce}.${signature(nonce)}`; }
function origin(request: Request) {
  const supplied = request.headers.get('origin');
  const expected = new URL(request.url).origin;
  if (supplied !== expected || request.headers.get('sec-fetch-site') === 'cross-site') throw new SafeError('INVALID_ORIGIN', 403);
}
function json(data: unknown, status = 200, cookie?: string, secure = false) {
  const headers: Record<string, string> = { 'content-type': 'application/json', 'cache-control': 'no-store, max-age=0', pragma: 'no-cache', 'x-content-type-options': 'nosniff', vary: 'Cookie, Origin' };
  if (cookie) headers['set-cookie'] = `${COOKIE}=${cookie}; HttpOnly; SameSite=Strict; Path=/; Max-Age=900${secure ? '; Secure' : ''}`;
  return new Response(JSON.stringify(data), { status, headers });
}
async function boundary(work: () => Promise<Response> | Response) {
  try { return await work(); }
  catch (error) { return json({ error: safeError(error) }, error instanceof SafeError ? error.status : 500); }
}
async function body(request: Request) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('content-type') ?? '') || request.headers.has('content-encoding')) throw new SafeError('INVALID_REQUEST');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new SafeError('TIMEOUT', 408)), LIMITS.totalMs);
  const signal = AbortSignal.any([request.signal, controller.signal]);
  try { return await abortable(boundedJson(request, LIMITS.requestBytes, signal), signal); }
  finally { clearTimeout(timer); }
}
function noQuery(request: Request) { if (new URL(request.url).search) throw new SafeError('INVALID_REQUEST'); }

export function createDiagnosis(request: Request) {
  return boundary(async () => {
    origin(request); noQuery(request);
    const envelope = await body(request);
    closed(envelope, ['mode', 'planner', 'fixtureId', 'input']);
    if (envelope.mode !== 'synthetic' && envelope.mode !== 'live') throw new SafeError('INVALID_REQUEST');
    if (envelope.planner !== 'deterministic' && envelope.planner !== 'model') throw new SafeError('INVALID_REQUEST');
    if (envelope.mode === 'live') throw new SafeError('HTTP_451_BLOCKED', 451);
    if (envelope.planner === 'model' && !providerConfig()) throw new SafeError('MODEL_UNAVAILABLE', 503);
    const fixture = getFixture(envelope.fixtureId);
    const input = parseInput(envelope.input);
    const symbol = input.kind === 'rejection' ? input.order.symbol : 'ABCUSDT';
    if (input.kind !== fixture.request.kind || (input.kind === 'rejection' && fixture.metadata?.symbol !== symbol)) throw new SafeError('INVALID_REQUEST');
    const existing = session(request);
    const owner = existing ?? issueSession();
    const snapshot = store.create(owner, input, fixture.id, symbol, envelope.planner);
    setTimeout(() => { void executeRun(store, owner, snapshot.id); }, 0);
    return json(snapshot, 200, owner, new URL(request.url).protocol === 'https:');
  });
}
export function getDiagnosis(request: Request, id: string) {
  return boundary(() => {
    noQuery(request);
    const owner = session(request);
    if (!owner) throw new SafeError('NOT_FOUND', 404);
    return json(store.snapshot(owner, id));
  });
}
export function cancelDiagnosis(request: Request, id: string) {
  return boundary(async () => {
    origin(request); noQuery(request);
    closed(await body(request), []);
    const owner = session(request);
    if (!owner) throw new SafeError('NOT_FOUND', 404);
    return json(store.cancel(owner, id));
  });
}
export function capabilities() {
  return json({ modes: { synthetic: true, live: false }, planners: { deterministic: true, model: !!providerConfig() }, limits: LIMITS,
    integration: 'server-owned function tools (not hosted MCP)',
    liveBlockReason: 'Live public data disabled after sandbox HTTP 451. No Binance requests are made.',
    modelEvidence: 'runtime verification required', persistence: 'Single-process memory; runs expire after 15 minutes and are lost on restart.' });
}
