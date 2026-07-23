#!/usr/bin/env bash

# This script must be executed, not sourced, and must run under Bash.
if [ -z "${BASH_VERSION:-}" ]; then
  printf '%s\n' \
    "[ERROR] This script requires Bash." \
    "Run: ./scripts/check-submission-readiness.sh" >&2
  return 2 2>/dev/null || exit 2
fi

if [[ "${BASH_SOURCE[0]:-}" != "$0" ]]; then
  printf '%s\n' \
    "[ERROR] Do not source this script." \
    "Run: ./scripts/check-submission-readiness.sh" >&2
  return 2
fi

# Deliberately omit `set -e`: this audit aggregates failures into one summary.
set -uo pipefail

TAG="${TAG:-v0.3.0}"
DEFAULT_BRANCH="${DEFAULT_BRANCH:-main}"
REMOTE_NAME="${REMOTE_NAME:-origin}"
AUDIT_MODE="${AUDIT_MODE:-submission}"
DEMO_URL="${DEMO_URL:-https://qa-sre-learning-mvp.pages.dev}"
DEMO_URL="${DEMO_URL%/}"
RELEASE_NOTES_FILE="${RELEASE_NOTES_FILE:-reports/release-notes-${TAG}.md}"
REMOTE_REF="${REMOTE_NAME}/${DEFAULT_BRANCH}"

case "${AUDIT_MODE}" in
  submission | development)
    ;;
  *)
    printf '[ERROR] Invalid AUDIT_MODE: %s\n' "${AUDIT_MODE}" >&2
    printf '%s\n' 'Allowed values: submission, development' >&2
    exit 2
    ;;
esac

if [[ -z "${HOME:-}" ]]; then
  printf '%s\n' '[ERROR] HOME is not set.' >&2
  exit 2
fi

STAMP="$(date '+%Y%m%d-%H%M%S')-$$"
OUT="${OUT:-${HOME}/portfolio-migration-backup/qa-sre-submission-check-${STAMP}}"
mkdir -p "${OUT}"
chmod 700 "${OUT}"
OUT="$(cd "${OUT}" && pwd -P)"

BOLD=""
RESET=""
GREEN=""
YELLOW=""
RED=""
CYAN=""

if [[ -t 1 && -n "${TERM:-}" && -z "${NO_COLOR:-}" ]] &&
  command -v tput >/dev/null 2>&1
then
  BOLD="$(tput bold 2>/dev/null || true)"
  RESET="$(tput sgr0 2>/dev/null || true)"
  GREEN="$(tput setaf 2 2>/dev/null || true)"
  YELLOW="$(tput setaf 3 2>/dev/null || true)"
  RED="$(tput setaf 1 2>/dev/null || true)"
  CYAN="$(tput setaf 6 2>/dev/null || true)"
fi

PASS_COUNT=0
WARN_COUNT=0
FAIL_COUNT=0
REPO="unknown"
CURRENT_BRANCH="unknown"
ROOT=""
TAG_SHA="unknown"

section() {
  local title="${1:?section title is required}"
  printf '\n%s%s=== %s ===%s\n' "${BOLD}" "${CYAN}" "${title}" "${RESET}"
}

pass() {
  local message="${1:?pass message is required}"
  PASS_COUNT=$((PASS_COUNT + 1))
  printf '%s[PASS]%s %s\n' "${GREEN}" "${RESET}" "${message}"
}

warn() {
  local message="${1:?warning message is required}"
  WARN_COUNT=$((WARN_COUNT + 1))
  printf '%s[WARN]%s %s\n' "${YELLOW}" "${RESET}" "${message}"
}

fail() {
  local message="${1:?failure message is required}"
  FAIL_COUNT=$((FAIL_COUNT + 1))
  printf '%s[FAIL]%s %s\n' "${RED}" "${RESET}" "${message}"
}

