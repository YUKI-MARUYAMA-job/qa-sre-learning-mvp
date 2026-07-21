#!/usr/bin/env bash

# IT就活ポートフォリオ提出前の完了チェックを一括実行する。
#
# 実行例:
#   bash scripts/check-submission-readiness.sh
#
# Cloudflare Pagesも確認:
#   APP_URL="https://example.pages.dev" \
#   bash scripts/check-submission-readiness.sh
#
# PR番号を明示:
#   PR_NUMBER=123 \
#   APP_URL="https://example.pages.dev" \
#   bash scripts/check-submission-readiness.sh
#
# 環境変数:
#   EXPECTED_QUIZ_COUNT       期待する問題数。既定値: 16
#   APP_URL                  Cloudflare Pages本番URL
#   APP_EXPECTED_TEXT        本番HTMLに含まれるべき文字列（任意）
#   PR_NUMBER                確認対象PR番号（任意）
#   MAIN_BRANCH              本番ブランチ。既定値: main
#   QUALITY_WORKFLOW         GitHub Actions workflow名またはファイル名
#                            既定値: quality-gate
#   QUALITY_CHECK_NAME       PR上のcheck/job名。既定値: quality-gate
#   RUN_REMOTE_CHECKS        0ならGitHub/Cloudflare確認を無効化。既定値: 1
#   RUN_FULL_CHECK           0なら CI=1 bun run check を省略。既定値: 1
#   KEEP_LOGS                1なら成功ログも保持。既定値: 0
#
# 終了コード:
#   0: FAILなし（SKIPはあり得る）
#   1: 1件以上FAIL
#   2: 実行場所・必須ツールなどの前提エラー

set -uo pipefail

EXPECTED_QUIZ_COUNT="${EXPECTED_QUIZ_COUNT:-16}"
APP_URL="${APP_URL:-}"
APP_EXPECTED_TEXT="${APP_EXPECTED_TEXT:-}"
PR_NUMBER="${PR_NUMBER:-}"
MAIN_BRANCH="${MAIN_BRANCH:-main}"
QUALITY_WORKFLOW="${QUALITY_WORKFLOW:-quality-gate}"
QUALITY_CHECK_NAME="${QUALITY_CHECK_NAME:-quality-gate}"
RUN_REMOTE_CHECKS="${RUN_REMOTE_CHECKS:-1}"
RUN_FULL_CHECK="${RUN_FULL_CHECK:-1}"
KEEP_LOGS="${KEEP_LOGS:-0}"

TIMESTAMP="$(date '+%Y%m%d-%H%M%S')"
LOG_DIR="${LOG_DIR:-reports/submission-readiness/${TIMESTAMP}}"
SUMMARY_FILE="${LOG_DIR}/summary.txt"
DETAIL_FILE="${LOG_DIR}/details.md"

PASS_COUNT=0
FAIL_COUNT=0
SKIP_COUNT=0
WARN_COUNT=0
TOTAL_COUNT=0

CURRENT_SECTION=""
INSIDE_DEVCONTAINER=0
QUALITY_GATE_LOCAL_RESULT="NOT_RUN"

declare -a RESULT_STATUS=()
declare -a RESULT_SECTION=()
declare -a RESULT_NAME=()
declare -a RESULT_DETAIL=()
declare -a RESULT_LOG=()

if [[ -t 1 && "${NO_COLOR:-0}" != "1" ]]; then
  COLOR_RESET=$'\033[0m'
  COLOR_BOLD=$'\033[1m'
  COLOR_GREEN=$'\033[32m'
  COLOR_RED=$'\033[31m'
  COLOR_YELLOW=$'\033[33m'
  COLOR_CYAN=$'\033[36m'
  COLOR_GRAY=$'\033[90m'
else
  COLOR_RESET=""
  COLOR_BOLD=""
  COLOR_GREEN=""
  COLOR_RED=""
  COLOR_YELLOW=""
  COLOR_CYAN=""
  COLOR_GRAY=""
fi

print_header() {
  printf '\n%s%s%s\n' "${COLOR_BOLD}${COLOR_CYAN}" "$1" "${COLOR_RESET}"
  printf '%s\n' '────────────────────────────────────────────────────────────'
}

sanitize_filename() {
  printf '%s' "$1" |
    tr '[:upper:]' '[:lower:]' |
    sed -E 's/[^a-z0-9._-]+/-/g; s/^-+//; s/-+$//'
}

