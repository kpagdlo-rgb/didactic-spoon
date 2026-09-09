import test from 'node:test';
import assert from 'node:assert/strict';
import { ModelAccess, MODEL_ACCESS_LIMITS } from '../src/server/model-access';
import { SafeError } from '../src/server/safety';

const key = 'test-only-access-key-never-a-real-secret';
const denied = (code: string) => (error: unknown) => error instanceof SafeError && error.code === code;

test('access configuration fails closed and accepts only bounded printable ASCII keys', () => {
  for (const configured of [undefined, '', 'a'.repeat(31), 'a'.repeat(257), `${key}\n`, `${key} `, `${key}é`]) {
    const access = new ModelAccess(() => {}, () => configured);
    assert.deepEqual(access.status('owner'), { configured: false, authorized: false });
    assert.throws(() => access.require('owner'), denied('MODEL_UNAVAILABLE'));
    assert.throws(() => access.login('owner', key), denied('MODEL_UNAVAILABLE'));
  }
  for (const length of [32, 256]) {
    const configured = 'a'.repeat(length);
    const access = new ModelAccess(() => {}, () => configured);
    assert.equal(access.login('owner', configured).authorized, true);
    access.revoke('owner');
  }
});

test('access grants are session-bound, closed public status never exposes credential material', () => {
  const revoked: string[] = [];
  const access = new ModelAccess(owner => revoked.push(owner), () => key);
  for (const owner of [undefined, 'owner']) assert.throws(() => access.require(owner), denied('MODEL_ACCESS_REQUIRED'));
  assert.throws(() => access.login('owner', 'wrong-key-that-still-fits-the-schema'), denied('MODEL_ACCESS_REQUIRED'));
  for (const invalid of [undefined, null, 1, {}, [], 'short', 'a'.repeat(257), `${key}é`, `${key}\n`]) {
    assert.throws(() => access.login('owner', invalid), denied('INVALID_REQUEST'));
  }
  const status = access.login('owner', key);
  assert.deepEqual(Object.keys(status).sort(), ['authorized', 'configured', 'expiresAt']);
  assert.ok(!JSON.stringify(status).includes(key));
  assert.equal(access.status('other').authorized, false);
  assert.throws(() => access.require('other'), denied('MODEL_ACCESS_REQUIRED'));
  access.require('owner');
  access.revoke('owner');
  assert.deepEqual(revoked, ['owner']);
  assert.deepEqual(access.status('owner'), { configured: true, authorized: false });
});

test('15-minute grants use monotonic elapsed time and do not slide with status reads or wall changes', () => {
  let mono = 0, wall = 1_700_000_000_000;
  const revoked: string[] = [];
  const access = new ModelAccess(owner => revoked.push(owner), () => key, { mono: () => mono, wall: () => wall });
  const initial = access.login('owner', key);
  assert.equal(initial.expiresAt, new Date(wall + 900_000).toISOString());
  wall += 3_600_000;
  mono = 100;
  assert.deepEqual(access.status('owner'), initial);
  wall -= 7_200_000;
  mono = MODEL_ACCESS_LIMITS.ttlMs - 1;
  access.require('owner');
  mono++;
  assert.throws(() => access.require('owner'), denied('MODEL_ACCESS_REQUIRED'));
  assert.deepEqual(revoked, ['owner']);
  assert.deepEqual(access.status('owner'), { configured: true, authorized: false });
});

test('idle expiry and rotation actively revoke without another request', t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  let mono = 0;
  let configured: string | undefined = key;
  const revoked: string[] = [];
  const access = new ModelAccess(owner => revoked.push(owner), () => configured, { mono: () => mono, wall: () => 1_700_000_000_000 });
  access.login('expired', key);
  mono = MODEL_ACCESS_LIMITS.ttlMs;
  t.mock.timers.tick(1_000);
  assert.deepEqual(revoked, ['expired']);
  access.login('rotated-one', key);
  access.login('rotated-two', key);
  configured = 'replacement-test-only-access-key-123456';
  t.mock.timers.tick(1_000);
  assert.deepEqual(revoked, ['expired', 'rotated-one', 'rotated-two']);
  assert.equal(access.status('rotated-one').authorized, false);
  assert.throws(() => access.login('owner', key), denied('MODEL_ACCESS_REQUIRED'));
  access.login('disabled', configured);
  configured = undefined;
  t.mock.timers.tick(1_000);
  assert.deepEqual(revoked, ['expired', 'rotated-one', 'rotated-two', 'disabled']);
  configured = key;
  assert.equal(access.status('rotated-one').authorized, false, 'restoring an old key cannot restore old grants');
});

test('the global attempt window is monotonic, bounded, and independent of grants or key rotation', () => {
  let mono = 0, wall = 1_700_000_000_000;
  let configured = key;
  const access = new ModelAccess(() => {}, () => configured, { mono: () => mono, wall: () => wall });
  for (let i = 0; i < MODEL_ACCESS_LIMITS.attempts; i++) {
    access.attempt();
    access.login(`owner-${i}`, key);
    access.revoke(`owner-${i}`);
  }
  configured = 'replacement-test-only-access-key-123456';
  access.status();
  wall += 86_400_000;
  assert.throws(() => access.attempt(), denied('CAPACITY'));
  mono = MODEL_ACCESS_LIMITS.attemptWindowMs - 1;
  assert.throws(() => access.attempt(), denied('CAPACITY'));
  wall -= 172_800_000;
  mono++;
  access.attempt();
});

test('grant storage is bounded even after the login attempt window advances', () => {
  const access = new ModelAccess(() => {}, () => key);
  for (let i = 0; i < MODEL_ACCESS_LIMITS.grants; i++) access.login(`owner-${i}`, key);
  assert.throws(() => access.login('overflow', key), denied('CAPACITY'));
  assert.equal(access.login('owner-0', key).authorized, true, 'renewal does not allocate another slot');
  for (let i = 0; i < MODEL_ACCESS_LIMITS.grants; i++) access.revoke(`owner-${i}`);
});