info() {
  local message="${1:?info message is required}"
  printf '%s[INFO]%s %s\n' "${CYAN}" "${RESET}" "${message}"
}

mode_sensitive_issue() {
  local message="${1:?message is required}"

  if [[ "${AUDIT_MODE}" == "development" ]]; then
    warn "${message}"
  else
    fail "${message}"
  fi
}

run_logged() {
  local label="${1:?label is required}"
  local log_file="${2:?log file is required}"
  shift 2

  if "$@" >"${log_file}" 2>&1; then
    pass "${label}"
    return 0
  fi

  fail "${label}"
  printf '  log: %s\n' "${log_file}"
  tail -n 20 "${log_file}" | sed 's/^/  | /'
  return 1
}

section "Runtime"

pass "Running under Bash ${BASH_VERSION}"
info "Audit mode: ${AUDIT_MODE}"
info "Target tag: ${TAG}"
info "Default branch: ${DEFAULT_BRANCH}"
info "Remote reference: ${REMOTE_REF}"
info "Evidence directory: ${OUT}"

section "Repository"

if ! command -v git >/dev/null 2>&1; then
  fail "Git is not available"
  exit 1
fi

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"

if [[ -z "${ROOT}" ]]; then
  fail "The script is not running inside a Git repository"
  exit 1
fi

ROOT="$(cd "${ROOT}" && pwd -P)"
cd "${ROOT}"
pass "Git repository detected: ${ROOT}"

case "${OUT}/" in
  "${ROOT}/"*)
    fail "Evidence directory must be outside the Git repository: ${OUT}"
    ;;
  *)
    pass "Evidence directory is outside the Git repository"
    ;;
esac

INITIAL_STATUS_FILE="${OUT}/git-status-before.txt"
FINAL_STATUS_FILE="${OUT}/git-status-after.txt"
STATUS_CHANGE_FILE="${OUT}/git-status-change.diff"

git status --porcelain=v1 --untracked-files=all >"${INITIAL_STATUS_FILE}"

CURRENT_BRANCH="$(git branch --show-current)"

if [[ "${CURRENT_BRANCH}" == "${DEFAULT_BRANCH}" ]]; then
  pass "Current branch is ${DEFAULT_BRANCH}"
elif [[ -z "${CURRENT_BRANCH}" ]]; then
  mode_sensitive_issue "HEAD is detached; expected branch: ${DEFAULT_BRANCH}"
else
  mode_sensitive_issue "Current branch is ${CURRENT_BRANCH}; expected: ${DEFAULT_BRANCH}"
fi

if [[ ! -s "${INITIAL_STATUS_FILE}" ]]; then
  pass "Working tree is clean"
else
  mode_sensitive_issue "Uncommitted changes exist"
  sed 's/^/  | /' "${INITIAL_STATUS_FILE}"
fi

if git fetch "${REMOTE_NAME}" --prune --tags >"${OUT}/git-fetch.log" 2>&1; then
  pass "Fetched branches and tags from ${REMOTE_NAME}"
else
  fail "Failed to fetch from ${REMOTE_NAME}"
  tail -n 20 "${OUT}/git-fetch.log" | sed 's/^/  | /'
fi

if git rev-parse --verify "${REMOTE_REF}^{commit}" >/dev/null 2>&1; then
  LOCAL_SHA="$(git rev-parse HEAD)"
  REMOTE_SHA="$(git rev-parse "${REMOTE_REF}^{commit}")"

  info "HEAD: ${LOCAL_SHA}"
  info "${REMOTE_REF}: ${REMOTE_SHA}"

  if [[ "${LOCAL_SHA}" == "${REMOTE_SHA}" ]]; then
    pass "HEAD matches ${REMOTE_REF}"
  else
    mode_sensitive_issue "HEAD does not match ${REMOTE_REF}"
  fi
else
  fail "Cannot resolve ${REMOTE_REF} to a commit"
fi

