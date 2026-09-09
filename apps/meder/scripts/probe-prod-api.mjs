import { chromium } from "@playwright/test";
const BASE = process.env.PROBE_BASE ?? "http://127.0.0.1:3100";
const browser = await chromium.launch();
const page = await browser.newPage();
page.on("response", async (res) => {
  if (res.url().includes("/api/")) {
    let body = "";
    try {
      body = (await res.text()).slice(0, 300);
    } catch {}
    console.log("API", res.status(), res.url().replace(BASE, ""), body);
  }
});
await page.goto(`${BASE}/app`);
await page.waitForLoadState("networkidle");
await page
  .getByRole("button", { name: "Diagnose order", exact: true })
  .click();
await page.waitForTimeout(4000);
console.log(
  "error-box:",
  (await page.locator(".error-box").textContent().catch(() => null)) ??
    "(none)",
);
console.log(
  "diagnosis-result present:",
  (await page.getByTestId("diagnosis-result").count()) > 0,
);
await browser.close();
