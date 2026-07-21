# qa-sre-learning-mvp

[README.md](README.md)

[![quality-gate](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/actions/workflows/quality-gate.yml/badge.svg?branch=main)](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/actions/workflows/quality-gate.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.x-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3.x-black.svg)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> `qa-sre-learning-mvp` は、QA/SRE志向のポートフォリオ成果物として、クイズアプリ、データ検証、品質ゲート、E2E、レポート生成、Cloudflare Pagesデプロイを小さく統合したMVPです。

## 概要

このリポジトリは、大規模なWebサービスを作ることではなく、小さなクイズアプリを題材に、品質保証・データ検証・自動テスト・デプロイ・ドキュメント化の一連の流れを実装することを目的としています。

クイズの題材は、外部機関の試験問題や公式問題ではありません。
本リポジトリ自体の構成、技術スタック、品質ゲート、データ検証、E2E、デプロイ、ドキュメント設計を理解するための内製クイズです。

現在のクイズは、以下を題材にした16問で構成されています。

- プロジェクト概要
- データ品質パイプライン
- schema validation / taxonomy validation
- policy validation
- 品質ゲートとCI
- React / ViteクイズUI
- Cloudflare Pagesデプロイ
- ドキュメントと説明設計
- Git運用

このプロジェクトでは、単にUIを作るだけでなく、以下を統合品質ゲートとして扱います。

- TypeScript typecheck
- client typecheck
- unit test
- learning data validation
- source policy validation
- quiz schema validation
- quiz taxonomy validation
- quiz policy validation
- negative fixture validation
- quiz quality report freshness check
- public quiz data freshness check
- dependency policy validation
- public repository safety check
- static site build check
- client production build
- security baseline check
- performance baseline check
- Playwright E2E smoke test

## 作成目的

このプロジェクトは、未経験からQA / SRE / インフラ寄りのIT職を目指すためのポートフォリオとして作成しています。

特に、以下を示すことを目的としています。

- 小さなMVPを要件に基づいて実装できること
- データ品質をschema / taxonomy / policyで検証できること
- 正常系だけでなく異常系fixtureも用意できること
- raw dataからpublic dataとreportを再生成できること
- localとCIで同じ品質ゲートを再現できること
- Playwright E2Eで主要なユーザー操作を検証できること
- Cloudflare Pagesへ静的アプリをデプロイできること
- README、docs、reportsにより技術判断を説明できること

## 公開デモ

- **Quiz App**: https://qa-sre-learning-mvp.pages.dev
- **Quality Gate**: .github/workflows/quality-gate.yml

公開アプリでは、以下を確認できます。

- 16問の4択クイズ
- 回答後の正誤フィードバック
- 解説表示
- 結果画面
- スコア表示
- 正答率表示
- カテゴリ別スコア集計
- 「もう一度解く」による再実行

## クイズアプリの位置づけ

このクイズアプリは、本リポジトリのREADME、docs、reports、source code、CI/CD構成を題材として、ポートフォリオ成果物の設計意図と品質保証メカニズムを理解するための独自クイズアプリです。

そのため、クイズデータでは以下を方針としています。

| 方針                      | 内容                                                                                            |
| ------------------------- | ----------------------------------------------------------------------------------------------- |
| 外部試験問題を扱わない    | 公式問題、過去問、実問再現、認定試験対策を題材にしない                                          |
| 根拠をrepo内部に置く      | `README.md`、`docs/`、`reports/`、`src/`、`e2e/`、`package.json` などをsourceとして扱う         |
| raw dataを正本にする      | [data/raw/quiz-questions.json](data/raw/quiz-questions.json) を正本とし、検証と生成の起点にする |
| public dataを生成する     | UI用の [public/study-it/quiz_data.json](public/study-it/quiz_data.json) を生成物として扱う      |
| review metadataを分離する | review / legal metadataは内部検証用として扱い、public JSONには原則として出さない                |
| 品質ゲートで検証する      | schema、taxonomy、policy、fixture、E2Eで変更を検証する                                          |

## 主な機能

