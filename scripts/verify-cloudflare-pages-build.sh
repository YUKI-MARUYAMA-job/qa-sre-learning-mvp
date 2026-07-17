#!/usr/bin/env bash
set -euo pipefail

echo "== Cloudflare Pages Build Verification =="

echo
echo "== Repository state =="
git status -sb
git branch --show-current
git log -1 --oneline

echo
echo "== Runtime versions =="
node --version || true
bun --version
bun --revision

echo
echo "== Required scripts =="
node - <<'NODE'
const fs = require("node:fs");

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const scripts = pkg.scripts ?? {};

const required = [
  "pages:verify",
  "pages:build",
  "client:build",
  "prepare:public-quiz-data",
  "prepare:public-quiz-data:check",
  "client:typecheck",
  "test:unit"
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
echo "== Node version policy =="
if [[ -f .node-version ]]; then
  cat .node-version
else
  echo "WARN: .node-version is missing."
fi

echo
echo "== Pages build =="
bun run pages:build

echo
echo "== Build output =="
test -f dist/app/index.html
echo "OK: dist/app/index.html exists"

echo
echo "== Public quiz data safety =="
if grep -n '"legal"\|"review"' public/study-it/quiz_data.json; then
  echo "ERROR: public quiz data contains internal metadata."
  exit 1
fi

echo "OK: public quiz data does not contain legal/review metadata."

echo
echo "== Cloudflare Pages Build Verification Passed =="
