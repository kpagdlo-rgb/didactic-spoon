"use client";

import { useRef, type FormEvent } from "react";
import type { useModelAccess } from "../../src/client/use-model-access";

export function ModelAccessPanel({ access, diagnosing }: { access: ReturnType<typeof useModelAccess>; diagnosing: boolean }) {
  const keyInput = useRef<HTMLInputElement>(null);
  const { state, pending, error, message } = access;

  async function unlock(event: FormEvent) {
    event.preventDefault();
    if (pending || diagnosing || !keyInput.current) return;
    const key = keyInput.current.value;
    // Never retain the deployment key in React state or browser storage.
    keyInput.current.value = "";
    await access.unlock(key);
  }

  return <section className="model-access" aria-labelledby="model-access-title">
    <div className="access-heading"><h3 id="model-access-title">Private model access</h3><span className="badge">{!access.checked ? "UNVERIFIED" : state.modelAccess.authorized ? "UNLOCKED" : "LOCKED"}</span></div>
    {!access.checked ? <>
      <p className="help">The server’s access status has not been confirmed. Model calls remain disabled in this interface.</p>
      {access.lockUnconfirmed && <button type="button" onClick={() => void access.lock()} disabled={pending}>{pending ? "Updating access…" : "Retry locking model access"}</button>}
    </>
      : !state.modelAccess.configured ? <p className="help">A private access key is not configured on this server. Deterministic diagnostics remain available without a key.</p>
      : state.modelAccess.authorized ? <>
        <p className="help">Access is limited to this browser session. {state.modelAccess.expiresAt && <>Expires at {new Date(state.modelAccess.expiresAt).toLocaleTimeString()}.</>}</p>
        <button type="button" onClick={() => void access.lock()} disabled={pending}>{pending ? "Updating access…" : "Lock model access"}</button>
      </> : <form onSubmit={unlock}>
        <div className="field"><label htmlFor="model-access-key">Private demo access key</label><input ref={keyInput} id="model-access-key" name="model-access-key" type="password" autoComplete="off" spellCheck={false} minLength={32} maxLength={256} required disabled={pending || diagnosing} data-private="true" /></div>
        <p className="help">Use the deployment owner’s shared demo key — never a Binance or model-provider API key. It is not saved in browser storage.</p>
        <button type="submit" disabled={pending || diagnosing}>{pending ? "Unlocking…" : "Unlock model access"}</button>
      </form>}
    {state.modelAccess.configured && !state.providerConfigured && <p className="help">The model provider is not configured. Unlocking access alone does not enable model calls.</p>}
    {state.modelBudget && state.providerConfigured && <p className="help">{state.modelBudget.remaining} model runs remain in this server process. Only one may run at a time.</p>}
    {error && <p className="access-error" role="alert">{error}</p>}
    <p className="help" role="status" aria-live="polite">{message}</p>
  </section>;
}
