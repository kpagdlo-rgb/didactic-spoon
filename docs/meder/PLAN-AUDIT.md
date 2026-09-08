# Meder — plan drift and correction

Audit started 8 September 2026 against commit `833b4a1`. This is an engineering comparison, not competition acceptance evidence.

## Drift found

| Agreed contract | Previous implementation | Correction |
| --- | --- | --- |
| Independent `apps/meder` Next.js/TypeScript app | Inline JavaScript inside the Python document reader | Restore independent application; keep reader for research only |
| One authoritative exact constraint solver | Python Decimal solver plus unrelated browser BigInt solver | Server-owned TypeScript rational solver; browser never calculates a verdict |
| Up to 40 digits / 18 fractional places; no rounding | Python default Decimal context has 28 digits; browser used a fixed precision | Bound strings before arithmetic; BigInt quotient/remainder for every bound |
| Versioned server-owned fixtures and immutable evidence | User-editable browser metadata without evidence ownership | Controller-selected fixtures, run/session-bound evidence and hashes |
| Closed bounded API, session isolation, expiry, cancellation | No diagnostic API or run lifecycle | Dedicated server handlers and bounded read-only tool gateway |
| Canonical repair, budget refusal, ambiguity, off-grid fixtures | Different demo quantities; no complete fixture acceptance suite | Use the specification's exact cases and generated-grid invariant tests |
| Optional genuine model choosing read/validate tools | No model path | Configurable server-side provider, explicitly disabled if unconfigured; no fabricated verification |
| Accurate build checklist and release claims | Manifest and checklist still said nothing was implemented | Update each gate from tests and observed behavior; leave external gates open |

The old demo was a useful proof of interaction, not completion of the agreed application. It must not remain a competing source of diagnostic truth.

## Preserved boundaries

- Only Meder is being built. Crash Lab stays historical/deferred.
- Synthetic data is an explicit mode. Binance live mode stays disabled after the observed HTTP 451; no network or hostname workaround.
- No exchange credentials, financial writes, order lookup, signing, wallet, or payment capability.
- Price, symbol, side, order type, and time-in-force are immutable. Only explicitly authorized BUY quantity reduction is eligible.
- Model configuration is not model verification. Tests with a fake provider establish boundary behavior only.
- Local validation does not prove Binance acceptance or historical rejection causality. The cap excludes fees.
- Competition eligibility, accepted demo environment, submission, and receipt of an award are separate external gates.

## Delivery classes

1. **Tested synthetic diagnostic application:** deterministic end-to-end fixtures, exact solver, safe report/export, browser evidence.
2. **Model-enabled diagnostic agent:** class 1 plus configured real provider and observed successful tool-selected diagnostic run. Merely shipping the adapter does not satisfy this gate.
3. **Live public-data integration:** independently legitimate access and observed live adapter result. Not implemented or enabled here.
4. **Competition-ready/submitted:** authenticated eligibility and requirements confirmed, then separately authorized submission and evidence of receipt.

The original 23:30 UTC feature-freeze recommendation is not a guarantee that these gates can all be met before the public 23:59 UTC deadline. Building continues as requested; no timestamp turns an unfinished gate into a pass.