if git rev-parse --verify "${TAG}^{commit}" >/dev/null 2>&1; then
  TAG_SHA="$(git rev-parse "${TAG}^{commit}")"
  pass "Local tag ${TAG} resolves to a commit"
  info "${TAG}: ${TAG_SHA}"

  if git merge-base --is-ancestor "${TAG}^{commit}" HEAD >/dev/null 2>&1; then
    pass "${TAG} is an ancestor of the current HEAD"
  else
    fail "${TAG} is not an ancestor of the current HEAD"
  fi

  if git cat-file -e "${TAG}:${RELEASE_NOTES_FILE}" 2>/dev/null; then
    pass "${RELEASE_NOTES_FILE} is included in ${TAG}"
  else
    fail "${RELEASE_NOTES_FILE} is not included in ${TAG}"
  fi
else
  fail "Local tag ${TAG} cannot be resolved"
fi

section "Required files"

for path in \
  README.md \
  LICENSE \
  .gitignore \
  package.json \
  bun.lock \
  "${RELEASE_NOTES_FILE}" \
  .github/workflows/quality-gate.yml
do
  if [[ -e "${path}" ]]; then
    pass "${path} exists"
  else
    fail "${path} is missing"
  fi
done

section "README navigation"

check_readme_literal() {
  local label="${1:?label is required}"
  local literal="${2:?literal is required}"

  if grep -Fq "${literal}" README.md; then
    pass "${label}"
  else
    fail "${label}"
  fi
}

check_readme_literal \
  "${TAG} release link exists" \
  "releases/tag/${TAG}"

check_readme_literal \
  "Latest release link exists" \
  "releases/latest"

check_readme_literal \
  "${TAG} detailed release notes link exists" \
  "${RELEASE_NOTES_FILE}"

if grep -Eq '\]\(/\.github/workflows/' README.md; then
  fail "README still contains a site-root workflow link"
else
  pass "Workflow links use repository-relative paths"
fi

if grep -Eq '\[README\.md\]\(README\.md\)' README.md; then
  warn "README contains a self-link"
else
  pass "README does not contain a self-link"
fi

if [[ -f "${RELEASE_NOTES_FILE}" ]] &&
  grep -nEi '<OWNER>|<秘匿情報|YOUR_USERNAME|example-owner|REDACTED' \
    README.md "${RELEASE_NOTES_FILE}" \
    >"${OUT}/placeholders.log" 2>&1
then
  fail "Public documents contain a known placeholder"
  sed 's/^/  | /' "${OUT}/placeholders.log"
else
  pass "No known placeholder was detected in public documents"
fi

{
  git diff --check
  git diff --cached --check
} >"${OUT}/git-diff-check.log" 2>&1
DIFF_CHECK_STATUS=$?

if [[ "${DIFF_CHECK_STATUS}" -eq 0 ]]; then
  pass "Working-tree and staged diffs pass whitespace checks"
else
  fail "Whitespace or patch formatting issue detected"
  sed 's/^/  | /' "${OUT}/git-diff-check.log"
fi

section "Tracked artifacts"

TRACKED_ARTIFACTS="$({
  git ls-files |
    grep -E '(^|/)(node_modules|dist|coverage|test-results|playwright-report|tmp)/' \
    || true
})"

if [[ -z "${TRACKED_ARTIFACTS}" ]]; then
  pass "No generated build, test, or temporary directories are tracked"
else
  fail "Potential generated or temporary artifacts are tracked"
  printf '%s\n' "${TRACKED_ARTIFACTS}" | sed 's/^/  | /'
fi

TRACKED_ENV="$({
  git ls-files |
    grep -E '(^|/)\.env($|\.)' |
    grep -vE '\.env\.(example|sample|template)$' \
    || true
})"

if [[ -z "${TRACKED_ENV}" ]]; then
  pass "No runtime .env file is tracked"
