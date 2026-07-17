# Remote CI/CD Strategy

## Purpose

This document defines the remote CI/CD responsibilities for the quiz app portfolio project.

## Responsibility Split

```text
GitHub Actions:
  Runs the full quality gate.
  Includes Playwright E2E.
  Installs Playwright Chromium before running E2E.

Cloudflare Pages:
  Runs deployment-safe build.
  Does not run Playwright E2E.
  Generates dist/app.
```

## Commands

```bash
bun run check
bun run pages:build
```

## GitHub Actions

```bash
bun install --frozen-lockfile
bunx playwright install --with-deps chromium
bun run check
```

## Cloudflare Pages

```text
Build command:
  bun install --frozen-lockfile && bun run pages:build

Build output directory:
  dist/app

Root directory:
  blank

NODE_VERSION:
  22.16.0
```

## Failure Classes

### Script not found

```text
Cause:
  package.json script mismatch or old commit deployed.

Example:
  error: Script not found "pages:build"
```

### Cannot find cwd

```text
Cause:
  invalid Cloudflare Pages root directory.

Example:
  Error: Cannot find cwd: /opt/buildhome/repo/repository root
```

### Playwright executable missing

```text
Cause:
  browser binaries were not installed.

Policy:
  This should be handled in GitHub Actions, not Cloudflare Pages.
```

### Modified playwright-report

```text
Cause:
  generated artifacts are tracked by Git.

Policy:
  playwright-report/ and test-results/ should be ignored.
```

