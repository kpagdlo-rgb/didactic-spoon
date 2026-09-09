"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ModelCapabilities = {
  providerConfigured: boolean;
  planners: { model: boolean };
  modelAccess: { configured: boolean; authorized: boolean; expiresAt?: string };
  modelBudget?: { remaining: number; active: number };
};

const unavailable: ModelCapabilities = {
  providerConfigured: false,
  planners: { model: false },
  modelAccess: { configured: false, authorized: false },
};

function capabilities(value: unknown): ModelCapabilities {
  if (!value || typeof value !== "object") throw new Error("Invalid capabilities");
  const data = value as Partial<ModelCapabilities>;
  if (typeof data.providerConfigured !== "boolean"
    || typeof data.planners?.model !== "boolean"
    || typeof data.modelAccess?.configured !== "boolean"
    || typeof data.modelAccess?.authorized !== "boolean") throw new Error("Invalid capabilities");
  return {
    providerConfigured: data.providerConfigured,
    planners: { model: data.planners.model && data.modelAccess.authorized && data.modelAccess.configured && data.providerConfigured },
    modelAccess: {
      configured: data.modelAccess.configured,
      authorized: data.modelAccess.authorized,
      ...(typeof data.modelAccess.expiresAt === "string" && Number.isFinite(Date.parse(data.modelAccess.expiresAt)) ? { expiresAt: data.modelAccess.expiresAt } : {}),
    },
    ...(data.modelBudget && Number.isSafeInteger(data.modelBudget.remaining) && Number.isSafeInteger(data.modelBudget.active)
      ? { modelBudget: { remaining: data.modelBudget.remaining, active: data.modelBudget.active } } : {}),
  };
}

export function useModelAccess() {
  const [state, setState] = useState<ModelCapabilities>(unavailable);
  const [pending, setPending] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");
  const [capabilityError, setCapabilityError] = useState("");
  const [message, setMessage] = useState("");
  const [lockUnconfirmed, setLockUnconfirmed] = useState(false);
  const generation = useRef(0);
  const refreshController = useRef<AbortController | null>(null);
  const operationController = useRef<AbortController | null>(null);
  const operating = useRef(false);
  const mounted = useRef(false);

  const refresh = useCallback(async () => {
    const token = ++generation.current;
    refreshController.current?.abort();
    const abort = new AbortController();
    refreshController.current = abort;
    try {
      const response = await fetch("/api/capabilities", { cache: "no-store", signal: AbortSignal.any([abort.signal, AbortSignal.timeout(5000)]) });
      if (!response.ok) throw new Error("Unavailable");
      const next = capabilities(await response.json());
      if (mounted.current && token === generation.current) {
        setState(next);
        setChecked(true);
        setCapabilityError("");
        if (!next.modelAccess.authorized) setLockUnconfirmed(false);
      }
    } catch {
      if (mounted.current && token === generation.current && !abort.signal.aborted) {
        setState(unavailable);
        setChecked(false);
        setCapabilityError("Model access could not be checked. Deterministic diagnostics remain available.");
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const check = () => { if (!operating.current) void refresh(); };
    check();
    const interval = setInterval(check, 30_000);
    window.addEventListener("focus", check);
    return () => {
      mounted.current = false;
      clearInterval(interval);
      window.removeEventListener("focus", check);
      refreshController.current?.abort();
      operationController.current?.abort();
    };
  }, [refresh]);

  async function update(action: "unlock" | "lock", accessKey?: string) {
    if (operating.current) return;
    operating.current = true;
    setPending(true); setError(""); setMessage("");
    if (action === "lock") setLockUnconfirmed(true);
    const abort = new AbortController();
    operationController.current = abort;
    ++generation.current;
    refreshController.current?.abort();
    try {
      const response = await fetch(action === "unlock" ? "/api/model-access" : "/api/model-access/logout", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "unlock" ? { accessKey } : {}),
        signal: AbortSignal.any([abort.signal, AbortSignal.timeout(5000)]),
      });
      if (!response.ok) {
        const text = action === "lock" ? "Locking model access could not be confirmed; access may still be active. No request was retried."
          : response.status === 429 ? "Too many access attempts. Wait one minute before trying again."
          : response.status === 503 ? "Model access is unavailable. Check the server configuration."
          : response.status === 403 ? "Model access was not authorized. Check the private demo access key and try again."
          : "Unlocking model access could not be confirmed. No request was retried.";
        if (mounted.current) setError(text);
        return;
      }
      const result = await response.json();
      if (typeof result?.modelAccess?.configured !== "boolean"
        || result.modelAccess.authorized !== (action === "unlock")
        || (action === "unlock" && !result.modelAccess.configured)) throw new Error("Unconfirmed access state");
      if (mounted.current && action === "lock") setLockUnconfirmed(false);
      if (mounted.current) setMessage(action === "unlock" ? "Access key accepted. Unlocking does not call a model." : "Model access locked. Any active model runs in this session were canceled.");
    } catch {
      if (mounted.current) setError(action === "lock"
        ? "Locking model access could not be confirmed; access may still be active. No request was retried."
        : "The access change could not be confirmed. No request was retried.");
    } finally {
      if (mounted.current) {
        await refresh();
        if (mounted.current) setPending(false);
      }
      operating.current = false;
    }
  }

  return { state, checked, pending, lockUnconfirmed, error: error || capabilityError, message, refresh, unlock: (key: string) => update("unlock", key), lock: () => update("lock") };
}
