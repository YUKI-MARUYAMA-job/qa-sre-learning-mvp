# qa-sre-learning-mvp
[![quality-gate](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/actions/workflows/quality-gate.yml/badge.svg)](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/actions/workflows/quality-gate.yml)

## Git同期診断

このリポジトリでは、VS Code GUIのSync操作に依存しすぎないよう、local branch と remote branch の状態を事前に確認する診断スクリプトを用意している。

```bash
bash scripts/git-sync-diagnose.sh
```

このスクリプトは、次の情報を表示する。

- repository root
- 現在のbranch
- upstream branch
- `git fetch --tags origin` 実行後の ahead / behind 数
- local-only commit と remote-only commit
- working tree の未commit変更・未追跡ファイル
- branch tracking summary

この確認により、次の状態を切り分ける。

| 状態 | 意味 | 推奨操作 |
|---|---|---|
| `0 0` | local と remote のcommit履歴は同期済み | 未commit変更のみ確認 |
| `0 N` | remote のみ進んでいる | `git pull --ff-only` |
| `N 0` | local のみ進んでいる | 検査後に `git push` |
| `N M` | local と remote が分岐している | `rebase` / `merge` / `reset` を明示判断 |

GUI同期で意図しないmerge commitや履歴分岐を発生させないため、作業開始時やpush前にはこの診断を実行する。

```bash
bash scripts/git-sync-diagnose.sh
bun run check
git status --short
```

## GitHub Actions 品質ゲート

このリポジトリでは、GitHub Actionsにより以下の品質ゲートを自動実行する。

```bash
bun run check
```

検査内容は以下である。

- TypeScript typecheck
- Bun unit tests
- data schema validation
- source policy validation
- quality report generation

workflow file:

```text
.github/workflows/quality-gate.yml
```

CIで生成された `reports/quality-report.md` は、GitHub Actions artifactとして保存する。


## Learning Items

検査対象データは `data/raw/learning-items.json` に配置している。

現在のデータは、Git、CI、TypeScript、Bun、local workflow noteを対象とし、以下の観点で検査する。

- schema validation
- source policy validation
- category別集計
- source type別集計
- tag別集計
- quality report generation

品質レポートは以下に生成される。

```text
reports/quality-report.md
```

## Public Safety Check

このリポジトリでは、公開リポジトリに含めるべきでないローカルファイルや、秘密情報を含む可能性のあるファイルを検出する。

```bash
bun run validate:public-safety
```

検出対象の例は以下である。

- `.env`
- `.env.*`
- private key / certificate files
- local editor profile files
- bundle files

この検査は、統合品質ゲートである以下のコマンドにも含まれる。

```bash
bun run check
```

## Architecture

このMVPの構成、データ処理パイプライン、品質ゲート、CIフローは以下にまとめている。

```text
docs/architecture.md
```

## Acceptance Criteria

このMVPの受け入れ基準は以下にまとめている。

```text
docs/acceptance-criteria.md
```

## Portfolio Readiness

このMVPの現在の到達状況と提出前チェックは以下にまとめている。

```text
reports/portfolio-readiness.md
```

## Release

現在の固定releaseは以下である。

```text
v0.1.0
```

このreleaseでは、構造化された学習データに対して、schema validation、source policy validation、negative fixtures、quality report generation、report freshness check、dependency reproducibility、public safety check、documentation、GitHub Actions quality gate を含む最初の QA/SRE 志向MVPを固定している。

詳細は以下を参照する。

```text
reports/release-notes-v0.1.0.md
```

## Static Report Site

このリポジトリでは、`reports/quality-report.md` と `reports/portfolio-readiness.md` を静的HTMLとして生成できる。

```bash
bun run site:build
```

生成先は以下である。

```text
dist/site
```

この静的サイトは、Cloudflare Pagesで公開することを想定している。

Cloudflare Pages の設定例:

```text
Build command: bun install --frozen-lockfile && bun run check
Build output directory: dist/site
Production branch: main
```
