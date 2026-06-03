import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: ["e2e/**/*.spec.ts", "tests/**/*.spec.ts"],
  timeout: 60_000,
  expect: { timeout: 10_000 },
  retries: process.env.CI ? 2 : 0,
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
        },
      },
});

