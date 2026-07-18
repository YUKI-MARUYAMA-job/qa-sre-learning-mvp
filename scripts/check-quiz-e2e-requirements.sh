#!/usr/bin/env bash
set -euo pipefail

TARGET="e2e/quiz-smoke.e2e.ts"
PUBLIC_JSON="public/study-it/quiz_data.json"
ARTIFACT_DIR="tmp/e2e-requirements"

mkdir -p "$ARTIFACT_DIR"

if command -v tput >/dev/null 2>&1; then
  GREEN="$(tput setaf 2)"
  RED="$(tput setaf 1)"
  YELLOW="$(tput setaf 3)"
  BLUE="$(tput setaf 4)"
  BOLD="$(tput bold)"
  RESET="$(tput sgr0)"
else
  GREEN=""
  RED=""
  YELLOW=""
  BLUE=""
  BOLD=""
  RESET=""
fi

pass() {
  printf "%s[PASS]%s %s\n" "$GREEN" "$RESET" "$1"
}

fail() {
  printf "%s[FAIL]%s %s\n" "$RED" "$RESET" "$1"
  exit 1
}

info() {
  printf "%s[INFO]%s %s\n" "$BLUE" "$RESET" "$1"
}

warn() {
  printf "%s[WARN]%s %s\n" "$YELLOW" "$RESET" "$1"
}

require_file() {
  local path="$1"
  [ -f "$path" ] || fail "Required file not found: $path"
  pass "File exists: $path"
}

require_grep() {
  local pattern="$1"
  local path="$2"
  local label="$3"

  if grep -Eq "$pattern" "$path"; then
    pass "$label"
  else
    fail "$label"
  fi
}

reject_grep() {
  local pattern="$1"
  local path="$2"
  local label="$3"

  if grep -Eq "$pattern" "$path"; then
    fail "$label"
  else
    pass "$label"
  fi
}

section() {
  printf "\n%s== %s ==%s\n" "$BOLD" "$1" "$RESET"
}

section "1. Static file checks"

require_file "$TARGET"

require_grep 'import[[:space:]]+\{[[:space:]]*expect,[[:space:]]*test[[:space:]]*\}[[:space:]]+from[[:space:]]+"@playwright/test"' \
  "$TARGET" \
  "Playwright test imports expect and test"

require_grep 'page\.goto\("/"\)' \
  "$TARGET" \
  "Test navigates to root path"

require_grep 'QA\\/SRE Learning Quiz' \
  "$TARGET" \
  "Test verifies quiz app heading"

require_grep '/study-it/quiz_data\.json' \
  "$TARGET" \
  "Test reads public quiz data"

require_grep 'response\.ok\(\)' \
  "$TARGET" \
  "Test verifies quiz data response is OK"

require_grep 'questionCount' \
  "$TARGET" \
  "Test derives questionCount"

require_grep 'toBeGreaterThan\(0\)' \
  "$TARGET" \
  "Test asserts questionCount > 0"

node - <<'NODE'
const fs = require("node:fs");

const target = "e2e/quiz-smoke.e2e.ts";
const source = fs.readFileSync(target, "utf8");

const compact = source.replace(/\s+/g, " ");

const hasQuestionCount = /const\s+questionCount\s*=/.test(source);
const assertsPositiveCount = /questionCount\)\.toBeGreaterThan\(0\)/.test(source);
const hasQuestionCountLoop =
  /for\s*\([^)]*questionCount[^)]*\)/s.test(source) ||
  /while\s*\([^)]*questionCount[^)]*\)/s.test(source);

const hasOldTwoQuestionPattern =
  /for\s*\([^)]*<\s*2\s*[;)]/s.test(source) ||
  /visibleButtonCount\s*>\s*0/.test(source);

if (!hasQuestionCount) {
  console.error("[FAIL] questionCount is not defined.");
  process.exit(1);
}

if (!assertsPositiveCount) {
  console.error("[FAIL] questionCount > 0 assertion is missing.");
  process.exit(1);
}

if (!hasQuestionCountLoop) {
  console.error("[FAIL] No loop condition appears to use questionCount.");
  process.exit(1);
}

