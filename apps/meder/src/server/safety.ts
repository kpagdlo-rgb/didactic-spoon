import { parseClosedJson } from '../domain/json';

export const LIMITS = Object.freeze({ requestBytes: 16_384, responseBytes: 1_048_576, metadataAgeMs: 60_000, retentionMs: 900_000, toolCalls: 5, totalMs: 20_000, modelCallMs: 12_000, publicReadMs: 3_000 });
const MESSAGES = {
  INVALID_REQUEST: 'The request does not match the supported schema.',
  TOO_LARGE: 'The request exceeds the size limit.',
  INVALID_ORIGIN: 'A same-origin request is required.',
  NOT_FOUND: 'The diagnosis is unavailable or expired.',
  HTTP_451_BLOCKED: 'Live public data is disabled in this environment. Start a separate synthetic diagnosis.',
  MODEL_UNAVAILABLE: 'Model mode requires server-side provider configuration.',
  PROVIDER_FAILED: 'The model provider did not complete the diagnosis. No proposal was produced.',
  PROVIDER_INVALID: 'The model returned an unsupported response. No proposal was produced.',
  TIMEOUT: 'The diagnosis exceeded its deadline. No proposal was produced.',
  CANCELED: 'The diagnosis was stopped. No proposal was produced.',
  TOOL_DENIED: 'The requested tool or its arguments are not permitted.',
  TOOL_LIMIT: 'The diagnosis reached its tool-call limit.',
  STALE_METADATA: 'The metadata evidence is stale.',
  INVALID_EVIDENCE: 'The metadata evidence does not belong to this diagnosis.',
  CAPACITY: 'The diagnostic service is busy. Try again later.',
  INTERNAL: 'The diagnosis could not be completed safely.',
} as const;
export type ErrorCode = keyof typeof MESSAGES;
export class SafeError extends Error {
  constructor(public readonly code: ErrorCode, public readonly status = 400) { super(MESSAGES[code]); }
}
export function safeError(error: unknown) {
  const safe = error instanceof SafeError ? error : new SafeError('INTERNAL', 500);
  return { code: safe.code, message: safe.message };
}
export function closed(value: unknown, required: readonly string[], optional: readonly string[] = []): asserts value is Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new SafeError('INVALID_REQUEST');
  const keys = Object.keys(value);
  if (required.some(key => !Object.hasOwn(value, key)) || keys.some(key => !required.includes(key) && !optional.includes(key))) throw new SafeError('INVALID_REQUEST');
}
export function immutable<T>(value: T): T {
  const copy = structuredClone(value);
  function freeze(item: unknown) {
    if (item && typeof item === 'object') { Object.values(item).forEach(freeze); Object.freeze(item); }
  }
  freeze(copy);
  return copy;
}
export async function boundedJson(response: Response | Request, limit: number, signal?: AbortSignal): Promise<unknown> {
  const length = response.headers.get('content-length');
  if (length !== null && (!/^\d+$/.test(length) || Number(length) > limit)) {
    void response.body?.cancel().catch(() => {});
    throw new SafeError('TOO_LARGE', 413);
  }
  if (!response.body) throw new SafeError('INVALID_REQUEST');
  const reader = response.body.getReader();
  const cancel = () => { void reader.cancel().catch(() => {}); };
  signal?.addEventListener('abort', cancel, { once: true });
  if (signal?.aborted) cancel();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      if (signal?.aborted) throw signal.reason instanceof SafeError ? signal.reason : new SafeError('CANCELED');
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { void reader.cancel().catch(() => {}); throw new SafeError('TOO_LARGE', 413); }
      chunks.push(value);
    }
    if (signal?.aborted) throw signal.reason instanceof SafeError ? signal.reason : new SafeError('CANCELED');
    return parseClosedJson(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
  } catch (error) {
    cancel();
    if (error instanceof SafeError) throw error;
    throw new SafeError('INVALID_REQUEST');
  } finally { signal?.removeEventListener('abort', cancel); reader.releaseLock(); }
}
export async function abortable<T>(work: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) {
    // Work may already have started; observe rejection even when cancellation wins.
    void work.catch(() => {});
    throw signal.reason instanceof SafeError ? signal.reason : new SafeError('CANCELED');
  }
  let listener: () => void = () => {};
  const stopped = new Promise<never>((_, reject) => {
    listener = () => reject(signal.reason instanceof SafeError ? signal.reason : new SafeError('CANCELED'));
    signal.addEventListener('abort', listener, { once: true });
  });
  try { return await Promise.race([work, stopped]); }
  finally { signal.removeEventListener('abort', listener); }
}
