# Portfolio Readiness Report

## 目的

本プロジェクトは、QA / SRE 志望者向けの学習ポートフォリオである。

単なるクイズアプリではなく、学習データの品質管理、公開用データ生成、React / Vite によるUI実装、Playwright E2E test、GitHub Actions、Cloudflare Pages deployment を小さく統合したMVPとして設計している。

## 現在の到達点

```text
Data validation:
  pass

Source policy validation:
  pass

Quiz schema validation:
  pass

Quiz taxonomy validation:
  pass

Quiz policy validation:
  pass

Fixture responsibility validation:
  pass

Quiz quality report generation:
  pass

Public quiz data generation:
  pass

Client typecheck:
  pass

Client build:
  pass

Playwright E2E smoke test:
  pass

Security baseline:
  pass

Performance baseline:
  pass

Cloudflare Pages deployment build:
  pass
```

## 品質ゲート

```text
Local / GitHub Actions:
  bun run check

Cloudflare Pages:
  bun run pages:build
```

`check` は、typecheck、unit test、data validation、policy validation、report freshness check、client build、security / performance baseline、Playwright E2E smoke test を含む完全品質ゲートである。

`pages:build` は、Cloudflare Pages 向けのdeploy buildであり、Playwright E2Eは含めない。

## Architecture

```text
data/raw/quiz-questions.json
  -> Zod schema validation
  -> taxonomy validation
  -> policy validation
  -> fixture responsibility validation
  -> quiz quality report
  -> public/study-it/quiz_data.json
  -> React / Vite quiz UI
  -> Playwright E2E smoke test
  -> GitHub Actions quality gate
  -> Cloudflare Pages deployment
```

## 強み

```text
- raw data と public data を分離している
- legal / review metadata をpublic JSONから除外している
- invalid fixture により、schema / taxonomy / policy の責務を分離して検証している
- report freshness check により、生成レポートの更新漏れを検出できる
- GitHub Actions と Cloudflare Pages の責務を分離している
- Playwright E2Eにより、主要なUI導線を検証している
```

## 既知の制限

```text
- クイズ問題数はまだ少ない
- accessibility check は基本段階である
- performance baseline は主にサイズベースである
- 学習履歴の永続化は未実装である
- 認証・ユーザー管理は未実装である
- dashboard / admin UI は未実装である
```

## 次の改善候補

```text
- クイズ問題数を12-24問へ拡張する
- accessibility checklist を追加する
- READMEにdemo URLと操作手順を追記する
- architecture diagram を追加する
- interview explanation package を整備する
```

## 評価観点

このプロジェクトでは、以下の観点を示すことを重視する。

```text
QA:
  validation, fixture, E2E, report freshness

SRE:
  CI/CD responsibility split, deployment build, failure diagnosis

Data quality:
  schema, taxonomy, policy, public projection

Security / public safety:
  dependency policy, public repository safety, internal metadata exclusion

Maintainability:
  scripts contract, documentation, reproducible workflow
```

