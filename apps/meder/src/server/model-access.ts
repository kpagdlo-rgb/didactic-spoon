import { createHash, timingSafeEqual } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { SafeError } from './safety';

export const MODEL_ACCESS_LIMITS = Object.freeze({ requestBytes: 1_024, ttlMs: 900_000, attempts: 10, attemptWindowMs: 60_000, grants: 1_000 });
export type ModelAccessStatus = { configured: boolean; authorized: boolean; expiresAt?: string };
type Grant = { expiresMono: number; expiresAt: string };
const validKey = (value: unknown): value is string => typeof value === 'string' && /^[\x21-\x7e]{32,256}$/.test(value);
const digest = (value: string) => createHash('sha256').update(value).digest();

export class ModelAccess {
  private grants = new Map<string, Grant>();
  private attempts: number[] = [];
  private configuredHash?: Buffer;
  private timer?: ReturnType<typeof setTimeout>;

  constructor(
    private revokeRuns: (owner: string) => void,
    private configuredKey = () => process.env.MEDER_MODEL_ACCESS_KEY,
    private clock = { wall: () => Date.now(), mono: () => performance.now() },
  ) {}

  private refresh() {
    const key = this.configuredKey();
    const nextHash = validKey(key) ? digest(key) : undefined;
    if (!nextHash || !this.configuredHash || !timingSafeEqual(nextHash, this.configuredHash)) {
      for (const owner of this.grants.keys()) this.revoke(owner);
      this.configuredHash = nextHash;
    }
    const now = this.clock.mono();
    for (const [owner, grant] of this.grants) if (now >= grant.expiresMono) this.revoke(owner);
  }

  private schedule() {
    if (this.timer || !this.grants.size) return;
    const remaining = Math.min(...[...this.grants.values()].map(grant => grant.expiresMono - this.clock.mono()));
    // Recheck rotation even when no further HTTP requests arrive.
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.refresh();
      this.schedule();
    }, Math.max(1, Math.ceil(Math.min(1_000, remaining))));
    this.timer.unref();
  }

  attempt() {
    const now = this.clock.mono();
    this.attempts = this.attempts.filter(at => now - at < MODEL_ACCESS_LIMITS.attemptWindowMs);
    if (this.attempts.length >= MODEL_ACCESS_LIMITS.attempts) throw new SafeError('CAPACITY', 429);
    this.attempts.push(now);
  }

  status(owner?: string): ModelAccessStatus {
    this.refresh();
    const grant = owner ? this.grants.get(owner) : undefined;
    return { configured: !!this.configuredHash, authorized: !!grant, ...(grant ? { expiresAt: grant.expiresAt } : {}) };
  }

  require(owner?: string) {
    const status = this.status(owner);
    if (!status.configured) throw new SafeError('MODEL_UNAVAILABLE', 503);
    if (!status.authorized) throw new SafeError('MODEL_ACCESS_REQUIRED', 403);
  }

  login(owner: string, accessKey: unknown): ModelAccessStatus {
    this.refresh();
    if (!validKey(accessKey)) throw new SafeError('INVALID_REQUEST');
    if (!this.configuredHash) throw new SafeError('MODEL_UNAVAILABLE', 503);
    if (!timingSafeEqual(digest(accessKey), this.configuredHash)) throw new SafeError('MODEL_ACCESS_REQUIRED', 403);
    if (!this.grants.has(owner) && this.grants.size >= MODEL_ACCESS_LIMITS.grants) throw new SafeError('CAPACITY', 429);
    this.grants.set(owner, { expiresMono: this.clock.mono() + MODEL_ACCESS_LIMITS.ttlMs, expiresAt: new Date(this.clock.wall() + MODEL_ACCESS_LIMITS.ttlMs).toISOString() });
    this.schedule();
    return this.status(owner);
  }

  revoke(owner: string) {
    this.grants.delete(owner);
    this.revokeRuns(owner);
    if (!this.grants.size) { clearTimeout(this.timer); this.timer = undefined; }
  }
}