record_result() {
  local status="$1"
  local name="$2"
  local detail="${3:-}"
  local log_file="${4:-}"

  TOTAL_COUNT=$((TOTAL_COUNT + 1))

  case "$status" in
    PASS) PASS_COUNT=$((PASS_COUNT + 1)) ;;
    FAIL) FAIL_COUNT=$((FAIL_COUNT + 1)) ;;
    SKIP) SKIP_COUNT=$((SKIP_COUNT + 1)) ;;
    WARN) WARN_COUNT=$((WARN_COUNT + 1)) ;;
    *)
      printf 'Internal error: unknown status: %s\n' "$status" >&2
      exit 2
      ;;
  esac

  RESULT_STATUS+=("$status")
  RESULT_SECTION+=("$CURRENT_SECTION")
  RESULT_NAME+=("$name")
  RESULT_DETAIL+=("$detail")
  RESULT_LOG+=("$log_file")

  case "$status" in
    PASS)
      printf '  %s[PASS]%s %s' "$COLOR_GREEN" "$COLOR_RESET" "$name"
      ;;
    FAIL)
      printf '  %s[FAIL]%s %s' "$COLOR_RED" "$COLOR_RESET" "$name"
      ;;
    SKIP)
      printf '  %s[SKIP]%s %s' "$COLOR_YELLOW" "$COLOR_RESET" "$name"
      ;;
    WARN)
      printf '  %s[WARN]%s %s' "$COLOR_YELLOW" "$COLOR_RESET" "$name"
      ;;
  esac

  if [[ -n "$detail" ]]; then
    printf ' — %s' "$detail"
  fi

  printf '\n'
}

start_section() {
  CURRENT_SECTION="$1"
  print_header "$CURRENT_SECTION"
}

run_command_check() {
  local name="$1"
  shift

  local slug
  local log_file
  local rc

  slug="$(sanitize_filename "$name")"
  log_file="${LOG_DIR}/${slug}.log"

  if "$@" >"$log_file" 2>&1; then
    if [[ "$KEEP_LOGS" != "1" ]]; then
      rm -f "$log_file"
      log_file=""
    fi
    record_result "PASS" "$name" "" "$log_file"
    return 0
  else
    rc=$?
    record_result \
      "FAIL" \
      "$name" \
      "終了コード=${rc}; log=${log_file}" \
      "$log_file"
    return "$rc"
  fi
}

run_shell_check() {
  local name="$1"
  local command_text="$2"
  local slug
  local log_file
  local rc

  slug="$(sanitize_filename "$name")"
  log_file="${LOG_DIR}/${slug}.log"

  if bash -o pipefail -c "$command_text" >"$log_file" 2>&1; then
    if [[ "$KEEP_LOGS" != "1" ]]; then
      rm -f "$log_file"
      log_file=""
    fi
    record_result "PASS" "$name" "" "$log_file"
    return 0
  else
    rc=$?
    record_result \
      "FAIL" \
      "$name" \
      "終了コード=${rc}; log=${log_file}" \
      "$log_file"
    return "$rc"
  fi
}

skip_check() {
  local name="$1"
  local reason="$2"
  record_result "SKIP" "$name" "$reason"
}

warn_check() {
  local name="$1"
  local reason="$2"
  record_result "WARN" "$name" "$reason"
}

check_file_exists() {
  local path="$1"

  if [[ -f "$path" ]]; then
    record_result "PASS" "\`${path}\` が存在する"
  else
    record_result "FAIL" "\`${path}\` が存在する" "ファイルが見つからない"
  fi
}

check_directory_exists() {
  local path="$1"

  if [[ -d "$path" ]]; then
    record_result "PASS" "\`${path}\` が生成される"
  else
    record_result "FAIL" "\`${path}\` が生成される" "ディレクトリが見つからない"
  fi
}

check_readme_link() {
  local label="$1"
  shift

  if [[ ! -f README.md ]]; then
    record_result "FAIL" "$label" "README.mdが存在しない"
    return 1
  fi

  local target
  for target in "$@"; do
    if grep -Fq "$target" README.md; then
      record_result "PASS" "$label" "検出: ${target}"
      return 0
    fi
  done

  record_result \
    "FAIL" \
    "$label" \
    "README.md内に対象パスへの参照が見つからない"
  return 1
}

package_script_exists() {
  local script_name="$1"

  if [[ ! -f package.json ]]; then
    return 1
  fi

  bun -e '
    const fs = require("node:fs");
    const name = process.argv[1];
    const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
    process.exit(pkg.scripts && typeof pkg.scripts[name] === "string" ? 0 : 1);
  ' "$script_name" >/dev/null 2>&1
}

