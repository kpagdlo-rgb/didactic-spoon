import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: { baseURL: process.env.MEDER_TEST_URL ?? "http://127.0.0.1:3000", trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.CI ? {
    // CI builds first, so test the production server: no cold-compile
    // races and the artifact under test is the one that ships.
    // The production origin gate denies loopback without a configured
    // origin, so the CI server authorizes exactly its own base URL.
    command: "bun run start -- --port 3000",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
    timeout: 60_000,
    env: { MEDER_ALLOWED_ORIGIN: "http://127.0.0.1:3000" },
  } : undefined,
});
