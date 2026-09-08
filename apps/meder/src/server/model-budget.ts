import { SafeError } from './safety';

export class ModelRunBudget {
  private used = 0;
  private active = 0;
  readonly limit: number;
  constructor(value: string | undefined) {
    this.limit = value === undefined ? 10 : /^[1-9]\d{0,2}$/.test(value) && Number(value) <= 100 ? Number(value) : 0;
  }
  snapshot() {
    return { limit: this.limit, remaining: this.limit - this.used, active: this.active, maxConcurrent: 1, scope: 'process-lifetime' as const };
  }
  acquire() {
    if (this.active >= 1 || this.used >= this.limit) throw new SafeError('CAPACITY', 429);
    this.used++;
    this.active++;
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.active--;
    };
  }
}

const globalState = globalThis as typeof globalThis & { mederModelBudget?: ModelRunBudget };
export const modelBudget = globalState.mederModelBudget ??= new ModelRunBudget(process.env.MEDER_MODEL_RUN_BUDGET);
