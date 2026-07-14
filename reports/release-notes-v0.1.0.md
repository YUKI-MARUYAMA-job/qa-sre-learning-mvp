# v0.1.0: QA/SRE Learning MVP Quality Gate

## 概要

`qa-sre-learning-mvp` v0.1.0 は、小型の QA/SRE 志向ポートフォリオMVPとして初めて固定するreleaseである。

このreleaseは、構造化された学習データに対して、再現可能な品質パイプラインを構築・検証できることを示す。

## 実装済み機能

- TypeScript / Bun プロジェクト構成
- Zod による learning item schema validation
- source policy validation
- negative validation fixtures
- 決定的な quality report generation
- report freshness checking
- dependency policy validation
- public repository に不適切なファイルを検出する public safety check
- `bun run check` による統合local quality gate
- GitHub Actions quality gate
- quality report artifact upload
- architecture documentation
- acceptance criteria documentation
- portfolio readiness report

## 品質ゲート

主要なlocal品質ゲートは以下である。

```bash
bun run check
```

このコマンドには以下が含まれる。

- TypeScript typecheck
- Bun unit tests
- data schema validation
- source policy validation
- dependency policy validation
- public safety check
- report freshness check

## 主要成果物

- `reports/quality-report.md`
- `reports/portfolio-readiness.md`
- `docs/architecture.md`
- `docs/acceptance-criteria.md`
- `.github/workflows/quality-gate.yml`

## 既知の制約

このreleaseには、まだ以下は含まれていない。

- Web UI
- Cloudflare Pages deployment
- performance baseline
- security headers baseline
- external URL availability check
- source freshness check
- factual correctness check
- full secret scanning engine

## Release Decision

このreleaseは、以下に焦点を当てた小型 QA/SRE ポートフォリオMVPとして適している。

```text
data quality
  -> validation
  -> negative tests
  -> report generation
  -> report freshness
  -> dependency reproducibility
  -> public safety
  -> CI quality gate
  -> documentation
```

## 次のステップ

v0.1.0 固定後は、以下を検討する。

- branch protection の設定
- required quality-gate check の有効化
- quality report のstatic site公開
- performance baseline の追加
- security baseline の追加
