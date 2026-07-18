#!/usr/bin/env bash
set -euo pipefail

MODE="${MODE:-dry-run}"
SOURCE_BRANCH="${SOURCE_BRANCH:-main}"

if [ "$MODE" != "dry-run" ] && [ "$MODE" != "apply" ]; then
  echo "ERROR: MODE must be dry-run or apply" >&2
  exit 1
fi

if [ "$#" -eq 0 ]; then
  set -- data/raw/quiz-questions.json
fi

node - "$MODE" "$SOURCE_BRANCH" "$@" <<'NODE'
const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");

const [, , mode, sourceBranch, ...targets] = process.argv;

function run(command) {
  return cp.execSync(command, { encoding: "utf8" }).trim();
}

function getOwnerRepo() {
  if (process.env.OWNER_REPO) {
    return process.env.OWNER_REPO;
  }

  const remote = run("git remote get-url origin");

  const sshMatch = remote.match(/^git@github\.com:([^/]+\/[^.]+)(?:\.git)?$/);
  if (sshMatch) return sshMatch[1];

  const httpsMatch = remote.match(/^https:\/\/github\.com\/([^/]+\/[^.]+)(?:\.git)?$/);
  if (httpsMatch) return httpsMatch[1];

  throw new Error(
    `Unsupported GitHub remote URL: ${remote}\n` +
    `Set OWNER_REPO manually, e.g. OWNER_REPO=owner/repo MODE=apply bash scripts/fix-phase10-quiz-taxonomy-policy.sh`
  );
}

function readQuizFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const data = JSON.parse(text);
  const isArray = Array.isArray(data);
  const questions = isArray ? data : data.questions;

  if (!Array.isArray(questions)) {
    throw new Error(`${filePath} must be a JSON array or { "questions": [...] }`);
  }

  return { text, data, isArray, questions };
}

function writeQuizFile(filePath, data, isArray, questions) {
  const output = isArray ? questions : { ...data, questions };
  fs.writeFileSync(filePath, `${JSON.stringify(output, null, 2)}\n`);
}

function normalizeRepositoryPath(url) {
  return String(url || "")
    .replace(/^repository:\/\//, "")
    .replace(/^file:\/\//, "")
    .replace(/^\.?\//, "")
    .replace(/^\/+/, "");
}

function toGitHubUrl(ownerRepo, branch, originalUrl) {
  let repoPath = normalizeRepositoryPath(originalUrl);

  if (!repoPath) {
    repoPath = "data/raw/quiz-questions.json";
  }

  const localPath = path.normalize(repoPath);
  const isDirectory =
    fs.existsSync(localPath) &&
    fs.statSync(localPath).isDirectory();

  const kind = isDirectory ? "tree" : "blob";

  return `https://github.com/${ownerRepo}/${kind}/${branch}/${repoPath}`;
}

function dedupe(values) {
  return [...new Set(values.filter(Boolean))];
}

function isPhase10FrontendQuestion(question) {
  return (
    question.category === "frontend_languages" &&
    typeof question.id === "string" &&
    (
      question.id.includes("phase10-typescript") ||
      question.id.startsWith("frontend_languages-phase10-typescript")
    )
  );
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

const ownerRepo = getOwnerRepo();

console.log(`MODE=${mode}`);
console.log(`SOURCE_BRANCH=${sourceBranch}`);
console.log(`OWNER_REPO=${ownerRepo}`);
console.log("");

let totalChangedQuestions = 0;

for (const target of targets) {
  if (!fs.existsSync(target)) {
    console.log(`[SKIP] missing: ${target}`);
    continue;
  }

  const { text, data, isArray, questions } = readQuizFile(target);
  const beforeQuestions = clone(questions);

  const changes = [];

  for (const question of questions) {
    if (!isPhase10FrontendQuestion(question)) {
      continue;
    }

    const before = clone(question);

    // 1. id must start with category prefix.
    if (!question.id.startsWith(`${question.category}-`)) {
      question.id = `${question.category}-${question.id}`;
    }

    // 2. tags must include category key.
    if (!Array.isArray(question.tags)) {
      question.tags = [];
    }

    question.tags = dedupe([question.category, ...question.tags]);

    // 3. source.url must be HTTPS.
    if (!question.source || typeof question.source !== "object") {
      question.source = {};
    }

    const currentUrl = question.source.url || "";

    if (!currentUrl.startsWith("https://")) {
      question.source.url = toGitHubUrl(ownerRepo, sourceBranch, currentUrl);
    }

    if (!question.source.title) {
      question.source.title = "This project";
    }

    if (!question.source.publisher) {
      question.source.publisher = "This project";
    }

    const after = clone(question);

    if (JSON.stringify(before) !== JSON.stringify(after)) {
      changes.push({
        beforeId: before.id,
        afterId: after.id,
        beforeTags: before.tags,
        afterTags: after.tags,
        beforeUrl: before.source?.url,
        afterUrl: after.source?.url
      });
    }
  }

  // Duplicate id check.
  const seen = new Set();
  const duplicates = [];

  for (const question of questions) {
    if (seen.has(question.id)) {
      duplicates.push(question.id);
    }
    seen.add(question.id);
  }

  if (duplicates.length > 0) {
    console.error(`[FAIL] duplicate ids after rewrite in ${target}:`);
    for (const id of duplicates) {
      console.error(`- ${id}`);
    }
    process.exit(1);
  }

  console.log(`== ${target} ==`);

  if (changes.length === 0) {
    console.log("[OK] no changes required");
    console.log("");
    continue;
  }

  for (const change of changes) {
    console.log(`- ${change.beforeId} -> ${change.afterId}`);
    console.log(`  tags: ${JSON.stringify(change.beforeTags)} -> ${JSON.stringify(change.afterTags)}`);
    console.log(`  url:  ${change.beforeUrl} -> ${change.afterUrl}`);
  }

  totalChangedQuestions += changes.length;

  if (mode === "apply") {
    const backupPath = `${target}.backup-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    fs.writeFileSync(backupPath, text);
    writeQuizFile(target, data, isArray, questions);

    console.log(`[APPLY] updated: ${target}`);
    console.log(`[APPLY] backup:  ${backupPath}`);
  } else {
    // Restore in-memory changes not needed because we do not write in dry-run.
    for (let i = 0; i < questions.length; i += 1) {
      questions[i] = beforeQuestions[i];
    }

    console.log("[DRY-RUN] file not modified");
  }

  console.log("");
}

console.log(`Changed questions: ${totalChangedQuestions}`);
NODE
