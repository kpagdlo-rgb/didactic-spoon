import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrigin } from '../src/server/origin';
import { SafeError } from '../src/server/safety';
import { createDiagnosis } from '../src/server/http';
import { loadFixture } from '../fixtures';

function request(origin: string, host = '127.0.0.1:3000', extra: Record<string, string> = {}) {
  return new Request('http://0.0.0.0:3000/api/diagnoses', { method: 'POST', headers: { origin, host, ...extra } });
}
const denied = (error: unknown) => error instanceof SafeError && error.code === 'INVALID_ORIGIN';

test('loopback Host wins over Next internal bind address, with exact port and scheme', () => {
  assert.equal(validateOrigin(request('http://127.0.0.1:3000'), undefined, false).origin, 'http://127.0.0.1:3000');
  assert.equal(validateOrigin(request('http://localhost:3000', 'localhost:3000'), undefined, false).origin, 'http://localhost:3000');
  for (const origin of ['http://127.0.0.1:3001', 'https://127.0.0.1:3000', 'http://localhost:3000', 'null', 'http://127.0.0.1:3000/', 'http://user@127.0.0.1:3000']) {
    assert.throws(() => validateOrigin(request(origin), undefined, false), denied);
  }
  assert.throws(() => validateOrigin(request('http://127.0.0.1:3000'), undefined, true), denied);
});

test('unconfigured external and forwarded origins cannot authorize a request', () => {
  assert.throws(() => validateOrigin(request('https://preview.example', 'preview.example'), undefined, false), denied);
  assert.throws(() => validateOrigin(request('https://preview.example', '127.0.0.1:3000', {
    'x-forwarded-host': 'preview.example', 'x-forwarded-proto': 'https',
  }), undefined, false), denied);
  assert.throws(() => validateOrigin(request('http://127.0.0.1:3000', 'evil.example'), undefined, false), denied);
});

test('configured origin handles proxy TLS but never broadens to other origins or malformed configuration', () => {
  const allowed = 'https://preview.example';
  assert.equal(validateOrigin(request(allowed), allowed, true).protocol, 'https:');
  for (const origin of ['https://attacker.example', 'https://preview.example.attacker.example', 'http://preview.example', 'http://127.0.0.1:3000']) {
    assert.throws(() => validateOrigin(request(origin), allowed, false), denied);
  }
  for (const config of ['', 'https://preview.example/', 'https://preview.example,https://other.example', '*']) {
    assert.throws(() => validateOrigin(request(allowed), config, false), denied);
  }
  assert.throws(() => validateOrigin(request(allowed, '127.0.0.1:3000', { 'sec-fetch-site': 'cross-site' }), allowed, false), denied);
});

test('managed external preview requires the exact environment marker, HTTPS and matching Host', () => {
  const suffix = '.preview.usehoplite.com';
  const host = 'current.preview.usehoplite.com';
  const origin = `https://${host}`;
  assert.equal(validateOrigin(request(origin, host), undefined, false, suffix).origin, origin);
  assert.equal(validateOrigin(request('https://future.preview.usehoplite.com', 'future.preview.usehoplite.com'), undefined, false, suffix).origin, 'https://future.preview.usehoplite.com');
  for (const incoming of [
    request(origin, 'sibling.preview.usehoplite.com'),
    request('https://sibling.preview.usehoplite.com', host),
    request(`http://${host}`, host),
    request('https://preview.usehoplite.com', 'preview.usehoplite.com'),
    request('https://current.preview.usehoplite.com.attacker.example', 'current.preview.usehoplite.com.attacker.example'),
    request(origin, '127.0.0.1:3000', { 'x-forwarded-host': host, 'x-forwarded-proto': 'https' }),
    request(origin, host, { 'sec-fetch-site': 'cross-site' }),
    request(`${origin}:8443`, host),
  ]) assert.throws(() => validateOrigin(incoming, undefined, false, suffix), denied);
  for (const marker of ['', '.example.com', '*.preview.usehoplite.com', `${suffix},.example.com`]) {
    assert.throws(() => validateOrigin(request(origin, host), undefined, false, marker), denied);
  }
  const noHost = new Request('http://0.0.0.0:3000/api/diagnoses', { headers: { origin } });
  assert.throws(() => validateOrigin(noHost, undefined, false, suffix), denied);
  assert.throws(() => validateOrigin(request(origin, host), undefined, true, suffix), denied);
  assert.throws(() => validateOrigin(request(origin, host), 'https://other.example', false, suffix), denied);
});

test('managed preview default environment lookup fails closed when the marker is absent', () => {
  const original = process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS;
  try {
    delete process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS;
    assert.throws(() => validateOrigin(request('https://current.preview.usehoplite.com', 'current.preview.usehoplite.com'), undefined, false), denied);
    process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = '.preview.usehoplite.com';
    assert.equal(validateOrigin(request('https://current.preview.usehoplite.com', 'current.preview.usehoplite.com'), undefined, false).protocol, 'https:');
  } finally {
    if (original === undefined) delete process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS;
    else process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS = original;
  }
});

test('actual route accepts Next-shaped loopback requests and canonicalizes both UI fixture aliases', async () => {
  for (const [fixtureId, canonical] of [['repairable_quantity', 'repairable'], ['ambiguous_submission', 'ambiguous']] as const) {
    const incoming = request('http://127.0.0.1:3000');
    incoming.headers.set('content-type', 'application/json');
    const response = await createDiagnosis(new Request(incoming, { body: JSON.stringify({
      mode: 'synthetic', planner: 'deterministic', fixtureId, input: loadFixture(canonical).rawRequest,
    }) }));
    assert.equal(response.status, 200);
    assert.match(response.headers.get('set-cookie')!, /HttpOnly; SameSite=Strict/);
    assert.equal((await response.json()).status, 'running');
  }
});