| 機能                    | 説明                                                     |
| ----------------------- | -------------------------------------------------------- |
| 4択クイズ               | public JSONから読み込んだ16問のクイズを出題              |
| 正誤フィードバック      | 回答後に正解・不正解と解説を表示                         |
| 結果画面                | スコア、正答率、カテゴリ別スコアを表示                   |
| クイズデータ検証        | schema / taxonomy / policy validationを実行              |
| 異常系fixture           | schema違反・taxonomy違反・policy違反の責務を分離して検証 |
| 品質レポート生成        | quiz quality report / portfolio readiness reportを生成   |
| 生成物鮮度チェック      | reportとpublic quiz dataがraw dataと同期しているか確認   |
| E2E smoke test          | Playwrightで主要なクイズ操作を検証                       |
| Cloudflare Pages deploy | 静的アプリとしてCloudflare Pagesへデプロイ               |
| Public safety check     | 公開リポジトリに含めるべきでないファイルや文字列を検査   |

## 技術構成

| 分類                             | 技術                                     |
| -------------------------------- | ---------------------------------------- |
| Runtime / Package Manager        | Bun                                      |
| Language                         | TypeScript                               |
| Frontend                         | React / Vite                             |
| Validation                       | Zod                                      |
| Unit Test                        | Bun test                                 |
| E2E                              | Playwright                               |
| Static Hosting                   | Cloudflare Pages                         |
| CI                               | GitHub Actions                           |
| Documentation                    | Markdown / generated reports             |
| Optional Development Environment | VS Code Dev Containers / Docker / Colima |

## アーキテクチャ

クイズデータは、raw dataを正本として扱い、検証後にpublic JSONとレポートへ変換します。

```
data/raw/quiz-questions.json
  -> schema validation
  -> taxonomy validation
  -> policy validation
  -> fixture validation
  -> quiz quality report generation
  -> public quiz data generation
  -> public/study-it/quiz_data.json
  -> React / Vite quiz UI
  -> client production build
  -> Playwright E2E smoke test
  -> GitHub Actions quality gate
  -> Cloudflare Pages deployment
```

学習データと静的レポート側は、以下の流れで検証・生成します。

```text
data/raw/learning-items.json
  -> Zod schema validation
  -> source policy validation
  -> negative fixture tests
  -> quality report generation
  -> report freshness check
  -> static site generation
  -> security / performance baseline
  -> GitHub Actions quality gate
```

主要な構成は以下です。

| Path                                                             | 役割                                                                 |
| ---------------------------------------------------------------- | -------------------------------------------------------------------- |
| [src/client/](src/client/)                                       | React / ViteによるクイズUI                                           |
| [src/cli/](src/cli/)                                             | validation / report / build / baseline check用CLI                    |
| [src/schemas/](src/schemas/)                                     | Zod schema定義                                                       |
| [src/application/](src/application/)                             | taxonomy validation、policy validationなどのアプリケーションロジック |
| [data/raw/](data/raw/)                                           | 学習データ・クイズデータの正本                                       |
| [data/fixtures/](data/fixtures/)                                 | 異常系検証用fixture                                                  |
| [public/study-it/quiz_data.json](public/study-it/quiz_data.json) | UIが読み込む公開用クイズJSON                                         |
| [reports/](reports/)                                             | 品質レポート・提出準備レポート・release notes                        |
| [docs/](docs/)                                                   | 設計、要件、品質ゲート、面接説明用メモ                               |
| [e2e/](e2e/)                                                     | Playwright E2E                                                       |
| [.github/workflows/](.github/workflows/)                         | GitHub Actions品質ゲート                                             |
| [.devcontainer/](.devcontainer/)                                 | 任意利用の開発コンテナ設定                                           |

## データ境界

このプロジェクトでは、raw dataとpublic dataを分けています。