else
  fail "Potential runtime .env files are tracked"
  printf '%s\n' "${TRACKED_ENV}" | sed 's/^/  | /'
fi

# Build sensitive signatures from fragments so this scanner does not match itself.
SECRET_PATTERN='g''hp_[A-Za-z0-9]{30,}'\
'|github_''pat_[A-Za-z0-9_]{20,}'\
'|A''KIA[0-9A-Z]{16}'\
'|-----BEGIN (RSA|OPENSSH|EC) PRIVATE K''EY-----'\
'|CLOUDFLARE_API_''TOKEN'\
'|CF_API_''TOKEN'

if git grep -nEI \
  "${SECRET_PATTERN}" \
  -- . \
  >"${OUT}/secret-patterns.log" 2>&1
then
  warn "Potential secret pattern detected; review for false positives"
  sed 's/^/  | /' "${OUT}/secret-patterns.log"
else
  pass "No known secret pattern was detected"
fi

section "Local quality gates"

if command -v bun >/dev/null 2>&1; then
  pass "Bun is available: $(bun --version)"

  run_logged \
    "CI=1 bun run check" \
    "${OUT}/bun-check.log" \
    env CI=1 bun run check

  run_logged \
    "bun run pages:build" \
    "${OUT}/pages-build.log" \
    bun run pages:build
else
  fail "Bun is not available"
fi

git status --porcelain=v1 --untracked-files=all >"${FINAL_STATUS_FILE}"

if cmp -s "${INITIAL_STATUS_FILE}" "${FINAL_STATUS_FILE}"; then
  pass "Local validation did not change the working-tree state"
else
  fail "Local validation changed the working-tree state"
  diff -u \
    "${INITIAL_STATUS_FILE}" \
    "${FINAL_STATUS_FILE}" \
    >"${STATUS_CHANGE_FILE}" \
    || true
  sed 's/^/  | /' "${STATUS_CHANGE_FILE}"
fi

section "GitHub"

