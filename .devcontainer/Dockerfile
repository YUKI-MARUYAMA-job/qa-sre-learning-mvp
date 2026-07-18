FROM mcr.microsoft.com/devcontainers/javascript-node:1-22-bookworm

# このDockerfileは、QA / SRE Learning MVP用の再現可能な開発環境を定義する。
# OSレベルのツール、Bun実行環境、Playwright Chromium実行に必要な依存関係を整備する。
# プロジェクト固有の検証処理は package.json と GitHub Actions 側に集約する。

ARG BUN_VERSION=1.3.14

# 基本ユーティリティとPlaywright Chromium実行に必要なLinux共有ライブラリを追加する。
# Colima / DevContainer上では、Chromium本体をinstallしてもOS依存ライブラリが不足するとE2Eが失敗する。
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      ca-certificates \
      curl \
      git \
      sudo \
      unzip \
      libnspr4 \
      libnss3 \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libdbus-1-3 \
      libcups2 \
      libxkbcommon0 \
      libasound2 \
      libgbm1 \
      libxcomposite1 \
      libxdamage1 \
      libxfixes3 \
      libxrandr2 \
      libatspi2.0-0 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Bunを全ユーザーから実行可能な場所へ配置する。
# このプロジェクトではBunを主要なpackage managerおよびTypeScript実行基盤として使う。
RUN curl -fsSL https://bun.sh/install | bash -s -- "bun-v${BUN_VERSION}" \
    && install -m 0755 /root/.bun/bin/bun /usr/local/bin/bun \
    && rm -rf /root/.bun

# package.json内の既存scriptが bunx を使うため、
# DevContainer内でも bunx を実行できるようにwrapperを用意する。
# bunx は実質的に `bun x` として扱う。
RUN cat > /usr/local/bin/bunx <<'BUNX_EOF' \
    && chmod 0755 /usr/local/bin/bunx
#!/usr/bin/env sh
exec bun x "$@"
BUNX_EOF

# nodeユーザーがBunの一時領域・cache領域を書き込めるように準備する。
RUN mkdir -p /home/node/.bun/install/cache \
    && chown -R node:node /home/node/.bun \
    && chmod 1777 /tmp

# post-create.shで権限補正を行うため、nodeユーザーにpasswordless sudoを許可する。
RUN echo "node ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/node \
    && chmod 0440 /etc/sudoers.d/node

# Bunとbunx wrapperの存在確認をDocker build時に行う。
RUN command -v bun \
    && command -v bunx \
    && bun --version