run_bun_script() {
  local script_name="$1"
  local display_name="${2:-bun run ${script_name}}"

  if ! package_script_exists "$script_name"; then
    record_result \
      "FAIL" \
      "\`${display_name}\` が成功する" \
      "package.jsonにscripts.${script_name}が存在しない"
    return 1
  fi

  run_command_check \
    "\`${display_name}\` が成功する" \
    bun run "$script_name"
}

json_quiz_count() {
  local json_path="$1"

  bun -e '
    const fs = require("node:fs");

    const file = process.argv[1];
    const expected = Number(process.argv[2]);
    const data = JSON.parse(fs.readFileSync(file, "utf8"));

    function findQuestionArray(value, depth = 0) {
      if (depth > 8 || value === null || value === undefined) {
        return null;
      }

      if (Array.isArray(value)) {
        const looksLikeQuestions =
          value.length === 0 ||
          value.every((item) =>
            item &&
            typeof item === "object" &&
            (
              "question" in item ||
              "prompt" in item ||
              "stem" in item ||
              "choices" in item ||
              "options" in item ||
              "correctAnswer" in item ||
              "answer" in item
            )
          );

        if (looksLikeQuestions) {
          return value;
        }

        for (const item of value) {
          const nested = findQuestionArray(item, depth + 1);
          if (nested) return nested;
        }

        return null;
      }

      if (typeof value === "object") {
        const preferredKeys = [
          "questions",
          "items",
          "quiz",
          "quizzes",
          "data"
        ];

        for (const key of preferredKeys) {
          if (key in value) {
            const nested = findQuestionArray(value[key], depth + 1);
            if (nested) return nested;
          }
        }

        for (const nestedValue of Object.values(value)) {
          const nested = findQuestionArray(nestedValue, depth + 1);
          if (nested) return nested;
        }
      }

      return null;
    }

    const questions = findQuestionArray(data);

    if (!questions) {
      console.error("問題配列を特定できませんでした。");
      process.exit(2);
    }

    console.log(`detected=${questions.length}`);
    console.log(`expected=${expected}`);

    process.exit(questions.length === expected ? 0 : 1);
  ' "$json_path" "$EXPECTED_QUIZ_COUNT"
}

check_json_quiz_count() {
  local path="$1"
  local name="\`${path}\` が${EXPECTED_QUIZ_COUNT}問構成を反映している"

  if [[ ! -f "$path" ]]; then
    record_result "FAIL" "$name" "ファイルが存在しない"
    return 1
  fi

  run_command_check "$name" json_quiz_count "$path"
}

check_markdown_quiz_count() {
  local path="$1"
  local name="\`${path}\` が${EXPECTED_QUIZ_COUNT}問構成を反映している"
  local slug
  local log_file
  local rc

  if [[ ! -f "$path" ]]; then
    record_result "FAIL" "$name" "ファイルが存在しない"
    return 1
  fi

  slug="$(sanitize_filename "$name")"
  log_file="${LOG_DIR}/${slug}.log"

  EXPECTED="$EXPECTED_QUIZ_COUNT" REPORT_PATH="$path" bun <<'JS' >"$log_file" 2>&1
const fs = require("node:fs");

const path = process.env.REPORT_PATH;
const expected = Number(process.env.EXPECTED);
const text = fs.readFileSync(path, "utf8");

const explicitPatterns = [
  new RegExp(`(?:問題数|総問題数|設問数|questions?|total)[^\\n\\d]{0,30}${expected}(?:\\s*問)?`, "i"),
  new RegExp(`${expected}\\s*問(?:構成|収録|掲載|実装|中)?`, "i"),
  new RegExp(`(?:全|合計)\\s*${expected}\\s*問`, "i")
];

if (explicitPatterns.some((pattern) => pattern.test(text))) {
  console.log(`explicit quiz count detected: ${expected}`);
  process.exit(0);
}

const lines = text.split(/\r?\n/);

const headingPatterns = [
  /^\s{0,3}#{1,6}\s*(?:問題|問|question)\s*[0-9０-９]+(?:\b|[：:．.\s])/i,
  /^\s*(?:[-*+]\s+)?(?:問題|問|question)\s*[0-9０-９]+(?:\b|[：:．.\s])/i
];

const matchedLines = lines.filter((line) =>
  headingPatterns.some((pattern) => pattern.test(line))
);

console.log(`question-like headings=${matchedLines.length}`);
console.log(`expected=${expected}`);

if (matchedLines.length === expected) {
  process.exit(0);
}

console.error(
  "明示的な問題数または問題見出しを用いて期待数を確認できませんでした。"
);
process.exit(1);
JS

  rc=$?

  if [[ "$rc" -eq 0 ]]; then
    if [[ "$KEEP_LOGS" != "1" ]]; then
      rm -f "$log_file"
      log_file=""
    fi
    record_result "PASS" "$name" "" "$log_file"
    return 0
  fi

  record_result \
    "FAIL" \
    "$name" \
    "問題数の明記または問題見出しを確認できない; log=${log_file}" \
    "$log_file"
  return "$rc"
}

