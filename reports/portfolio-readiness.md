# ポートフォリオ提出準備レポート

`reports/portfolio-readiness.md`

## 1. 目的

このレポートは、`qa-sre-learning-mvp` が QA/SRE 志向のポートフォリオMVPとして提示可能な状態にあるかを評価するものである。

このリポジトリは、単なるクイズUIではなく、以下を統合した小型MVPである。

* ポートフォリオ理解用クイズアプリ
* raw dataを正本とするデータ品質管理
* schema / taxonomy / policy validation
* 異常系fixtureによる検証層の責務確認
* 公開用クイズデータ生成
* クイズ品質レポート生成
* React / Viteによるクライアントビルド
* PlaywrightによるE2E smoke test
* 依存関係の再現性確認
* 公開リポジトリ向け安全性チェック
* security / performance baseline
* GitHub Actionsによる品質ゲート
* Cloudflare Pagesへのデプロイ
* README、docs、reportsによる説明可能性の担保

本プロジェクトの主目的は、大規模な本番サービスを構築することではない。
むしろ、小さな題材に対して、品質保証・自動検証・生成物同期・デプロイ・ドキュメント化の一連の流れを再現可能に示すことである。

---

## 2. 要約

現在の提出準備状況:

```text
状態: ポートフォリオMVPのリリース候補として提示可能
```

このリポジトリは、以下のコマンドがlocalとCIの両方で成功する場合、QA/SRE志向の小型ポートフォリオMVPとして提示可能である。

```bash
CI=1 bun run check
```

現在の実装は、以下の2系統の品質パイプラインを示している。

### 2.1 クイズアプリ・クイズデータパイプライン

```text
data/raw/quiz-questions.json
  -> schema validation
  -> taxonomy validation
  -> policy validation
  -> fixture responsibility validation
  -> quiz quality report generation
  -> public quiz data generation
  -> public/study-it/quiz_data.json
  -> React / Vite quiz UI
  -> client production build
  -> Playwright E2E smoke test
  -> GitHub Actions quality gate
  -> Cloudflare Pages deployment
```

### 2.2 学習データ・品質レポートパイプライン

```text
data/raw/learning-items.json
  -> schema validation
  -> source policy validation
  -> negative fixture tests
  -> quality report generation
  -> report freshness check
  -> static site generation
  -> security / performance baseline
  -> GitHub Actions quality gate
```

---

## 3. 現在の到達点

### 3.1 クイズ問題コンセプト

実装状態:

```text
実装済み
```

現在のクイズは、外部機関の公式問題、過去問、実問再現、認定試験対策を目的としない。
本リポジトリのREADME、docs、reports、source code、CI/CD構成を題材として、ポートフォリオ成果物の設計意図、技術スタック、品質保証メカニズムを理解するための内製クイズである。

現在のクイズ構成:

```text
総問題数: 16問
主目的: ポートフォリオ理解用の内製クイズ
source方針: repository内部pathを根拠として扱う
publisher: qa-sre-learning-mvp
```

主な出題領域:

* プロジェクト概要
* データ品質パイプライン
* schema validation / taxonomy validation
* policy validation
* 品質ゲートとCI
* React / ViteクイズUI
* Cloudflare Pagesデプロイ
* ドキュメントと説明設計
* Git運用

エビデンス:

| ファイル・項目                                   | エビデンスとなる理由                                                                                   |
| ----------------------------------------- | -------------------------------------------------------------------------------------------- |
| `data/raw/quiz-questions.json`            | 16問のクイズ問題本体を保持する正本データであり、問題文、選択肢、正答、解説、source、review、legal metadataの実装状況を確認できるため。            |
| `data/raw/subject-taxonomy.json`          | クイズ問題を分類するためのcategory、sub_category、sub_sub_categoryの正本であり、今回のポートフォリオ理解用taxonomyへの移行を確認できるため。 |
| `reports/quiz-quality-report.md`          | 問題数、track分布、category分布、publisher分布、taxonomy coverageなどを集計しており、新しい16問構成が生成物に反映されているか確認できるため。  |
| `public/study-it/quiz_data.json`          | React / ViteクイズUIが実行時に読み込む公開用JSONであり、raw dataからUI用データへ変換できていることを確認できるため。                     |
| `docs/quiz-schema-taxonomy-validation.md` | クイズデータ検証方針、taxonomy設計、policy validationの目的を説明する文書であり、コンセプトピボット後の設計意図を確認できるため。                |

