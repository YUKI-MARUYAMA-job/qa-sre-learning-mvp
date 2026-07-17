#!/usr/bin/env bash
set -euo pipefail

echo "== Phase 7 Verification =="

echo
echo "== Repository state =="
git status -sb
git branch --show-current

echo
echo "== Required scripts =="
node - <<'NODE'
const fs = require("node:fs");

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const scripts = pkg.scripts ?? {};

const required = [
  "test",
  "test:unit",
  "test:e2e",
  "client:typecheck",
  "client:build",
  "prepare:public-quiz-data",
  "prepare:public-quiz-data:check",
  "check"
];

let failed = false;

for (const name of required) {
  if (!scripts[name]) {
    console.error(`MISSING script: ${name}`);
    failed = true;
  } else {
    console.log(`OK script: ${name} -> ${scripts[name]}`);
  }
}

if (failed) {
  process.exit(1);
}
NODE

echo
echo "== Required files =="
required_files=(
  "playwright.config.ts"
  "e2e/quiz-smoke.e2e.ts"
  "public/study-it/quiz_data.json"
  "src/client/App.tsx"
  "src/client/main.tsx"
  "vite.config.ts"
  "tsconfig.client.json"
)

for file in "${required_files[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "MISSING file: $file"
    exit 1
  fi
  echo "OK file: $file"
done

echo
echo "== Unit / E2E test responsibility split =="
if find e2e -type f -name "*.spec.ts" | grep -q .; then
  echo "ERROR: e2e contains *.spec.ts files. Rename them to *.e2e.ts or restrict Bun test scope."
  find e2e -type f -name "*.spec.ts"
  exit 1
fi

if ! grep -q 'testMatch: "\*\*/\*.e2e.ts"' playwright.config.ts; then
  echo "ERROR: playwright.config.ts should include testMatch: \"**/*.e2e.ts\""
  exit 1
fi

echo "OK: Playwright E2E files are separated from Bun unit tests."

echo
echo "== Public quiz data generation =="
bun run prepare:public-quiz-data
bun run prepare:public-quiz-data:check

echo
echo "== Public quiz data safety =="
if grep -n '"legal"\|"review"' public/study-it/quiz_data.json; then
  echo "ERROR: public quiz data contains internal metadata."
  exit 1
fi
echo "OK: public quiz data does not contain legal/review metadata."

echo
echo "== Client typecheck and build =="
bun run client:typecheck
bun run client:build

echo
echo "== Build output =="
test -f dist/app/index.html
echo "OK: dist/app/index.html exists"

if [[ -f public/_headers ]]; then
  test -f dist/app/_headers
  echo "OK: public/_headers copied to dist/app/_headers"
else
  echo "INFO: public/_headers is not present. This is acceptable unless Phase 7A deployment headers are in scope."
fi

echo
echo "== Unit tests =="
bun run test:unit

echo
echo "== E2E smoke test =="
bun run test:e2e

echo
echo "== Optional client performance baseline =="
if node -e 'const s=require("./package.json").scripts||{}; process.exit(s["validate:client-performance-baseline"] ? 0 : 1)' 2>/dev/null; then
  bun run validate:client-performance-baseline
else
  echo "SKIP: validate:client-performance-baseline script is not defined."
fi

echo
echo "== Full check =="
bun run check

echo
echo "== Phase 7 Verification Passed =="
