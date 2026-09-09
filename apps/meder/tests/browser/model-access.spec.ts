import { test, expect, type Page } from "@playwright/test";

const demoKey = "synthetic-demo-access-key-for-browser-tests-only";
const wrongKey = "synthetic-wrong-access-key-for-browser-tests-only";

function capabilities({ authorized = false, configured = true, providerConfigured = true } = {}) {
  return {
    providerConfigured,
    planners: { deterministic: true, model: authorized && configured && providerConfigured },
    modelAccess: {
      configured,
      authorized,
      ...(authorized ? { expiresAt: new Date(Date.now() + 900_000).toISOString() } : {}),
    },
    modelBudget: { remaining: 10, active: 0 },
  };
}

const panel = (page: Page) => page.getByRole("region", { name: "Private model access" });
const runtime = (page: Page) => page.getByLabel("Diagnostic runtime");
const modelOption = (page: Page) => runtime(page).locator('option[value="model"]');
const diagnose = (page: Page) => page.getByRole("button", { name: "Diagnose order", exact: true });

async function openApp(page: Page) {
  const loaded = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/capabilities");
  await page.goto("/");
  const response = await loaded;
  expect(response.ok()).toBe(true);
  return response.json();
}

async function blockDiagnoses(page: Page) {
  const requests: string[] = [];
  await page.route(/\/api\/diagnoses(?:\/[^?]*)?(?:\?.*)?$/, async (route) => {
    requests.push(route.request().url());
    await route.abort();
  });
  return requests;
}

async function expectNoStoredKey(page: Page, key: string) {
  const stored = await page.evaluate(() => ({
    local: { ...localStorage },
    session: { ...sessionStorage },
    cookies: document.cookie,
  }));
  expect(JSON.stringify(stored)).not.toContain(key);
  await expect(page.locator("body")).not.toContainText(key);
}

test("unlock clears the key before the response, enables model mode, and never starts a diagnosis", async ({ page }) => {
  const diagnoses = await blockDiagnoses(page);
  let authorized = false;
  await page.route("**/api/capabilities", (route) => route.fulfill({ json: capabilities({ authorized }) }));
  let release!: () => void;
  const heldResponse = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/model-access", async (route) => {
    expect(route.request().method()).toBe("POST");
    expect(route.request().headers()["content-type"]).toBe("application/json");
    expect(route.request().postDataJSON()).toEqual({ accessKey: demoKey });
    await heldResponse;
    authorized = true;
    await route.fulfill({ json: { modelAccess: capabilities({ authorized }).modelAccess } });
  });
  await openApp(page);
  await expect(panel(page).locator(".badge")).toHaveText("LOCKED");
  const input = page.getByLabel("Private demo access key");
  await expect(input).toBeVisible();
  await expect(modelOption(page)).toBeDisabled();
  await expect(runtime(page)).toHaveValue("deterministic");
  await input.fill(demoKey);
  const login = page.waitForRequest("**/api/model-access");
  await page.getByRole("button", { name: "Unlock model access", exact: true }).click();
  await login;
  try {
    await expect(input).toHaveValue("");
    await expect(input).toBeDisabled();
    await expect(diagnose(page)).toBeDisabled();
    await expectNoStoredKey(page, demoKey);
    expect(diagnoses).toEqual([]);
  } finally {
    release();
  }
  await expect(panel(page).locator(".badge")).toHaveText("UNLOCKED");
  await expect(modelOption(page)).toBeEnabled();
  await expect(panel(page).getByRole("status")).toContainText("No model has been called.");
  await expect(runtime(page)).toHaveValue("deterministic");
  await runtime(page).selectOption("model");
  await expect(diagnose(page)).toBeEnabled();
  await expectNoStoredKey(page, demoKey);
  expect(diagnoses).toEqual([]);
});

test("locking revokes access without silently changing the selected model runtime", async ({ page }) => {
  const diagnoses = await blockDiagnoses(page);
  let authorized = true;
  await page.route("**/api/capabilities", (route) => route.fulfill({ json: capabilities({ authorized }) }));
  await page.route("**/api/model-access/logout", async (route) => {
    expect(route.request().method()).toBe("POST");
    expect(route.request().postDataJSON()).toEqual({});
    authorized = false;
    await route.fulfill({ json: { modelAccess: { configured: true, authorized: false } } });
  });
  await openApp(page);
  await expect(modelOption(page)).toBeEnabled();
  await runtime(page).selectOption("model");
  await expect(diagnose(page)).toBeEnabled();
  const refreshed = page.waitForResponse("**/api/capabilities");
  await page.getByRole("button", { name: "Lock model access", exact: true }).click();
  expect((await (await refreshed).json()).modelAccess.authorized).toBe(false);
  await expect(panel(page).locator(".badge")).toHaveText("LOCKED");
  await expect(modelOption(page)).toBeDisabled();
  await expect(runtime(page)).toHaveValue("model");
  await expect(diagnose(page)).toBeDisabled();
  await expect(page.getByText(/No automatic fallback occurs/)).toBeVisible();
  // A keyboard form submission must also respect the revoked grant.
  await page.getByLabel("Quantity", { exact: true }).press("Enter");
  await expect(runtime(page)).toHaveValue("model");
  expect(diagnoses).toEqual([]);
  await runtime(page).selectOption("deterministic");
  await expect(diagnose(page)).toBeEnabled();
});

