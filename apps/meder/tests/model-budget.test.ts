import test from 'node:test';
import assert from 'node:assert/strict';
import { ModelRunBudget } from '../src/server/model-budget';
import { SafeError } from '../src/server/safety';

const capacity = (error: unknown) => error instanceof SafeError && error.code === 'CAPACITY' && error.status === 429;

test('budget defaults to ten, accepts only 1..100 and fails closed for invalid configuration', () => {
  assert.equal(new ModelRunBudget(undefined).limit, 10);
  for (const value of ['1', '10', '100']) assert.equal(new ModelRunBudget(value).limit, Number(value));
  for (const value of ['', '0', '101', '-1', 'Infinity', '1.5', '1e2', ' 10', '01']) {
    const budget = new ModelRunBudget(value);
    assert.equal(budget.snapshot().remaining, 0);
    assert.throws(() => budget.acquire(), capacity);
  }
});

test('global admission permits one active run and never refunds released allowances', () => {
  const budget = new ModelRunBudget('2');
  const release = budget.acquire();
  assert.throws(() => budget.acquire(), capacity);
  assert.deepEqual(budget.snapshot(), { limit: 2, remaining: 1, active: 1, maxConcurrent: 1, scope: 'process-lifetime' });
  release(); release();
  assert.equal(budget.snapshot().active, 0);
  budget.acquire()();
  assert.throws(() => budget.acquire(), capacity);
  assert.equal(budget.snapshot().remaining, 0);
});
