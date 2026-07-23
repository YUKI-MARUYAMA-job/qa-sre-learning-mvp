# Evidence Matrix


## 1. 目的

このドキュメントは、`qa-sre-learning-mvp` における実装、検証、CI/CD、デプロイ、説明資料を、QA / SRE / Data quality / Frontend / Documentation の評価観点に対応づけるものです。

本ポートフォリオの評価対象は、UIの見た目だけではありません。
構造化データを検証し、生成物を同期し、品質ゲートをlocalとCIで再現し、Cloudflare Pagesへdeployment-safe buildを行えることを示します。

また、クイズ問題は外部機関試験対策ではなく、本ポートフォリオ成果物の技術スタック、品質ゲート、データ検証、E2E、デプロイ構成を理解するための内製クイズとして位置づけています。

---

## 2. 評価観点の全体像

本リポジトリでは、以下の観点を中心に評価可能な証跡を用意しています。

```text
中心評価:
  データ品質
  schema / taxonomy / policy validation
  異常系fixture
  生成物鮮度確認
  public data projection
  React / Vite UI
  Playwright E2E
  CI/CD責務分離
  Cloudflare Pages deployment
  public repository safety
  security / performance baseline
  Lighthouse warn-only observation
  ドキュメントによる説明可能性
  LLM活用時の検証責任
```

---

## 3. Evidence Matrix

