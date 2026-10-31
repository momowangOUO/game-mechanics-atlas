import { defineConfig } from "@playwright/test";
const basePath = (process.env.PAGES_BASE_PATH ?? "").replace(/\/$/, "");
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    reducedMotion: "reduce",
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: basePath ? "npm run preview:pages" : "npm run preview",
        url: `http://127.0.0.1:3000${basePath}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});
