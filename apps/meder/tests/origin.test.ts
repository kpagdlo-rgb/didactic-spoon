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