check_disclaimer() {
  local name="クイズが外部試験問題対策ではないことが明記されている"
  local files=(
    "README.md"
    "docs/acceptance-criteria.md"
    "docs/quiz-schema-taxonomy-validation.md"
  )

  local existing_files=()
  local file

  for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
      existing_files+=("$file")
    fi
  done

  if [[ "${#existing_files[@]}" -eq 0 ]]; then
    record_result "FAIL" "$name" "検査対象文書が存在しない"
    return 1
  fi

  local combined
  combined="$(cat "${existing_files[@]}")"

  if printf '%s' "$combined" |
    grep -Eiq \
      '(外部|公的|公式|実在).{0,30}(試験|資格).{0,40}(対策|再現|模倣|転載|目的では|対象では)|試験対策を目的としない|外部試験問題対策ではない|official exam.{0,30}(not|isn.t)|not.{0,30}exam preparation'; then
    record_result "PASS" "$name"
  else
    record_result \
      "FAIL" \
      "$name" \
      "READMEまたは主要docs内に明示的な免責・位置付けを検出できない"
    return 1
  fi
}

detect_devcontainer() {
  if [[ -n "${REMOTE_CONTAINERS:-}" ]] ||
     [[ -n "${DEVCONTAINER:-}" ]] ||
     [[ -f "/.dockerenv" ]] ||
     grep -qaE '(docker|containerd|kubepods)' /proc/1/cgroup 2>/dev/null; then
    INSIDE_DEVCONTAINER=1
  else
    INSIDE_DEVCONTAINER=0
  fi
}

