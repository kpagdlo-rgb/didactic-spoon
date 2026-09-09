"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { CodeBlock } from "@/components/ui/code-block";
import { QuantityCounter } from "./quantity-counter";
import type { Run } from "./meder-types";

export function ProposalPanel({
  run,
  busy,
  onCopy,
  onExport,
  copyMessage,
}: {
  run: Run | null;
  busy: boolean;
  onCopy: () => Promise<void>;
  onExport: () => void;
  copyMessage: string;
}) {
  const result = run?.result;
  const proposal = result?.proposedOrder;
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );

  async function handleCopy() {
    await onCopy();
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
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
                <div className="quantity" data-testid="original-quantity">
                  {result?.originalOrder?.quantity != null && (
                    <QuantityCounter text={result.originalOrder.quantity} />
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
              Unchanged: {proposal.symbol} · {proposal.side} · {proposal.type}{" "}
              / {proposal.timeInForce} · price {proposal.price}
            </p>
            <p className="small">
              Proposed notional:{" "}
              <strong>{result?.proposedNotional ?? "See report"}</strong>{" "}
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
          <button onClick={handleCopy} disabled={!proposal || busy}>
            {copied ? (
              <Check size={14} strokeWidth={2.2} aria-hidden="true" />
            ) : (
              <Copy size={14} strokeWidth={2.2} aria-hidden="true" />
            )}
            Copy proposed JSON
          </button>
          <button onClick={onExport} disabled={!run?.export || busy}>
            Export report
          </button>
          <output aria-live="polite">{copyMessage}</output>
        </div>
        {proposal && (
          <details className="advanced">
            <summary>Inspect proposed JSON</summary>
            {/* The mirrored pre keeps the frozen test id byte-exact; the
                CodeBlock below it is the readable view. */}
            <pre data-testid="proposal-json" className="sr-only">
              {JSON.stringify(proposal, null, 2)}
            </pre>
            <CodeBlock
              code={JSON.stringify(proposal, null, 2)}
              language="json"
              filename="proposal.json"
            />
          </details>
        )}
      </div>
    </section>
  );
}
