# Security

## Reporting a vulnerability

Meder is a read-only synthetic diagnostic with no exchange credentials, no
account access, and no order-execution path. If you still find a security
issue — a way to make it read live data, execute, leak a session, bypass the
origin gate, or inject content — **do not open a public issue**. Report it
privately to the repository owner via a GitHub private vulnerability report
(Security → Report a vulnerability) or by contacting the maintainer directly.

## Design guarantees (and what they do not cover)

- **No financial writes.** There is no order, transfer, signing, or wallet
  code anywhere in the repository.
- **Synthetic-only by default.** Live mode is disabled and returns HTTP 451
  locally without making a Binance request; there is no silent fallback.
- **Origin gate.** Same-origin enforcement via `src/server/origin.ts`;
  production requires `MEDER_ALLOWED_ORIGIN` and fails closed when unset.
- **Model gate (optional).** A shared `MEDER_MODEL_ACCESS_KEY` unlocks a
  15-minute signed-session grant; provider settings alone never authorize
  calls. This is a private-demo gate, **not** user authentication — a
  model-enabled instance must sit behind an authenticated gateway and must
  not be exposed publicly.
- **In-process limits.** One concurrent model run and a process-lifetime
  budget (`MEDER_MODEL_RUN_BUDGET`, default 10) are safeguards, not
  authentication or a spend cap.

## Supported versions

Only the current `apps/meder` implementation is supported. The Python
document reader (`scripts/`, port 3001) is a research tool with no trading or
account integration; it sanitizes rendered HTML and serves only allowlisted
documents.

## Secrets

Never commit real keys. `.env` files are git-ignored; only `.env.example`
with placeholders is tracked. If a key is ever committed, rotate it
immediately and rewrite history.