検証コマンド:

```bash
bun run validate:quiz
bun run validate:quiz-policy
bun run validate:quiz-fixtures
bun run quiz:report:check
bun run prepare:public-quiz-data:check
```

---

## 4. 実装済み機能

### 4.1 クイズUI

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                          | エビデンスとなる理由                                                              |
| -------------------------------- | ----------------------------------------------------------------------- |
| `src/client/`                    | React / ViteによるクイズUIの実装ディレクトリであり、問題表示、回答操作、フィードバック、結果画面などのUI処理を確認できるため。 |
| `public/study-it/quiz_data.json` | UIが実行時に読み込む公開用クイズデータであり、画面表示に必要な問題データが生成されていることを確認できるため。                |
| `e2e/quiz-smoke.e2e.ts`          | Playwrightによるブラウザ操作テストであり、ユーザー視点でクイズの主要操作フローが動作することを確認できるため。            |

検証コマンド:

```bash
bun run client:typecheck
bun run client:build
bun run test:e2e
```

現在のクイズUIでは、以下を確認できる。

* 公開用JSONの読み込み
* 問題表示
* 4択回答
* 正誤フィードバック
* 解説表示
* 次問題への遷移
* 結果画面
* 正答率表示
* カテゴリ別スコア
* 再実行

Playwright E2Eでは、特定の問題文や固定文言に過度に依存せず、主要なユーザー操作フローを検証する。

---

### 4.2 クイズデータschema validation

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                                  | エビデンスとなる理由                                                                                            |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `src/schemas/quiz-question.schema.ts`    | クイズ問題のZod schemaを定義しており、id、track、category、question、options、answer、source、legal、reviewなどの必須構造を確認できるため。 |
| `src/schemas/subject-taxonomy.schema.ts` | taxonomy側のschemaを定義しており、category keyやsub_category構造が検証可能であることを確認できるため。                                |
| `src/cli/validate-quiz-data.ts`          | クイズデータ検証を実行するCLIであり、schema validationとtaxonomy validationをコマンドとして再現できることを確認できるため。                     |
| `data/raw/quiz-questions.json`           | schema validationの入力データであり、実際の16問が定義済みschemaに適合しているか確認する対象となるため。                                      |

検証コマンド:

```bash
bun run validate:quiz
```

この検査により、`data/raw/quiz-questions.json` が期待されるクイズ問題schemaに従っていることを確認する。

主な検証対象:

* `id`
* `track`
* `category`
* `sub_category`
* `sub_sub_category`
* `difficulty`
* `question`
* `options`
* `answer`
* `explanation`
* `source`
* `legal`
* `review`
* `tags`

---

### 4.3 taxonomy validation

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                                     | エビデンスとなる理由                                                                |
| ------------------------------------------- | ------------------------------------------------------------------------- |
| `data/raw/subject-taxonomy.json`            | category、sub_category、sub_sub_categoryの正本であり、クイズ分類が何に従うべきかを確認できるため。       |
| `src/application/validate-quiz-taxonomy.ts` | クイズ問題の分類がtaxonomy正本と整合するかを検証するアプリケーションロジックであり、分類不整合の検出機能を確認できるため。         |
| `tests/validate-quiz-taxonomy.test.ts`      | taxonomy validationの正常系・異常系を確認するテストであり、未知のsub_categoryなどを検出できることを確認できるため。 |

検証コマンド:

```bash
bun run validate:quiz
```

