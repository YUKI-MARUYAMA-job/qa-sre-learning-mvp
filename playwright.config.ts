import { defineConfig, devices } from "@playwright/test";

const previewPort = 4173;
const previewHost = "127.0.0.1";
const previewUrl = `http://${previewHost}:${previewPort}`;

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",

  timeout: 30_000,
  expect: {
    timeout: 5_000
  },

  fullyParallel: false,
  workers: process.env.CI ? 1 : undefined,

  reporter: [["list"], ["html", { open: "never" }]],

  use: {
    baseURL: previewUrl,
    trace: "on-first-retry"
  },

  webServer: {
    command: "bun run e2e:webserver",
    port: previewPort,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe"
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"]
      }
    }
  ]
});
