// Reduced-motion and CSP checks:
// - reducedMotion=reduce: no running CSS animations, counter settles exact,
//   no shader canvas on the landing.
// - CSP meta/header present on / and /app, no CSP violation console entries.
import { chromium } from "@playwright/test";

const BASE = process.env.MEDER_TEST_URL ?? "http://127.0.0.1:3000";
const failures = [];
const browser = await chromium.launch();

// Reduced motion
const page = await browser.newPage({ reducedMotion: "reduce" });
await page.goto(`${BASE}/app`);
await page
  .getByRole("button", { name: "Diagnose order", exact: true })
  .click();
await page.waitForFunction(
  () =>
    document.querySelector('[data-testid="proposed-quantity"]')?.textContent ===
    "0.001",
  undefined,
  { timeout: 15000 },
);
await page.waitForTimeout(800);
const anims = await page.evaluate(() =>
  document.getAnimations().filter((a) => a.playState === "running").length,
);
if (anims > 0) failures.push(`reduced-motion: ${anims} CSS animations running`);
console.log("reduced-motion: counter exact, running CSS animations =", anims);

// Landing under reduced motion: no WebGL shader canvas
await page.goto(`${BASE}/`);
await page.waitForLoadState("networkidle");
await page.waitForTimeout(600);
const shaderCanvas = await page.evaluate(
  () => document.querySelectorAll(".lp-shader canvas").length,
);
if (shaderCanvas > 0)
  failures.push("reduced-motion: landing still mounts shader canvas");
console.log("reduced-motion: landing shader canvases =", shaderCanvas);
await page.close();

// CSP + console violations on both routes
for (const route of ["/", "/app"]) {
  const p = await browser.newPage();
  const cspErrors = [];
  p.on("console", (m) => {
    if (m.type() === "error" && /content security policy/i.test(m.text()))
      cspErrors.push(m.text());
  });
  const res = await p.goto(`${BASE}${route}`);
  await p.waitForLoadState("networkidle");
  const header = res.headers()["content-security-policy"] ?? "";
  const meta = await p.evaluate(
    () =>
      document.querySelector('meta[http-equiv="Content-Security-Policy"]')
        ?.content ?? "",
  );
  if (!header && !meta) failures.push(`${route}: no CSP header or meta`);
  if (cspErrors.length)
    failures.push(`${route}: CSP violations: ${cspErrors.join(" | ")}`);
  console.log(
    `${route}: CSP ${header ? "header" : meta ? "meta" : "MISSING"}, violations = ${cspErrors.length}`,
  );
  await p.close();
}

await browser.close();
if (failures.length) {
  console.error("FAILURES:\n" + failures.join("\n"));
  process.exit(1);
}
console.log("reduced-motion + CSP checks passed");