check_pr_quality_gate() {
  local name="GitHub Actions \`quality-gate\` がpull request上で成功する"

  if [[ "$RUN_REMOTE_CHECKS" != "1" ]]; then
    skip_check "$name" "RUN_REMOTE_CHECKS=0"
    return
  fi

  if ! command -v gh >/dev/null 2>&1; then
    skip_check "$name" "GitHub CLI（gh）が利用できない"
    return
  fi

  if ! gh auth status >/dev/null 2>&1; then
    skip_check "$name" "ghがGitHubへ認証されていない"
    return
  fi

  local pr_ref="$PR_NUMBER"

  if [[ -z "$pr_ref" ]]; then
    pr_ref="$(gh pr view --json number --jq '.number' 2>/dev/null || true)"
  fi

  if [[ -z "$pr_ref" ]]; then
    skip_check "$name" "現在のブランチに対応するPRを特定できない。PR_NUMBERを指定可能"
    return
  fi

  local slug
  local log_file
  slug="$(sanitize_filename "$name")"
  log_file="${LOG_DIR}/${slug}.log"

  local result
  result="$(
    gh pr checks "$pr_ref" \
      --json name,bucket,state,workflow \
      --jq \
      ".[] |
       select(
         ((.name // \"\") | ascii_downcase | contains(\"${QUALITY_CHECK_NAME,,}\")) or
         ((.workflow // \"\") | ascii_downcase | contains(\"${QUALITY_WORKFLOW,,}\"))
       ) |
       [.name, .bucket, .state, .workflow] |
       @tsv" \
      2>"$log_file" || true
  )"

  if [[ -z "$result" ]]; then
    record_result \
      "FAIL" \
      "$name" \
      "PR #${pr_ref}に対象checkが見つからない; log=${log_file}" \
      "$log_file"
    return
  fi

  printf '%s\n' "$result" >>"$log_file"

  if printf '%s\n' "$result" |
    awk -F '\t' '
      BEGIN { found=0; failed=0 }
      {
        found=1
        bucket=tolower($2)
        if (bucket != "pass") failed=1
      }
      END { exit !(found && !failed) }
    '; then
    if [[ "$KEEP_LOGS" != "1" ]]; then
      rm -f "$log_file"
      log_file=""
    fi
    record_result "PASS" "$name" "PR #${pr_ref}" "$log_file"
  else
    record_result \
      "FAIL" \
      "$name" \
      "PR #${pr_ref}の対象checkが未成功; log=${log_file}" \
      "$log_file"
  fi
}

check_main_quality_gate() {
  local name="GitHub Actions \`quality-gate\` がmain push後に成功する"

  if [[ "$RUN_REMOTE_CHECKS" != "1" ]]; then
    skip_check "$name" "RUN_REMOTE_CHECKS=0"
    return
  fi

  if ! command -v gh >/dev/null 2>&1; then
    skip_check "$name" "GitHub CLI（gh）が利用できない"
    return
  fi

  if ! gh auth status >/dev/null 2>&1; then
    skip_check "$name" "ghがGitHubへ認証されていない"
    return
  fi

  local slug
  local log_file
  local run_json
  local run_id
  local conclusion
  local url
  local status

  slug="$(sanitize_filename "$name")"
  log_file="${LOG_DIR}/${slug}.log"

  run_json="$(
    gh run list \
      --workflow "$QUALITY_WORKFLOW" \
      --branch "$MAIN_BRANCH" \
      --event push \
      --limit 1 \
      --json databaseId,conclusion,status,url,headSha,createdAt,workflowName \
      2>"$log_file" || true
  )"

  if [[ -z "$run_json" || "$run_json" == "[]" ]]; then
    record_result \
      "FAIL" \
      "$name" \
      "workflow=${QUALITY_WORKFLOW}, branch=${MAIN_BRANCH} のpush runが見つからない; log=${log_file}" \
      "$log_file"
    return
  fi

  printf '%s\n' "$run_json" >>"$log_file"

  run_id="$(
    printf '%s' "$run_json" |
      bun -e '
        let input = "";
        process.stdin.on("data", (chunk) => input += chunk);
        process.stdin.on("end", () => {
          const runs = JSON.parse(input);
          process.stdout.write(String(runs[0]?.databaseId ?? ""));
        });
      '
  )"

  conclusion="$(
    printf '%s' "$run_json" |
      bun -e '
        let input = "";
        process.stdin.on("data", (chunk) => input += chunk);
        process.stdin.on("end", () => {
          const runs = JSON.parse(input);
          process.stdout.write(String(runs[0]?.conclusion ?? ""));
        });
      '
  )"

  status="$(
    printf '%s' "$run_json" |
      bun -e '
        let input = "";
        process.stdin.on("data", (chunk) => input += chunk);
        process.stdin.on("end", () => {
          const runs = JSON.parse(input);
          process.stdout.write(String(runs[0]?.status ?? ""));
        });
      '
  )"

  url="$(
    printf '%s' "$run_json" |
      bun -e '
        let input = "";
        process.stdin.on("data", (chunk) => input += chunk);
        process.stdin.on("end", () => {
          const runs = JSON.parse(input);
          process.stdout.write(String(runs[0]?.url ?? ""));
        });
      '
  )"

  if [[ "$status" == "completed" && "$conclusion" == "success" ]]; then
    if [[ "$KEEP_LOGS" != "1" ]]; then
      rm -f "$log_file"
      log_file=""
    fi
    record_result \
      "PASS" \
      "$name" \
      "run=${run_id}${url:+; ${url}}" \
      "$log_file"
  else
    record_result \
      "FAIL" \
      "$name" \
      "run=${run_id}; status=${status}; conclusion=${conclusion}; ${url}; log=${log_file}" \
      "$log_file"
  fi
}

