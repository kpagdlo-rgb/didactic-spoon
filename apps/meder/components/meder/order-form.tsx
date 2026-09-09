"use client";

import type { FormEvent } from "react";
import { Beaker, Lock, LockOpen } from "lucide-react";
import { ModelAccessPanel } from "./model-access-panel";
import { FieldHelp } from "./field-help";
import { presets, type FixtureId, type Planner } from "./meder-types";

type EditHandler = (
  event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
) => void;

type OrderFormProps = {
  busy: boolean;
  pending: boolean;
  fixture: FixtureId;
  side: string;
  price: string;
  quantity: string;
  cap: string;
  tolerance: string;
  planner: Planner;
  modelAvailable: boolean;
  raw: string;
  useRaw: boolean;
  modelAccess: React.ComponentProps<typeof ModelAccessPanel>["access"];
  input: () => Record<string, unknown>;
  invalidate: () => void;
  chooseFixture: (value: FixtureId) => void;
  edit: (setter: (value: string) => void) => EditHandler;
  setSide: (value: string) => void;
  setPrice: (value: string) => void;
  setQuantity: (value: string) => void;
  setCap: (value: string) => void;
  setTolerance: (value: string) => void;
  setPlanner: (value: Planner) => void;
  setRaw: (value: string) => void;
  setUseRaw: (value: boolean) => void;
  onSubmit: (event: FormEvent) => void;
  onStop: () => void;
};

