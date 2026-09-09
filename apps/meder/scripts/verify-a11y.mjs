// axe-core contrast/a11y audit: /app idle+result x light/dark, / landing.
import { chromium } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

const BASE = process.env.MEDER_TEST_URL ?? "http://127.0.0.1:3000";
const failures = [];
const browser = await chromium.launch();

async function audit(name, page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );
  for (const v of serious) {
    failures.push(
      `${name}: ${v.id} (${v.impact}) — ${v.nodes
        .slice(0, 3)
        .map((n) => n.target.join(" "))
        .join("; ")}`,
    );
  }
  console.log(
    `${name}: ${results.violations.length} violations (${serious.length} serious/critical)`,
  );
}

for (const dark of [false, true]) {
  for (const result of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await ctx.newPage();
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
      await page.waitForFunction(
        () =>
          document.querySelector('[data-testid="proposed-quantity"]')
            ?.textContent === "0.001",
        undefined,
        { timeout: 15000 },
      );
      // let view transitions settle so axe doesn't sample mid-fade blends
      await page.waitForTimeout(700);
    }
    await audit(
      `/app ${dark ? "dark" : "light"} ${result ? "result" : "idle"}`,
      page,
    );
    await ctx.close();
  }
}

const landingCtx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const landing = await landingCtx.newPage();
await landing.goto(`${BASE}/`);
await landing.waitForLoadState("networkidle");
await audit("/ landing", landing);
await landingCtx.close();

await browser.close();
if (failures.length) {
  console.error("FAILURES:\n" + failures.join("\n"));
  process.exit(1);
}
console.log("axe audit passed (no serious/critical violations)");
