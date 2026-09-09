import { expect, test } from "@playwright/test";

test("landing renders hero, links to the tool, and stays console-clean", async ({
  page,
}) => {
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
  await expect(
    page.getByRole("link", { name: "Open the diagnostic" }).first(),
  ).toBeVisible();
  await page.getByRole("link", { name: "Open the diagnostic" }).first().click();
  await expect(page).toHaveURL(/\/app$/);
  await expect(
    page.getByRole("button", { name: "Diagnose order", exact: true }),
  ).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