| Evaluation Area              | Evidence                                                 | File / Command                                                      | 説明                                                                                   |
| ---------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Project scope                | QA/SRE志向ポートフォリオMVPとしての位置づけ              | [README.md](/README.md)                                             | 本リポジトリの目的、対象範囲、主要機能を説明します                                     |
| Release scope                | v0.1.0の固定範囲                                         | [reports/release-notes-v0.1.0.md](/reports/release-notes-v0.1.0.md) | 現在の実装済み機能、制約、次のステップを整理します                                     |
| Type safety                  | TypeScript typecheck                                     | `bun run typecheck`                                                 | CLI、schema、application logic、testの型整合性を確認します                             |
| Client type safety           | React / Vite client typecheck                            | `bun run client:typecheck`                                          | クイズUI側の型整合性を確認します                                                       |
| Unit testing                 | Unit / validation tests                                  | `bun run test:unit`                                                 | validation logicや変換処理の基本動作を確認します                                       |
| Learning data quality        | Learning data validation                                 | `bun run validate:data`                                             | learning dataの構造と必須項目を確認します                                              |
| Source policy                | Source policy validation                                 | `bun run validate:policy`                                           | learning data側のsource方針を検査します                                                |
| Quiz schema                  | Quiz question schema validation                          | `bun run validate:quiz`                                             | クイズ問題の構造、選択肢、answer、metadataを検査します                                 |
| Quiz taxonomy                | Quiz taxonomy validation                                 | `bun run validate:quiz`                                             | `subject-taxonomy.json` とquiz dataの分類整合性を検査します                            |
| Quiz policy                  | Quiz policy validation                                   | `bun run validate:quiz-policy`                                      | 外部公式問題再現リスク、source方針、review状態、公開方針を検査します                   |
| Fixture responsibility       | Invalid fixtures fail at expected layer                  | `bun run validate:quiz-fixtures`                                    | schema、taxonomy、policyの異常系fixtureが期待した層で失敗することを確認します          |
| Quiz concept pivot           | 内製クイズへのコンセプト転換                             | `docs/adr/0004-quiz-concept-pivot.md`                               | 外部機関試験対策からポートフォリオ理解用クイズへ転換した理由と履歴上の根拠を説明します |
| Raw quiz data                | クイズ問題の正本                                         | `data/raw/quiz-questions.json`                                      | 16問のクイズ問題を内部管理用metadata付きで管理します                                   |
| Subject taxonomy             | クイズ分類体系の正本                                     | `data/raw/subject-taxonomy.json`                                    | 出題領域、カテゴリ、サブカテゴリを管理します                                           |
| Public data projection       | Public quiz JSON generation                              | `bun run prepare:public-quiz-data`                                  | raw quiz dataからUI用の公開JSONを生成します                                            |
| Public data freshness        | Public quiz JSON freshness check                         | `bun run prepare:public-quiz-data:check`                            | `public/study-it/quiz_data.json` がraw dataと同期していることを確認します              |
| Quiz quality report          | Quiz quality report generation                           | `bun run quiz:report`                                               | クイズ問題数、分類、難易度、source、review状態を集計します                             |
| Quiz report freshness        | Generated quiz report is up to date                      | `bun run quiz:report:check`                                         | `reports/quiz-quality-report.md` の更新漏れを検出します                                |
| Quality report               | Learning data quality report generation                  | `reports/quality-report.md`                                         | learning data側の品質集計結果を示します                                                |
| Report freshness             | Generated quality report is up to date                   | `bun run report:check`                                              | `reports/quality-report.md` の更新漏れを検出します                                     |
| Dependency reproducibility   | Dependency policy validation                             | `bun run validate:dependencies`                                     | `latest` 指定回避、lockfile、依存関係方針を確認します                                  |
| Lockfile reproducibility     | Frozen install                                           | `bun install --frozen-lockfile`                                     | localとCIで同じ依存解決を再現します                                                    |
| Public safety                | Repository safety check                                  | `bun run validate:public-safety`                                    | secret-like text、private情報、不要な生成物の混入を検出します                          |
| Security baseline            | Security baseline check                                  | `bun run validate:security-baseline`                                | 静的配信時の最低限のsecurity headerなどを確認します                                    |
| Performance baseline         | Performance baseline check                               | `bun run validate:performance-baseline`                             | file-size budgetなど、決定的に扱いやすい性能基準を確認します                           |
| Frontend UI                  | React / Vite quiz app                                    | `src/client/`                                                       | 公開用JSONを読み込み、4択クイズUIを表示します                                          |
| Frontend build               | React / Vite production build                            | `bun run client:build`                                              | `dist/app` を生成します                                                                |
| E2E testing                  | Playwright smoke test                                    | `bun run test:e2e`                                                  | クイズ表示、回答、正誤フィードバック、結果画面、再実行を確認します                     |
| E2E selector quality         | Stable locator strategy                                  | `e2e/quiz-smoke.e2e.ts`                                             | text部分一致に依存しすぎず、roleやtest idを使って主要導線を検査します                  |
| CI quality gate              | Full local / remote quality gate                         | `CI=1 bun run check`                                                | 型検査、validation、test、build、baseline、E2Eを統合して確認します                     |
| GitHub Actions               | Remote quality gate                                      | `.github/workflows/quality-gate.yml`                                | remote CIで完全品質ゲートを再現します                                                  |
| Deployment build             | Cloudflare Pages build                                   | `bun run pages:build`                                               | Cloudflare Pages向けに `dist/app` を生成します                                         |
| Deployment target            | Cloudflare Pages responsibility split                    | `docs/deployment/remote-ci-cd.md`                                   | GitHub ActionsとCloudflare Pagesの責務分離を説明します                                 |
| Lighthouse site observation  | Static report site Lighthouse check                      | `bun run lighthouse:site:check`                                     | `dist/site` を対象にLighthouse warn-only補助観測を行います                             |
| Lighthouse app observation   | Quiz app Lighthouse check                                | `bun run lighthouse:app:check`                                      | `dist/app` を対象にクイズアプリ本体のブラウザ品質を補助観測します                      |
| Lighthouse policy            | Warn-only operation                                      | `docs/lighthouse-ci.md`                                             | Lighthouseを必須品質ゲートではなく改善候補把握用として扱う理由を説明します             |
| Architecture                 | Architecture documentation                               | `docs/architecture/architecture.md`                                 | クイズアプリ、データ境界、検証パイプライン、CI/CDの構成を説明します                    |
| Acceptance criteria          | Acceptance criteria documentation                        | `docs/acceptance-criteria.md`                                       | v0.1.0の受け入れ条件と未対応範囲を説明します                                           |
| Quiz validation policy       | Quiz schema / taxonomy / policy validation documentation | `docs/quiz-schema-taxonomy-validation.md`                           | クイズデータ検証方針を説明します                                                       |
| Dependency / tsconfig policy | Dependency and TypeScript configuration policy           | `docs/dependency-and-tsconfig-policy.md`                            | 依存関係、lockfile、TypeScript設定分離の方針を説明します                               |
| Portfolio readiness          | Readiness report                                         | `reports/portfolio-readiness.md`                                    | 提出前の到達点、制約、改善余地を整理します                                             |
| Interview explanation        | Quiz app technical explanation memo                      | `docs/interview/quiz-app-explanation.md`                            | 面接・レビュー時にクイズアプリの設計意図を説明するための資料です                       |
| LLM-assisted development     | LLM活用範囲と本人の検証責任                              | `docs/llm-assisted-development.md`                                  | LLMをどの範囲で活用し、どの品質確認を本人が担保したかを説明します                      |
| Git workflow evidence        | Commit history and staged changes                        | `git log`, `git diff`, `git status`                                 | 変更単位、差分確認、履歴上の設計転換を確認します                                       |



## 4. 必須品質ゲート

本リポジトリの中心となる品質ゲートは以下です。

```bash
CI=1 bun run check
```

この品質ゲートには、主に以下が含まれます。

