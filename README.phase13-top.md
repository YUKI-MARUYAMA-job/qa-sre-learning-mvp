# qa-sre-learning-mvp

![quality-gate](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/actions/workflows/quality-gate.yml/badge.svg?branch=main)

## Overview

`qa-sre-learning-mvp` は、QA/SRE志向の小型ポートフォリオMVPである。

構造化された学習データを題材に、データ品質検査、異常系fixture、決定的なquality report生成、report freshness check、dependency reproducibility、public safety check、performance / security baseline、Cloudflare Pages production deploymentを一連のquality gateとして実装している。

このリポジトリの目的は、大規模なアプリケーションを作ることではなく、以下を再現可能に示すことである。

- 検査対象を定義する
- 正常系・異常系を検証する
- 品質ゲートをlocalとCIで再現する
- 生成レポートを静的サイトとして公開する
- 公開後のdeployment baselineを確認する

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
| Deployment | Cloudflare Pages production deployment |
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
- security headers がresponseに含まれること

## Key Artifacts

| Artifact | Purpose |
|---|---|
| `reports/quality-report.md` | data quality / policy validation の結果 |
| `reports/portfolio-readiness.md` | ポートフォリオ提出準備状況 |
| `docs/architecture.md` | アーキテクチャと品質ゲートの説明 |
| `docs/acceptance-criteria.md` | MVP受け入れ基準 |
| `reports/release-notes-v0.1.0.md` | v0.1.0 release notes |
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
bun run check
```

## Interview Summary

このリポジトリでは、構造化された学習データを対象に、QA/SRE志向の品質パイプラインを構築した。

Zodによるschema validation、source policy validation、negative fixture、quality report generation、report freshness checkを実装し、dependency reproducibility、public safety check、performance / security baselineをGitHub Actionsのquality-gateに統合している。

さらに、main branchはbranch protectionによりPR経由の統合に制限し、生成されたreportは静的HTMLとしてCloudflare Pagesでproduction deployしている。

## Known Limitations

現時点では、以下は今後の拡張対象である。

- full observability
- production-grade monitoring
- advanced Lighthouse CI enforcement
- external source freshness verification
- referenced content factual verification
- multi-user application behavior