check_cloudflare_app() {
  local name="Cloudflare Pagesでクイズアプリを確認できる"

  if [[ "$RUN_REMOTE_CHECKS" != "1" ]]; then
    skip_check "$name" "RUN_REMOTE_CHECKS=0"
    return
  fi

  if [[ -z "$APP_URL" ]]; then
    skip_check "$name" "APP_URLが未設定"
    return
  fi

  if ! command -v curl >/dev/null 2>&1; then
    skip_check "$name" "curlが利用できない"
    return
  fi

  local slug
  local log_file
  local body_file
  local http_code

  slug="$(sanitize_filename "$name")"
  log_file="${LOG_DIR}/${slug}.log"
  body_file="${LOG_DIR}/${slug}.html"

  http_code="$(
    curl \
      --location \
      --silent \
      --show-error \
      --connect-timeout 10 \
      --max-time 30 \
      --output "$body_file" \
      --write-out '%{http_code}' \
      "$APP_URL" \
      2>"$log_file" || true
  )"

  printf 'URL=%s\nHTTP=%s\n' "$APP_URL" "$http_code" >>"$log_file"

  if [[ ! "$http_code" =~ ^2[0-9][0-9]$ ]]; then
    record_result \
      "FAIL" \
      "$name" \
      "HTTP=${http_code:-取得失敗}; log=${log_file}" \
      "$log_file"
    return
  fi

  if [[ ! -s "$body_file" ]]; then
    record_result \
      "FAIL" \
      "$name" \
      "レスポンス本文が空; log=${log_file}" \
      "$log_file"
    return
  fi

  if [[ -n "$APP_EXPECTED_TEXT" ]] &&
     ! grep -Fqi "$APP_EXPECTED_TEXT" "$body_file"; then
    record_result \
      "FAIL" \
      "$name" \
      "HTTP=${http_code}だが期待文字列「${APP_EXPECTED_TEXT}」が見つからない; log=${log_file}" \
      "$log_file"
    return
  fi

  if ! grep -Eiq '<html|<div[^>]+id=["'"'"']root["'"'"']|<script[^>]+src=' "$body_file"; then
    record_result \
      "FAIL" \
      "$name" \
      "HTTP=${http_code}だがWebアプリHTMLを確認できない; log=${log_file}" \
      "$log_file"
    return
  fi

  if [[ "$KEEP_LOGS" != "1" ]]; then
    rm -f "$log_file" "$body_file"
    log_file=""
  fi

  record_result "PASS" "$name" "HTTP=${http_code}; ${APP_URL}" "$log_file"
}

generate_reports() {
  mkdir -p "$LOG_DIR"

  {
    printf 'Portfolio submission readiness\n'
    printf 'Generated: %s\n' "$(date '+%Y-%m-%d %H:%M:%S %z')"
    printf 'Repository: %s\n' "$(pwd)"
    printf 'Expected quiz count: %s\n' "$EXPECTED_QUIZ_COUNT"
    printf '\n'
    printf 'PASS=%d FAIL=%d WARN=%d SKIP=%d TOTAL=%d\n' \
      "$PASS_COUNT" "$FAIL_COUNT" "$WARN_COUNT" "$SKIP_COUNT" "$TOTAL_COUNT"
    printf '\n'

    local i
    for i in "${!RESULT_STATUS[@]}"; do
      printf '[%s] [%s] %s' \
        "${RESULT_STATUS[$i]}" \
        "${RESULT_SECTION[$i]}" \
        "${RESULT_NAME[$i]}"

      if [[ -n "${RESULT_DETAIL[$i]}" ]]; then
        printf ' — %s' "${RESULT_DETAIL[$i]}"
      fi

      printf '\n'
    done
  } >"$SUMMARY_FILE"

  {
    printf '# Submission Readiness Report\n\n'
    printf -- '- Generated: `%s`\n' "$(date '+%Y-%m-%d %H:%M:%S %z')"
    printf -- '- Repository: `%s`\n' "$(pwd)"
    printf -- '- Expected quiz count: `%s`\n\n' "$EXPECTED_QUIZ_COUNT"

    printf '## Summary\n\n'
    printf '| Result | Count |\n'
    printf '|---|---:|\n'
    printf '| PASS | %d |\n' "$PASS_COUNT"
    printf '| FAIL | %d |\n' "$FAIL_COUNT"
    printf '| WARN | %d |\n' "$WARN_COUNT"
    printf '| SKIP | %d |\n' "$SKIP_COUNT"
    printf '| Total | %d |\n\n' "$TOTAL_COUNT"

    printf '## Results\n\n'
    printf '| Status | Section | Check | Detail |\n'
    printf '|---|---|---|---|\n'

    local i
    local escaped_name
    local escaped_detail

    for i in "${!RESULT_STATUS[@]}"; do
      escaped_name="$(
        printf '%s' "${RESULT_NAME[$i]}" |
          sed 's/|/\\|/g'
      )"
      escaped_detail="$(
        printf '%s' "${RESULT_DETAIL[$i]}" |
          sed 's/|/\\|/g'
      )"

      printf '| %s | %s | %s | %s |\n' \
        "${RESULT_STATUS[$i]}" \
        "${RESULT_SECTION[$i]}" \
        "$escaped_name" \
        "$escaped_detail"
    done

    printf '\n## Interpretation\n\n'

    if [[ "$FAIL_COUNT" -gt 0 ]]; then
      printf '**NOT READY:** FAILが%d件あります。\n' "$FAIL_COUNT"
    elif [[ "$SKIP_COUNT" -gt 0 || "$WARN_COUNT" -gt 0 ]]; then
      printf '**CONDITIONALLY READY:** FAILはありませんが、WARNまたはSKIPがあります。\n'
    else
      printf '**READY:** すべての検査がPASSしました。\n'
    fi
  } >"$DETAIL_FILE"
}

