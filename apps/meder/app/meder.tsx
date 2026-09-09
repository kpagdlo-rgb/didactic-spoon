"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { DiagnosisResult } from "../src/domain/types";
import { parseClosedJson } from "../src/domain/json";
import { useModelAccess } from "../src/client/use-model-access";
import { ModelAccessPanel } from "./model-access-panel";
import FluidOrb from "@/components/ui/fluid-orb";
import { QuantityCounter } from "@/components/meder/quantity-counter";
import { ShieldCheck } from "lucide-react";

type FixtureId = "repairable" | "budget_refusal" | "ambiguous" | "off_grid_min";
type Planner = "deterministic" | "model";
type TraceEntry = {
  tool?: string;
  name?: string;
  summary?: string;
  code?: string;
};
type Run = {
  id: string;
  status: "running" | "completed" | "canceled" | "error";
  observedSource?: "synthetic_fixture" | "redacted_import";
  result?: DiagnosisResult | null;
  trace?: TraceEntry[];
  evidence?: {
    mode?: string;
    receivedAt?: string;
    fixtureVersion?: string;
    ageMs?: number;
  }[];
  error?: { code: string; message: string } | null;
  export?: unknown;
};

const presets: Record<
  FixtureId,
  { label: string; quantity: string; cap: string; detail: string }
> = {
  repairable: {
    label: "Quantity correction",
    quantity: "0.00123",
    cap: "0.123",
    detail: "Step 0.001 · minimum quantity 0.001 · minimum notional 0.10",
  },
  budget_refusal: {
    label: "No correction within budget",
    quantity: "0.100",
    cap: "9.99",
    detail: "Step 0.001 · minimum quantity 0.001 · minimum notional 10.00",
  },
  ambiguous: {
    label: "Unknown execution",
    quantity: "0.100",
    cap: "10",
    detail: "Invented lost-response report. No account lookup or retry.",
  },
  off_grid_min: {
    label: "Zero-origin grid regression",
    quantity: "0.0022",
    cap: "1",
    detail:
      "Step 0.001 · minimum quantity 0.0015 · grid is not offset from minimum",
  },
};
const titles: Record<string, string> = {
  REPAIR_PROPOSED: "A smaller quantity fits your limits.",
  REFUSED: "No correction fits your limits.",
  REFUSED_EXACT_TOLERANCE: "Your exact quantity stays protected.",
  ALREADY_VALID: "Your order meets the checked rules.",
  INCOMPLETE: "There isn’t enough evidence to decide.",
  UNRESOLVED: "The execution outcome is unknown.",
};
const ruleLabels: Record<string, string> = {
  LOT_SIZE:
    "Quantity is outside the allowed lot bounds or does not match the zero-origin step.",
  PRICE_FILTER:
    "Price is outside its allowed bounds or tick grid. Your price will not be changed.",
  MIN_NOTIONAL: "Price × quantity is below the required minimum notional.",
  NOTIONAL: "Price × quantity is outside the permitted notional interval.",
  QUOTE_NOTIONAL_CAP:
    "Price × quantity exceeds your quote-notional cap, excluding fees.",
};

