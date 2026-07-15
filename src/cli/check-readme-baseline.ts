const readmePath = "README.md";

const requiredTexts = [
  "# qa-sre-learning-mvp",
  "## Overview",
  "## Live Site",
  "## What This Demonstrates",
  "## Architecture Overview",
  "## Quality Gate",
  "## Production Deployment",
  "## Reports",
  "## Main Commands",
  "## Release",
  "## Known Limitations",
  "qa-sre-learning-mvp.pages.dev",
  "bun run check",
  "validate:deployment",
  "Cloudflare Pages",
  "GitHub Actions",
  "v0.1.0"
] as const;

const readme = await Bun.file(readmePath).text();

const issues = requiredTexts.filter((text) => !readme.includes(text));

if (issues.length > 0) {
  console.error("README baseline check failed.");

  for (const issue of issues) {
    console.error(`- Missing required README text: ${issue}`);
  }

  process.exit(1);
}

console.log("README baseline check passed.");
