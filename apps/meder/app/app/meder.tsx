"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { MotionConfig } from "motion/react";
import { parseClosedJson } from "../../src/domain/json";
import { useModelAccess } from "../../src/client/use-model-access";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TopBar } from "@/components/meder/top-bar";
import { OrderForm } from "@/components/meder/order-form";
import { ResultPanel } from "@/components/meder/result-panel";
import { ProposalPanel } from "@/components/meder/proposal-panel";
import { SafetyStrip } from "@/components/meder/safety-strip";
import {
  presets,
  type FixtureId,
  type Planner,
  type Run,
} from "@/components/meder/meder-types";

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
  const resultRef = useRef<HTMLElement | null>(null);

  // Mobile: bring the verdict into view when a run settles.
  useEffect(() => {
    if (
      run &&
      run.status !== "running" &&
      matchMedia("(max-width: 1023px)").matches
    ) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [run]);

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
  function input(): Record<string, unknown> {
    if (useRaw) {
      if (new TextEncoder().encode(raw).byteLength > 16384)
        throw new Error("Oversized input");
      return parseClosedJson(raw) as Record<string, unknown>;
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
    const response = await fetch(`/api/diagnoses/${encodeURIComponent(id)}/cancel`, {
      method: "POST",
    });
    if (!response.ok)
      throw new Error("Cancellation could not be confirmed.");
    return response.json() as Promise<Run>;
  }
  async function diagnose(event: FormEvent) {
    event.preventDefault();
    if (busy || modelAccess.pending) return;
    if (planner === "model" && !modelAvailable) {
      setError(
        "Model access is unavailable. Unlock access or explicitly choose deterministic mode.",
      );
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
  const edit =
    (setter: (value: string) => void) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      invalidate();
      setter(event.target.value);
    };

  return (
    <MotionConfig reducedMotion="user">
    <TooltipProvider>
      <div className="shell">
        <a href="#order-input" className="skip">
          Skip to order input
        </a>
        <TopBar />
        <main>
          <section className="hero">
            <div>
              <div className="eyebrow">Order diagnostics / Spot · LIMIT · GTC</div>
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
          </section>
          <div className="workspace">
            <OrderForm
              busy={busy}
              pending={modelAccess.pending}
              fixture={fixture}
              side={side}
              price={price}
              quantity={quantity}
              cap={cap}
              tolerance={tolerance}
              planner={planner}
              modelAvailable={modelAvailable}
              raw={raw}
              useRaw={useRaw}
              modelAccess={modelAccess}
              input={input}
              invalidate={invalidate}
              chooseFixture={chooseFixture}
              edit={edit}
              setSide={setSide}
              setPrice={setPrice}
              setQuantity={setQuantity}
              setCap={setCap}
              setTolerance={setTolerance}
              setPlanner={setPlanner}
              setRaw={setRaw}
              setUseRaw={setUseRaw}
              onSubmit={diagnose}
              onStop={stop}
            />
            <div className="right">
              <ResultPanel
                busy={busy}
                error={error}
                run={run}
                submittedPlanner={submittedPlanner}
                submittedFixture={submittedFixture}
                resultRef={resultRef}
              />
              <ProposalPanel
                run={run}
                busy={busy}
                onCopy={copyProposal}
                onExport={exportReport}
                copyMessage={copyMessage}
              />
            </div>
          </div>
        </main>
        <SafetyStrip />
      </div>
    </TooltipProvider>
    </MotionConfig>
  );
}