if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
  pass "GitHub CLI is authenticated"

  REPO="$(gh repo view --json nameWithOwner --jq '.nameWithOwner' 2>/dev/null || true)"

  if [[ -n "${REPO}" ]]; then
    pass "GitHub repository: ${REPO}"

    if gh release view "${TAG}" \
      --json tagName,name,isDraft,isPrerelease,publishedAt,url \
      >"${OUT}/release.json" 2>&1
    then
      IS_DRAFT="$(gh release view "${TAG}" --json isDraft --jq '.isDraft')"
      IS_PRERELEASE="$(gh release view "${TAG}" --json isPrerelease --jq '.isPrerelease')"
      PUBLISHED_AT="$(gh release view "${TAG}" --json publishedAt --jq '.publishedAt')"

      if [[ "${IS_DRAFT}" == "false" &&
            "${IS_PRERELEASE}" == "false" &&
            "${PUBLISHED_AT}" != "null" ]]
      then
        pass "${TAG} is published as a standard release"
      else
        fail "${TAG} release attributes require review"
        sed 's/^/  | /' "${OUT}/release.json"
      fi
    else
      fail "Cannot verify the ${TAG} release"
    fi

    LATEST_TAG="$({
      gh api "/repos/${REPO}/releases/latest" \
        --jq '.tag_name' \
        2>/dev/null \
        || true
    })"

    if [[ "${LATEST_TAG}" == "${TAG}" ]]; then
      pass "${TAG} is the latest release"
    elif [[ -n "${LATEST_TAG}" ]]; then
      warn "Latest release is ${LATEST_TAG}; submission target is ${TAG}"
    else
      warn "Cannot determine the latest release"
    fi

    HEAD_SHA="$(git rev-parse HEAD)"

    if gh run list \
      --commit "${HEAD_SHA}" \
      --limit 50 \
      --json status,conclusion,name,url \
      >"${OUT}/runs.json" 2>&1
    then
      RUN_COUNT="$({
        gh run list \
          --commit "${HEAD_SHA}" \
          --limit 50 \
          --json status \
          --jq 'length' \
          2>/dev/null \
          || printf '0'
      })"

      BAD_RUNS="$({
        gh run list \
          --commit "${HEAD_SHA}" \
          --limit 50 \
          --json status,conclusion \
          --jq '[
            .[]
            | select(
                .status == "completed"
                and .conclusion != "success"
                and .conclusion != "neutral"
                and .conclusion != "skipped"
              )
          ] | length' \
          2>/dev/null \
          || printf 'unknown'
      })"

      if [[ "${BAD_RUNS}" == "unknown" ]]; then
        warn "Cannot evaluate GitHub Actions conclusions"
      elif [[ "${RUN_COUNT}" == "0" ]]; then
        warn "No GitHub Actions run was found for the current HEAD"
      elif [[ "${BAD_RUNS}" == "0" ]]; then
        pass "No failed completed workflow run exists for the current HEAD"
      else
        fail "A failed workflow run exists for the current HEAD"
        gh run list \
          --commit "${HEAD_SHA}" \
          --limit 50 \
          --json status,conclusion,name,url \
          --jq '.[]' |
          sed 's/^/  | /'
      fi
    else
      warn "Cannot retrieve GitHub Actions runs"
    fi

    OPEN_PRS="$({
      gh pr list \
        --state open \
        --limit 100 \
        --json number \
        --jq 'length' \
        2>/dev/null \
        || printf 'unknown'
    })"

    if [[ "${OPEN_PRS}" == "0" ]]; then
      pass "No open pull request exists"
    elif [[ "${OPEN_PRS}" == "unknown" ]]; then
      warn "Cannot determine the number of open pull requests"
    else
      warn "${OPEN_PRS} open pull request(s) exist"
      gh pr list --state open --limit 20 |
        sed 's/^/  | /'
    fi

    OPEN_ALERTS="$({
      gh api \
        "/repos/${REPO}/code-scanning/alerts?state=open&per_page=100" \
        --jq 'length' \
        2>/dev/null \
        || printf 'unknown'
    })"

    if [[ "${OPEN_ALERTS}" == "0" ]]; then
      pass "No open code-scanning alert exists"
    elif [[ "${OPEN_ALERTS}" == "unknown" ]]; then
      warn "Cannot retrieve code-scanning alerts"
    else
      warn "${OPEN_ALERTS} open code-scanning alert(s) exist"
    fi
  else
    fail "Cannot determine the GitHub repository"
  fi
else
  warn "GitHub CLI is unavailable or unauthenticated; remote checks were skipped"
fi

section "Published demo"

if command -v curl >/dev/null 2>&1; then
  HTTP_CODE="$({
    curl -fsSL \
      --max-time 20 \
      -o /dev/null \
      -w '%{http_code}' \
      "${DEMO_URL}/" \
      2>"${OUT}/demo-curl.log" \
      || true
  })"

  if [[ "${HTTP_CODE}" =~ ^2[0-9][0-9]$ ]]; then
    pass "Published demo is reachable: HTTP ${HTTP_CODE}"
  else
    fail "Published demo is unreachable: HTTP ${HTTP_CODE:-unknown}"
  fi

  QUIZ_HTTP_CODE="$({
    curl -fsSL \
      --max-time 20 \
      -o /dev/null \
      -w '%{http_code}' \
      "${DEMO_URL}/study-it/quiz_data.json" \
      2>"${OUT}/quiz-data-curl.log" \
      || true
  })"

  if [[ "${QUIZ_HTTP_CODE}" =~ ^2[0-9][0-9]$ ]]; then
    pass "Published quiz data is reachable: HTTP ${QUIZ_HTTP_CODE}"
  else
    fail "Published quiz data is unreachable: HTTP ${QUIZ_HTTP_CODE:-unknown}"
  fi

  curl -sSIL \
    --max-time 20 \
    "${DEMO_URL}/" \
    >"${OUT}/demo-headers.txt" \
    2>/dev/null \
    || true

  info "HTTP headers: ${OUT}/demo-headers.txt"
