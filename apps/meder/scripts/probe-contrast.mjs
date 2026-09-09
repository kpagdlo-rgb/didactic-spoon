import { chromium } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const BASE = process.env.MEDER_TEST_URL ?? "http://127.0.0.1:3000";
const browser = await chromium.launch();

async function detail(name, url, dark, result) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  await page.addInitScript(
    (theme) => localStorage.setItem("meder-theme", theme),
    dark ? "dark" : "light",
  );
  await page.goto(`${BASE}${url}`);
  await page.waitForLoadState("networkidle");
  if (result) {
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
  }
  const results = await new AxeBuilder({ page })
    .withRules(["color-contrast"])
    .analyze();
  for (const v of results.violations) {
    for (const n of v.nodes) {
      const d = n.any[0]?.data ?? {};
      console.log(
        `${name} | ${n.target.join(" ")} | ratio=${d.contrastRatio} needs=${d.expectedContrastRatio} fg=${d.fgColor} bg=${d.bgColor} font=${d.fontSize}`,
      );
    }
  }
  await ctx.close();
}

await detail("light-idle", "/app", false, false);
await detail("light-result", "/app", false, true);
await detail("dark-idle", "/app", true, false);
await detail("landing", "/", false, false);
await browser.close();
