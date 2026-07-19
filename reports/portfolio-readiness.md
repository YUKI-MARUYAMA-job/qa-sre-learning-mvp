# ポートフォリオ提出準備レポート
`reports/portfolio-readiness.md`

## 1. 目的

このレポートは、`qa-sre-learning-mvp` が QA/SRE 志向のポートフォリオMVPとして提示可能な状態にあるかを評価するものである。

このリポジトリは、単なるクイズUIではなく、以下を統合した小型MVPである。

* ポートフォリオ理解用クイズアプリ
* raw dataを正本とするデータ品質管理
* schema / taxonomy / policy validation
* 異常系fixtureによる検証層の責務確認
* public quiz data generation
* quiz quality report generation
* React / Vite client build
* Playwright E2E smoke test
* dependency reproducibility
* public repository safety check
* security / performance baseline
* GitHub Actions quality gate
* Cloudflare Pages deployment
* README、docs、reportsによる説明可能性の担保

本プロジェクトの主目的は、大規模な本番サービスを構築することではない。
むしろ、小さな題材に対して、品質保証・自動検証・生成物同期・デプロイ・ドキュメント化の一連の流れを再現可能に示すことである。

---

## 2. エグゼクティブサマリー

現在の提出準備状況:

```text
Status: Ready for portfolio MVP release candidate
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

Status:

```text
Implemented
```

現在のクイズは、外部機関の公式問題、過去問、実問再現、認定試験対策を目的としない。
本リポジトリのREADME、docs、reports、source code、CI/CD構成を題材として、ポートフォリオ成果物の設計意図、技術スタック、品質保証メカニズムを理解するための内製クイズである。

現在のクイズ構成:

```text
Total quiz questions: 16
Primary purpose: portfolio-focused internal quiz
Source policy: repository-internal source paths
Publisher: qa-sre-learning-mvp
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

Evidence:

```text
data/raw/quiz-questions.json
data/raw/subject-taxonomy.json
reports/quiz-quality-report.md
public/study-it/quiz_data.json
docs/quiz-schema-taxonomy-validation.md
```

Validation commands:

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

Status:

```text
Implemented
```

Evidence:

```text
src/client/
public/study-it/quiz_data.json
e2e/quiz-smoke.e2e.ts
```

Validation commands:

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

Status:

```text
Implemented
```

Evidence:

```text
src/schemas/quiz-question.schema.ts
src/schemas/subject-taxonomy.schema.ts
src/cli/validate-quiz-data.ts
data/raw/quiz-questions.json
```

Validation command:

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

Status:

```text
Implemented
```

Evidence:

```text
data/raw/subject-taxonomy.json
src/application/validate-quiz-taxonomy.ts
tests/validate-quiz-taxonomy.test.ts
```

Validation command:

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


- `project_overview`
- `data_quality_pipeline`
- `schema_taxonomy_validation`
- `policy_validation`
- `quality_gate_ci`
- `frontend_quiz_ui`
- `deployment_cloudflare_pages`
- `documentation_workflow`
- `git_workflow`

---

### 4.4 quiz policy validation

Status:

```text
Implemented
```

Evidence:

- `src/application/validate-quiz-policy.ts`
- `src/cli/validate-quiz-policy.ts`
- `tests/validate-quiz-policy.test.ts`
- `data/fixtures/policy-invalid-quiz-questions.json`

Validation command:

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

Status:

```text
Implemented
```

Evidence:

- `data/fixtures/invalid-quiz-schema.json`
- `data/fixtures/invalid-quiz-taxonomy.json`
- `data/fixtures/policy-invalid-quiz-questions.json`
- `src/cli/validate-quiz-fixtures.ts`
- `tests/invalid-quiz-schema-fixture.test.ts`
- `tests/invalid-quiz-taxonomy-fixture.test.ts`
- `tests/validate-quiz-policy.test.ts`


Validation command:

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

### 4.6 public quiz data generation

Status:

```text
Implemented
```

Evidence:

- `src/cli/prepare-public-quiz-data.ts`
- `public/study-it/quiz_data.json`


