# qa-sre-learning-mvp

[![quality-gate](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/actions/workflows/quality-gate.yml/badge.svg?branch=main)](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/actions/workflows/quality-gate.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.x-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3.x-black.svg)](https://bun.sh/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **一言で説明**: `qa-sre-learning-mvp` は、QA/SRE志向の学習用クイズアプリと品質ゲートを組み合わせた小型ポートフォリオMVPです。
> TypeScript、Bun、Vite、Playwright、Cloudflare Pagesを用いて、データ検証・E2E・品質レポート・本番デプロイまで再現できることを示します。

## 概要

このリポジトリは、大規模なアプリケーションを作ることではなく、小さな学習アプリを題材に、品質保証・自動検証・デプロイ・ドキュメント化の一連の流れを実装することを目的としています。

主な対象は、QA / SRE / フロントエンド基礎 / DevOps学習用の4択クイズです。
クイズデータはpublic JSONとして生成され、アプリ側ではそれを読み込んで出題します。

また、単にUIを作るだけではなく、以下を品質ゲートとして統合しています。

- TypeScript typecheck
- unit test
- schema validation
- taxonomy validation
- policy validation
- negative fixture test
- public quiz data freshness check
- public safety check
- static site build check
- security baseline check
- performance baseline check
- Playwright E2E smoke test

### なぜ作ったのか

このプロジェクトは、未経験からQA / SRE / インフラ寄りのIT職を目指すためのポートフォリオとして作成しました。

特に、以下を示すことを目的としています。

- 小さなMVPを要件に基づいて実装できること
- データ品質をschema / taxonomy / policyで検証できること
- 正常系だけでなく異常系fixtureも用意できること
- localとCIで同じ品質ゲートを再現できること
- Cloudflare Pagesへ公開デプロイできること
- README、docs、reportsにより技術判断を説明できること

---

## ライブデモ

- **Quiz App**: https://qa-sre-learning-mvp.pages.dev
- **Quality Gate**: `.github/workflows/quality-gate.yml`

公開アプリでは、以下を確認できます。

- 13問の4択クイズ
- 正誤フィードバック
- 結果画面
- 正答率表示
- カテゴリ別スコア集計

---

## 主な機能

| 機能                    | 説明                                                           |
| :---------------------- | :------------------------------------------------------------- |
| 4択クイズ               | public JSONから読み込んだ13問のクイズを出題                    |
| 正誤フィードバック      | 回答後に正解・不正解と解説を表示                               |
| 結果画面                | スコア、正答率、カテゴリ別スコアを表示                         |
| クイズデータ検証        | schema / taxonomy / policy validationを実行                    |
| 異常系fixture           | schema違反・taxonomy違反・policy違反の責務を分離して検証       |
| 品質レポート生成        | quiz quality report / portfolio readiness reportを生成         |
| E2E smoke test          | Playwrightで主要なクイズ操作を検証                             |
| Cloudflare Pages deploy | デプロイ用buildと完全品質ゲートを分離                          |
| Dev Container           | Bun / TypeScript / Vite / Playwrightを再現可能な開発環境で実行 |

---

## 技術スタック

| カテゴリ                  | 技術                                     |
| :------------------------ | :--------------------------------------- |
| Runtime / Package Manager | Bun                                      |
| Language                  | TypeScript                               |
| Frontend                  | React / Vite                             |
| Validation                | Zod                                      |
| Unit Test                 | Bun test                                 |
| E2E                       | Playwright                               |
| Static Hosting            | Cloudflare Pages                         |
| CI                        | GitHub Actions                           |
| Development Environment   | VS Code Dev Containers / Docker / Colima |
| Documentation             | Markdown / generated reports             |

---

## アーキテクチャ

```text
data/raw/quiz-questions.json
  -> schema validation
  -> taxonomy validation
  -> policy validation
  -> public quiz data generation
  -> public/study-it/quiz_data.json
  -> React / Vite quiz UI
  -> Playwright E2E smoke test
  -> Cloudflare Pages deployment
```

品質レポート側は、以下の流れで生成します。

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

| Path                             | 役割                                              |
| :------------------------------- | :------------------------------------------------ |
| `src/client/`                    | React / ViteによるクイズUI                        |
| `src/cli/`                       | validation / report / build / baseline check用CLI |
| `src/schemas/`                   | Zod schema定義                                    |
| `data/raw/`                      | 学習データ・クイズデータ                          |
| `data/fixtures/`                 | 異常系検証用fixture                               |
| `public/study-it/quiz_data.json` | 公開用に生成されたクイズJSON                      |
| `reports/`                       | 品質レポート・提出準備レポート・release notes     |
| `docs/`                          | 設計、要件、品質ゲート、面接説明用メモ            |
| `e2e/`                           | Playwright E2E                                    |
| `.devcontainer/`                 | Dev Container設定                                 |
| `.github/workflows/`             | GitHub Actions品質ゲート                          |

---

## はじめ方

### 前提条件

- Bun 1.3.x
- Node.js 22.x
- Git
- Dockerまたは互換コンテナ実行環境
- VS Code Dev Containers拡張機能を使う場合は、Docker DesktopまたはColima等

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

---

## 品質ゲート

完全な品質ゲートは以下で実行します。

```bash
CI=1 bun run check
```

`bun run check` には、主に以下が含まれます。

| 分類        | 内容                                                       |
| :---------- | :--------------------------------------------------------- |
| 型検査      | TypeScript typecheck / client typecheck                    |
| Unit test   | Bun test                                                   |
| データ検証  | data schema validation / source policy validation          |
| クイズ検証  | quiz schema / taxonomy / policy validation                 |
| fixture検証 | schema-invalid / taxonomy-invalid / policy-invalid fixture |
| 生成物検証  | report freshness / public quiz data freshness              |
| 安全性      | dependency policy / public repository safety               |
| Build       | static site build / client production build                |
| Baseline    | security baseline / performance baseline                   |
| E2E         | Playwright smoke test                                      |

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
bun run client:build
CI=1 bunx playwright test e2e/quiz-smoke.e2e.ts --trace on
```

---

## デプロイ

このプロジェクトでは、GitHub ActionsとCloudflare Pagesの責務を分離しています。

```text
GitHub Actions:
  bun run check

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

---

## レポート生成

このプロジェクトでは、品質確認用のレポートを生成します。

| Artifact                          | Purpose                                 |
| :-------------------------------- | :-------------------------------------- |
| `reports/quality-report.md`       | 学習データの品質・source policy検証結果 |
| `reports/quiz-quality-report.md`  | クイズデータの分布・検証結果            |
| `reports/portfolio-readiness.md`  | ポートフォリオ提出準備状況              |
| `reports/release-notes-v0.1.0.md` | `v0.1.0` release notes                  |
| `docs/interview-notes.md`         | 面接説明用の補助資料                    |

レポートを再生成する場合は以下を実行します。

```bash
bun run report
bun run quiz:report
```

---

## Dev Container

このリポジトリには、VS Code Dev Containers向けの開発環境設定を含めています。

Dev Containerを利用すると、Bun、TypeScript、Vite、Playwrightなどの開発環境をコンテナ内で再現できます。
ローカル環境差による不具合を減らし、品質ゲートを安定して実行しやすくすることを目的としています。

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

---

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

---

## 今後の拡張候補

今後は、以下の機能追加・品質向上を検討しています。

- 出題範囲を絞り込む機能
  - 分野、カテゴリ、学習テーマに応じて出題対象を選択できるようにする。

- 問題順のシャッフル機能
  - 固定順に加えて、任意で問題順を並べ替えられるようにする。

- 回答内容の振り返り画面
  - 結果画面から、各問題の選択回答、正答、解説を確認できるようにする。

- クイズデータの拡充
  - QA、SRE、DevOps、TypeScript、Cloudflareなどの学習領域を中心に問題数を増やす。

- アクセシビリティ確認の強化
  - キーボード操作、見出し構造、色によらない情報提示などを追加で検証する。

- Lighthouse CIの運用強化
  - 現在の補助的な確認から、将来的には継続的な品質指標として扱えるようにする。

- 基本的な稼働確認の追加
  - デプロイ後に主要ページへアクセスできることや、公開データが取得できることを確認する。

---

## 現時点での制限事項

現時点では、本プロジェクトは本格運用サービスではなく、ポートフォリオ用の小型MVPとして範囲を限定しています。

- 本格的な監視機能は未実装
  - ログ収集、メトリクス監視、アラート通知などは今後の拡張対象です。

- 本番運用を前提とした監視体制は未整備
  - 障害検知、復旧手順、運用担当者向け通知などは含めていません。

- Lighthouse CIは補助的な確認として運用
  - 現時点では、品質ゲートの必須条件ではなく、追加確認として扱っています。

- 外部参照元の鮮度確認は限定的
  - 参照元資料が最新であるかを自動的に検証する仕組みは未実装です。

- 参照内容の事実確認は限定的
  - 参照元の内容そのものの正確性を自動的に検証する仕組みは含めていません。

- 複数ユーザー利用は未対応
  - ログイン、ユーザー別履歴、権限管理などは実装していません。

- 学習履歴の永続保存は未実装
  - 回答履歴や成績推移をブラウザやデータベースに保存する機能は今後の拡張対象です。

---

## 主要ドキュメント

主要ドキュメントは以下です。

| Document                                  | Purpose                                        |
| :---------------------------------------- | :--------------------------------------------- |
| `docs/architecture/architechture.md`      | アーキテクチャと品質ゲートの説明               |
| `docs/acceptance-criteria.md`             | MVP受け入れ基準                                |
| `docs/interview-notes.md`                 | 面接説明用の補助資料                           |
| `docs/quiz-schema-taxonomy-validation.md` | クイズデータのschema / taxonomy validation方針 |
| `reports/portfolio-readiness.md`          | ポートフォリオ提出準備状況                     |
| `reports/release-notes-v0.1.0.md`         | release notes                                  |

---

## ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開する想定です。

ただし、外部サービス名、技術名、参照元情報、第三者が権利を持つコンテンツは、それぞれの権利者に帰属します。
クイズデータ・学習データに外部資料を参照している場合でも、リポジトリ内には原則として独自作成した要約・メタデータ・検証用データのみを含め、第三者の本文・画像・教材を再配布しない方針です。