for (const failure of [
  { status: 403, code: "MODEL_ACCESS_REQUIRED", message: "Model access was not authorized. Check the private demo access key and try again." },
  { status: 429, code: "CAPACITY", message: "Too many access attempts. Wait one minute before trying again." },
]) {
  test(`${failure.status} uses safe client text rather than reflecting a server credential`, async ({ page }) => {
    const diagnoses = await blockDiagnoses(page);
    await page.route("**/api/capabilities", (route) => route.fulfill({ json: capabilities() }));
    let attempts = 0;
    await page.route("**/api/model-access", async (route) => {
      attempts++;
      expect(route.request().postDataJSON()).toEqual({ accessKey: wrongKey });
      await route.fulfill({
        status: failure.status,
        json: { error: { code: failure.code, message: `Unsafe server reflection: ${wrongKey}` } },
      });
    });
    await openApp(page);
    const input = page.getByLabel("Private demo access key");
    await expect(input).toBeVisible();
    await input.fill(wrongKey);
    await page.getByRole("button", { name: "Unlock model access", exact: true }).click();
    await expect(panel(page).getByRole("alert")).toHaveText(failure.message);
    await expect(input).toHaveValue("");
    await expect(input).toBeEnabled();
    await expect(panel(page).locator(".badge")).toHaveText("LOCKED");
    await expect(modelOption(page)).toBeDisabled();
    await expect(diagnose(page)).toBeEnabled();
    await expectNoStoredKey(page, wrongKey);
    await expect(page.locator("body")).not.toContainText("Unsafe server reflection");
    expect(attempts).toBe(1);
    expect(diagnoses).toEqual([]);
  });
}

test("window focus refresh observes an expired grant and relocks the selected model", async ({ page }) => {
  const diagnoses = await blockDiagnoses(page);
  let authorized = true;
  await page.route("**/api/capabilities", (route) => route.fulfill({ json: capabilities({ authorized }) }));
  await openApp(page);
  await expect(modelOption(page)).toBeEnabled();
  await runtime(page).selectOption("model");
  authorized = false;
  const refreshed = page.waitForResponse("**/api/capabilities");
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  expect((await (await refreshed).json()).modelAccess.authorized).toBe(false);
  await expect(panel(page).locator(".badge")).toHaveText("LOCKED");
  await expect(page.getByLabel("Private demo access key")).toBeVisible();
  await expect(modelOption(page)).toBeDisabled();
  await expect(runtime(page)).toHaveValue("model");
  await expect(diagnose(page)).toBeDisabled();
  expect(diagnoses).toEqual([]);
});

for (const missing of ["provider", "gate"] as const) {
  test(`missing ${missing} keeps the real deterministic solver available`, async ({ page }) => {
    await page.route("**/api/capabilities", (route) => route.fulfill({
      json: capabilities({ configured: missing !== "gate", providerConfigured: missing !== "provider" }),
    }));
    await openApp(page);
    await expect(panel(page)).toContainText(missing === "provider"
      ? "The model provider is not configured."
      : "A private access key is not configured on this server.");
    await expect(modelOption(page)).toBeDisabled();
    await expect(runtime(page)).toHaveValue("deterministic");
    const request = page.waitForRequest("**/api/diagnoses");
    await diagnose(page).click();
    expect((await request).postDataJSON().planner).toBe("deterministic");
    await expect(page.getByTestId("diagnosis-result")).toContainText("REPAIR_PROPOSED");
    await expect(page.getByTestId("proposed-quantity")).toHaveText("0.001");
  });
}

test("unconfigured preview defaults still run a real deterministic diagnosis without logging in", async ({ page }) => {
  const actual = await openApp(page);
  expect(actual.providerConfigured).toBe(false);
  expect(actual.modelAccess).toMatchObject({ configured: false, authorized: false });
  await expect(panel(page)).toContainText("A private access key is not configured on this server.");
  await expect(modelOption(page)).toBeDisabled();
  await expect(page.getByLabel("Private demo access key")).toHaveCount(0);
  await expect(runtime(page)).toHaveValue("deterministic");
  const request = page.waitForRequest("**/api/diagnoses");
  await diagnose(page).click();
  expect((await request).postDataJSON().planner).toBe("deterministic");
  await expect(page.getByTestId("diagnosis-result")).toContainText("REPAIR_PROPOSED");
  await expect(page.getByTestId("proposed-quantity")).toHaveText("0.001");
});
