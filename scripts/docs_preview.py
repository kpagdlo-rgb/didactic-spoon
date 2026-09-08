"""Read-only Markdown preview; files are reloaded on each request."""

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
}
VIEWS = {
    "ordermedic": "OrderMedic",
    "crash-lab": "Crash Lab",
    "compare": "Side by side",
    "diff": "Blueprint diff",
    "guide-diff": "Track A: old → new",
    "guide": "Track A guide",
    "meder": "Meder demo",
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
/* Meder is a local, deterministic demo: it has no network dependencies. */
.meder{max-width:1120px;margin:auto}.meder-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.meder-card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:24px}.meder-card h2{margin-top:0;font-size:20px}.meder label{display:block;font-size:14px;font-weight:650;margin:12px 0 4px}.meder input,.meder select{width:100%;padding:9px 10px;border:1px solid #aebdcb;border-radius:6px;background:#fff;color:var(--ink);font:inherit}.meder input:focus,.meder select:focus,.meder button:focus{outline:3px solid #8db9f5;outline-offset:2px}.meder fieldset{border:1px solid var(--line);border-radius:8px;margin:16px 0;padding:4px 14px 14px}.meder legend{font-weight:700;padding:0 5px}.meder .row{display:grid;grid-template-columns:repeat(2,1fr);gap:12px}.meder button{background:#155bc5;color:#fff;border:0;border-radius:7px;padding:10px 15px;font:700 15px system-ui;cursor:pointer}.meder button:hover{background:#0f479d}.meder .badge,.result-state{display:inline-block;padding:3px 9px;border-radius:99px;background:#e4efff;color:#124583;font-weight:700;font-size:12px}.result-state{background:#fff2d8;color:#785000}.meder .result{border-left:4px solid #155bc5;padding:14px 16px;background:#f5f9ff;border-radius:4px;margin-top:12px}.meder .result h3{margin:0 0 6px}.meder .small{font-size:13px;color:var(--muted)}.meder ul{padding-left:20px}.meder .proposal{display:none}.meder .proposal.show{display:block}@media(max-width:850px){.meder-grid{grid-template-columns:1fr}.meder .row{grid-template-columns:1fr}}
"""


def read_doc(key):
    return (ROOT / DOCS[key][1]).read_text()


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


def meder_page():
    """A deliberately isolated client-side demonstration, not a trading integration."""
    return '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Meder · deterministic diagnostic demo</title><style>''' + STYLE + '''</style></head><body><header><div class="eyebrow">Meder · local diagnostic MVP</div><h1>Meder</h1><p>Deterministic local order checks — no account access, network reads, or order submission.</p><nav aria-label="Document views"><a href="/?view=ordermedic">Blueprint reader</a><a href="/meder" aria-current="page">Meder demo</a></nav></header><main class="meder"><p class="notice"><span class="badge">Synthetic demo</span> Invented rules for ABCUSDT. Results are a local calculation, not exchange acceptance. Do not paste keys, account details, or order identifiers.</p><div class="meder-grid"><section class="meder-card" aria-labelledby="order-title"><h2 id="order-title">Order input</h2><div class="row"><div><label for="symbol">Symbol</label><input id="symbol" value="ABCUSDT" maxlength="20" pattern="[A-Z0-9]{2,20}" autocomplete="off"></div><div><label for="side">Side</label><select id="side"><option>BUY</option><option>SELL</option></select></div></div><div class="row"><div><label for="price">Limit price</label><input id="price" value="12.34" inputmode="decimal" autocomplete="off"></div><div><label for="quantity">Quantity</label><input id="quantity" value="8.17" inputmode="decimal" autocomplete="off"></div></div><div class="row"><div><label for="tolerance">Quantity tolerance</label><select id="tolerance"><option value="down">Allow all downward</option><option value="exact">Exact quantity</option></select></div><div><label for="cap">BUY quote-notional cap</label><input id="cap" value="100" inputmode="decimal" autocomplete="off"></div></div><fieldset><legend>Editable synthetic filters</legend><div class="row"><div><label for="tick">Price tick size</label><input id="tick" value="0.01" inputmode="decimal"></div><div><label for="step">Quantity step size</label><input id="step" value="0.10" inputmode="decimal"></div><div><label for="minqty">Minimum quantity</label><input id="minqty" value="0.10" inputmode="decimal"></div><div><label for="maxqty">Maximum quantity</label><input id="maxqty" value="50" inputmode="decimal"></div><div><label for="minnotional">Minimum notional</label><input id="minnotional" value="10" inputmode="decimal"></div><div><label for="maxnotional">Maximum notional</label><input id="maxnotional" value="500" inputmode="decimal"></div></div></fieldset><button id="diagnose" type="button">Diagnose order</button></section><section class="meder-card" aria-labelledby="diagnosis-title"><h2 id="diagnosis-title">Diagnosis</h2><div id="status" class="result" role="status" aria-live="polite"><h3>Ready</h3><p>Enter a synthetic LIMIT/GTC order and run a local check.</p></div><div class="small"><strong>Source:</strong> built-in synthetic rules · age: 0 seconds<br><strong>Unchecked:</strong> balances, fees, permissions, dynamic price limits, exchange availability.</div><div id="proposal" class="proposal result"><h3>Proposal</h3><p id="proposal-text"></p><button id="copy" type="button">Copy proposed JSON</button> <button id="export" type="button">Export sanitized report</button><p class="small">Copy/export never submits an order and excludes credentials, identifiers, and free-text errors.</p></div></section></div></main><script>
(() => {
  const S = 1000000000000000000n, $ = id => document.getElementById(id);
  const get = id => $(id).value.trim();
  const parse = value => { if (!/^\d+(?:\.\d+)?$/.test(value)) throw Error('Use an unsigned decimal value.'); const [a,b=''] = value.split('.'); if (b.length > 18) throw Error('Use no more than 18 decimal places.'); return BigInt(a) * S + BigInt((b + '0'.repeat(18)).slice(0,18)); };
  const out = n => { const a = n / S, b = (n % S).toString().padStart(18,'0').replace(/0+$/,''); return b ? `${a}.${b}` : a.toString(); };
  const floor = (n,d) => n / d * d, ceil = (n,d) => (n + d - 1n) / d * d, divCeil = (n,d) => (n + d - 1n) / d;
  let patch;
  const set = (state, message, details) => { $('status').innerHTML = `<span class="result-state">${state}</span><h3>${message}</h3><p>${details}</p><p><strong>Partial validation — exchange acceptance unknown.</strong></p>`; };
  function diagnose() { $('proposal').classList.remove('show'); patch = null; try {
    const symbol = get('symbol'), side = get('side'), price = parse(get('price')), q = parse(get('quantity')), tick = parse(get('tick')), step = parse(get('step')), minQ = parse(get('minqty')), maxQ = parse(get('maxqty')), minN = parse(get('minnotional')), maxN = parse(get('maxnotional'));
    if (!/^[A-Z0-9]{2,20}$/.test(symbol) || price <= 0n || q <= 0n || step <= 0n) throw Error('Symbol, price, quantity, and quantity step must be valid positive values.');
    const cap = side === 'BUY' ? parse(get('cap')) : null;
    if (side === 'BUY' && cap <= 0n) throw Error('A BUY order needs a positive quote-notional cap.');
    const notional = price * q / S, priceOK = tick === 0n || price % tick === 0n;
    const qOK = q % step === 0n && q >= minQ && (maxQ === 0n || q <= maxQ);
    const nOK = notional >= minN && (maxN === 0n || notional <= maxN) && (cap === null || notional <= cap);
    if (priceOK && qOK && nOK) return set('ALREADY_VALID', 'Original order satisfies checked local rules.', `Quantity ${out(q)} · notional ${out(notional)} (fees excluded).`);
    if (!priceOK) return set('REFUSED', 'Price cannot be repaired.', 'Meder protects the entered limit price and only proposes downward quantity changes.');
    const minFromNotional = divCeil(minN * S, price);
    const lower = ceil(minQ > minFromNotional ? minQ : minFromNotional, step);
    let upper = floor(q, step); if (maxQ > 0n) upper = upper < floor(maxQ, step) ? upper : floor(maxQ, step); if (cap !== null) upper = upper < floor(cap * S / price, step) ? upper : floor(cap * S / price, step); if (maxN > 0n) upper = upper < floor(maxN * S / price, step) ? upper : floor(maxN * S / price, step);
    if (upper < lower) return set('REFUSED', 'Known local constraints cannot be satisfied.', `The legal downward range is empty (lower ${out(lower)}, upper ${out(upper)}).`);
    if (get('tolerance') === 'exact' && upper !== q) return set('REFUSED_EXACT_TOLERANCE', 'A correction would violate exact-quantity intent.', `The original quantity ${out(q)} is not valid; Meder will not modify it.`);
    const proposedN = price * upper / S; patch = {symbol, side, type:'LIMIT', timeInForce:'GTC', price:out(price), quantity:out(upper)};
    set('REPAIR_PROPOSED', 'Largest legal downward quantity proposed.', `Quantity ${out(q)} → ${out(upper)} · notional ${out(notional)} → ${out(proposedN)} (fees excluded).`);
    $('proposal-text').textContent = `Changed quantity only; price remains ${out(price)}. The proposal is not submitted.`; $('proposal').classList.add('show');
  } catch (e) { set('INCOMPLETE', 'Input needs correction.', e.message); } }
  $('diagnose').addEventListener('click', diagnose);
  $('copy').addEventListener('click', async () => { if (patch && navigator.clipboard) await navigator.clipboard.writeText(JSON.stringify(patch, null, 2)); });
  $('export').addEventListener('click', () => { const text = `Meder synthetic diagnostic\n${$('status').innerText}\nUnchecked: balances, fees, permissions, dynamic price limits.`; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text],{type:'text/plain'})); a.download='meder-report.txt'; a.click(); URL.revokeObjectURL(a.href); });
})();</script></body></html>'''


def page(view):
    if view == "meder":
        return meder_page()
    nav = "".join(f'<a href="/?view={key}"' + (' aria-current="page"' if view == key else '') + f'>{label}</a>' for key, label in VIEWS.items())
    note = "Build blueprints, not implemented apps. Research and runtime limitations are documented in each file."
    if view == "compare":
        content = '<div class="columns">' + article("ordermedic") + article("crash-lab") + '</div>'
        note = "Two independent products. Scroll each document separately on desktop."
    elif view in ("diff", "guide-diff"):
        before, after = ("ordermedic", "crash-lab") if view == "diff" else ("old", "guide")
        content = diff_view(before, after)
        note = ("Content comparison: OrderMedic → Crash Lab. These are different products, not successive Git revisions."
                if view == "diff" else "Historical document comparison: the uploaded Track A brief → the researched standalone guide.")
    else:
        content = '<div class="single">' + article(view) + '</div>'
    return f'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{VIEWS[view]} · Blueprint reader</title><style>{STYLE}</style></head><body><header><div class="eyebrow">Binance Agent OS · Track A</div><h1>Blueprint reader</h1><p>OrderMedic &amp; Agent Crash Lab · Evidence-backed plans and document comparisons</p><nav aria-label="Document views">{nav}</nav></header><main><p class="notice">{note}</p>{content}</main></body></html>'''


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urlsplit(self.path)
        view = "meder" if url.path == "/meder" else parse_qs(url.query).get("view", ["ordermedic"])[0]
        if (url.path not in ("/", "/meder")) or view not in VIEWS:
            self.send_error(404)
            return
        body = page(view).encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; base-uri 'none'; form-action 'none'")
        self.end_headers()
        self.wfile.write(body)


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "3000"))
    print(f"Document preview listening on {port}", flush=True)
    ThreadingHTTPServer(("0.0.0.0", port), Handler).serve_forever()
