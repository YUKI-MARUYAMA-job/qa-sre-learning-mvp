#!/usr/bin/env bash
set -euo pipefail

echo "== Repository =="
git rev-parse --show-toplevel

echo
echo "== Branch =="
git branch --show-current

echo
echo "== Upstream =="
git rev-parse --abbrev-ref --symbolic-full-name @{upstream}

echo
echo "== Fetch =="
git fetch --tags origin

echo
echo "== Ahead / Behind =="
git rev-list --left-right --count HEAD...@{upstream}

echo
echo "== Local-only / Remote-only commits =="
git log --oneline --decorate --graph --left-right --cherry-pick HEAD...@{upstream} -n 50 || true

echo
echo "== Working tree =="
git status --short

echo
echo "== Branch summary =="
git status -sb
