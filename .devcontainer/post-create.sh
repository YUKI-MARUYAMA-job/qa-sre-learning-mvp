#!/usr/bin/env bash
set -euo pipefail

# DevContainer作成後に実行する初期化処理。
# 目的は、Bun依存関係の導入と軽量な型チェックである。
# ColimaやDocker volume環境では一時領域やcache領域の権限差が出ることがあるため、
# Bun実行前に書き込み権限を明示的に確認・補正する。

echo "[devcontainer] 現在のユーザー:"
whoami
id

echo "[devcontainer] Bun version:"
bun --version

# package.jsonの一部scriptは bunx を使う。
# Dockerfile更新漏れや環境差に備え、bunxがなければ `bun x` wrapperを作成する。
if ! command -v bunx >/dev/null 2>&1; then
  echo "[devcontainer] bunx が見つからないため、wrapperを作成します..."
  sudo tee /usr/local/bin/bunx >/dev/null <<'BUNX_EOF'
#!/usr/bin/env sh
exec bun x "$@"
BUNX_EOF
  sudo chmod 0755 /usr/local/bin/bunx
fi

echo "[devcontainer] bun / bunx の確認:"
command -v bun
command -v bunx

echo "[devcontainer] /tmp の権限を補正します..."
sudo mkdir -p /tmp
sudo chmod 1777 /tmp

echo "[devcontainer] Bun cache directory の権限を補正します..."
sudo mkdir -p /home/node/.bun/install/cache
sudo chown -R node:node /home/node/.bun
sudo chmod -R u+rwX /home/node/.bun

export TMPDIR=/tmp

echo "[devcontainer] 書き込み確認を実行します..."
touch /tmp/bun-temp-write-test
rm /tmp/bun-temp-write-test

touch /home/node/.bun/install/cache/bun-cache-write-test
rm /home/node/.bun/install/cache/bun-cache-write-test

echo "[devcontainer] 依存関係を frozen lockfile でインストールします..."
bun install --frozen-lockfile

echo "[devcontainer] 軽量検証を実行します..."
bun run typecheck
bun run client:typecheck

# Playwrightのブラウザ本体は環境差が出やすいため、自動導入しない。
# E2Eをコンテナ内で実行する場合は、必要に応じて手動で実行する。
echo "[devcontainer] Playwright E2Eを実行する場合:"
echo "[devcontainer]   bunx playwright install chromium"
echo "[devcontainer]   CI=1 bunx playwright test e2e/quiz-smoke.e2e.ts --trace on"

echo "[devcontainer] セットアップ完了。"
