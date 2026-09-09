import { getFixture, parseInput } from './domain';
import { executeRun, providerConfig } from './planner';
import { RunStore } from './run-store';
import { modelBudget } from './model-budget';
import { ModelAccess, MODEL_ACCESS_LIMITS } from './model-access';
import { validateOrigin } from './origin';
import { issueSession, session, sessionCookie } from './session';
import { abortable, boundedJson, closed, LIMITS, SafeError, safeError } from './safety';

const globalState = globalThis as typeof globalThis & { mederServer?: { store: RunStore }; mederModelAccess?: ModelAccess };
const state = globalState.mederServer ??= { store: new RunStore() };
export const store = state.store;
const modelAccess = globalState.mederModelAccess ??= new ModelAccess(owner => store.cancelModelRuns(owner));
function json(data: unknown, status = 200, cookie?: string, secure = false) {
  const headers: Record<string, string> = { 'content-type': 'application/json', 'cache-control': 'no-store, max-age=0', pragma: 'no-cache', 'x-content-type-options': 'nosniff', vary: 'Cookie, Origin' };
  if (cookie) headers['set-cookie'] = sessionCookie(cookie, secure);
  return new Response(JSON.stringify(data), { status, headers });
}
async function boundary(work: () => Promise<Response> | Response) {
  try { return await work(); }
  catch (error) { return json({ error: safeError(error) }, error instanceof SafeError ? error.status : 500); }
}
async function body(request: Request, limit: number = LIMITS.requestBytes) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers.get('content-type') ?? '') || request.headers.has('content-encoding')) throw new SafeError('INVALID_REQUEST');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new SafeError('TIMEOUT', 408)), LIMITS.totalMs);
  const signal = AbortSignal.any([request.signal, controller.signal]);
  try { return await abortable(boundedJson(request, limit, signal), signal); }
  finally { clearTimeout(timer); }
}
function noQuery(request: Request) { if (new URL(request.url).search) throw new SafeError('INVALID_REQUEST'); }

export function createDiagnosis(request: Request) {
  return boundary(async () => {
    const origin = validateOrigin(request); noQuery(request);
    const envelope = await body(request);
    closed(envelope, ['mode', 'planner', 'fixtureId', 'input']);
    if (envelope.mode !== 'synthetic' && envelope.mode !== 'live') throw new SafeError('INVALID_REQUEST');
    if (envelope.planner !== 'deterministic' && envelope.planner !== 'model') throw new SafeError('INVALID_REQUEST');
    if (envelope.mode === 'live') throw new SafeError('HTTP_451_BLOCKED', 451);
    const existing = session(request);
    if (envelope.planner === 'model') {
      modelAccess.require(existing);
      if (!providerConfig()) throw new SafeError('MODEL_UNAVAILABLE', 503);
    }
    const fixture = getFixture(envelope.fixtureId);
    const input = parseInput(envelope.input);
    const symbol = input.kind === 'rejection' ? input.order.symbol : 'ABCUSDT';
    if (input.kind !== fixture.request.kind || (input.kind === 'rejection' && fixture.metadata?.symbol !== symbol)) throw new SafeError('INVALID_REQUEST');
    const owner = existing ?? issueSession();
    const release = envelope.planner === 'model' ? modelBudget.acquire() : () => {};
    try {
      const snapshot = store.create(owner, input, fixture.id, symbol, envelope.planner);
      setTimeout(() => { void executeRun(store, owner, snapshot.id, { authorizeModel: () => modelAccess.require(owner) }).finally(release); }, 0);
      return json(snapshot, 200, owner, origin.protocol === 'https:');
    } catch (error) {
      release();
      throw error;
    }
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
    validateOrigin(request); noQuery(request);
    closed(await body(request), []);
    const owner = session(request);
    if (!owner) throw new SafeError('NOT_FOUND', 404);
    return json(store.cancel(owner, id));
  });
}
export function loginModelAccess(request: Request) {
  return boundary(async () => {
    const origin = validateOrigin(request);
    modelAccess.attempt();
    noQuery(request);
    const envelope = await body(request, MODEL_ACCESS_LIMITS.requestBytes);
    closed(envelope, ['accessKey']);
    const owner = session(request) ?? issueSession();
    const access = modelAccess.login(owner, envelope.accessKey);
    return json({ modelAccess: access }, 200, owner, origin.protocol === 'https:');
  });
}
export function logoutModelAccess(request: Request) {
  return boundary(async () => {
    validateOrigin(request); noQuery(request);
    closed(await body(request, MODEL_ACCESS_LIMITS.requestBytes), []);
    const owner = session(request);
    if (owner) modelAccess.revoke(owner);
    return json({ modelAccess: modelAccess.status(owner) });
  });
}
export function capabilities(request?: Request) {
  const access = modelAccess.status(request ? session(request) : undefined);
  const budget = modelBudget.snapshot();
  const providerConfigured = !!providerConfig();
  return json({ modes: { synthetic: true, live: false }, planners: { deterministic: true, model: providerConfigured && access.configured && access.authorized && budget.remaining > 0 && budget.active < budget.maxConcurrent }, limits: LIMITS,
    providerConfigured, modelAccess: access,
    modelBudget: budget,
    integration: 'server-owned function tools (not hosted MCP)',
    liveBlockReason: 'Live public data disabled after sandbox HTTP 451. No Binance requests are made.',
    modelEvidence: 'runtime verification required', persistence: 'Single-process memory; runs expire after 15 minutes and are lost on restart.' });
}