taxonomy validationでは、クイズ問題の分類が `data/raw/subject-taxonomy.json` の正本と整合していることを確認する。

主な検証対象:

* `category`
* `sub_category`
* `sub_sub_category`
* `id` のcategory prefix

現在のtaxonomyは、ポートフォリオ理解用に再構成されている。

* `project_overview`
* `data_quality_pipeline`
* `schema_taxonomy_validation`
* `policy_validation`
* `quality_gate_ci`
* `frontend_quiz_ui`
* `deployment_cloudflare_pages`
* `documentation_workflow`
* `git_workflow`

---

### 4.4 quiz policy validation

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                                            | エビデンスとなる理由                                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `src/application/validate-quiz-policy.ts`          | source、publisher、review状態、外部試験問題参照、公式性誤認、secret-like textなどを検査する中心ロジックであり、policy validationの実体を確認できるため。 |
| `src/cli/validate-quiz-policy.ts`                  | policy validationをCLIとして実行する入口であり、localやCIから同じ検証を再現できることを確認できるため。                                       |
| `tests/validate-quiz-policy.test.ts`               | policy validationの正常系と異常系を検証するテストであり、想定したpolicy違反が検出されることを確認できるため。                                      |
| `data/fixtures/policy-invalid-quiz-questions.json` | schema / taxonomyは通過しつつpolicyで失敗すべき異常系データであり、policy validationの検出責務を確認できるため。                            |

検証コマンド:

```bash
bun run validate:quiz-policy
```

quiz policy validationは、schema validationやtaxonomy validationでは検出できない、公開ポートフォリオとしての安全性と運用方針を確認する。

主な検証観点:

* sourceがrepo内部pathであること
* publisherが `qa-sre-learning-mvp` であること
* 問題内容が本ポートフォリオの範囲に収まること
* review済みであること
* 外部公式問題の再現ではないこと
* 第三者資料の丸写しではないこと
* 公式認定・提携・後援などを示唆しないこと
* token、password、private key等、機密情報を示唆する文字列を含まないこと

この検証は法的助言の代替ではなく、公開前の安全確認と品質保証のためのガードである。

---

### 4.5 異常系fixture coverage

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                                            | エビデンスとなる理由                                                                                     |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `data/fixtures/invalid-quiz-schema.json`           | schema validationで失敗すべき構造不正データであり、schema層が不正なJSON構造を拒否できることを確認できるため。                           |
| `data/fixtures/invalid-quiz-taxonomy.json`         | schema validationは通過し、taxonomy validationで失敗すべきデータであり、分類不整合をtaxonomy層で検出できることを確認できるため。         |
| `data/fixtures/policy-invalid-quiz-questions.json` | schema / taxonomy validationは通過し、policy validationで失敗すべきデータであり、公開方針違反をpolicy層で検出できることを確認できるため。 |
| `src/cli/validate-quiz-fixtures.ts`                | 各fixtureが期待した検証層で失敗するかをまとめて確認するCLIであり、fixture責務分離の検証を再現できるため。                                  |
| `tests/invalid-quiz-schema-fixture.test.ts`        | schema-invalid fixtureが想定通りschemaで失敗することを確認するテストであるため。                                         |
| `tests/invalid-quiz-taxonomy-fixture.test.ts`      | taxonomy-invalid fixtureがschemaを通過し、taxonomyで失敗することを確認するテストであるため。                              |
| `tests/validate-quiz-policy.test.ts`               | policy-invalid fixtureがschema / taxonomyを通過し、policyで失敗することを確認するテストであるため。                       |

検証コマンド:

```bash
bun run validate:quiz-fixtures
```

fixture responsibility validationでは、異常系fixtureが想定した検証層で失敗することを確認する。

| Fixture                              | 期待される挙動                                                 |
| ------------------------------------ | ------------------------------------------------------- |
| `invalid-quiz-schema.json`           | schema validationで失敗する                                  |
| `invalid-quiz-taxonomy.json`         | schema validationは通過し、taxonomy validationで失敗する          |
| `policy-invalid-quiz-questions.json` | schema / taxonomy validationは通過し、policy validationで失敗する |

