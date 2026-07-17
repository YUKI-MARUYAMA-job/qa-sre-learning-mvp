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

主要な構成は以下である。

| Path | Role |
|---|---|
| `data/raw/learning-items.json` | 検査対象の学習データ |
| `data/fixtures/invalid-learning-items.json` | 異常系検証用fixture |
| `src/schemas/` | Zod schema定義 |
| `src/application/` | source policy validation / report generation |
| `src/cli/` | validation / report / static site / baseline checks |
| `reports/` | quality report / readiness report / release notes |
| `docs/` | architecture / acceptance criteria |
| `site/static/` | static site assets / Cloudflare Pages headers |
| `.github/workflows/quality-gate.yml` | GitHub Actions quality gate |

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

GitHub Actionsでも同じ品質ゲートを実行する。

```text
.github/workflows/quality-gate.yml
```

main branch は branch protection により、PR経由の統合と required quality-gate check を前提とする。

Lighthouse CIは、現段階では required quality-gate には含めず、warn-only の補助検査として運用する。

```bash
bun run lighthouse:check
```


Git同期状態は以下で確認する。

```bash
bash scripts/git-sync-diagnose.sh
```

## Production Deployment

このリポジトリの静的レポートサイトは、Cloudflare Pagesでproduction deployしている。

```text
Production URL: https://qa-sre-learning-mvp.pages.dev
Production branch: main
Build command: bun install --frozen-lockfile && bun run check
Build output directory: dist/site
```

静的サイトは以下で生成する。

```bash
bun run site:build
```

生成先は以下である。

```text
dist/site
```

Cloudflare Pages production deployment は以下で検証する。

```bash
PRODUCTION_URL="https://qa-sre-learning-mvp.pages.dev" bun run validate:deployment
```

この検査では、production URL上で以下を確認する。

- index page が取得できること
- quality report page が取得できること
- portfolio readiness page が取得できること
- security headers が response に含まれること

performance / security baseline は以下で個別に検証できる。

```bash
bun run validate:security-baseline
bun run validate:performance-baseline
```

主な検査対象は以下である。

- Cloudflare Pages 用 `_headers`
- security headers の存在
- generated HTML / CSS の file-size budget
- `dist/site` の必須成果物

## Reports

主要な成果物と補助ドキュメントは以下である。

| Artifact | Purpose |
|---|---|
| `reports/quality-report.md` | data quality / policy validation の結果 |
| `reports/portfolio-readiness.md` | ポートフォリオ提出準備状況 |
| `reports/release-notes-v0.1.0.md` | `v0.1.0` release notes |
| `docs/architecture.md` | アーキテクチャと品質ゲートの説明 |
| `docs/acceptance-criteria.md` | MVP受け入れ基準 |
| `docs/interview-notes.md` | 面接説明用の補助資料 |
| `dist/site` | static report site build output |

品質レポートは以下に生成される。

```text
reports/quality-report.md
```

公開サイトでは、`reports/quality-report.md` と `reports/portfolio-readiness.md` を静的HTMLとして閲覧できる。

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

## Main Commands

主要コマンドは以下である。

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
bun run lighthouse:check
bun run check
```

作業開始時やpush前には、以下を確認する。

```bash
bash scripts/git-sync-diagnose.sh
bun run check
git status --short
```

deployment baseline を確認する場合は、production URLを指定する。

```bash
PRODUCTION_URL="https://qa-sre-learning-mvp.pages.dev" bun run validate:deployment
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

## Known Limitations

現時点では、以下は今後の拡張対象である。

- full observability
- production-grade monitoring
- advanced Lighthouse CI enforcement
- external source freshness verification
- referenced content factual verification
- multi-user application behavior

## Quiz Validation Docs

| `docs/quiz-schema-taxonomy-validation.md` | クイズデータのschema/taxonomy validation方針 |


## Remote Quality Gates

This project separates full quality checks from deployment builds.

```text
GitHub Actions:
  bun run check

Cloudflare Pages:
  bun run pages:build
```

`check` includes type checks, unit tests, data validation, report freshness checks, client build, security/performance baselines, and Playwright E2E smoke testing.

`pages:build` excludes Playwright E2E and focuses on generating the deployable `dist/app` output.

## Cloudflare Pages Settings

```text
Build command:
  bun install --frozen-lockfile && bun run pages:build

Build output directory:
  dist/app

Root directory:
  blank

NODE_VERSION:
  22.16.0
```


## Remote Quality Gates

このプロジェクトでは、品質チェックとデプロイ用ビルドを分離している。

```text
GitHub Actions:
  bun run check

Cloudflare Pages:
  bun run pages:build
```

`check` は、local / GitHub Actions 向けの完全品質ゲートである。
以下をまとめて実行する。

```text
- TypeScript typecheck
- client typecheck
- unit tests
- data validation
- policy validation
- quiz schema validation
- quiz taxonomy validation
- quiz policy validation
- fixture responsibility validation
- report freshness check
- public quiz data freshness check
- dependency policy validation
- public repository safety check
- static site build check
- client build
- security baseline check
- performance baseline check
- Playwright E2E smoke test
```

`pages:build` は、Cloudflare Pages 向けのデプロイ用ビルドである。  
Playwright E2E は含めず、デプロイ可能な `dist/app` の生成に責務を限定する。

```text
pages:build:
  pages:verify
  client:build

output:
  dist/app
```

この責務分離により、GitHub Actions では品質保証を行い、Cloudflare Pages では静的アプリケーションのビルドと配信に集中する。