| データ                                                           | 役割                   | commit対象 |
| ---------------------------------------------------------------- | ---------------------- | ---------- |
| [data/raw/quiz-questions.json](data/raw/quiz-questions.json)     | クイズ問題の正本       | 対象       |
| [data/raw/subject-taxonomy.json](data/raw/subject-taxonomy.json) | taxonomyの正本         | 対象       |
| [reports/quiz-quality-report.md](reports/quiz-quality-report.md) | クイズ品質レポート     | 対象       |
| [public/study-it/quiz_data.json](public/study-it/quiz_data.json) | UIが読み込む公開用JSON | 対象       |
| [test-results/](test-results/)                                   | Playwright実行結果     | 原則対象外 |
| [dist/](dist/)                                                   | build出力              | 原則対象外 |

`reports/quiz-quality-report.md` と`public/study-it/quiz_data.json`は生成物ですが、品質ゲートで鮮度確認するためcommit対象にしています。

## はじめ方

### 前提条件

- Bun 1.3.x
- Node.js 22.x
- Git
- Playwright E2Eを実行する場合はChromium実行環境
- Dev Containerを利用する場合はDockerまたは互換コンテナ実行環境

### セットアップ

```bash
git clone https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp.git
cd qa-sre-learning-mvp

bun install --frozen-lockfile
bun run prepare:public-quiz-data
bun run client:build
```

### ローカルでクイズアプリを確認する

```bash
bun run client:build
bun run client:preview -- --host 127.0.0.1 --port 4173 --strictPort
```

ブラウザで以下を開きます。

```text
http://127.0.0.1:4173/
```

## 品質ゲート

完全な品質ゲートは以下で実行します。

```bash
CI=1 bun run check
```

`bun run check` には、主に以下が含まれます。

| 分類        | 内容                                                                          |
| ----------- | ----------------------------------------------------------------------------- |
| 型検査      | TypeScript typecheck / client typecheck                                       |
| Unit test   | Bun test                                                                      |
| データ検証  | learning data schema validation / source policy validation                    |
| クイズ検証  | quiz schema / taxonomy / policy validation                                    |
| fixture検証 | schema-invalid / taxonomy-invalid / policy-invalid fixture                    |
| 生成物検証  | quality report freshness / quiz report freshness / public quiz data freshness |
| 安全性      | dependency policy / public repository safety                                  |
| Build       | static site build / client production build                                   |
| Baseline    | security baseline / performance baseline                                      |
| E2E         | Playwright smoke test                                                         |

個別に確認する場合は以下を使います。

```bash
bun run typecheck
bun run client:typecheck
bun run test:unit
bun run validate:data
bun run validate:policy
bun run validate:quiz
bun run validate:quiz-policy
bun run validate:quiz-fixtures
bun run quiz:report:check
bun run prepare:public-quiz-data:check
bun run client:build
CI=1 bunx playwright test e2e/quiz-smoke.e2e.ts --trace on
```

## クイズデータ更新ワークフロー

クイズ問題やtaxonomyを変更した場合は、以下の順序で確認します。

```bash
bun run validate:quiz
bun run validate:quiz-policy
bun run validate:quiz-fixtures

bun run quiz:report
bun run prepare:public-quiz-data

bun run quiz:report:check
bun run prepare:public-quiz-data:check

CI=1 bun run check
```

生成物をcommitする場合は、以下を含めます。

```bash
git add reports/quiz-quality-report.md public/study-it/quiz_data.json
```

## デプロイ

このプロジェクトでは、GitHub ActionsとCloudflare Pagesの責務を分離しています。

```text
GitHub Actions:
  CI=1 bun run check

Cloudflare Pages:
  bun run pages:build
```

`check` はlocal / GitHub Actions向けの完全品質ゲートです。
一方、`pages:build` はCloudflare Pages向けのデプロイ用ビルドであり、Playwright E2Eは含めません。

### Cloudflare Pages設定

```text
Build command:
  bun install --frozen-lockfile && bun run pages:build

Build output directory:
  dist/app

Root directory:
  blank
```

## レポート

このプロジェクトでは、品質確認用のレポートを生成します。

