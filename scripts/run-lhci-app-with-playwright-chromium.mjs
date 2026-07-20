import { spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";

const chromePath = chromium.executablePath();

if (!chromePath) {
  console.error("Playwright Chromium executable path was not found.");
  console.error("Run: bunx playwright install --with-deps chromium");
  process.exit(1);
}

const result = spawnSync(
  "bunx",
  ["lhci", "autorun", "--config=lighthouserc.app.json"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      CHROME_PATH: chromePath,
    },
  },
);

process.exit(result.status ?? 1);