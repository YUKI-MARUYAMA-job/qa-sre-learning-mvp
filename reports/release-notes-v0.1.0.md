# v0.1.0: QA/SRE Learning MVP Quality Gate

`reports/release-notes-v0.1.0.md`

## 概要

`qa-sre-learning-mvp` v0.1.0 は、QA/SRE志向の小型ポートフォリオMVPとして、最初に固定するreleaseです。

このreleaseでは、単なるReactクイズアプリではなく、構造化データ、schema validation、taxonomy validation、policy validation、異常系fixture、生成物鮮度確認、E2E、CI/CD、Cloudflare Pagesデプロイまでを小さく統合した品質パイプラインを示します。

クイズ問題のコンセプトは、外部機関の公式問題、過去問、実問再現、認定試験対策ではありません。
本リポジトリの技術スタック、品質ゲート、データ検証、E2E、デプロイ構成、ドキュメント設計を理解するための内製クイズとして再設計しています。

現在のクイズは16問で構成されています。

---

## 実装済み機能

v0.1.0では、以下を実装済みです。

* TypeScript / Bunプロジェクト構成
* React / ViteによるクイズUI
* `data/raw/quiz-questions.json` を正本とするクイズデータ管理
* Zodによるquiz question schema validation
* subject taxonomy validation
* quiz policy validation
* fixture responsibility validation
* `public/study-it/quiz_data.json` への公開用クイズデータ生成
* `reports/quiz-quality-report.md` の生成
* quiz report freshness check
* public quiz data freshness check
* Zodによるlearning item schema validation
* source policy validation
* negative validation fixtures
* `reports/quality-report.md` の生成
* quality report freshness check
* dependency policy validation
* public repository safety check
* security baseline
* performance baseline
* Playwright E2E smoke test
* `CI=1 bun run check` による統合local quality gate
* GitHub Actions quality gate
* Cloudflare Pages向けbuild
* Lighthouse CI warn-only補助検査
* architecture documentation
* acceptance criteria documentation
* quiz schema / taxonomy / policy validation documentation
* dependency and TypeScript configuration policy documentation
* Lighthouse CI operation documentation
* portfolio readiness report
* quiz app technical explanation memo

---

## クイズ問題コンセプト

v0.1.0のクイズ問題は、本ポートフォリオ成果物を理解するための内製教材として位置づけています。

当初のクイズ問題は、外部技術学習や外部機関試験対策に寄った構成を含んでいました。
その後、公開ポートフォリオとしての説明可能性、第三者教材への依存回避、公式問題再現リスクの低減を考慮し、本リポジトリ自体の技術スタック・品質ゲート・デプロイ構成を理解するためのクイズへ転換しました。

現在の主な出題領域は以下です。

* プロジェクト概要
* データ品質パイプライン
* schema validation / taxonomy validation
* policy validation
* 品質ゲートとCI
* React / ViteクイズUI
* Cloudflare Pagesデプロイ
* ドキュメントと説明設計
* Git運用

この転換により、外部公式問題の再現ではなく、ポートフォリオ成果物自体の設計意図を説明するクイズとして扱える状態になっています。

---

## 品質ゲート

主要なlocal品質ゲートは以下です。

```bash
CI=1 bun run check
```

このコマンドには、主に以下が含まれます。

* TypeScript typecheck
* client typecheck
* Bun unit tests
* learning data schema validation
* source policy validation
* quiz schema validation
* quiz taxonomy validation
* quiz policy validation
* quiz fixture responsibility validation
* quiz quality report freshness check
* public quiz data freshness check
* dependency policy validation
* public repository safety check
* quality report freshness check
* static site check
* client production build
* security baseline check
* performance baseline check
* Playwright E2E smoke test

この品質ゲートにより、データ、検証、生成物、UI、E2E、baselineをまとめて確認できます。

---

## 補助的な品質観測

v0.1.0では、必須品質ゲートとは別に、Lighthouse CIをwarn-onlyの補助検査として扱います。

Lighthouse CIは、現時点ではmerge blockやrequired quality gateには含めません。
理由は、Lighthouse scoreがCI環境の負荷や実行タイミングに影響されるためです。

現在のLighthouse CIでは、以下を分けて扱います。

| 設定                      | 測定対象        | 目的                        |
| ----------------------- | ----------- | ------------------------- |
| `lighthouserc.json`     | `dist/site` | 静的レポートサイトの補助観測            |
| `lighthouserc.app.json` | `dist/app`  | React / Viteクイズアプリ本体の補助観測 |

アプリ向けLighthouse CIは、以下のコマンドで実行します。

```bash
bun run lighthouse:app:check
```

この検査は、主成果物であるクイズアプリ本体のperformance、accessibility、best practices、SEOの改善候補を把握するために使います。

---

## 主要成果物

v0.1.0の主要成果物は以下です。

