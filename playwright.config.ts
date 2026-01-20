import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://127.0.0.1:5000",
    trace: "on-first-retry",
  },
  webServer: process.env.E2E_NO_WEBSERVER
    ? undefined
    : {
        command: "npm run dev",
        url: process.env.E2E_BASE_URL || "http://127.0.0.1:5000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        env: {
          NODE_ENV: "development",
          PORT: process.env.PORT || "5000",
          HOST: process.env.HOST || "127.0.0.1",
        },
      },
});