export function OrderForm(props: OrderFormProps) {
  const {
    busy,
    pending,
    fixture,
    side,
    price,
    quantity,
    cap,
    tolerance,
    planner,
    modelAvailable,
    raw,
    useRaw,
    modelAccess,
    input,
    invalidate,
    chooseFixture,
    edit,
    setSide,
    setPrice,
    setQuantity,
    setCap,
    setTolerance,
    setPlanner,
    setRaw,
    setUseRaw,
    onSubmit,
    onStop,
  } = props;

  return (
    <section className="card" aria-labelledby="input-title">
      <div className="card-head">
        <h2 id="input-title">Your order</h2>
        <span className="badge">
          <Beaker size={13} strokeWidth={2.2} aria-hidden="true" />
          SYNTHETIC DEMO
        </span>
      </div>
      <div className="card-body">
        <form onSubmit={onSubmit} id="order-input">
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
              <label htmlFor="fixture">Example scenario</label>
              {/* Contract: tests drive this exact select by value. The radio
                  cards below are the visible control; the select stays in
                  sync and out of the tab order. */}
              <select
                id="fixture"
                className="sr-only"
                tabIndex={-1}
                value={fixture}
                onChange={(e) => chooseFixture(e.target.value as FixtureId)}
              >
                {Object.entries(presets).map(([id, value]) => (
                  <option key={id} value={id}>
                    {value.label}
                  </option>
                ))}
              </select>
              <div
                role="radiogroup"
                aria-label="Scenario choices"
                className="scenario-cards"
              >
                {(
                  Object.entries(presets) as [
                    FixtureId,
                    (typeof presets)[FixtureId],
                  ][]
                ).map(([id, value]) => (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={fixture === id}
                    tabIndex={fixture === id ? 0 : -1}
                    className={`scenario-card${fixture === id ? " selected" : ""}`}
                    onClick={() => chooseFixture(id)}
                    onKeyDown={(event) => {
                      if (event.key !== "ArrowDown" && event.key !== "ArrowUp")
                        return;
                      event.preventDefault();
                      const ids = Object.keys(presets) as FixtureId[];
                      const delta = event.key === "ArrowDown" ? 1 : -1;
                      const next =
                        ids[(ids.indexOf(fixture) + delta + ids.length) % ids.length];
                      chooseFixture(next);
                      (
                        document.querySelector(
                          `.scenario-card[aria-checked="true"]`,
                        ) as HTMLButtonElement | null
                      )?.focus();
                    }}
                  >
                    <span className="scenario-name">{value.label}</span>
                    <span className="scenario-detail">{value.detail}</span>
                  </button>
                ))}
              </div>
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
                  <div className="label-row">
                    <label htmlFor="tolerance">Quantity permission</label>
                    <FieldHelp>
                      Price is always protected. Quantity never increases.
                    </FieldHelp>
                  </div>
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
                </div>
                {side === "BUY" && (
                  <div className="field">
                    <div className="label-row">
                      <label htmlFor="cap">
                        Quote-notional cap · fees excluded
                      </label>
                      <FieldHelp>
                        Caps price × quantity. Not a balance guarantee.
                      </FieldHelp>
                    </div>
                    <input
                      id="cap"
                      inputMode="decimal"
                      value={cap}
                      onChange={edit(setCap)}
                      required
                    />
                  </div>
                )}
              </>
            )}
            {fixture === "ambiguous" && !useRaw && (
              <div className="notice">
                A synthetic response was lost. An imported status cannot
                confirm what happened. This example never retries or checks an
                account.
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
                    Do not paste keys, signatures, private account data, or
                    real identifiers. Free text and identifiers are excluded
                    from reports and model prompts.
                  </p>
                </div>
              )}
            </details>

            <details className="runtime-data" open>
              <summary>
                Runtime &amp; data
                <span className="muted">
                  {" "}
                  —{" "}
                  {planner === "model" ? "model-guided" : "deterministic"} ·
                  synthetic
                </span>
              </summary>
              <div className="field">
                <label htmlFor="source-mode">Data source</label>
                <select id="source-mode" value="synthetic" onChange={() => {}}>
                  <option value="synthetic">
                    Synthetic demo · invented data
                  </option>
                  <option disabled>Live Binance data · unavailable</option>
                </select>
              </div>
              <div className="mode-copy">
                <strong>Demo data, not exchange evidence.</strong>
                <br />
                Live reads are disabled after a regional access restriction. No
                Binance request is made.
              </div>
              <div className="field">
                <div className="label-row">
                  <label htmlFor="planner">Diagnostic runtime</label>
                  <FieldHelp>
                    {planner === "deterministic"
                      ? "Deterministic mode only. No model is invoked."
                      : "The model selects read-only tools. The exact solver owns the verdict."}
                  </FieldHelp>
                </div>
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
                    {!modelAccess.checked
                      ? "access unverified"
                      : !modelAccess.state.providerConfigured
                        ? "provider not configured"
                        : !modelAccess.state.modelAccess.configured
                          ? "access key not configured"
                          : !modelAccess.state.modelAccess.authorized
                            ? "locked · unlock below"
                            : modelAccess.state.modelBudget?.remaining === 0
                              ? "run budget exhausted"
                              : (modelAccess.state.modelBudget?.active ?? 0) > 0
                                ? "another run is active"
                                : "unlocked private session"}
                  </option>
                </select>
              </div>
            </details>
          </fieldset>
          <button
            className="primary full"
            type="submit"
            disabled={busy || pending || (planner === "model" && !modelAvailable)}
          >
            {busy ? "Diagnosing…" : "Diagnose order"}
          </button>
          {planner === "model" && !modelAvailable && !busy && (
            <p className="help">
              Model mode is unavailable. Unlock access below or explicitly
              select deterministic mode. No automatic fallback occurs.
            </p>
          )}
          {busy && (
            <button
              className="full"
              type="button"
              onClick={onStop}
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
            <span className="access-swap" aria-hidden="true">
              <Lock size={14} strokeWidth={2.2} className="icon-locked" />
              <LockOpen size={14} strokeWidth={2.2} className="icon-unlocked" />
            </span>
            Private model access
            <span className="muted"> — unlock is optional</span>
          </summary>
          <ModelAccessPanel access={modelAccess} diagnosing={busy} />
        </details>
      </div>
    </section>
  );
}
