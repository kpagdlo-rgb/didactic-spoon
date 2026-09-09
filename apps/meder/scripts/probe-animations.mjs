import { chromium } from "@playwright/test";
const BASE = process.env.MEDER_TEST_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch();
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
  document.getAnimations()
    .filter((a) => a.playState === "running")
    .map((a) => ({
      name: a.animationName ?? a.constructor.name,
      target: a.effect?.target
        ? `${a.effect.target.tagName}.${String(a.effect.target.className?.baseVal ?? a.effect.target.className).slice(0, 50)}`
        : null,
      duration: a.effect?.getComputedTiming?.()?.duration,
    })),
);
console.log(JSON.stringify(anims, null, 1));
await browser.close();