この機能により、検証層の責務が混ざっていないことを確認できる。

---

### 4.6 公開用クイズデータ生成

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                               | エビデンスとなる理由                                                             |
| ------------------------------------- | ---------------------------------------------------------------------- |
| `src/cli/prepare-public-quiz-data.ts` | raw quiz dataからUI用のpublic JSONを生成するCLIであり、内部データから公開用データへの変換処理を確認できるため。 |
| `public/study-it/quiz_data.json`      | 実際に生成された公開用JSONであり、React / ViteクイズUIが読み込むデータが存在することを確認できるため。           |

生成コマンド:

```bash
bun run prepare:public-quiz-data
```

鮮度確認:

```bash
bun run prepare:public-quiz-data:check
```

`public/study-it/quiz_data.json` は、React / ViteクイズUIが実行時に読み込む公開用JSONである。
このファイルは `data/raw/quiz-questions.json` から生成される。

public JSONには、UI表示とクイズ実行に必要な情報のみを含める。
`legal` と `review` は内部品質管理用metadataであり、public JSONには含めない。

---

### 4.7 クイズ品質レポート生成

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                           | エビデンスとなる理由                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------- |
| `src/cli/generate-quiz-report.ts` | クイズデータの集計レポートを生成するCLIであり、問題数、分類分布、policy issue、taxonomy coverageなどを算出する処理を確認できるため。 |
| `reports/quiz-quality-report.md`  | 生成済みのクイズ品質レポートであり、現在の16問構成や新taxonomyの反映状況を確認できるため。                                 |

生成コマンド:

```bash
bun run quiz:report
```

鮮度確認:

```bash
bun run quiz:report:check
```

`reports/quiz-quality-report.md` では、主に以下を確認する。

* 総問題数
* taxonomy issue count
* policy issue count
* track distribution
* category distribution
* difficulty distribution
* source publisher distribution
* review status distribution
* legal flag summary
* taxonomy coverage

`quiz:report:check` により、クイズデータを変更したにもかかわらず品質レポートが更新されていない状態を検出できる。

---

### 4.8 学習データschema validation

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                               | エビデンスとなる理由                                                     |
| ------------------------------------- | -------------------------------------------------------------- |
| `src/schemas/learning-item.schema.ts` | learning itemのZod schemaを定義しており、学習データの構造検証ルールを確認できるため。         |
| `src/cli/validate-data.ts`            | 学習データschema validationを実行するCLIであり、検証をlocalとCIで再現できることを確認できるため。 |
| `data/raw/learning-items.json`        | 学習データの正本であり、schema validationの対象となる実データを確認できるため。               |

検証コマンド:

```bash
bun run validate:data
```

この検査により、`data/raw/learning-items.json` が期待されるlearning item schemaに従っていることを確認する。

---