export default function Meder() {
  const [fixture, setFixture] = useState<FixtureId>("repairable");
  const [side, setSide] = useState("BUY");
  const [price, setPrice] = useState("100");
  const [quantity, setQuantity] = useState("0.00123");
  const [cap, setCap] = useState("0.123");
  const [tolerance, setTolerance] = useState("allow_all_downward");
  const [planner, setPlanner] = useState<Planner>("deterministic");
  const modelAccess = useModelAccess();
  const modelAvailable = modelAccess.state.planners.model;
  const [raw, setRaw] = useState("");
  const [useRaw, setUseRaw] = useState(false);
  const [run, setRun] = useState<Run | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copyMessage, setCopyMessage] = useState("");
  const [submittedPlanner, setSubmittedPlanner] =
    useState<Planner>("deterministic");
  const [submittedFixture, setSubmittedFixture] =
    useState<FixtureId>("repairable");
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const currentId = useRef<string | null>(null);
  const stopRequested = useRef(false);

  useEffect(() => {
    return () => {
      controller.current?.abort();
    };
  }, []);

  function invalidate() {
    generation.current += 1;
    controller.current?.abort();
    setRun(null);
    setError("");
    setCopyMessage("");
  }
  function chooseFixture(value: FixtureId) {
    invalidate();
    setFixture(value);
    setPrice("100");
    setSide("BUY");
    setQuantity(presets[value].quantity);
    setCap(presets[value].cap);
    setTolerance("allow_all_downward");
    setRaw("");
    setUseRaw(false);
  }
  function input() {
    if (useRaw) {
      if (new TextEncoder().encode(raw).byteLength > 16384)
        throw new Error("Oversized input");
      return parseClosedJson(raw);
    }
    if (fixture === "ambiguous")
      return {
        kind: "ambiguous_submission",
        source: "synthetic_fixture",
        identifier: { clientOrderId: "meder-synthetic-example" },
        importedStatus: {
          status: "UNKNOWN",
          source: "synthetic_fixture",
          observedAt: "2026-09-08T21:00:00Z",
        },
      };
    return {
      kind: "rejection",
      order: {
        symbol: "ABCUSDT",
        side,
        type: "LIMIT",
        timeInForce: "GTC",
        price,
        quantity,
      },
      observed: {
        source: "synthetic_fixture",
        code: "-1013",
        message: "Filter failure: LOT_SIZE",
      },
      intent: {
        priceTolerance: "exact",
        quantityTolerance: side === "SELL" ? "exact" : tolerance,
        ...(side === "BUY" ? { maxQuoteNotional: cap } : {}),
      },
    };
  }
  async function cancelOnServer(id: string) {
    const response = await fetch(
      `/api/diagnoses/${encodeURIComponent(id)}/cancel`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!response.ok)
      throw new Error(
        "Could not confirm cancellation. This app has no financial actions.",
      );
    return response.json() as Promise<Run>;
  }
  async function diagnose(event: FormEvent) {
    event.preventDefault();
    if (busy || modelAccess.pending) return;
    if (planner === "model" && !modelAvailable) {
      setError("Model access is unavailable. Unlock access or explicitly choose deterministic mode.");
      return;
    }
    invalidate();
    const token = generation.current;
    const abort = new AbortController();
    controller.current = abort;
    stopRequested.current = false;
    currentId.current = null;
    let requestInput;
    try {
      requestInput = input();
    } catch {
      setError(
        "Enter valid, unique-key JSON within 16 KiB. Do not include credentials or account data.",
      );
      return;
    }
    const body = JSON.stringify({
      mode: "synthetic",
      planner,
      fixtureId: fixture,
      input: requestInput,
    });
    if (new TextEncoder().encode(body).byteLength > 16384) {
      setError("Input exceeds the 16 KiB request limit.");
      return;
    }
    setSubmittedPlanner(planner);
    setSubmittedFixture(fixture);
    setBusy(true);
    const timeout = setTimeout(() => abort.abort(), 25000);
    try {
      const response = await fetch("/api/diagnoses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal: abort.signal,
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          typeof data.error?.message === "string"
            ? data.error.message
            : "The diagnostic request could not be accepted.",
        );
      }
      let next: Run = await response.json();
      currentId.current = next.id;
      if (stopRequested.current) next = await cancelOnServer(next.id);
      if (token !== generation.current) return;
      setRun(next);
      while (next.status === "running" && !abort.signal.aborted) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const poll = await fetch(
          `/api/diagnoses/${encodeURIComponent(next.id)}`,
          { signal: abort.signal, cache: "no-store" },
        );
        if (!poll.ok)
          throw new Error(
            "This report has expired or is unavailable in this session. Start a new diagnosis.",
          );
        next = await poll.json();
        if (token !== generation.current) return;
        setRun(next);
      }
    } catch (failure) {
      if (token !== generation.current) return;
      if (abort.signal.aborted) {
        if (currentId.current)
          await cancelOnServer(currentId.current)
            .then(setRun)
            .catch(() => {});
        setError(
          "The request stopped before completion. No order was placed or retried.",
        );
      } else
        setError(
          failure instanceof Error
            ? failure.message
            : "Diagnosis unavailable. No financial action occurred.",
        );
    } finally {
      clearTimeout(timeout);
      if (token === generation.current) setBusy(false);
      void modelAccess.refresh();
    }
  }
  async function stop() {
    stopRequested.current = true;
    if (!currentId.current) return;
    try {
      setRun(await cancelOnServer(currentId.current));
    } catch {
      setError(
        "Could not confirm cancellation. No financial action is possible; the run deadline remains enforced.",
      );
    }
  }
  async function copyProposal() {
    if (!run?.result?.proposedOrder || busy) return;
    try {
      await navigator.clipboard.writeText(
        JSON.stringify(run.result.proposedOrder, null, 2),
      );
      setCopyMessage("Proposal copied. Nothing was submitted.");
    } catch {
      setCopyMessage(
        "Clipboard is unavailable. Select the proposed JSON below to copy manually.",
      );
    }
  }
  function exportReport() {
    if (!run?.export || busy) return;
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(run.export, null, 2)], {
        type: "application/json",
      }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "meder-report.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const result = run?.result;
  const proposal = result?.proposedOrder;
  const caution =
    result &&
    result.result !== "REPAIR_PROPOSED" &&
    result.result !== "ALREADY_VALID";
  const edit =
    (setter: (value: string) => void) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      invalidate();
      setter(event.target.value);
    };

  return (
    <div className="shell">
      <a href="#order-input" className="skip">
        Skip to order input
      </a>
      <header className="topbar">
        <div className="wordmark">
          <span className="mark" aria-hidden="true">
            m
          </span>
          Meder
        </div>
        <div className="topnote">A calmer way to understand an order.</div>
        <span className="badge">
          <ShieldCheck size={13} strokeWidth={2.2} aria-hidden="true" />
          READ-ONLY BY DESIGN
        </span>
      </header>
      <main>
        <section className="hero">
          <div>
            <div className="eyebrow">
              Order diagnostics / Spot · LIMIT · GTC
            </div>
            <h1>
              Order clarity. <em>Without another trade.</em>
            </h1>
            <p>
              Understand a rejected order. Explore a bounded quantity
              correction.
              <br />
              Or know when to stop — without submitting anything.
            </p>
          </div>
          <div className="safety-pill">
            No account connection. No financial writes.
          </div>
        </section>
        <div className="workspace">
          <section className="card" aria-labelledby="input-title">
            <div className="card-head">
                <h2 id="input-title">Your order</h2>
              <span className="badge">SYNTHETIC DEMO</span>
            </div>
            <div className="card-body">
              <form onSubmit={diagnose} id="order-input">
                <fieldset
                  aria-disabled={busy}
                  onChangeCapture={(event) => {
                    if (busy) {
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }}
                  onKeyDownCapture={(event) => {
                    if (busy && event.key !== "Tab") event.preventDefault();
                  }}
                  style={{
                    border: 0,
                    padding: 0,
                    margin: 0,
                    minWidth: 0,
                    pointerEvents: busy ? "none" : undefined,
                  }}
                >
                  <legend className="sr-only">Diagnostic inputs</legend>
                  <div className="field">
                    <label htmlFor="source-mode">Data source</label>
                    <select
                      id="source-mode"
                      value="synthetic"
                      onChange={() => {}}
                    >
                      <option value="synthetic">
                        Synthetic demo · invented data
                      </option>
                      <option disabled>Live Binance data · unavailable</option>
                    </select>
                  </div>
                  <div className="mode-copy">
                    <strong>Demo data, not exchange evidence.</strong>
                    <br />
                    Live reads are disabled after a regional access restriction.
                    No Binance request is made.
                  </div>
                  <div className="field">
                    <label htmlFor="fixture">Example scenario</label>
                    <select
                      id="fixture"
                      value={fixture}
                      onChange={(e) =>
                        chooseFixture(e.target.value as FixtureId)
                      }
                    >
                      {Object.entries(presets).map(([id, value]) => (
                        <option key={id} value={id}>
                          {value.label}
                        </option>
                      ))}
                    </select>
                    <p className="help">{presets[fixture].detail}</p>
                  </div>
                  {fixture !== "ambiguous" && !useRaw && (
                    <>
                      <div className="divider" />
                      <div className="two">
                        <div className="field">
                          <label htmlFor="symbol">Symbol</label>
                          <input id="symbol" value="ABCUSDT" readOnly />
                        </div>
                        <div className="field">
                          <label htmlFor="side">Side</label>
                          <select
                            id="side"
                            value={side}
                            onChange={edit(setSide)}
                          >
                            <option>BUY</option>
                            <option>SELL</option>
                          </select>
                        </div>
                      </div>
                      <div className="two">
                        <div className="field">
                          <label htmlFor="price">Limit price</label>
                          <input
                            id="price"
                            inputMode="decimal"
                            value={price}
                            onChange={edit(setPrice)}
                            required
                          />
                        </div>
                        <div className="field">
                          <label htmlFor="quantity">Quantity</label>
                          <input
                            id="quantity"
                            inputMode="decimal"
                            value={quantity}
                            onChange={edit(setQuantity)}
                            required
                          />
                        </div>
                      </div>
                      <div className="field">
                        <label htmlFor="tolerance">Quantity permission</label>
                        <select
                          id="tolerance"
                          value={side === "SELL" ? "exact" : tolerance}
                          onChange={edit(setTolerance)}
                          disabled={side === "SELL"}
                        >
                          <option value="allow_all_downward">
                            Allow any downward correction
                          </option>
                          <option value="exact">Keep my exact quantity</option>
                        </select>
                        <p className="help">
                          Price is always protected. Quantity never increases.
                        </p>
                      </div>
                      {side === "BUY" && (
                        <div className="field">
                          <label htmlFor="cap">
                            Quote-notional cap · fees excluded
                          </label>
                          <input
                            id="cap"
                            inputMode="decimal"
                            value={cap}
                            onChange={edit(setCap)}
                            required
                          />
                          <p className="help">
                            Caps price × quantity. Not a balance guarantee.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  {fixture === "ambiguous" && !useRaw && (
                    <div className="notice">
                      A synthetic response was lost. An imported status cannot
                      confirm what happened. This example never retries or
                      checks an account.
                    </div>
                  )}
                  <details className="advanced">
                    <summary>Advanced: redacted JSON input</summary>
                    <label className="help">
                      <input
                        type="checkbox"
                        checked={useRaw}
                        onChange={(e) => {
                          invalidate();
                          if (e.target.checked && !raw)
                            setRaw(JSON.stringify(input(), null, 2));
                          setUseRaw(e.target.checked);
                        }}
                      />{" "}
                      Use JSON instead of the form
                    </label>
                    {useRaw && (
                      <div className="field">
                        <label htmlFor="raw-input">
                          Request input · maximum 16 KiB
                        </label>
                        <textarea
                          id="raw-input"
                          value={raw}
                          onChange={(e) => {
                            invalidate();
                            setRaw(e.target.value);
                          }}
                        />
                        <p className="help">
                          Do not paste keys, signatures, private account data,
                          or real identifiers. Free text and identifiers are
                          excluded from reports and model prompts.
                        </p>
                      </div>
                    )}
                  </details>
                  <div className="field">
                    <label htmlFor="planner">Diagnostic runtime</label>
                    <select
                      id="planner"
                      value={planner}
                      onChange={(e) => {
                        invalidate();
                        setPlanner(e.target.value as Planner);
                      }}
                    >
                      <option value="deterministic">
                        Deterministic · exact local rules
                      </option>
                      <option value="model" disabled={!modelAvailable}>
                        Model-guided ·{" "}
                        {!modelAccess.checked ? "access unverified"
                          : !modelAccess.state.providerConfigured ? "provider not configured"
                          : !modelAccess.state.modelAccess.configured ? "access key not configured"
                          : !modelAccess.state.modelAccess.authorized ? "locked · unlock below"
                          : modelAccess.state.modelBudget?.remaining === 0 ? "run budget exhausted"
                          : (modelAccess.state.modelBudget?.active ?? 0) > 0 ? "another run is active"
                          : "unlocked private session"}
                      </option>
                    </select>
                    <p className="help">
                      {planner === "deterministic"
                        ? "Deterministic mode only. No model is invoked."
                        : "The model selects read-only tools. The exact solver owns the verdict."}
                    </p>
                  </div>
                </fieldset>
                <button className="primary full" type="submit" disabled={busy || modelAccess.pending || (planner === "model" && !modelAvailable)}>
                  {busy ? "Diagnosing…" : "Diagnose order"}
                </button>
                {planner === "model" && !modelAvailable && !busy && <p className="help">Model mode is unavailable. Unlock access below or explicitly select deterministic mode. No automatic fallback occurs.</p>}
                {busy && (
                  <button
                    className="full"
                    type="button"
                    onClick={stop}
                    style={{ marginTop: 8 }}
                  >
                    Stop diagnosis
                  </button>
                )}
                <p className="form-footer">
                  A proposal is not an order. Nothing is executed.
                </p>
              </form>
              <details className="access" open>
                <summary>
                  Private model access
                  <span className="muted"> — unlock is optional</span>
                </summary>
                <ModelAccessPanel access={modelAccess} diagnosing={busy} />
              </details>
            </div>
          </section>
          <div className="right">
            <section className="card" aria-labelledby="diagnosis-title">
              <div className="card-head">
                <h2 id="diagnosis-title">Diagnosis</h2>
                {busy ? (
                  <span className="progress">
                    <span className="dot" />
                    Checking local evidence
                  </span>
                ) : (
                  <span className="small muted">
                    {run ? "Report available" : "Ready when you are"}
                  </span>
                )}
              </div>
              <div role="status" aria-live="polite" className="sr-only">
                {busy
                  ? "Diagnosis in progress"
                  : error ||
                    (run?.status === "canceled"
                      ? "Diagnosis canceled"
                      : result
                        ? `${result.result}. ${titles[result.result] ?? "Diagnosis complete"}`
                        : "Ready for diagnosis")}
              </div>
              {error && (
                <div className="card-body">
                  <div className="error-box" role="alert">
                    {error}
                  </div>
                </div>
              )}
              {run?.status === "canceled" ? (
                <div className="card-body">
                  <span className="state caution">CANCELED</span>
                  <h3 className="verdict-title">
                    Stopped. Nothing was submitted.
                  </h3>
                  <p className="small muted">
                    This run cannot publish a late proposal. Start a new
                    diagnosis when you are ready.
                  </p>
                </div>
              ) : run?.status === "error" ? (
                <div className="card-body">
                  <span className="state error">RUN ERROR</span>
                  <h3 className="verdict-title">
                    The diagnostic did not complete.
                  </h3>
                  <p className="small muted">
                    {run.error?.message ||
                      "Required evidence or model output was unavailable. No verdict has been invented."}
                  </p>
                </div>
              ) : result ? (
                <div className="card-body" data-testid="diagnosis-result">
                  <span className={`state${caution ? " caution" : ""}`}>
                    {result.result}
                  </span>
                  <h3 className="verdict-title">
                    {titles[result.result] ?? "Local diagnosis complete."}
                  </h3>
                  {result.result === "UNRESOLVED" && (
                    <p className="small">
                      We cannot confirm whether this order executed. Do not
                      resubmit based on this report.
                    </p>
                  )}
                  <p className="small muted">{result.explanation}</p>
                  {run.observedSource === "redacted_import" && (
                    <p className="notice">
                      User-reported import — not an independently verified
                      exchange response. Metadata below is still synthetic.
                    </p>
                  )}
                  {result.validation.failed.length > 0 && (
                    <p className="mini-label">Original order · failed checks</p>
                  )}
                  <ul className="constraints">
                    {result.validation.failed.map((reason, index) => (
                      <li key={index}>
                        {ruleLabels[reason] ?? reason.replaceAll("_", " ")}
                      </li>
                    ))}
                  </ul>
                  {result.bounds && (
                    <p className="small">
                      Feasible grid bounds:{" "}
                      <strong>{result.bounds.lowerQuantity}</strong> minimum /{" "}
                      <strong>{result.bounds.upperQuantity}</strong> maximum.
                    </p>
                  )}
                  {result.result !== "UNRESOLVED" && (
                    <div className="notice">
                      <strong>
                        Partial validation — exchange acceptance unknown.
                      </strong>
                      These are current synthetic checks, not proof of an
                      exchange rejection or acceptance.
                    </div>
                  )}
                  <p className="unchecked">
                    Unchecked:{" "}
                    {result.validation.unchecked
                      .map((value) => value.replaceAll("_", " "))
                      .join(", ") ||
                      "balances, fees, account permissions, dynamic price bounds"}
                    .
                  </p>
                  <div className="divider" />
                  <div className="evidence">
                    <span>
                      Source <b>Synthetic fixture</b>
                    </span>
                    <span>
                      Runtime{" "}
                      <b>
                        {submittedPlanner === "model"
                          ? "Model-guided"
                          : "Deterministic · no model"}
                      </b>
                    </span>
                    <span>
                      Scenario <b>{presets[submittedFixture].label.slice(5)}</b>
                    </span>
                    {run.evidence?.[0]?.receivedAt && (
                      <span>
                        Received <b>{run.evidence[0].receivedAt}</b>
                      </span>
                    )}
                    {result.evidenceAgeMs !== undefined && (
                      <span>
                        Age when checked{" "}
                        <b>
                          {(result.evidenceAgeMs / 1000).toFixed(3)}s ·
                          synthetic, not live
                        </b>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                !error && (
                  <div className="idle">
                    <FluidOrb
                      size={180}
                      color="#256457"
                      className="orb-shader"
                      aria-hidden="true"
                    />
                    <h3>Clarity starts with a check.</h3>
                    <p>
                      Choose an example or adjust the order. Meder checks the
                      local rules and keeps your intent intact.
                    </p>
                  </div>
                )
              )}
              {run && (
                <details className="trace">
                  <summary>
                    Sanitized tool trace{" "}
                    <span className="muted">
                      {run.trace?.length ?? 0} entries
                    </span>
                  </summary>
                  <p className="help">
                    Tool summaries only. No private reasoning, pasted errors, or
                    account data.
                  </p>
                  <ol>
                    {run.trace?.map((entry, i) => (
                      <li key={i}>
                        <code>{entry.tool ?? entry.name}</code>
                        {` — ${entry.summary ?? entry.code ?? "completed"}`}
                      </li>
                    ))}
                  </ol>
                </details>
              )}
            </section>
            <section className="card" aria-labelledby="proposal-title">
              <div className="card-head">
                <h2 id="proposal-title">Proposed correction</h2>
                <span className="small muted">Review only</span>
              </div>
              <div className="card-body">
                {proposal ? (
                  <>
                    <div className="proposal-grid">
                      <div>
                        <div className="mini-label">Original quantity</div>
                        <div
                          className="quantity"
                          data-testid="original-quantity"
                        >
                          {result?.originalOrder?.quantity != null && (
                            <QuantityCounter
                              text={result.originalOrder.quantity}
                            />
                          )}
                        </div>
                      </div>
                      <div className="arrow" aria-hidden="true">
                        →
                      </div>
                      <div className="comparison">
                        <div className="mini-label">Proposed quantity</div>
                        <div
                          className="quantity after"
                          data-testid="proposed-quantity"
                        >
                          <QuantityCounter text={proposal.quantity} />
                        </div>
                      </div>
                    </div>
                    <p className="protected">
                      Unchanged: {proposal.symbol} · {proposal.side} ·{" "}
                      {proposal.type} / {proposal.timeInForce} · price{" "}
                      {proposal.price}
                    </p>
                    <p className="small">
                      Proposed notional:{" "}
                      <strong>
                        {result?.proposedNotional ?? "See report"}
                      </strong>{" "}
                      <span className="muted">· fees excluded</span>
                    </p>
                  </>
                ) : (
                  <>
                    <h3>
                      {result
                        ? "No actionable quantity patch."
                        : "A proposal, only when the rules allow it."}
                    </h3>
                    <p className="small muted">
                      {result
                        ? "Refused, incomplete, ambiguous, and already-valid results do not produce a replacement order."
                        : "Meder may reduce a BUY quantity within your cap. It will never change your price, increase quantity, or retry an uncertain order."}
                    </p>
                  </>
                )}
                <div className="actions">
                  <button onClick={copyProposal} disabled={!proposal || busy}>
                    Copy proposed JSON
                  </button>
                  <button
                    onClick={exportReport}
                    disabled={!run?.export || busy}
                  >
                    Export report
                  </button>
                  <output aria-live="polite">{copyMessage}</output>
                </div>
                {proposal && (
                  <details className="advanced">
                    <summary>Inspect proposed JSON</summary>
                    <pre data-testid="proposal-json">
                      {JSON.stringify(proposal, null, 2)}
                    </pre>
                  </details>
                )}
                <p className="help">
                  Exports omit identifiers, pasted error text, and
                  session/evidence tokens.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
      <footer className="footer">
        <p>
          Meder · Synthetic diagnostic application. Not exchange acceptance,
          investment advice, or proof of competition eligibility.
        </p>
        <p>Exact arithmetic. Bounded tools. Zero financial writes.</p>
      </footer>
    </div>
  );
}