| Artifact                                                                         | Purpose                                 |
| -------------------------------------------------------------------------------- | --------------------------------------- |
| [reports/quality-report.md](reports/quality-report.md)                           | 学習データの品質・source policy検証結果 |
| [reports/quiz-quality-report.md](reports/quiz-quality-report.md)                 | クイズデータの分布・検証結果            |
| [reports/portfolio-readiness.md](reports/portfolio-readiness.md)                 | ポートフォリオ提出準備状況              |
| [reports/release-notes-v0.1.0.md](reports/release-notes-v0.1.0.md)               | `v0.1.0` release notes                  |
| [reports/release-notes-v0.2.0.md](reports/release-notes-v0.2.0.md)               | `v0.2.0` release notes                  |
| [docs/interview/quiz-app-explanation.md](docs/interview/quiz-app-explanation.md) | 面接説明用の補助資料                    |

レポートを再生成する場合は以下を実行します。

```bash
bun run report
bun run quiz:report
```

生成物が最新か確認する場合は以下を実行します。

```bash
bun run report:check
bun run quiz:report:check
```

## Dev Container

このリポジトリには、VS Code Dev Containers向けの開発環境設定を含めています。

Dev Containerは、クイズ問題の分類項目ではなく、開発環境を再現するための補助機能です。
Bun、TypeScript、Vite、Playwrightなどの実行環境をコンテナ内でそろえ、ローカル環境差による不具合を減らすことを目的としています。

### Dev Containerで開く手順

1. Docker DesktopまたはColima等のコンテナ実行環境を用意する。
2. VS CodeにDev Containers拡張機能をインストールする。
3. このリポジトリをVS Codeで開く。
4. コマンドパレットから `Dev Containers: Reopen in Container` を実行する。

### コンテナ内での確認

```bash
bun install --frozen-lockfile
bun run typecheck
bun run client:typecheck
bun run test:unit
bun run client:build
```

### Playwright E2Eを実行する場合

Dev Container内でPlaywright E2Eを実行する場合は、初回のみChromiumをインストールします。

```bash
bunx playwright install chromium
CI=1 bunx playwright test e2e/quiz-smoke.e2e.ts --trace on
```

`Host system is missing dependencies to run browsers` が表示される場合は、`.devcontainer/Dockerfile` にPlaywright Chromium実行用のLinux共有ライブラリが含まれているか確認してください。

## デモ確認フロー

このプロジェクトは、以下の順で確認できます。

```text
1. READMEでプロジェクトの目的を確認する
2. Cloudflare Pages上のクイズUIを開く
3. クイズを1周操作する
4. 結果画面でスコア・正答率・カテゴリ別スコアを確認する
5. reports/portfolio-readiness.md で品質保証の到達点を確認する
6. reports/quiz-quality-report.md でクイズデータの分布と検証結果を確認する
7. GitHub ActionsのQuality Gateでremote CIの成功状態を確認する
```

## コンセプト転換の経緯

(参照：[docs/adr/quiz-concept-pivot.md](docs/adr/quiz-concept-pivot.md))

当初のクイズ問題は、外部技術学習や外部機関試験対策に寄った構成を含んでいました。

その後、公開ポートフォリオとしての説明可能性、第三者教材への依存回避、公式問題再現リスクの低減を考慮し、クイズ問題のコンセプトを本リポジトリ自体の技術スタック・品質ゲート・デプロイ構成を理解するための内製クイズへ転換しました。

commit履歴上は、`078da91` でtaxonomyをポートフォリオ理解用に再構成した段階から転換を開始し、`547b49b` で問題内容、`8a8fe94` でschema / policy validation、`1996995` でテスト・レポート・生成物を同期しました。

その後、README、architecture、validation方針、技術説明メモを更新し、現在の16問・ポートフォリオ理解用クイズとして説明できる状態に整えました。

## 今後の拡張候補

今後は、以下の機能追加・品質向上を検討しています。

- クイズ問題数の拡充
  - 16問から20〜24問程度へ増やし、taxonomy coverageを高める。

- taxonomy coverageの改善
  - `documentation_workflow`、`git_workflow`、`policy_validation`、`quality_gate_ci` の未カバーsub categoryを補う。

