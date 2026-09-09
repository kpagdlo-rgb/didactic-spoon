// Captures the definition-of-done screenshot matrix:
// light/dark x idle/result x 1920/390 on /app, plus landing full-page.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = process.env.MEDER_TEST_URL ?? "http://127.0.0.1:3000";
const OUT = new URL("../../../.hoplite/artifacts/screenshots/", import.meta.url)
  .pathname;
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function capture({ viewport, dark, result, path }) {
  const page = await browser.newPage({ viewport });
  await page.addInitScript(
    (theme) => localStorage.setItem("meder-theme", theme),
    dark ? "dark" : "light",
  );
  await page.goto(`${BASE}/app`);
  await page.waitForLoadState("networkidle");
  if (result) {
    await page
      .getByRole("button", { name: "Diagnose order", exact: true })
      .click();
    await page.getByTestId("proposed-quantity").waitFor();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-testid="proposed-quantity"]')
          ?.textContent === "0.001",
    );
    await page.waitForTimeout(500);
  }
  await page.screenshot({ path: `${OUT}${path}` });
  await page.close();
  console.log("captured", path);
}

for (const [vw, vh, tag] of [
  [1920, 1080, "1920"],
  [390, 844, "390"],
]) {
  for (const dark of [false, true]) {
    for (const result of [false, true]) {
      await capture({
        viewport: { width: vw, height: vh },
        dark,
        result,
        path: `app-${tag}-${dark ? "dark" : "light"}-${result ? "result" : "idle"}.png`,
      });
    }
  }
}

const landing = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await landing.goto(`${BASE}/`);
await landing.waitForLoadState("networkidle");
await landing.waitForTimeout(800);
await landing.screenshot({ path: `${OUT}landing-1920-full.png`, fullPage: true });
console.log("captured landing-1920-full.png");
await landing.close();

await browser.close();
