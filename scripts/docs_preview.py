"""Read-only research reader; Meder lives in the independent apps/meder app."""

import difflib
import html
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlsplit

import bleach
import markdown

ROOT = Path(__file__).resolve().parents[1]
DOCS = {
    "ordermedic": ("OrderMedic", "docs/ordermedic-build-blueprint.md"),
    "crash-lab": ("Agent Crash Lab", "docs/agent-crash-lab-build-blueprint.md"),
    "guide": ("Track A guide", "track-a-agent-os-standalone.md"),
    "old": ("Previous Track A guide", "track-a-agent-os-standalone.md.old"),
    "meder": ("Meder build manifest", "docs/meder/MANIFEST.md"),
}
VIEWS = {
    "ordermedic": "OrderMedic",
    "crash-lab": "Crash Lab",
    "compare": "Side by side",
    "diff": "Blueprint diff",
    "guide-diff": "Track A: old → new",
    "guide": "Track A guide",
    "meder": "Meder manifest",
}
TAGS = set(bleach.sanitizer.ALLOWED_TAGS) | {
    "h1", "h2", "h3", "h4", "h5", "h6", "p", "pre", "code", "hr",
    "table", "thead", "tbody", "tr", "th", "td", "br", "del", "div", "span",
}
STYLE = """
:root{color-scheme:light;--ink:#192a3d;--muted:#596c7e;--line:#dce4ec;--blue:#155bc5}
*{box-sizing:border-box}body{margin:0;background:#f3f6fa;color:var(--ink);font:16px/1.65 system-ui,sans-serif}
header{background:#13273e;color:white;padding:28px max(24px,calc((100vw - 1440px)/2)) 24px}
.eyebrow{text-transform:uppercase;font-size:12px;letter-spacing:.15em;color:#9cb9d9}
header h1{margin:5px 0;font-size:30px}header p{margin:0;color:#c4d3e2;font-size:14px}
nav{display:flex;gap:8px;flex-wrap:wrap;margin-top:22px}nav a{color:#d8e6f7;text-decoration:none;padding:8px 14px;border:1px solid #496078;border-radius:8px;font-size:14px}
nav a[aria-current=page]{background:#fff;color:#13273e;border-color:#fff}nav a:hover{background:#31506f;color:white}
main{max-width:1488px;margin:auto;padding:24px}.notice{color:var(--muted);margin:0 0 20px;font-size:14px}
article{background:#fff;border:1px solid var(--line);border-radius:12px;padding:28px 36px;min-width:0;overflow-wrap:anywhere}
.single{max-width:1100px;margin:auto}.columns{display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:start}
.columns article{padding:24px;max-height:76vh;overflow:auto}.doc-label{font-weight:700;color:var(--blue);padding-bottom:16px;border-bottom:1px solid var(--line);margin-bottom:22px}
article h1{font-size:27px;line-height:1.3}article h2{font-size:21px;margin-top:32px}article h3{font-size:18px}a{color:var(--blue)}
code{background:#edf2f7;border-radius:4px;padding:2px 4px;font-size:13px}pre{background:#13273e;color:#e4edf8;white-space:pre-wrap;overflow-wrap:anywhere;padding:18px;border-radius:8px;line-height:1.5}
pre code{background:none;color:inherit;padding:0}table{display:block;overflow-x:auto;border-collapse:collapse;width:100%;font-size:13px}td,th{border:1px solid var(--line);padding:10px;text-align:left;vertical-align:top}th{background:#edf2f7}
blockquote{border-left:3px solid #97b8e3;margin-left:0;padding-left:20px;color:var(--muted)}
.diff{font:12px/1.65 ui-monospace,monospace;background:white;white-space:pre-wrap;overflow-wrap:anywhere;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.diff span{display:block;padding:2px 16px}.add{background:#e2f5e9;color:#145e31}.remove{background:#fde7e9;color:#8c2633}.hunk{background:#e7efff;color:#234f91}.stats{display:flex;gap:12px;margin-bottom:16px;font-size:14px}.stats b{padding:6px 12px;border-radius:6px}
@media(max-width:850px){.columns{grid-template-columns:1fr}.columns article{max-height:none}article{padding:20px}main{padding:16px}header h1{font-size:25px}}
"""


def read_doc(key):
    path = ROOT / DOCS[key][1]
    if not path.is_file():
        return (f"*`{DOCS[key][1]}` is not present in this checkout. "
                "It is a local-only historical artifact and is excluded from Git.*")
    return path.read_text()


def article(key):
    rendered = markdown.markdown(read_doc(key), extensions=["fenced_code", "tables", "sane_lists"])
    safe = bleach.clean(rendered, tags=TAGS, attributes={"a": ["href", "title"], "code": ["class"]}, strip=True)
    return f'<article><div class="doc-label">{DOCS[key][0]}</div>{safe}</article>'


def diff_view(before, after):
    lines = list(difflib.unified_diff(read_doc(before).splitlines(), read_doc(after).splitlines(),
                                    fromfile=DOCS[before][1], tofile=DOCS[after][1], lineterm=""))
    added = sum(line.startswith("+") and not line.startswith("+++") for line in lines)
    removed = sum(line.startswith("-") and not line.startswith("---") for line in lines)
    rows = []
    for line in lines:
        kind = "add" if line.startswith("+") else "remove" if line.startswith("-") else "hunk" if line.startswith("@@") else "context"
        rows.append(f'<span class="{kind}">{html.escape(line)}</span>')
    return (f'<div class="stats"><b class="add">+{added} lines</b><b class="remove">−{removed} lines</b></div>'
            '<div class="diff" aria-label="Unified Markdown diff">' + "".join(rows) + '</div>')


def page(view):
    nav = "".join(f'<a href="/?view={key}"' + (' aria-current="page"' if view == key else '') + f'>{label}</a>' for key, label in VIEWS.items())
    note = "Research reader. Meder is the standalone application in apps/meder, served separately on port 3000."
    if view == "compare":
        content = '<div class="columns">' + article("ordermedic") + article("crash-lab") + '</div>'
        note = "Two independent product blueprints. Only Meder is being built. Scroll each document separately on desktop."
    elif view in ("diff", "guide-diff"):
        before, after = ("ordermedic", "crash-lab") if view == "diff" else ("old", "guide")
        content = diff_view(before, after)
        note = ("Content comparison: OrderMedic → Crash Lab. These are different products, not successive Git revisions."
                if view == "diff" else "Historical document comparison: the uploaded Track A brief → the researched standalone guide.")
    else:
        content = '<div class="single">' + article(view) + '</div>'
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{VIEWS[view]} · Blueprint reader</title><style>{STYLE}</style></head><body><header><div class="eyebrow">Binance Agent OS · Track A research</div><h1>Blueprint reader</h1><p>Meder plans, research, and historical product comparisons</p><nav aria-label="Document views">{nav}</nav></header><main><p class="notice">{note}</p>{content}</main></body></html>'''


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urlsplit(self.path)
        view = "meder" if url.path == "/meder" else parse_qs(url.query).get("view", ["ordermedic"])[0]
        if url.path not in ("/", "/meder") or view not in VIEWS:
            self.send_error(404)
            return
        body = page(view).encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'")
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "3001"))
    print(f"Document preview listening on {port}", flush=True)
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
