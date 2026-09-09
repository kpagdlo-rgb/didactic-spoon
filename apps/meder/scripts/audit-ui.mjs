// Rendered-UI audit: measures horizontal overflow, text clipping, element
// overlap, dead side space and viewport clipping across viewports and routes.
// Purely diagnostic; writes a JSON report to stdout.
import { chromium } from "@playwright/test";

const BASE = process.env.MEDER_TEST_URL ?? "http://127.0.0.1:3100";
const VIEWPORTS = [
  [360, 780, "360"],
  [390, 844, "390"],
  [768, 900, "768"],
  [1024, 900, "1024"],
  [1440, 900, "1440"],
  [1920, 1080, "1920"],
];
const ROUTES = ["/", "/app"];

const browser = await chromium.launch();

function rectOverlap(a, b) {
  const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
  const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  return x * y;
}

async function auditPage(page, route, vw, vh) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(`console: ${m.text()}`);
  });
  await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);

  const report = await page.evaluate(() => {
    const rectOverlap = (a, b) => {
      const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return x * y;
    };
    const out = {
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
      bodyScrollWidth: document.body.scrollWidth,
      clippedText: [],
      overlaps: [],
      deadSpace: null,
      visible: 0,
    };
    const sel = "h1,h2,h3,h4,p,span,button,a,label,li,td,th,summary,option";
    const els = [...document.querySelectorAll(sel)].filter(
      (el) => el.offsetParent !== null || el.tagName === "BODY",
    );
    out.visible = els.length;

    // Text clipped by its own box (horizontal overflow of inline content).
    for (const el of els) {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (el.scrollWidth > el.clientWidth + 2 && el.scrollHeight > el.clientHeight + 2) {
        out.clippedText.push({
          tag: el.tagName,
          cls: (el.className && String(el.className).slice(0, 60)) || "",
          text: (el.textContent || "").trim().slice(0, 60),
          scrollW: el.scrollWidth,
          clientW: el.clientWidth,
          scrollH: el.scrollHeight,
          clientH: el.clientHeight,
        });
      }
    }

    // Pairwise overlap of visible boxes (ignore tiny incidental overlaps).
    const boxes = els
      .map((el) => {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") return null;
        const r = el.getBoundingClientRect();
        return {
          el,
          cls: String(el.className || "").slice(0, 50),
          tag: el.tagName,
          text: (el.textContent || "").trim().slice(0, 40),
          r,
        };
      })
      .filter((b) => b && b.r.width > 4 && b.r.height > 4 && b.r.top < innerHeight && b.r.left < innerWidth);
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        const ov = rectOverlap(a.r, b.r);
        if (ov <= 0) continue;
        const area = Math.min(a.r.width * a.r.height, b.r.width * b.r.height);
        if (ov / area < 0.35) continue; // only substantial overlaps
        // Skip nested containers (parent/child) — only flag cross-branch overlap.
        if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
        out.overlaps.push({
          a: `${a.tag}.${a.cls} "${a.text}"`,
          b: `${b.tag}.${b.cls} "${b.text}"`,
          overlapPct: Math.round((ov / area) * 100),
        });
      }
    }

    // Dead side space: widest content box vs viewport.
    const content = document.querySelector("main, .shell, .lp");
    if (content) {
      const r = content.getBoundingClientRect();
      out.deadSpace = {
        left: Math.round(r.left),
        right: Math.round(innerWidth - r.right),
        contentW: Math.round(r.width),
      };
    }
    return out;
  });

  // Elements poking outside the viewport horizontally.
  const overflowEls = await page.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      if (r.left < -2 || r.right > innerWidth + 2) {
        bad.push({
          tag: el.tagName,
          cls: String(el.className || "").slice(0, 50),
          left: Math.round(r.left),
          right: Math.round(r.right),
          text: (el.textContent || "").trim().slice(0, 40),
        });
      }
    }
    return bad.slice(0, 20);
  });

  return {
    route,
    viewport: `${vw}x${vh}`,
    errors,
    report,
    overflowEls,
  };
}

const results = [];
for (const [vw, vh, tag] of VIEWPORTS) {
  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width: vw, height: vh } });
    results.push(await auditPage(page, route, vw, vh));
    await page.close();
  }
}
await browser.close();
console.log(JSON.stringify(results, null, 1));