### 4.9 source policy validation

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                                     | エビデンスとなる理由                                                                                         |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/application/validate-source-policy.ts` | learning dataに対するsource URL、tag、categoryなどのpolicy ruleを実装しており、schema validationを超えた検証ロジックを確認できるため。 |
| `src/cli/validate-policy.ts`                | source policy validationをCLIとして実行する入口であり、localとCIで同じ検証を再現できることを確認できるため。                            |
| `tests/validate-source-policy.test.ts`      | source policyの正常系・異常系を確認するテストであり、HTTPS URL制約やtag整合性などを検出できることを確認できるため。                             |

検証コマンド:

```bash
bun run validate:policy
```

source policyは、learning dataに対して、基本的なschema validationを超えたプロジェクト固有のルールを検査する。

例:

* `original-note` 以外のsourceには `sourceUrl` が必要である
* source URLはHTTPSでなければならない
* IDはcategory prefixで始まるべきである
* tagsに重複を含めてはならない
* tagsにはitemのcategoryを含めるべきである

この検証は、quiz data側のrepo内部source path方針とは別系統である。
quiz dataではrepo内部pathをsourceとして扱い、learning dataでは外部source URLのHTTPS制約を扱う。

---

### 4.10 品質レポート生成

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                                   | エビデンスとなる理由                                                        |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `src/application/build-quality-report.ts` | 学習データ品質レポートの内容を構築するアプリケーションロジックであり、集計処理や出力項目の定義を確認できるため。          |
| `src/cli/generate-report.ts`              | 品質レポートをCLIから生成する入口であり、localやCIで同じレポート生成処理を再現できるため。                |
| `reports/quality-report.md`               | 生成済みの品質レポートであり、学習データの状態、source policy、分類分布などの集計結果を確認できるため。        |
| `tests/build-quality-report.test.ts`      | 品質レポート生成ロジックのテストであり、正常な集計やpolicy violationの記録が期待通り動作することを確認できるため。 |

生成コマンド:

```bash
bun run report
```

鮮度確認:

```bash
bun run report:check
```

生成されるレポートには以下が含まれる。

* summary counts
* quality gate status
* validation scope
* limitations
* data source summary
* source URL domain counts
* category counts
* difficulty counts
* source type counts
* tag counts
* source policy violations

---

### 4.11 依存関係の再現性

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                              | エビデンスとなる理由                                                       |
| ------------------------------------ | ---------------------------------------------------------------- |
| `package.json`                       | project scriptsとdependenciesを定義しており、依存関係と品質ゲート実行コマンドの起点を確認できるため。 |
| `bun.lock`                           | 依存関係の解決結果を固定するlockfileであり、CI環境で同じ依存関係を再現できることを確認できるため。           |
| `src/cli/check-dependency-policy.ts` | `"latest"` のような不安定な依存指定を検出するCLIであり、依存関係の管理方針を自動検証できることを確認できるため。  |

期待する確認:

```bash
bun install --frozen-lockfile
bun run validate:dependencies
```

この検査により、依存関係のversionが管理され、CI環境でinstallを再現できることを確認する。

このリポジトリでは、以下のような依存関係指定を避ける。

```text
"latest"
```

---

### 4.12 公開安全性チェック

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                          | エビデンスとなる理由                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| `scripts/check-public-safety.sh` | `.env`、秘密鍵、証明書、不要なbundleなど、公開リポジトリに含めるべきでないファイルを検出するshell scriptであるため。             |
| `package.json`                   | `validate:public-safety` scriptを定義しており、public safety checkを品質ゲートへ統合していることを確認できるため。 |

検証コマンド:

```bash
bun run validate:public-safety
```

この検査は、public repositoryにcommitすべきでないファイルや文字列を検出する。

例:

* `.env`
* `.env.*`
* private key files
* certificate files
* local editor profile files
* unintended bundle files
* secret-like strings

---

### 4.13 security / performance baseline

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                                 | エビデンスとなる理由                                                              |
| --------------------------------------- | ----------------------------------------------------------------------- |
| `site/static/_headers`                  | 静的サイトに付与するsecurity headersを定義するファイルであり、公開時の最低限のheader方針を確認できるため。        |
| `src/cli/check-security-baseline.ts`    | security baselineを検査するCLIであり、必要なheadersが生成物に含まれているかを自動確認できるため。          |
| `src/cli/check-performance-baseline.ts` | performance baselineを検査するCLIであり、静的生成物がfile-size budget内に収まるかを自動確認できるため。 |

検証コマンド:

```bash
bun run validate:security-baseline
bun run validate:performance-baseline
```

このbaselineでは、静的サイトにsecurity headersが含まれていること、および生成物が簡易的なfile-size budget内に収まっていることを検査する。

---

### 4.14 統合品質ゲート

実装状態:

```text
実装済み
```

主要コマンド:

```bash
CI=1 bun run check
```

統合品質ゲートには以下が含まれる。

* TypeScript typecheck
* client typecheck
* Bun unit tests
* learning data schema validation
* source policy validation
* quiz schema validation
* quiz taxonomy validation
* quiz policy validation
* quiz fixture responsibility validation
* quiz report freshness check
* public quiz data freshness check
* dependency policy validation
* public safety check
* quality report freshness check
* static site build check
* client production build
* security baseline check
* performance baseline check
* Playwright E2E smoke test

---

### 4.15 GitHub Actions品質ゲート

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                              | エビデンスとなる理由                                                                                      |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `.github/workflows/quality-gate.yml` | GitHub Actions上で品質ゲートを実行するworkflow定義であり、localの `CI=1 bun run check` をremote CIで再現する仕組みを確認できるため。 |

CI workflow:

```text
repositoryをcheckoutする
  -> Bunをセットアップする
  -> bun install --frozen-lockfile を実行する
  -> CI=1 bun run check を実行する
  -> 必要に応じてartifactをuploadする