Generation command:

```bash
bun run prepare:public-quiz-data
```

Freshness check:

```bash
bun run prepare:public-quiz-data:check
```

`public/study-it/quiz_data.json` は、React / ViteクイズUIが実行時に読み込む公開用JSONである。
このファイルは `data/raw/quiz-questions.json` から生成される。

public JSONには、UI表示とクイズ実行に必要な情報のみを含める。
`legal` と `review` は内部品質管理用metadataであり、public JSONには含めない。

---

### 4.7 quiz quality report generation

Status:

```text
Implemented
```

Evidence:

- `src/cli/generate-quiz-report.ts`
- `reports/quiz-quality-report.md`


Generation command:

```bash
bun run quiz:report
```

Freshness check:

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

Status:

```text
Implemented
```

Evidence:

- `src/schemas/learning-item.schema.ts
- `src/cli/validate-data.ts
- `data/raw/learning-items.json


Validation command:

```bash
bun run validate:data
```

この検査により、`data/raw/learning-items.json` が期待されるlearning item schemaに従っていることを確認する。

---

### 4.9 source policy validation

Status:

```text
Implemented
```

Evidence:

- `src/application/validate-source-policy.ts
- `src/cli/validate-policy.ts
- `tests/validate-source-policy.test.ts


Validation command:

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

Status:

```text
Implemented
```

Evidence:

- `src/application/build-quality-report.ts`
- `src/cli/generate-report.ts`
- `reports/quality-report.md`
- `tests/build-quality-report.test.ts`

Generation command:

```bash
bun run report
```

Freshness check:

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

Status:

```text
Implemented
```

Evidence:

- `package.json`
- `bun.lock`
- `src/cli/check-dependency-policy.ts`

Expected checks:

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

Status:

```text
Implemented
```

Evidence:

- `scripts/check-public-safety.sh`
- `package.json`

Validation command:

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

Status:

```text
Implemented
```

Evidence:

- `site/static/_headers`
- `src/cli/check-security-baseline.ts`
- `src/cli/check-performance-baseline.ts`

Validation commands:

```bash
bun run validate:security-baseline
bun run validate:performance-baseline
```

このbaselineでは、静的サイトにsecurity headersが含まれていること、および生成物が簡易的なfile-size budget内に収まっていることを検査する。

---

### 4.14 統合品質ゲート

Status:

```text
Implemented
```

Primary command:

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

### 4.15 GitHub Actions quality gate

Status:

```text
Implemented
```

Evidence:


- `.github/workflows/quality-gate.yml`

CI workflow:

```text
checkout repository
  -> setup Bun
  -> bun install --frozen-lockfile
  -> CI=1 bun run check
  -> upload artifacts where configured
```

GitHub Actions quality gateは、local checksがCI上でも再現できることを検証する。

---

### 4.16 Cloudflare Pages deployment

Status:

```text
Implemented
```

Evidence:


- `Cloudflare Pages deployment`
- `Production branch: main`
- `Build command: bun install --frozen-lockfile && bun run pages:build`
- `Build output directory: dist/app`

Production URL:

```text
https://qa-sre-learning-mvp.pages.dev/
```

Validation command:

```bash
bun run pages:build
```

Cloudflare Pagesでは、完全品質ゲートではなく、デプロイ用buildと静的配信に責務を限定する。
完全な品質確認は、GitHub Actionsの `CI=1 bun run check` で行う。

---

### 4.17 Lighthouse CI warn operation

Status:

```text
Implemented as optional / warn-only check
```

Evidence:

- `lighthouserc.json`
- `.github/workflows/lighthouse-warn.yml`
- `docs/lighthouse-ci.md`

Validation command:

```bash
bun run lighthouse:check
```

Lighthouse CIは、現時点ではrequired quality gateには含めず、warn-onlyの補助検査として運用する。

この検査では、静的生成物を対象に、performance、accessibility、best-practices、SEOのcategory scoreを観測する。

---

### 4.18 ドキュメント

Status:

```text
Implemented
```

Evidence:

- `README.md`
- `docs/architecture/architechture.md`
- `docs/acceptance-criteria.md`
- `docs/quiz-schema-taxonomy-validation.md`
- `reports/quality-report.md`
- `reports/quiz-quality-report.md`
- `reports/portfolio-readiness.md`

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

## 5. Acceptance Criteria Review

以下の表は、acceptance criteriaに対する現在の準備状況をまとめたものである。

| Area                              | Status | Evidence                                  |
| --------------------------------- | ------ | ----------------------------------------- |
| Quiz app UI                       | Pass   | `src/client/`                             |
| Public quiz data loading          | Pass   | `public/study-it/quiz_data.json`          |
| Quiz data schema validation       | Pass   | `bun run validate:quiz`                   |
| Quiz taxonomy validation          | Pass   | `bun run validate:quiz`                   |
| Quiz policy validation            | Pass   | `bun run validate:quiz-policy`            |
| Quiz fixture responsibility       | Pass   | `bun run validate:quiz-fixtures`          |
| Quiz quality report               | Pass   | `bun run quiz:report:check`               |
| Public quiz data freshness        | Pass   | `bun run prepare:public-quiz-data:check`  |
| Learning data schema validation   | Pass   | `bun run validate:data`                   |
| Source policy validation          | Pass   | `bun run validate:policy`                 |
| Negative fixtures                 | Pass   | `bun run test:unit`                       |
| Unit tests                        | Pass   | `bun run test:unit`                       |
| Playwright E2E                    | Pass   | `bun run test:e2e`                        |
| Quality report generation         | Pass   | `bun run report:check`                    |
| Dependency reproducibility        | Pass   | `bun run validate:dependencies`           |
| Public safety                     | Pass   | `bun run validate:public-safety`          |
| Security baseline                 | Pass   | `bun run validate:security-baseline`      |
| Performance baseline              | Pass   | `bun run validate:performance-baseline`   |
| Integrated quality gate           | Pass   | `CI=1 bun run check`                      |
| GitHub Actions quality gate       | Pass   | `.github/workflows/quality-gate.yml`      |
| Cloudflare Pages build            | Pass   | `bun run pages:build`                     |
| Architecture documentation        | Pass   | `docs/architecture/architechture.md`      |
| Acceptance criteria documentation | Pass   | `docs/acceptance-criteria.md`             |
| Quiz validation documentation     | Pass   | `docs/quiz-schema-taxonomy-validation.md` |

---

## 6. Local Verification Commands

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

Expected result:

```text
All checks pass.
```

---

## 7. CI Verification

GitHub Actions workflowは、以下で成功するべきである。

* pull requests
* main branch push events

Workflow:

`quality-gate`

Workflow file:


`.github/workflows/quality-gate.yml`

Expected result:

`quality-gate: success`

CI runでは、configured artifactsがuploadされるべきである。

---

## 8. Portfolio Value

このリポジトリは、以下のQA/SRE関連スキルを示す。

### 8.1 QA-Relevant Skills

* validation targetを定義できる
* 正常入力と異常入力をtestできる
* schema validation、taxonomy validation、policy validationを分離できる
* negative fixturesを作成できる
* fixture責務を検証できる
* stale generated artifactsを検出できる
* UIの主要操作をE2Eで検証できる
* acceptance criteriaを文書化できる

### 8.2 SRE-Relevant Skills

* 再現可能なquality gateを構築できる
* localとCIで同じchecksを実行できる
* lockfileとfrozen installを利用できる
* public repository safetyを検査できる
* security / performance baselineを定義できる
* reportによりoperational stateを可視化できる
* GitHub Actionsをautomated control pointとして利用できる
* Cloudflare Pagesで静的アプリを公開できる

### 8.3 Software Engineering Skills

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

## 10. Recommended Interview Explanation

### 10.1 簡潔な説明