print_final_summary() {
  print_header "総合判定"

  printf '  PASS : %s%d%s\n' "$COLOR_GREEN" "$PASS_COUNT" "$COLOR_RESET"
  printf '  FAIL : %s%d%s\n' "$COLOR_RED" "$FAIL_COUNT" "$COLOR_RESET"
  printf '  WARN : %s%d%s\n' "$COLOR_YELLOW" "$WARN_COUNT" "$COLOR_RESET"
  printf '  SKIP : %s%d%s\n' "$COLOR_YELLOW" "$SKIP_COUNT" "$COLOR_RESET"
  printf '  TOTAL: %d\n\n' "$TOTAL_COUNT"

  if [[ "$FAIL_COUNT" -gt 0 ]]; then
    printf '%s%sNOT READY%s\n' \
      "$COLOR_BOLD" "$COLOR_RED" "$COLOR_RESET"
    printf 'FAIL項目を修正してから再実行してください。\n'
  elif [[ "$SKIP_COUNT" -gt 0 || "$WARN_COUNT" -gt 0 ]]; then
    printf '%s%sCONDITIONALLY READY%s\n' \
      "$COLOR_BOLD" "$COLOR_YELLOW" "$COLOR_RESET"
    printf 'ローカル検査上のFAILはありませんが、SKIP/WARN項目の手動確認が必要です。\n'
  else
    printf '%s%sREADY%s\n' \
      "$COLOR_BOLD" "$COLOR_GREEN" "$COLOR_RESET"
    printf 'スクリプトで定義したすべての項目が成功しました。\n'
  fi

  printf '\n結果:\n'
  printf '  %s\n' "$SUMMARY_FILE"
  printf '  %s\n' "$DETAIL_FILE"
}

