import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto("http://localhost:3000/app");
await page.waitForResponse("**/api/capabilities");
const report = await page.evaluate(() => {
  const limit = 374; // 390 - 2*16 gutter
  const found = [];
  document.querySelectorAll("main *").forEach((el) => {
    const sw = el.scrollWidth;
    if (sw > limit + 0.5) {
      const p = el.parentElement;
      if (!p || p.scrollWidth <= sw + 0.5 || p === el) {
        found.push({
          el: el.tagName + "." + String(el.className).slice(0, 40),
          sw,
          text: (el.textContent || "").slice(0, 40),
        });
      }
    }
  });
  return { vw: innerWidth, docSW: document.documentElement.scrollWidth, found: found.slice(0, 10) };
});
console.log(JSON.stringify(report, null, 2));
await browser.close();