if (hasOldTwoQuestionPattern) {
  console.error("[FAIL] Old fixed-count / partial-flow pattern still appears to exist.");
  process.exit(1);
}

console.log("[PASS] Test iterates based on questionCount");
NODE

require_grep '正解\|不正解' \
  "$TARGET" \
  "Test checks answer feedback"

require_grep '次の問題へ\|結果を見る' \
  "$TARGET" \
  "Test supports next/result button labels"

require_grep '結果\|Result' \
  "$TARGET" \
  "Test supports Japanese/English result heading"

require_grep 'スコア\|Score' \
  "$TARGET" \
  "Test supports Japanese/English score text"

require_grep 'もう一度解く' \
  "$TARGET" \
  "Test verifies retry button"

reject_grep 'name:[[:space:]]*/Result/i' \
  "$TARGET" \
  "Test no longer depends on English-only /Result/i locator"

reject_grep 'name:[[:space:]]*/Score:/i' \
  "$TARGET" \
  "Test no longer depends on English-only /Score:/i locator"

section "2. Generated public quiz data checks"

bun run prepare:public-quiz-data

require_file "$PUBLIC_JSON"

QUESTION_COUNT="$(node - <<'NODE'
const fs = require("node:fs");

const path = "public/study-it/quiz_data.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));
const questions = Array.isArray(data) ? data : data.questions;

if (!Array.isArray(questions)) {
  console.error("public quiz data is neither an array nor { questions: [...] }");
  process.exit(1);
}

console.log(questions.length);
NODE
)"

if [ "$QUESTION_COUNT" -gt 0 ]; then
  pass "Public quiz data has questions: $QUESTION_COUNT"
else
  fail "Public quiz data has no questions"
fi

if grep -n '"legal"\|"review"' "$PUBLIC_JSON" > "$ARTIFACT_DIR/public-metadata-leak.txt"; then
  cat "$ARTIFACT_DIR/public-metadata-leak.txt"
  fail "Public quiz data must not contain legal/review metadata"
else
  pass "Public quiz data does not expose legal/review metadata"
fi

section "3. Validation and build checks"

bun run validate:quiz
pass "Quiz schema/taxonomy validation passed"

bun run validate:quiz-policy
pass "Quiz policy validation passed"

bun run validate:quiz-fixtures
pass "Quiz fixture validation passed"

bun run client:build
pass "Client production build passed"

section "4. Playwright E2E visual/runtime check"

rm -rf test-results playwright-report

set +e
CI=1 bunx playwright test "$TARGET" --trace on --reporter=list,html
PLAYWRIGHT_EXIT="$?"
set -e

if [ "$PLAYWRIGHT_EXIT" -ne 0 ]; then
  warn "Playwright E2E failed. Collecting diagnostics."

  find test-results -maxdepth 3 -type f | sort > "$ARTIFACT_DIR/test-results-files.txt" || true

  if find test-results -name "error-context.md" -print -quit | grep -q .; then
    ERROR_CONTEXT="$(find test-results -name "error-context.md" -print -quit)"
    cp "$ERROR_CONTEXT" "$ARTIFACT_DIR/error-context.md"
    warn "Error context copied to: $ARTIFACT_DIR/error-context.md"
  fi

  if find test-results -name "trace.zip" -print -quit | grep -q .; then
    TRACE_PATH="$(find test-results -name "trace.zip" -print -quit)"
    warn "Trace available: $TRACE_PATH"
    warn "Open it with:"
    printf "  bunx playwright show-trace %s\n" "$TRACE_PATH"
  fi

  warn "HTML report command:"
  printf "  bunx playwright show-report\n"

  fail "Playwright E2E requirement failed"
fi

pass "Playwright E2E passed"

section "5. Visual artifact guidance"

if [ -d "playwright-report" ]; then
  pass "HTML report generated: playwright-report/"
  info "Open visual report:"
  printf "  bunx playwright show-report\n"
else
  warn "playwright-report/ was not found. Reporter settings may differ."
fi

section "6. Final summary"

pass "quiz-smoke E2E requirements are satisfied"
info "Question count used by app: $QUESTION_COUNT"
info "Checked file: $TARGET"
