import { expect, test } from "@playwright/test";

test("landing renders hero, links to the tool, and stays console-clean", async ({
  page,
}) => {
  // CI runs against a cold dev server; /app compiles on first navigation
  // while other specs compile it concurrently, which can exceed 30 s.
  test.setTimeout(120_000);
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  await page.goto("/");
  await expect(page).toHaveTitle(/Meder/);
  await expect(
    page.getByRole("heading", { level: 1 }),
  ).toContainText("Order clarity");
  const cta = page.getByRole("link", { name: "Open the diagnostic" }).first();
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", "/app");
  await Promise.all([
    page.waitForURL(/\/app$/, { timeout: 90_000 }),
    cta.click(),
  ]);
  await expect(
    page.getByRole("button", { name: "Diagnose order", exact: true }),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
