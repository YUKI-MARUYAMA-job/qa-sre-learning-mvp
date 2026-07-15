# qa-sre-learning-mvp

[![quality-gate](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/actions/workflows/quality-gate.yml/badge.svg?branch=main)](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/actions/workflows/quality-gate.yml)

## Overview

`qa-sre-learning-mvp` は、QA/SRE志向の小型ポートフォリオMVPである。

構造化された学習データを題材に、schema validation、source policy validation、negative fixtures、quality report generation、report freshness check、dependency reproducibility、public safety check、performance / security baseline、Cloudflare Pages production deployment を一連の quality gate として実装している。

このリポジトリの目的は、大規模なアプリケーションを作ることではなく、以下を再現可能に示すことである。

- 検査対象を定義する
- 正常系・異常系を検証する
- 品質ゲートを local と CI で再現する
- 生成レポートを静的サイトとして公開する
- 公開後の deployment baseline を確認する
- main branch を保護し、PR経由で変更を統合する

## Live Site

```text
Production URL: https://qa-sre-learning-mvp.pages.dev
```

公開サイトでは、以下のレポートを確認できる。

- Quality Report
- Portfolio Readiness Report

## What This Demonstrates

このMVPでは、以下の実装・運用要素を示す。

| Area | Demonstrated capability |
|---|---|
| Data Quality | Zod schema validation / source policy validation |
| QA | negative fixtures / acceptance criteria / report freshness |
| SRE | reproducible quality gate / GitHub Actions / branch protection |
| Security | public safety check / security headers baseline |
| Performance | static site file-size budget |
| Deployment | Cloudflare Pages production deployment / deployment baseline |
| Documentation | architecture docs / readiness report / release notes |

## Architecture Overview

```text
data/raw/learning-items.json
  -> Zod schema validation
  -> source policy validation
  -> negative fixture tests
  -> quality report generation
  -> report freshness check
  -> static site generation
  -> performance / security baseline
  -> GitHub Actions quality-gate
  -> Cloudflare Pages production deployment
```

## Quality Gate

統合品質ゲートは以下で実行する。

```bash
bun run check
```

このコマンドには、主に以下が含まれる。

- TypeScript typecheck
- Bun unit tests
- data schema validation
- source policy validation
- dependency policy validation
- public safety check
- report freshness check
- static site build check
- security baseline check
- performance baseline check

## Deployment Baseline

Cloudflare Pages production deployment は以下で検証する。

```bash
PRODUCTION_URL="https://qa-sre-learning-mvp.pages.dev" bun run validate:deployment
```

この検査では、production URL上で以下を確認する。

- index page が取得できること
- quality report page が取得できること
- portfolio readiness page が取得できること
- security headers が response に含まれること

## Key Artifacts

| Artifact | Purpose |
|---|---|
| `reports/quality-report.md` | data quality / policy validation の結果 |
| `reports/portfolio-readiness.md` | ポートフォリオ提出準備状況 |
| `docs/architecture.md` | アーキテクチャと品質ゲートの説明 |
| `docs/acceptance-criteria.md` | MVP受け入れ基準 |
| `reports/release-notes-v0.1.0.md` | `v0.1.0` release notes |
| `dist/site` | static report site build output |

## Main Commands

```bash
bun run typecheck
bun test
bun run validate:data
bun run validate:policy
bun run validate:dependencies
bun run validate:public-safety
bun run report:check
bun run site:check
bun run validate:security-baseline
bun run validate:performance-baseline
bun run validate:deployment
bun run check
```

## Learning Items

検査対象データは以下に配置している。

```text
data/raw/learning-items.json
```

現在のデータは、Git、CI、TypeScript、Bun、local workflow note を対象とし、以下の観点で検査する。

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

## Static Report Site

このリポジトリでは、`reports/quality-report.md` と `reports/portfolio-readiness.md` を静的HTMLとして生成できる。

```bash
bun run site:build
```

生成先は以下である。

```text
dist/site
```

Cloudflare Pages の設定は以下である。

```text
Production branch: main
Build command: bun install --frozen-lockfile && bun run check
Build output directory: dist/site
```

## Performance / Security Baseline

このリポジトリでは、静的レポートサイトに対して最低限の performance / security baseline を検査する。

Security baseline:

```bash
bun run validate:security-baseline
```

Performance baseline:

```bash
bun run validate:performance-baseline
```

主な検査対象は以下である。

- Cloudflare Pages 用 `_headers`
- security headers の存在
- generated HTML / CSS の file-size budget
- `dist/site` の必須成果物

これらの検査は、統合品質ゲートにも含まれる。

```bash
bun run check
```

## Public Safety Check

公開リポジトリに含めるべきでないローカルファイルや、秘密情報を含む可能性のあるファイルを検出する。

```bash
bun run validate:public-safety
```

検出対象の例は以下である。

- `.env`
- `.env.*`
- private key / certificate files
- local editor profile files
- bundle files

この検査は統合品質ゲートにも含まれる。

```bash
bun run check
```

## Git Sync Diagnosis

このリポジトリでは、VS Code GUI の Sync 操作に依存しすぎないよう、local branch と remote branch の状態を確認する診断スクリプトを用意している。

```bash
bash scripts/git-sync-diagnose.sh
```

このスクリプトは、次の情報を表示する。

- repository root
- 現在のbranch
- upstream branch
- fetch後の ahead / behind 数
- local-only commit と remote-only commit
- working tree の未commit変更・未追跡ファイル
- branch tracking summary

ahead / behind の基本的な読み方は以下である。

| 状態 | 意味 | 推奨操作 |
|---|---|---|
| `0 0` | local と remote は同期済み | 未commit変更のみ確認 |
| `0 N` | remote のみ進んでいる | `git pull --ff-only` |
| `N 0` | local のみ進んでいる | 検査後に `git push` |
| `N M` | local と remote が分岐している | `rebase` / `merge` / `reset` を明示判断 |

作業開始時やpush前には、以下を確認する。

```bash
bash scripts/git-sync-diagnose.sh
bun run check
git status --short
```

## GitHub Actions

GitHub Actionsでは、以下の統合品質ゲートを自動実行する。

```bash
bun run check
```

Workflow file:

```text
.github/workflows/quality-gate.yml
```

CIで生成された `reports/quality-report.md` は、GitHub Actions artifact として保存する。

## Documentation

詳細な設計・受け入れ基準・提出準備状況は、以下に分けて記録している。

| Document | Description |
|---|---|
| `docs/architecture.md` | 構成、データ処理パイプライン、品質ゲート、CIフロー |
| `docs/acceptance-criteria.md` | MVPとしての受け入れ基準 |
| `reports/portfolio-readiness.md` | 現在の到達状況と提出前チェック |
| `reports/release-notes-v0.1.0.md` | `v0.1.0` release notes |

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

## Interview Summary

このリポジトリでは、構造化された学習データを対象に、QA/SRE志向の品質パイプラインを構築した。

Zodによる schema validation、source policy validation、negative fixture、quality report generation、report freshness check を実装し、dependency reproducibility、public safety check、performance / security baseline を GitHub Actions の quality gate に統合している。

さらに、main branch は branch protection により PR 経由の統合に制限し、生成された report は静的HTMLとして Cloudflare Pages で production deploy している。

## Known Limitations

現時点では、以下は今後の拡張対象である。

- full observability
- production-grade monitoring
- advanced Lighthouse CI enforcement
- external source freshness verification
- referenced content factual verification
- multi-user application behavior