main() {
  if [[ ! -f package.json ]]; then
    printf '%sERROR:%s package.jsonが見つかりません。\n' \
      "$COLOR_RED" "$COLOR_RESET" >&2
    printf 'リポジトリのルートディレクトリで実行してください。\n' >&2
    exit 2
  fi

  mkdir -p "$LOG_DIR"

  printf '%sPortfolio Submission Readiness Check%s\n' \
    "${COLOR_BOLD}" "${COLOR_RESET}"
  printf 'repository : %s\n' "$(pwd)"
  printf 'timestamp  : %s\n' "$TIMESTAMP"
  printf 'quiz count : %s\n' "$EXPECTED_QUIZ_COUNT"
  printf 'logs       : %s\n' "$LOG_DIR"

  start_section "実行環境"

  if command -v bun >/dev/null 2>&1; then
    record_result "PASS" "\`bun\` が利用できる" "$(bun --version 2>/dev/null || true)"
  else
    record_result "FAIL" "\`bun\` が利用できる" "PATH上にbunがない"
    generate_reports
    print_final_summary
    exit 2
  fi

  if command -v bunx >/dev/null 2>&1; then
    record_result "PASS" "\`bunx\` が利用できる"
  else
    record_result "FAIL" "\`bunx\` が利用できる" "PATH上にbunxがない"
  fi

  detect_devcontainer

  if [[ "$INSIDE_DEVCONTAINER" -eq 1 ]]; then
    record_result "PASS" "Dev Container内で実行されている"
  else
    skip_check \
      "Dev Container内で実行されている" \
      "ホスト環境と判定。Dev Container内でも同じスクリプトを実行すること"
  fi

  start_section "データ・検証"

  run_bun_script "validate:data"
  run_bun_script "validate:policy"
  run_bun_script "validate:quiz"
  run_bun_script "validate:quiz-policy"
  run_bun_script "validate:quiz-fixtures"

  start_section "型検査・テスト"

  run_bun_script "typecheck"
  run_bun_script "client:typecheck"
  run_bun_script "test:unit"

  run_command_check \
    "\`CI=1 bunx playwright test e2e/quiz-smoke.e2e.ts --trace on\` が成功する" \
    env CI=1 bunx playwright test e2e/quiz-smoke.e2e.ts --trace on

  start_section "生成物"

  run_bun_script "report"
  run_bun_script "quiz:report"
  run_bun_script "report:check"
  run_bun_script "quiz:report:check"
  run_bun_script "prepare:public-quiz-data:check"

  check_markdown_quiz_count "reports/quiz-quality-report.md"
  check_json_quiz_count "public/study-it/quiz_data.json"

  start_section "build・baseline"

  run_bun_script "client:build"
  run_bun_script "site:check"
  run_bun_script "validate:security-baseline"
  run_bun_script "validate:performance-baseline"

  start_section "統合品質ゲート"

  if [[ "$RUN_FULL_CHECK" == "1" ]]; then
    if package_script_exists "check"; then
      if run_command_check \
        "\`CI=1 bun run check\` が成功する" \
        env CI=1 bun run check; then
        QUALITY_GATE_LOCAL_RESULT="PASS"
      else
        QUALITY_GATE_LOCAL_RESULT="FAIL"
      fi
    else
      record_result \
        "FAIL" \
        "\`CI=1 bun run check\` が成功する" \
        "package.jsonにscripts.checkが存在しない"
      QUALITY_GATE_LOCAL_RESULT="FAIL"
    fi
  else
    skip_check \
      "\`CI=1 bun run check\` が成功する" \
      "RUN_FULL_CHECK=0"
    QUALITY_GATE_LOCAL_RESULT="SKIP"
  fi

  check_pr_quality_gate
  check_main_quality_gate

  start_section "デプロイ"

  check_cloudflare_app
  run_bun_script "pages:build"
  check_directory_exists "dist/app"

  start_section "ドキュメント"

  check_file_exists "README.md"
  check_file_exists "docs/architecture/architechture.md"
  check_file_exists "docs/acceptance-criteria.md"
  check_file_exists "docs/interview/quiz-app-explanation.md"
  check_file_exists "docs/quiz-schema-taxonomy-validation.md"

  check_readme_link \
    "READMEから主要docsへ辿れる" \
    "docs/architecture/architechture.md" \
    "docs/acceptance-criteria.md" \
    "docs/interview-notes.md" \
    "docs/quiz-schema-taxonomy-validation.md"

  check_readme_link \
    "READMEから主要reportsへ辿れる" \
    "reports/quiz-quality-report.md" \
    "reports/" \
    "./reports"

  check_disclaimer

  start_section "開発環境"

  if [[ "$INSIDE_DEVCONTAINER" -eq 1 ]]; then
    if command -v bun >/dev/null 2>&1; then
      record_result \
        "PASS" \
        "Dev Container内で \`bun\` が利用できる" \
        "$(bun --version 2>/dev/null || true)"
    else
      record_result \
        "FAIL" \
        "Dev Container内で \`bun\` が利用できる" \
        "PATH上にbunがない"
    fi

    if command -v bunx >/dev/null 2>&1; then
      record_result "PASS" "Dev Container内で \`bunx\` が利用できる"
    else
      record_result \
        "FAIL" \
        "Dev Container内で \`bunx\` が利用できる" \
        "PATH上にbunxがない"
    fi

    case "$QUALITY_GATE_LOCAL_RESULT" in
      PASS)
        record_result \
          "PASS" \
          "Dev Container内で主要検証が成功する" \
          "\`CI=1 bun run check\` の結果を再利用"
        ;;
      FAIL)
        record_result \
          "FAIL" \
          "Dev Container内で主要検証が成功する" \
          "\`CI=1 bun run check\` が失敗"
        ;;
      *)
        skip_check \
          "Dev Container内で主要検証が成功する" \
          "統合品質ゲートが未実行"
        ;;
    esac
  else
    skip_check \
      "Dev Container内で \`bun\` が利用できる" \
      "Dev Container外で実行中"
    skip_check \
      "Dev Container内で \`bunx\` が利用できる" \
      "Dev Container外で実行中"
    skip_check \
      "Dev Container内で主要検証が成功する" \
      "Dev Container内で同スクリプトを再実行する必要がある"
  fi

  generate_reports
  print_final_summary

  if [[ "$FAIL_COUNT" -gt 0 ]]; then
    exit 1
  fi

  exit 0
}

main "$@"
