import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests/browser",
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }], ["junit", { outputFile: "test-results/browser.xml" }]],
  use: {
    baseURL: process.env.DOCS_URL || "http://127.0.0.1:4321",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 1000 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: process.env.DOCS_URL
    ? undefined
    : { command: "npm run preview", url: "http://127.0.0.1:4321", reuseExistingServer: !process.env.CI },
});