```

GitHub Actions品質ゲートは、local checksがCI上でも再現できることを検証する。

---

### 4.16 Cloudflare Pagesデプロイ

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                                                               | エビデンスとなる理由                                                               |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `Cloudflare Pages deployment`                                         | 本リポジトリがCloudflare Pages上で静的アプリとして公開可能であることを示す運用上の証跡であるため。                |
| `Production branch: main`                                             | main branchを本番デプロイ対象として扱う運用方針を示しており、main branchの安定性を品質ゲートで保つ必要性を確認できるため。 |
| `Build command: bun install --frozen-lockfile && bun run pages:build` | Cloudflare Pages上で依存関係を再現し、デプロイ用buildを実行する手順を示しているため。                    |
| `Build output directory: dist/app`                                    | Cloudflare Pagesが公開する静的成果物の出力先を示しており、client buildとデプロイ対象の対応を確認できるため。     |

本番URL:

```text
https://qa-sre-learning-mvp.pages.dev/
```

検証コマンド:

```bash
bun run pages:build
```

Cloudflare Pagesでは、完全品質ゲートではなく、デプロイ用buildと静的配信に責務を限定する。
完全な品質確認は、GitHub Actionsの `CI=1 bun run check` で行う。

---

### 4.17 Lighthouse CIの警告運用

実装状態:

```text
補助検査として実装済み
```

エビデンス:

| ファイル・項目                                 | エビデンスとなる理由                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------- |
| `lighthouserc.json`                     | Lighthouse CIの測定対象、閾値、実行条件を定義する設定ファイルであり、品質観測の方針を確認できるため。                             |
| `.github/workflows/lighthouse-warn.yml` | Lighthouse CIをGitHub Actions上でwarn-onlyとして実行するworkflowであり、必須ゲートとは分離した補助検査の運用を確認できるため。 |
| `docs/lighthouse-ci.md`                 | Lighthouse CIの位置づけ、required gateに含めない理由、確認方法を説明する文書であり、運用判断の根拠を確認できるため。               |

検証コマンド:

```bash
bun run lighthouse:check
```

Lighthouse CIは、現時点では必須品質ゲートには含めず、warn-onlyの補助検査として運用する。

この検査では、静的生成物を対象に、performance、accessibility、best-practices、SEOのcategory scoreを観測する。

---

### 4.18 ドキュメント

実装状態:

```text
実装済み
```

エビデンス:

| ファイル・項目                                   | エビデンスとなる理由                                                            |
| ----------------------------------------- | --------------------------------------------------------------------- |
| `README.md`                               | プロジェクト概要、技術構成、品質ゲート、デプロイ、主要ドキュメントへの導線を示す入口文書であるため。                    |
| `docs/architecture/architechture.md`      | データ境界、検証層、品質ゲート、デプロイ責務を説明する設計文書であり、アーキテクチャ判断を確認できるため。                 |
| `docs/acceptance-criteria.md`             | MVPとして何を満たせば受け入れ可能かを定義する文書であり、完了条件を確認できるため。                           |
| `docs/quiz-schema-taxonomy-validation.md` | クイズデータのschema、taxonomy、policy validation方針を説明する文書であり、検証設計の理由を確認できるため。 |
| `reports/quality-report.md`               | 学習データ品質とsource policyの結果を示す生成レポートであり、品質状態を確認できるため。                    |
| `reports/quiz-quality-report.md`          | クイズデータの分布と検証結果を示す生成レポートであり、クイズ仕様の到達点を確認できるため。                         |
| `reports/portfolio-readiness.md`          | 本リポジトリがポートフォリオMVPとして提示可能かを評価する文書であり、提出前の説明資料として機能するため。                |

現在のドキュメントは以下を扱う。

* project purpose
* quiz concept
* architecture
* data boundary
* validation layers
* quality gate
* acceptance criteria
* public safety check
* report generation
* deployment responsibility
* known limitations
* interview explanation

---

## 5. 受け入れ基準レビュー

以下の表は、acceptance criteriaに対する現在の準備状況をまとめたものである。

| 領域                       | 状態   | 根拠                                        |
| ------------------------ | ---- | ----------------------------------------- |
| クイズUI                    | Pass | `src/client/`                             |
| 公開用クイズデータ読み込み            | Pass | `public/study-it/quiz_data.json`          |
| クイズデータschema validation  | Pass | `bun run validate:quiz`                   |
| クイズtaxonomy validation   | Pass | `bun run validate:quiz`                   |
| クイズpolicy validation     | Pass | `bun run validate:quiz-policy`            |
| クイズfixture責務検証           | Pass | `bun run validate:quiz-fixtures`          |
| クイズ品質レポート                | Pass | `bun run quiz:report:check`               |
| 公開用クイズデータ鮮度確認            | Pass | `bun run prepare:public-quiz-data:check`  |
| 学習データschema validation   | Pass | `bun run validate:data`                   |
| source policy validation | Pass | `bun run validate:policy`                 |
| 異常系fixture               | Pass | `bun run test:unit`                       |
| unit test                | Pass | `bun run test:unit`                       |
| Playwright E2E           | Pass | `bun run test:e2e`                        |
| 品質レポート生成                 | Pass | `bun run report:check`                    |
| 依存関係の再現性                 | Pass | `bun run validate:dependencies`           |
| 公開安全性                    | Pass | `bun run validate:public-safety`          |
| security baseline        | Pass | `bun run validate:security-baseline`      |
| performance baseline     | Pass | `bun run validate:performance-baseline`   |
| 統合品質ゲート                  | Pass | `CI=1 bun run check`                      |
| GitHub Actions品質ゲート      | Pass | `.github/workflows/quality-gate.yml`      |
| Cloudflare Pages build   | Pass | `bun run pages:build`                     |
| アーキテクチャ文書                | Pass | `docs/architecture/architechture.md`      |
| 受け入れ基準文書                 | Pass | `docs/acceptance-criteria.md`             |
| クイズ検証方針文書                | Pass | `docs/quiz-schema-taxonomy-validation.md` |

---

## 6. local検証コマンド

このリポジトリをポートフォリオ成果物として提示する前に、以下を実行する。

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
bun run validate:dependencies
bun run validate:public-safety
bun run report:check
bun run site:check
bun run client:build
bun run validate:security-baseline
bun run validate:performance-baseline
bun run test:e2e
```