else
  warn "curl is unavailable; published demo checks were skipped"
fi

if [[ "${FAIL_COUNT}" -gt 0 ]]; then
  DECISION="NOT_READY"
  DECISION_LABEL="NOT READY"
  EXIT_CODE=1
elif [[ "${WARN_COUNT}" -gt 0 ]]; then
  DECISION="READY_AFTER_MANUAL_REVIEW"
  DECISION_LABEL="READY AFTER MANUAL REVIEW"
  EXIT_CODE=0
else
  DECISION="READY"
  DECISION_LABEL="READY"
  EXIT_CODE=0
fi

section "Submission record"

CHECKED_AT="$(date '+%Y-%m-%dT%H:%M:%S%z')"
INITIAL_CHANGE_COUNT="$(wc -l <"${INITIAL_STATUS_FILE}" | tr -d '[:space:]')"
FINAL_CHANGE_COUNT="$(wc -l <"${FINAL_STATUS_FILE}" | tr -d '[:space:]')"

{
  printf 'checked_at=%s\n' "${CHECKED_AT}"
  printf 'audit_mode=%s\n' "${AUDIT_MODE}"
  printf 'repository=%s\n' "${REPO}"
  printf 'branch=%s\n' "${CURRENT_BRANCH}"
  printf 'remote_ref=%s\n' "${REMOTE_REF}"
  printf 'head_sha=%s\n' "$(git rev-parse HEAD)"
  printf 'tag=%s\n' "${TAG}"
  printf 'tag_sha=%s\n' "${TAG_SHA}"
  printf 'demo_url=%s\n' "${DEMO_URL}"
  printf 'initial_worktree_entries=%s\n' "${INITIAL_CHANGE_COUNT}"
  printf 'final_worktree_entries=%s\n' "${FINAL_CHANGE_COUNT}"
  printf 'pass=%s\n' "${PASS_COUNT}"
  printf 'warn=%s\n' "${WARN_COUNT}"
  printf 'fail=%s\n' "${FAIL_COUNT}"
  printf 'decision=%s\n' "${DECISION}"
} >"${OUT}/submission-record.txt"

printf '\n%s%s+--------------------------------------+%s\n' "${BOLD}" "${CYAN}" "${RESET}"
printf '%s%s|        SUBMISSION READINESS          |%s\n' "${BOLD}" "${CYAN}" "${RESET}"
printf '%s%s+--------------------------------------+%s\n' "${BOLD}" "${CYAN}" "${RESET}"
printf '| PASS: %-5s WARN: %-5s FAIL: %-5s |\n' \
  "${PASS_COUNT}" "${WARN_COUNT}" "${FAIL_COUNT}"
printf '%s%s+--------------------------------------+%s\n' "${BOLD}" "${CYAN}" "${RESET}"

if [[ "${EXIT_CODE}" -eq 1 ]]; then
  printf '%s%sDECISION: %s%s\n' "${BOLD}" "${RED}" "${DECISION_LABEL}" "${RESET}"
  printf 'Resolve all FAIL results before submission.\n'
elif [[ "${WARN_COUNT}" -gt 0 ]]; then
  printf '%s%sDECISION: %s%s\n' "${BOLD}" "${YELLOW}" "${DECISION_LABEL}" "${RESET}"
  printf 'Review each warning and confirm that it is explainable.\n'
else
  printf '%s%sDECISION: %s%s\n' "${BOLD}" "${GREEN}" "${DECISION_LABEL}" "${RESET}"
fi

printf 'Evidence directory: %s\n' "${OUT}"
printf 'Submission record:  %s\n' "${OUT}/submission-record.txt"

exit "${EXIT_CODE}"