- TypeScript typecheck
- client typecheck
- Bun unit tests
- learning data schema validation
- source policy validation
- quiz schema validation
- quiz taxonomy validation
- quiz policy validation
- quiz fixture responsibility validation
- quiz quality report freshness check
- public quiz data freshness check
- dependency policy validation
- public repository safety check
- quality report freshness check
- static site check
- client production build
- security baseline check
- performance baseline check
- Playwright E2E smoke test

このコマンドをlocalとGitHub Actionsの両方で実行できるようにすることで、品質確認の再現性を高めています。

---

## 5. 補助的な品質観測

Lighthouse CIは、必須品質ゲートではなくwarn-onlyの補助観測として扱います。

| Command                         | Target      | Output                      |
| ------------------------------- | ----------- | --------------------------- |
| `bun run lighthouse:site:check` | `dist/site` | `.lighthouseci/reports`     |
| `bun run lighthouse:app:check`  | `dist/app`  | `.lighthouseci/app-reports` |


Lighthouse scoreはCI環境の負荷や実行タイミングの影響を受けるため、現時点ではmerge blockには使いません。
一方で、主成果物であるクイズアプリ本体のperformance、accessibility、best practices、SEOの改善候補を把握する補助指標として有効です。

---

## 6. デプロイ責務

本リポジトリでは、GitHub ActionsとCloudflare Pagesの責務を分けています。

| 領域             | 役割                                                        |
| ---------------- | ----------------------------------------------------------- |
| GitHub Actions   | `CI=1 bun run check` による完全品質ゲート                   |
| Cloudflare Pages | `bun run pages:build` によるdeployment-safe buildと静的配信 |
| Lighthouse CI    | 必須ゲート外のwarn-only補助観測                             |


Cloudflare Pagesでは、Playwright E2Eや完全なvalidation suiteを実行しません。
これらはGitHub Actions側で完了させ、Cloudflare Pagesは `dist/app` の生成と配信に責務を限定します。

---

## 7. 成果物の解釈

このポートフォリオの評価対象は以下です。

- 変更を安全に検証できること
- データ構造をschemaで管理できること
- taxonomyとpolicyを分けて検証できること
- 異常系fixtureを用意できること
- 生成物の鮮度を検出できること
- public dataとinternal metadataを分離できること
- E2Eで主要導線を確認できること
- localとCIで同じ品質ゲートを再現できること
- deploymentとquality gateの責務を分けられること
- LLM使用時も検証責任を本人が担保できること

そのため、成果物を見る際は、React / Vite UIだけでなく、[data/](/data/)、[src/application/](/src/application/)、[src/schemas/](/src/schemas/)、[tests/](/tests/)、[e2e/](/e2e/)、[reports/](/reports/)、[docs/](/docs/)、[.github/workflows/](/.github/workflows/) を合わせて確認することを想定しています。

---

## 8. 現在の制約

現在の制約は以下です。

- learning data側の外部URLについて、到達可能性の自動検査はまだ実装していません。
- learning data側の外部sourceについて、参照元の鮮度や更新状況の自動検査はまだ実装していません。
- 参照内容そのものの事実正確性は、自動検証の対象にしていません。
- quiz dataのsourceはrepo内部pathを前提としていますが、repo内部pathの存在確認や参照先内容との意味的整合性までは完全には検査していません。
- Playwright E2Eは主要導線のsmoke testに限定しており、網羅的なブラウザ・端末・アクセシビリティ検証はまだ実装していません。
- Lighthouse CIはwarn-onlyの補助観測であり、必須品質ゲートには含めていません。
- security / performance baselineは実装済みですが、本格的な継続監視、アラート通知、real user monitoring、production-grade observabilityはまだ実装していません。
- Cloudflare Pages向けbuildは整備済みですが、デプロイ後の継続的なsynthetic monitoringや自動復旧運用はまだ実装していません。
- public repository safety checkは導入済みですが、専用ツールによるfull secret scanning engineの代替にはなりません。

---

## 9. まとめ

このEvidence Matrixは、`qa-sre-learning-mvp` の各成果物が、どの評価観点に対応しているかを整理するための文書です。

本ポートフォリオでは、React / ViteのクイズUIだけでなく、データ品質、検証責務の分離、生成物鮮度確認、E2E、CI/CD、Cloudflare Pagesデプロイ、Lighthouse補助観測、公開安全性、LLM活用時の検証責任を含めて評価されることを想定しています。

特に、`CI=1 bun run check` を中心とする必須品質ゲートにより、localとremote CIで同じ検査を再現できることを重視しています。
この構成により、QA/SRE志向のポートフォリオとして、変更を安全に確認し、失敗を切り分け、説明可能な形で成果物を提示できます。
