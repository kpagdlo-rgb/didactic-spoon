# Agent OS research and blueprints

## Selected product: Meder

OrderMedic is now named **Meder**. A safe, deterministic local MVP is available
at `/meder` in the Preview reader. It diagnoses synthetic Spot-style `LIMIT`/`GTC`
orders only: it has no account access, network reads, credentials, signing, or order
submission capability. It can propose a bounded BUY quantity reduction, but never
executes or retries an order. The planning pack is:

- [Product/build manifest](docs/meder/MANIFEST.md)
- [Implementation specification](docs/meder/SPEC.md)
- [Prioritized TODO plan](docs/meder/TODO.md)
- [Machine-readable manifest](docs/meder/manifest.json)

## Research and original blueprints

- [OrderMedic blueprint](docs/ordermedic-build-blueprint.md)
- [Agent Crash Lab blueprint](docs/agent-crash-lab-build-blueprint.md)
- [Canonical Track A guide](track-a-agent-os-standalone.md)
- [Previous uploaded Track A guide](track-a-agent-os-standalone.md.old)
- [Track A ecosystem research and five ideas](docs/track-a-five-ideas-ecosystem-research.md)
- [Track B research and five concepts](docs/track-b-research-and-five-concepts.md)

The research documents and Meder plan do not establish competition eligibility or a
submitted entry. Local validation is partial and never establishes exchange acceptance.

## Document Preview

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements-preview.txt
.venv/bin/python scripts/docs_preview.py
```

Open port 3000. The reader includes the Meder synthetic diagnostic at `/meder`,
each blueprint, side-by-side reading,
an OrderMedic-to-Crash-Lab content diff, and the historical Track A `.old`-to-current diff.
The blueprint content diff compares different products, not Git revisions.
Markdown is re-read on every request; refresh after editing. The server serves
only allowlisted documents, sanitizes rendered HTML, and has no trading or account integration.

```sh
.venv/bin/python -m unittest discover -s tests -v
```

Hoplite setup/run commands are in `.hoplite/settings.json`. Equivalent project
overrides were enabled because the platform did not detect the new workspace configuration.
Attachments, private proof artifacts, and local dependencies are excluded from Git.
