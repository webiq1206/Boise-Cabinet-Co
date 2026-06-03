import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: ["e2e/**/*.spec.ts", "tests/**/*.spec.ts"],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  projects: [
    { name: "Desktop Chrome", use: { ...devices["Desktop Chrome"] } },
    { name: "iPhone 14", use: { ...devices["iPhone 14"] } },
    { name: "Pixel 7", use: { ...devices["Pixel 7"] } },
    { name: "iPad Pro 11", use: { ...devices["iPad Pro 11"] } },
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:3456",
    trace: "on-first-retry",
  },
  webServer: process.env.E2E_NO_WEBSERVER
    ? undefined
    : {
        command: "npm run dev -- -p 3456",
        url: process.env.E2E_BASE_URL || "http://127.0.0.1:3456",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          NODE_ENV: "development",
          PORT: process.env.PORT || "3456",
          HOST: process.env.HOST || "127.0.0.1",
          SESSION_SECRET:
            process.env.SESSION_SECRET ||
            "e2e-test-session-secret-min-32-chars-long",
        },
      },
});