- 出題範囲の絞り込み
  - track、category、difficulty単位で出題対象を選択できるようにする。

- 回答内容の振り返り画面
  - 結果画面から、各問題の選択回答、正答、解説を確認できるようにする。

- E2Eの強化
  - 問題数固定や曖昧なtext selectorに依存しない形で、主要操作の回帰検出力を高める。

- レポートの拡張
  - internal source path distribution、policy rule coverage、fixture responsibility summaryを追加する。

- デプロイ後の稼働確認
  - 公開URLへアクセスできること、public quiz dataを取得できることを確認する簡易smoke checkを追加する。

- アクセシビリティ確認の強化
  - キーボード操作、見出し構造、色によらない情報提示などを追加で検証する。

- 本格的な監視機能は未実装
  - ログ収集、メトリクス監視、アラート通知などは今後の拡張対象です。

- 本番運用を前提とした監視体制は未整備
  - 障害検知、復旧手順、運用担当者向け通知などは含めていません。

- 複数ユーザー利用は未対応
  - ログイン、ユーザー別履歴、権限管理などは実装していません。

- 学習履歴の永続保存は未実装
  - 回答履歴や成績推移をブラウザやデータベースに保存する機能は今後の拡張対象です。

- 外部試験問題の再現は対象外
  - このクイズは外部機関の公式問題、過去問、実問再現、認定試験対策を目的としていません。

- 参照元の事実性を自動検証する仕組みは限定的
  - 現在はrepo内部のsource pathとreview metadataを中心に検証しています。

- Lighthouse CIは補助的な確認
  - 現時点では、継続的な品質指標として拡張可能な余地を残しています。

## 主要ドキュメント

主要ドキュメントは以下です。

| Document                                                                                       | Purpose                                                                                                                              |
| ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [docs/architecture.md](docs/architecture.md)`                                                  | アーキテクチャと品質ゲートの説明                                                                                                     |
| [docs/acceptance-criteria.md](docs/acceptance-criteria.md)                                     | MVP受け入れ基準                                                                                                                      |
| [docs/quiz-schema-taxonomy-validation.md](docs/quiz-schema-taxonomy-validation.md)             | クイズデータのschema / taxonomy / policy validation方針                                                                              |
| [docs/llm-assisted-development.md](docs/llm-assisted-development.md)                           | LLMをどの範囲で活用し、どの品質保証を本人が担保したかを説明する文書                                                                  |
| [docs/interview-notes.md](docs/interview-notes.md)                                             | 面接説明用の補助資料                                                                                                                 |
| [reports/quality-report.md](reports/quality-report.md)                                         | 学習データの品質・source policy検証結果                                                                                              |
| [reports/quiz-quality-report.md](reports/quiz-quality-report.md)                               | クイズデータの分布・検証結果                                                                                                         |
| [reports/portfolio-readiness.md](reports/portfolio-readiness.md)                               | ポートフォリオ提出準備状況                                                                                                           |
| [reports/local-reproducibility-check-v0.1.0.md](reports/local-reproducibility-check-v0.1.0.md) | ローカル環境で新規clone後に依存関係install、データ生成、build、品質ゲート、E2E、Lighthouse補助観測が再現できることを確認したレポート |
| [reports/release-notes-v0.1.0.md](reports/release-notes-v0.1.0.md)                             | release notes (v0.1.0)                                                                                                               |
| [reports/release-notes-v0.2.0.md](reports/release-notes-v0.2.0.md)                             | release notes (v0.2.0)                                                                                                               |

## ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開する想定です。
本リポジトリ内のコードおよび独自作成したドキュメントはMIT Licenseの対象です。外部サービス名、技術名、商標、参照元情報、第三者が権利を持つコンテンツは、それぞれの権利者に帰属します。クイズデータは、本リポジトリのREADME、docs、reports、source code、CI/CD構成を題材として独自に作成したものです。外部機関の公式問題、過去問、実問、教材本文、画像等を再配布しない方針です。