| 成果物                                         | 役割                              |
| ------------------------------------------- | ------------------------------- |
| `src/client/`                               | React / ViteクイズUI               |
| `data/raw/quiz-questions.json`              | クイズ問題の正本データ                     |
| `data/raw/subject-taxonomy.json`            | クイズ分類体系の正本                      |
| `public/study-it/quiz_data.json`            | UIが読み込む公開用クイズデータ                |
| `reports/quiz-quality-report.md`            | クイズデータ品質レポート                    |
| `reports/quality-report.md`                 | learning data品質レポート             |
| `reports/portfolio-readiness.md`            | ポートフォリオ提出準備レポート                 |
| `docs/architecture/architechture.md`        | アーキテクチャ説明                       |
| `docs/acceptance-criteria.md`               | 受け入れ基準                          |
| `docs/quiz-schema-taxonomy-validation.md`   | クイズデータ検証方針                      |
| `docs/dependency-and-tsconfig-policy.md`    | 依存関係とTypeScript設定方針             |
| `docs/lighthouse-ci.md`                     | Lighthouse CI運用方針               |
| `docs/interview/quiz-app-explanation.md`    | クイズアプリ技術説明メモ                    |
| `.github/workflows/quality-gate.yml`        | 必須品質ゲートworkflow                 |
| `.github/workflows/lighthouse-warn.yml`     | 静的レポートサイト向けLighthouse補助workflow |
| `.github/workflows/lighthouse-app-warn.yml` | クイズアプリ向けLighthouse補助workflow    |
| `lighthouserc.json`                         | 静的レポートサイト向けLighthouse設定         |
| `lighthouserc.app.json`                     | クイズアプリ向けLighthouse設定            |

---

## デプロイ

v0.1.0では、Cloudflare Pagesをデプロイ先として扱います。

Cloudflare Pagesでは、完全品質ゲートではなく、デプロイ用buildと静的配信に責務を限定します。
完全な品質確認は、GitHub Actionsの `CI=1 bun run check` で行います。

Cloudflare Pages向けのbuildでは、以下を想定します。

```text
Build command:
  bun install --frozen-lockfile && bun run pages:build

Build output directory:
  dist/app
```

この責務分離により、GitHub Actionsでは品質保証を行い、Cloudflare Pagesでは公開用buildと配信を担います。

---

## 既知の制約

このreleaseには、以下の制約があります。

* learning data側の外部URLについて、到達可能性の自動検査はまだ実装していません。
* learning data側の外部sourceについて、参照元の鮮度や更新状況の自動検査はまだ実装していません。
* 参照内容そのものの事実正確性は、自動検証の対象にしていません。
* quiz dataのsourceはrepo内部pathを前提としていますが、repo内部pathの存在確認や参照先内容との意味的整合性までは完全には検査していません。
* Web UIはReact / Viteで実装済みですが、複数ユーザー利用、ログイン、学習履歴の永続保存は実装していません。
* Playwright E2Eは主要導線のsmoke testに限定しており、網羅的なブラウザ・端末・アクセシビリティ検証はまだ実装していません。
* security / performance baselineは実装済みですが、本格的な継続監視、アラート通知、real user monitoring、production-grade observabilityはまだ実装していません。
* Cloudflare Pages向けbuildは整備済みですが、デプロイ後の継続的なsynthetic monitoringや自動復旧運用はまだ実装していません。
* public repository safety checkは導入済みですが、専用ツールによるfull secret scanning engineの代替にはなりません。
* Lighthouse CIはwarn-onlyの補助観測であり、必須品質ゲートには含めていません。
* 現在のクイズは16問構成であり、taxonomy coverageや出題粒度は今後20〜24問程度へ拡充する余地があります。

---

## Release Decision

このreleaseは、以下に焦点を当てた小型QA/SREポートフォリオMVPとして適しています。

```text
portfolio-focused quiz app
  -> structured raw data
  -> schema validation
  -> taxonomy validation
  -> policy validation
  -> negative fixtures
  -> public data generation
  -> report generation
  -> report freshness
  -> client build
  -> Playwright E2E
  -> dependency reproducibility
  -> public safety
  -> security / performance baseline
  -> CI quality gate
  -> Cloudflare Pages deployment
  -> Lighthouse warn-only observation
  -> documentation
```

v0.1.0は、本番運用サービスではありません。
一方で、QA/SRE志向のポートフォリオとして、変更を安全に検証し、生成物を同期し、CI/CDとデプロイ責務を説明できるMVPとして扱えます。

---

## 次のステップ

v0.1.0固定後は、以下を検討します。

* branch protectionの設定
* required quality-gate checkの有効化
* GitHub Releaseの作成
* release tag `v0.1.0` の作成
* Cloudflare Pages production URLの最終確認
* READMEから主要docs / reportsへの導線整理
* クイズ問題を20〜24問程度へ拡充
* taxonomy coverageの改善
* repo内部pathの存在確認検査
* クイズsourceと参照先内容の意味的整合性確認
* production URLのLighthouse補助測定
* Lighthouse結果の要約report化
* accessibility改善項目のissue化
* synthetic monitoringの検討
* alert通知の検討
* releaseごとの品質指標比較
