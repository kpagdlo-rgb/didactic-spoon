"use client";

import type { RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import FluidOrb from "@/components/ui/fluid-orb";
import {
  presets,
  ruleLabels,
  titles,
  type FixtureId,
  type Planner,
  type Run,
} from "./meder-types";

const viewTransition = { duration: 0.16, ease: "easeOut" as const };

export function ResultPanel({
  busy,
  error,
  run,
  submittedPlanner,
  submittedFixture,
  resultRef,
}: {
  busy: boolean;
  error: string;
  run: Run | null;
  submittedPlanner: Planner;
  submittedFixture: FixtureId;
  resultRef: RefObject<HTMLElement | null>;
}) {
  const result = run?.result;
  const caution =
    result &&
    result.result !== "REPAIR_PROPOSED" &&
    result.result !== "ALREADY_VALID";
  const view = error
    ? "error"
    : run?.status === "canceled"
      ? "canceled"
      : run?.status === "error"
        ? "run-error"
        : result
          ? `result-${result.result}`
          : "idle";

  return (
    <section
      className="card"
      aria-labelledby="diagnosis-title"
      ref={resultRef}
    >
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
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={viewTransition}
        >
          {error ? (
            <div className="card-body">
              <div className="error-box" role="alert">
                {error}
              </div>
            </div>
          ) : run?.status === "canceled" ? (
            <div className="card-body">
              <span className="state caution">CANCELED</span>
              <h3 className="verdict-title">Stopped. Nothing was submitted.</h3>
              <p className="small muted">
                This run cannot publish a late proposal. Start a new diagnosis
                when you are ready.
              </p>
            </div>
          ) : run?.status === "error" ? (
            <div className="card-body">
              <span className="state error">RUN ERROR</span>
              <h3 className="verdict-title">The diagnostic did not complete.</h3>
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
              {run?.observedSource === "redacted_import" && (
                <p className="notice">
                  User-reported import — not an independently verified exchange
                  response. Metadata below is still synthetic.
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
                  These are current synthetic checks, not proof of an exchange
                  rejection or acceptance.
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
                  Scenario <b>{presets[submittedFixture].label}</b>
                </span>
                {run?.evidence?.[0]?.receivedAt && (
                  <span>
                    Received <b>{run.evidence[0].receivedAt}</b>
                  </span>
                )}
                {result.evidenceAgeMs !== undefined && (
                  <span>
                    Age when checked{" "}
                    <b>
                      {(result.evidenceAgeMs / 1000).toFixed(3)}s · synthetic,
                      not live
                    </b>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="idle">
              <FluidOrb
                size={180}
                color="#256457"
                className="orb-shader"
                aria-hidden="true"
              />
              <h3>Clarity starts with a check.</h3>
              <p>
                Choose an example or adjust the order. Meder checks the local
                rules and keeps your intent intact.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {run && (
        <details className="trace">
          <summary>
            Sanitized tool trace{" "}
            <span className="muted">{run.trace?.length ?? 0} entries</span>
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
  );
}