```text
このリポジトリは、QA/SRE志向のポートフォリオMVPです。

単なるクイズアプリではなく、raw dataを正本として、schema validation、taxonomy validation、policy validation、異常系fixture、品質レポート生成、公開用JSON生成、React / Vite UI、Playwright E2E、security / performance baseline、GitHub Actions quality gate、Cloudflare Pages deployまでを一連の品質パイプラインとして実装しています。

クイズ問題は外部試験問題の再現ではなく、このリポジトリ自体の設計・品質ゲート・デプロイ構成を理解するための内製クイズです。
```

### 10.2 技術的な説明

```text
このプロジェクトでは、クイズデータを raw data と public data に分離しています。

raw dataには、question、options、answer、explanationに加え、source、legal、review、tagsなどの内部検証用metadataを持たせています。これをZod schemaで構造検証し、taxonomy validationで分類整合性を確認し、policy validationで外部試験問題参照や公式性誤認、review漏れ、secret-like textを検出しています。

検証済みのraw dataから、UI用の public/study-it/quiz_data.json と reports/quiz-quality-report.md を生成し、freshness checkで生成物の更新漏れを検出します。

最終的に、CI=1 bun run check に、型検査、unit test、validation、report check、public safety、client build、security / performance baseline、Playwright E2Eを統合しています。
```

### 10.3 QA観点の説明

```text
QA観点では、単に正常系のアプリ操作を確認するだけではなく、schema違反、taxonomy違反、policy違反の異常系fixtureを分けて用意しています。

これにより、どの検証層がどの不具合を検出するかを確認できるようにしています。また、Playwright E2Eにより、実際のユーザー操作に近い形で、問題表示、回答、フィードバック、結果画面、再実行の主要フローを検証しています。
```

### 10.4 SRE観点の説明

```text
SRE観点では、localとGitHub Actionsで同じ品質ゲートを実行できることを重視しています。

lockfileとfrozen installにより依存関係を再現し、public safety checkで公開リポジトリに含めるべきでないファイルを検出し、security / performance baselineで静的成果物の最低基準を確認します。

Cloudflare Pagesではデプロイ用buildに責務を限定し、完全な品質保証はGitHub Actions側で実行する設計にしています。
```

---

## 11. Current Readiness Decision

Current decision:

```text
The repository is ready to proceed toward portfolio MVP release preparation.
```

Reason:

```text
The core QA/SRE quality pipeline is implemented, documented, locally reproducible, CI-verifiable, and connected to a deployable quiz application.
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

## 12. Recommended Next Steps

1. `main` 上で `CI=1 bun run check` が成功することを確認する。
2. GitHub Actions `quality-gate` がpull request上で成功することを確認する。
3. GitHub Actions `quality-gate` がmain push後に成功することを確認する。
4. Cloudflare Pages production URLでクイズアプリを確認する。
5. README、architecture、acceptance criteria、quiz validation方針、portfolio readinessの内容を整合させる。
6. `reports/quiz-quality-report.md` と `public/study-it/quiz_data.json` が最新であることを確認する。
7. 必要に応じて `v0.1.0` release tagを作成する。
8. GitHub Release notesを追加する。
9. required quality-gate checksを伴うbranch protectionを検討する。
10. 次フェーズでtaxonomy coverageを改善するため、クイズ問題を20〜24問程度へ拡充する。

---

## 13. v0.1.0 Release Candidate Checklist

`v0.1.0` をtaggingする前に、以下を確認する。

* [ ] `CI=1 bun run check` passes locally
* [ ] GitHub Actions `quality-gate` passes on pull request
* [ ] GitHub Actions `quality-gate` passes on `main`
* [ ] Cloudflare Pages production URL is accessible
* [ ] `reports/quality-report.md` is up to date
* [ ] `reports/quiz-quality-report.md` is up to date
* [ ] `public/study-it/quiz_data.json` is up to date
* [ ] `reports/portfolio-readiness.md` is up to date
* [ ] `docs/architecture/architechture.md` exists
* [ ] `docs/acceptance-criteria.md` exists
* [ ] `docs/quiz-schema-taxonomy-validation.md` exists
* [ ] README links to major documents
* [ ] no unsafe local files are detected
* [ ] dependency policy validation passes
* [ ] security baseline passes
* [ ] performance baseline passes
* [ ] main branch contains the latest accepted work

---