統合実行:

```bash
CI=1 bun run check
```

期待結果:

```text
すべての検査が成功する。
```

---

## 7. CI検証

GitHub Actions workflowは、以下で成功するべきである。

* pull request
* main branch push

workflow名:

```text
quality-gate
```

workflow定義ファイル:

```text
.github/workflows/quality-gate.yml
```

期待結果:

```text
quality-gate: success
```

CI実行では、設定されているartifactが必要に応じてuploadされる。

---

## 8. ポートフォリオ上の価値

このリポジトリは、以下のQA/SRE関連スキルを示す。

### 8.1 QA観点で示せること

* 検証対象を定義できる
* 正常入力と異常入力をtestできる
* schema validation、taxonomy validation、policy validationを分離できる
* negative fixturesを作成できる
* fixture責務を検証できる
* 生成物の更新漏れを検出できる
* UIの主要操作をE2Eで検証できる
* 受け入れ基準を文書化できる

### 8.2 SRE観点で示せること

* 再現可能なquality gateを構築できる
* localとCIで同じ検査を実行できる
* lockfileとfrozen installを利用できる
* 公開リポジトリ向け安全性チェックを実装できる
* security / performance baselineを定義できる
* reportにより運用状態を可視化できる
* GitHub Actionsを自動制御点として利用できる
* Cloudflare Pagesで静的アプリを公開できる

