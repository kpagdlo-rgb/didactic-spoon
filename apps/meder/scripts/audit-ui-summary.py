import json

with open('/tmp/ui-audit.json') as f:
    data = json.load(f)

for r in data:
    rep = r['report']
    issues = []
    if rep['scrollWidth'] > rep['innerWidth']:
        issues.append(f"H-OVERFLOW {rep['scrollWidth']}>{rep['innerWidth']}")
    if rep['clippedText']:
        issues.append(f"CLIPPED-TEXT x{len(rep['clippedText'])}")
        for c in rep['clippedText'][:3]:
            issues.append(f"   {c['tag']}.{c['cls']} '{c['text']}' {c['scrollW']}/{c['clientW']} {c['scrollH']}x{c['clientH']}")
    if rep['overlaps']:
        issues.append(f"OVERLAPS x{len(rep['overlaps'])}")
        for o in rep['overlaps'][:4]:
            issues.append(f"   {o['overlapPct']}% {o['a']} <-> {o['b']}")
    if rep['deadSpace']:
        ds = rep['deadSpace']
        issues.append(f"dead L{ds['left']} R{ds['right']} contentW{ds['contentW']}")
    if r['errors']:
        issues.append(f"JS-ERRORS: {r['errors'][:2]}")
    if r['overflowEls']:
        issues.append(f"OUT-OF-VIEWPORT x{len(r['overflowEls'])}")
        for e in r['overflowEls'][:3]:
            issues.append(f"   {e['tag']}.{e['cls']} L{e['left']} R{e['right']} '{e['text']}'")
    line = f"{r['route']} @{r['viewport']}: " + (" | ".join(issues) if issues else "clean")
    print(line)
