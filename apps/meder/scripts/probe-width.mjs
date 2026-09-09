import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
await page.goto(process.env.PROBE_URL ?? "http://127.0.0.1:3000/app");
await page.waitForLoadState("networkidle");
const wide = await page.evaluate(() => {
  const vw = window.innerWidth;
  const out = [];
  document.querySelectorAll("*").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.width > vw + 1 || r.right > vw + 1 || r.left < -1) {
      out.push(
        `${el.tagName}.${String(el.className?.baseVal ?? el.className).slice(0, 60)} left=${Math.round(r.left)} right=${Math.round(r.right)} w=${Math.round(r.width)}`,
      );
    }
  });
  return {
    vw,
    sw: document.documentElement.scrollWidth,
    out: out.slice(0, 20),
  };
});
console.log(JSON.stringify(wide, null, 1));
await browser.close();