### 8.3 ソフトウェア開発観点で示せること

* TypeScript project structure
* React / Vite frontend
* Zod schema validation
* layer separation
* CLI-based workflows
* testable application logic
* deterministic report generation
* generated artifact freshness check
* Playwright E2E
* explicit documentation
* Git branch and PR workflow

---

## 9. 現時点での制限事項

現在のMVPでは、以下は本格対応していない。

* 複数ユーザー利用
* ログイン機能
* 学習履歴の永続保存
* 本格的な監視機能
* アラート通知
* production-grade observability
* full secret scanning engine
* 外部参照元の自動鮮度確認
* 参照内容そのものの事実確認
* 本格的なアクセシビリティ監査
* デプロイ後の継続的synthetic monitoring

これらの制約は、現段階のMVPでは許容可能である。
現在の目的は、本格運用サービスではなく、QA/SRE志向の検証可能な小型ポートフォリオを示すことである。

---


## 10. 現在の提出判断

現在の判断:

```text
このリポジトリは、ポートフォリオMVPのリリース準備へ進める状態である。
```

理由:

```text
QA/SRE志向の中核的な品質パイプラインが実装済みであり、文書化され、localで再現でき、CIでも検証でき、デプロイ可能なクイズアプリと接続されているため。
```

現時点で、本リポジトリは以下を示すMVPとして扱える。

```text
portfolio-focused quiz data
  -> schema validation
  -> taxonomy validation
  -> policy validation
  -> negative fixtures
  -> quiz quality report
  -> public quiz data generation
  -> React / Vite quiz UI
  -> Playwright E2E
  -> dependency reproducibility
  -> public safety
  -> security / performance baseline
  -> GitHub Actions quality gate
  -> Cloudflare Pages deployment
  -> documentation
```

---

## 11. 今後の課題

1. required quality-gate checksを伴うbranch protectionを検討する。
2. 次フェーズでtaxonomy coverageを改善するため、クイズ問題を20〜24問程度へ拡充する。

---

## 12. v0.1.0 リリース候補チェックリスト

`v0.1.0` をtaggingする前に、以下を確認する。

* [ ] `CI=1 bun run check` がlocalで成功する
* [ ] GitHub Actions `quality-gate` がpull request上で成功する
* [ ] GitHub Actions `quality-gate` が `main` 上で成功する
* [ ] Cloudflare Pages production URLへアクセスできる
* [ ] `reports/quality-report.md` が最新である
* [ ] `reports/quiz-quality-report.md` が最新である
* [ ] `public/study-it/quiz_data.json` が最新である
* [ ] `reports/portfolio-readiness.md` が最新である
* [ ] `docs/architecture/architechture.md` が存在する
* [ ] `docs/acceptance-criteria.md` が存在する
* [ ] `docs/quiz-schema-taxonomy-validation.md` が存在する
* [ ] READMEから主要ドキュメントへ辿れる
* [ ] 公開すべきでないlocal fileが検出されない
* [ ] dependency policy validationが成功する
* [ ] security baselineが成功する
* [ ] performance baselineが成功する
* [ ] main branchに最新の受け入れ済み作業が含まれている