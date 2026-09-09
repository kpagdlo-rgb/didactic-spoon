// Renders / and /app (idle + result) and asserts the copy discipline:
// no "AI" claims, no "total-spend" phrasing, no 01/02/03 numerotation.
import { chromium } from "@playwright/test";

const BASE = process.env.MEDER_TEST_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch();
const failures = [];

async function sweep(name, prepare) {
  const page = await browser.newPage();
  await page.goto(`${BASE}${name}`);
  await page.waitForLoadState("networkidle");
  if (prepare) await prepare(page);
  const text = await page.evaluate(() => document.body.innerText);
  const checks = {
    "AI kicker": /\bAI\b/,
    "spend phrasing": /total[- ]spend/i,
    numerotation: /(^|\n)\s*0[1-4]\s*(\n|$)/,
  };
  for (const [label, re] of Object.entries(checks)) {
    const m = text.match(re);
    if (m) failures.push(`${name}: found ${label}: ${JSON.stringify(m[0])}`);
  }
  // open the About safety sheet and sweep it too
  const about = page.getByRole("button", { name: "About safety" });
  if (await about.count()) {
    await about.click();
    const sheetText = await page.evaluate(() => document.body.innerText);
    for (const [label, re] of Object.entries(checks)) {
      const m = sheetText.match(re);
      if (m)
        failures.push(
          `${name} (about-safety open): found ${label}: ${JSON.stringify(m[0])}`,
        );
    }
  }
  console.log(`${name}: clean (${text.length} chars swept)`);
  await page.close();
}

await sweep("/");
await sweep("/app");
await sweep("/app", async (page) => {
  await page
    .getByRole("button", { name: "Diagnose order", exact: true })
    .click();
  await page.waitForFunction(
    () =>
      document.querySelector('[data-testid="proposed-quantity"]')
        ?.textContent === "0.001",
    undefined,
    { timeout: 15000 },
  );
});

await browser.close();
if (failures.length) {
  console.error("FAILURES:\n" + failures.join("\n"));
  process.exit(1);
}
console.log("copy sweep passed on /, /app idle, /app result");
