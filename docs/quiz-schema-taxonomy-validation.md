# クイズデータ検証方針
`docs/quiz-schema-taxonomy-validation.md`

## 概要

このドキュメントは、`qa-sre-learning-mvp` におけるクイズデータの検証方針を整理するものです。

本プロジェクトでは、クイズアプリのUIだけでなく、クイズデータそのものを品質管理対象として扱います。
クイズデータは、構造、分類、公開方針、fixture責務、品質レポート生成、公開用JSON生成、UI利用、E2E確認の各段階で検証します。

現在のクイズは、外部機関の試験問題や公式問題を再現するものではありません。
本リポジトリのREADME、docs、reports、source code、CI/CD構成を題材として、ポートフォリオ成果物の設計意図、技術スタック、品質保証メカニズムを理解するための内製クイズです。

目的は、以下を再現可能に示すことです。

* クイズデータの構造を検証する
* category、sub_category、sub_sub_categoryの分類整合性を検証する
* 本ポートフォリオの範囲外の問題を検出する
* 外部試験問題参照、公式問題再現、公式認定の誤認を防ぐ
* review済みデータだけをproduction用クイズデータとして扱う
* 異常系fixtureが想定した検証層で失敗することを確認する
* 検証済みデータから公開用JSONを生成する
* クイズ品質レポートを決定的に生成する
* localとGitHub Actionsで同じ検証を実行する

---

## 対象データ

| ファイル                             | 役割                   |
| -------------------------------- | -------------------- |
| `data/raw/quiz-questions.json`   | クイズ問題データの正本          |
| `data/raw/subject-taxonomy.json` | クイズ分類体系の正本           |
| `public/study-it/quiz_data.json` | Webアプリが読み込む公開用クイズデータ |
| `reports/quiz-quality-report.md` | クイズデータの品質レポート        |
| `data/fixtures/`                 | 異常系検証用fixture        |

`data/raw/quiz-questions.json` は、検証対象となる内部用の正本データです。
`public/study-it/quiz_data.json` は、React / Viteクイズアプリが実行時に取得する公開用データです。

内部レビューや公開方針の確認に必要な情報はraw data側に保持し、UIに不要な内部メタデータはpublic JSONから除外します。

---

## クイズコンセプト

本クイズは、外部試験問題対策ではなく、本ポートフォリオ成果物の理解を目的とします。

| 項目           | 方針                                    |
| ------------ | ------------------------------------- |
| 題材           | 本リポジトリの設計、品質ゲート、検証処理、UI、デプロイ、ドキュメント   |
| 問題数          | 現行MVPでは16問                            |
| source       | repo内部pathを参照する                       |
| publisher    | `qa-sre-learning-mvp` に統一する           |
| 除外対象         | 外部公式問題、過去問、実問再現、認定試験対策                |
| production条件 | schema、taxonomy、policy、fixture検証を通過する |
| 公開用データ       | UIに必要な項目だけを含める                        |

---

## 全体パイプライン

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
  -> client build
  -> Playwright E2E
  -> GitHub Actions quality gate
```

この流れにより、クイズデータの作成、検証、公開、UI利用、E2E確認を一連の品質管理対象として扱います。

---

## 検証層

クイズデータは、以下の複数層で検証します。

| 層                                 | 検証内容                                                           | 主な目的                  |
| --------------------------------- | -------------------------------------------------------------- | --------------------- |
| Schema validation                 | JSON構造、必須項目、型、選択肢数、文字列長を検証する                                   | データとして成立していることを確認する   |
| Taxonomy validation               | `category`、`sub_category`、`sub_sub_category` が分類体系に存在することを検証する | 分類の整合性を確認する           |
| Policy validation                 | 内部source、publisher、review状態、外部試験参照排除、公開安全性を検証する                | 公開ポートフォリオとしての安全性を確認する |
| Fixture responsibility validation | 異常系fixtureが想定した層で失敗することを検証する                                   | 検証層の責務ずれを検出する         |
| Report freshness check            | クイズ品質レポートが最新であることを検証する                                         | 生成物の更新漏れを検出する         |
| Public data freshness check       | 公開用JSONがraw dataと同期していることを検証する                                 | UI配信用データの更新漏れを検出する    |
| Playwright E2E                    | クイズUIの主要操作フローを検証する                                             | ユーザー視点の回帰を検出する        |

---

## 分類体系

分類体系は、`data/raw/subject-taxonomy.json` を正本として扱います。

クイズ問題側の `category`、`sub_category`、`sub_sub_category` は、この分類体系と整合している必要があります。

### Category

現行のcategoryは以下です。

| Category                      | Label                | 目的                                           |
| ----------------------------- | -------------------- | -------------------------------------------- |
| `project_overview`            | プロジェクト概要             | MVPの目的と成果物構成を理解する                            |
| `data_quality_pipeline`       | データ品質パイプライン          | raw data、public data、report生成の関係を理解する        |
| `schema_taxonomy_validation`  | スキーマ検証と分類検証          | Zod schemaとtaxonomy validationの役割を理解する       |
| `policy_validation`           | ポリシー検証               | 内製クイズ方針、公開安全性、fixture責務を理解する                 |
| `quality_gate_ci`             | 品質ゲートとCI             | `CI=1 bun run check` とGitHub Actionsの役割を理解する |
| `frontend_quiz_ui`            | クイズUI                | React / Vite UIと公開用JSONの関係を理解する              |
| `deployment_cloudflare_pages` | Cloudflare Pagesデプロイ | build outputと静的配信の責務を理解する                    |
| `documentation_workflow`      | ドキュメントと説明設計          | README、docs、reportsの説明責務を理解する                |
| `git_workflow`                | Git運用                | branch、pull request、品質ゲート統合の流れを理解する          |

### Track

現行のtrackは以下です。

| Track           | 目的                     |
| --------------- | ---------------------- |
| `portfolio`     | プロジェクト概要や成果物構成         |
| `quality`       | データ検証、品質ゲート、policy、E2E |
| `frontend`      | React / ViteクイズUI      |
| `deployment`    | Cloudflare Pagesデプロイ   |
| `documentation` | README、docs、reports    |
| `operations`    | Git運用や変更管理             |

Dev Containerは開発環境再現の補助機能ですが、今回のクイズtaxonomyでは主要出題カテゴリには含めません。

---

## Schema validation

schema validationでは、クイズデータの構造的な妥当性を確認します。

主な検証対象は以下です。

| 項目                 | 検証内容               |
| ------------------ | ------------------ |
| `id`               | 一意な識別子として扱えること     |
| `track`            | 定義済みのtrackであること    |
| `category`         | 定義済みのcategoryであること |
| `sub_category`     | 文字列として存在すること       |
| `sub_sub_category` | 文字列として存在すること       |
| `difficulty`       | 定義済みの難易度であること      |
| `question`         | 問題文として必要な文字列を持つこと  |
| `options`          | 4択として必要な選択肢数を持つこと  |
| `answer`           | 選択肢に対応する正答キーであること  |
| `explanation`      | 解説として必要な文字列を持つこと   |
| `source`           | 根拠管理に必要な情報を持つこと    |
| `legal`            | 公開方針上の確認情報を持つこと    |
| `review`           | review状態と確認日を持つこと  |
| `tags`             | 1件以上のtagを持つこと      |

主な関連ファイルは以下です。

- `src/schemas/quiz-question.schema.ts`
- `src/schemas/subject-taxonomy.schema.ts`
- `src/cli/validate-quiz-data.ts`
- `data/raw/quiz-questions.json`
- `data/raw/subject-taxonomy.json`


実行コマンド:

```bash
bun run validate:quiz
```

---

## source.urlの扱い

新仕様では、`source.url` は外部URLに限定しません。

クイズの根拠はrepo内部の成果物であるため、以下のような内部pathを許容します。


- `README.md`
- `docs/architecture/architechture.md`
- `docs/acceptance-criteria.md`
- `docs/quiz-schema-taxonomy-validation.md`
- `reports/quiz-quality-report.md`
- `src/application/validate-quiz-policy.ts`
- `src/cli/prepare-public-quiz-data.ts`
- `e2e/quiz-smoke.e2e.ts`
- `package.json`


このため、`source.url` に対して `z.string().url()` を使う設計は採用しません。
現在は、repo内部pathを扱えるように `z.string().min(1)` 相当の検証にしています。

外部URLのHTTPS制約は、主に `learning-items.json` 側のsource policyで扱います。
クイズデータ側では、repo内部pathをsourceとして扱うことを優先します。

---

## Taxonomy validation

taxonomy validationでは、クイズ問題の分類が正本の分類体系に存在することを確認します。

主な検証対象は以下です。

```text
category
sub_category
sub_sub_category
id prefix
```

この検証により、以下のような問題を検出します。

* 存在しないcategoryを指定している
* 存在しないsub_categoryを指定している
* 存在しないsub_sub_categoryを指定している
* 分類体系と問題データの対応が崩れている
* 問題追加時に分類名の表記揺れが発生している
* `id` が `category` prefixと対応していない

IDの命名規則は以下です。

```text
<category>-<serial>
```

例:

- `project_overview-001`
- `data_quality_pipeline-001`
- `schema_taxonomy_validation-001`
- `policy_validation-001`
- `quality_gate_ci-001`
- `frontend_quiz_ui-001`
- `deployment_cloudflare_pages-001`
- `documentation_workflow-001`
- `git_workflow-001`


関連ファイル:

- `data/raw/subject-taxonomy.json`
- `src/application/validate-quiz-taxonomy.ts`
- `src/cli/validate-quiz-data.ts`
- `tests/validate-quiz-taxonomy.test.ts`


実行コマンド:

```bash
bun run validate:quiz
```

---

## Policy validation

policy validationでは、schema validationとtaxonomy validationでは検出できない、公開ポートフォリオとしての安全性と運用方針を確認します。

この検証は法的助言ではなく、公開リポジトリとして安全側に倒すための品質ゲートです。

主な検証対象は以下です。

| 分類     | 検証内容                                             |
| ------ | ------------------------------------------------ |
| source | `source.url` がrepo内部pathであること                    |
| source | `source.publisher` が `qa-sre-learning-mvp` であること |
| source | `source.title` が明示されていること                        |
| source | `retrieved_at` が日付形式であること                        |
| scope  | 問題内容が本ポートフォリオの範囲に収まること                           |
| legal  | 外部公式問題の再現ではないこと                                  |
| legal  | 第三者資料の丸写しではないこと                                  |
| legal  | 公式認定試験、公式問題集、実問再現などと誤認されないこと                     |
| legal  | 提携、公認、後援、承認を示唆しないこと                              |
| legal  | 自作または改変問題として扱えること                                |
| review | production用データがreview済みであること                     |
| review | reviewed dataに `reviewed_at` があること               |
| safety | token、password、private key風の文字列が含まれないこと          |

関連ファイル:

- `src/application/validate-quiz-policy.ts`
- `src/cli/validate-quiz-policy.ts`
- `data/raw/quiz-questions.json`
- `data/fixtures/policy-invalid-quiz-questions.json`
- `tests/validate-quiz-policy.test.ts`


実行コマンド:

```bash
bun run validate:quiz-policy
```

---

## Policy rules

主なpolicy ruleは以下です。

| rule                                | 目的                                          |
| ----------------------------------- | ------------------------------------------- |
| `internal-source-required`          | sourceがrepo内部pathを参照していることを確認する             |
| `source-publisher-internal`         | publisherが `qa-sre-learning-mvp` であることを確認する |
| `project-scope-only`                | 問題内容が本ポートフォリオの範囲に収まることを確認する                 |
| `review-required`                   | production用クイズデータがreview済みであることを確認する        |
| `review-date-required`              | review済みデータにreview日があることを確認する               |
| `no-verbatim-copy`                  | 第三者資料の丸写しでないことを確認する                         |
| `no-official-question-reproduction` | 外部公式問題の再現ではないことを確認する                        |
| `no-official-certification-claim`   | 公式認定、公式試験、公式教材を主張しないことを確認する                 |
| `no-affiliation-endorsement-claim`  | 提携、後援、承認、支援を示唆しないことを確認する                    |
| `no-external-exam-claim`            | 外部試験対策や実問再現と誤認されるmetadataを防ぐ                |
| `official-misrepresentation-text`   | 公式性、認定、承認、提携を示唆するmetadataを検出する              |
| `no-secret-like-text`               | token、password、private key風の文字列を検出する        |


CloudflareやIPAなどの外部固有名詞を中心にした検証ではなく、repo内部source、project scope、review状態、公開安全性を中心に検証します。

---

## Legal / review metadata

policy validationでは、クイズデータに `legal` と `review` を含めます。

例:

```json
{
  "legal": {
    "is_official_question_reproduction": false,
    "is_copied_verbatim": false,
    "is_official_certification_claim": false,
    "is_affiliation_or_endorsement_claim": false,
    "is_modified_or_original": true,
    "attribution": "Original question based on qa-sre-learning-mvp repository documentation."
  },
  "review": {
    "status": "reviewed",
    "reviewed_at": "2026-07-19"
  }
}
```

`legal` は、外部公式問題の再現、丸写し、公式認定の主張、提携・承認の示唆などを避けるための内部確認項目です。

`review` は、公開用データとして利用可能な状態かを確認するための内部確認項目です。

---


## 異常系fixtureの責務分離

異常系fixtureは、検証層ごとに責務を分けます。

| fixture                              | schema validation | taxonomy validation | policy validation | 目的          |
| ------------------------------------ | ----------------- | ------------------- | ----------------- | ----------- |
| `invalid-quiz-schema.json`           | 失敗                | 評価しない               | 評価しない             | 構造不正を検出する   |
| `invalid-quiz-taxonomy.json`         | 成功                | 失敗                  | 評価不要              | 分類不整合を検出する  |
| `policy-invalid-quiz-questions.json` | 成功                | 成功                  | 失敗                | 公開方針違反を検出する |

この責務分離により、schema拡張やpolicy追加によって、fixtureが意図しない検証層で失敗する状態を検出できます。

関連ファイル:

- `data/fixtures/invalid-quiz-schema.json`
- `data/fixtures/invalid-quiz-taxonomy.json`
- `data/fixtures/policy-invalid-quiz-questions.json`
- `src/cli/validate-quiz-fixtures.ts`


実行コマンド:

```bash
bun run validate:quiz-fixtures
```

詳細確認:

```bash
bun run validate:quiz-fixtures:verbose
```

機械処理用出力:

```bash
bun run validate:quiz-fixtures:json
```

---

## 期待されるfixture検証出力

通常のfixture validationでは、以下のような出力を期待します。

```text
Checking quiz fixtures by expected validation layer...
PASS fixture: schema-invalid | schema=fail | taxonomyIssues=n/a | policyIssues=n/a | path=data/fixtures/invalid-quiz-schema.json
PASS fixture: taxonomy-invalid | schema=pass | taxonomyIssues=1 | policyIssues=0 | path=data/fixtures/invalid-quiz-taxonomy.json
PASS fixture: policy-invalid | schema=pass | taxonomyIssues=0 | policyIssues=9 | path=data/fixtures/policy-invalid-quiz-questions.json

Quiz fixture validation passed.
```

この出力により、各fixtureが想定した検証層で失敗していることを確認できます。

---

## クイズ品質レポート

検証済みのクイズデータから、以下の品質レポートを生成します。

- `reports/quiz-quality-report.md`

このレポートでは、主に以下を集計します。

| 集計項目                          | 内容            |
| ----------------------------- | ------------- |
| total quiz questions          | 問題数           |
| validation status             | 検証状態          |
| track distribution            | track別分布      |
| category distribution         | category別分布   |
| difficulty distribution       | 難易度別分布        |
| source publisher distribution | publisher別分布  |
| review status distribution    | review状態別分布   |
| legal flag summary            | legal flagの概要 |
| taxonomy coverage             | 分類体系の利用状況     |

現行MVPでは、クイズ問題数は16問です。
`source.publisher` は `qa-sre-learning-mvp` に統一します。

実行コマンド:

```bash
bun run quiz:report
```

鮮度確認:

```bash
bun run quiz:report:check
```

`quiz:report:check` は、レポートを再生成した後、以下を実行します。

```bash
git diff --exit-code -- reports/quiz-quality-report.md
```

これにより、クイズデータを変更したにもかかわらず、品質レポートを更新していない状態を検出できます。

---

## レポートの決定的出力方針

`reports/quiz-quality-report.md` には、現在時刻などの非決定的な値を含めません。

望ましい例:

```text
Total quiz questions: 16
```

避ける例:

```text
Generated at: 2026-07-19T12:34:56.789Z
```

非決定的な値を含めると、実行のたびにGit差分が発生し、freshness checkが不安定になります。

---

## 公開用クイズデータ生成

検証済みのraw dataから、Webアプリ配信用のpublic quiz dataを生成します。


`data/raw/quiz-questions.json`
  * 正本データ。schema、taxonomy、policy、reportの対象。

`public/study-it/quiz_data.json`
  * Webアプリがfetchする配信用データ。


生成パイプライン:

```text
data/raw/quiz-questions.json
  -> schema validation
  -> taxonomy validation
  -> policy validation
  -> public quiz data projection
  -> public quiz data schema validation
  -> public/study-it/quiz_data.json
```

実行コマンド:

```bash
bun run prepare:public-quiz-data
```

鮮度確認:

```bash
bun run prepare:public-quiz-data:check
```

`prepare:public-quiz-data:check` は、配信用JSONを再生成した後、以下を実行します。

```bash
git diff --exit-code -- public/study-it/quiz_data.json
```

これにより、正本データを変更したにもかかわらず、配信用JSONを更新していない状態を検出できます。

---

## 公開用データの項目方針

配信用データには、クイズUIに必要な項目だけを含めます。

| 区分   | 項目                 |
| ---- | ------------------ |
| 含める  | `id`               |
| 含める  | `track`            |
| 含める  | `category`         |
| 含める  | `sub_category`     |
| 含める  | `sub_sub_category` |
| 含める  | `difficulty`       |
| 含める  | `question`         |
| 含める  | `options`          |
| 含める  | `answer`           |
| 含める  | `explanation`      |
| 含める  | `source`           |
| 含める  | `tags`             |
| 除外する | `legal`            |
| 除外する | `review`           |

`legal` と `review` は内部品質管理用metadataであり、Web UIの表示には不要です。
そのため、public JSONには含めません。

---

## 公開用データの決定的出力方針

`public/study-it/quiz_data.json` には、現在時刻などの非決定的な値を含めません。

望ましい例:

```text
version: 2026-07-19
```

避ける例:

```text
generated_at: 2026-07-19T12:34:56.789Z
```

非決定的な値を含めると、実行のたびにGit差分が発生し、public data freshness checkが不安定になります。

---

## クイズUI実装後の確認

React / Vite UIは、検証済みのpublic quiz dataを安全に利用する必要があります。

確認パイプライン:

```text
data/raw/quiz-questions.json
  -> schema validation
  -> taxonomy validation
  -> policy validation
  -> public/study-it/quiz_data.json
  -> React fetch
  -> PublicQuizDataSchema runtime validation
  -> quiz UI
  -> Vite production build
  -> Playwright E2E
```

主な確認コマンド:

```bash
bun run prepare:public-quiz-data
bun run prepare:public-quiz-data:check
bun run client:typecheck
bun run client:build
bun run test:unit
CI=1 bun run check
```

手動確認項目:

```text
- loading stateが表示される
- quiz dataが /study-it/quiz_data.json から読み込まれる
- question textが表示される
- answer optionsを選択できる
- correct / incorrect feedbackが表示される
- explanationが表示される
- result screenが表示される
- category scoreが表示される
- restartが動作する
- browser consoleに致命的なerrorがない
```

---

## E2E selector方針

Playwright E2Eでは、問題文やファイル名に含まれる文字列へ過度に依存しないようにします。

避ける例:

```ts
page.getByText(/Question/i)
```

このselectorは、`quiz-questions.json` のような問題文中の文字列にも一致し、strict mode violationを起こす可能性があります。

推奨例:

```ts
page.getByRole("heading", { name: /^Question$/ })
page.getByRole("button", { name: /もう一度解く/ })
page.getByRole("status")
page.getByTestId("result-score")
page.getByTestId("result-accuracy")
```

E2Eでは、特定の問題文や問題数固定ではなく、ユーザー操作として重要な流れを検証します。

---

## ビルド成果物の扱い

| 出力                               | 方針                                        |
| -------------------------------- | ----------------------------------------- |
| `public/study-it/quiz_data.json` | commit対象の生成済み公開用データ                       |
| `dist/app`                       | Vite production build output。通常はcommitしない |
| `reports/quiz-quality-report.md` | commit対象の品質レポート                           |
| `test-results/`                  | Playwright実行結果。通常はcommitしない               |
| `playwright-report/`             | Playwright HTML report。通常はcommitしない       |

---

## テスト責務の分離

本プロジェクトでは、unit / validation test と E2E testを分離します。

```text
tests/
  Bun test runnerが実行するunit / validation tests。

e2e/
  Playwright test runnerが実行するbrowser smoke tests。
```

`bun test` がPlaywright専用test fileを誤って実行しないように、unit testは `tests/` に限定します。

Playwright test fileは、以下のように配置します。

```text
e2e/quiz-smoke.e2e.ts
```

`playwright.config.ts` では、E2E test fileを明示します。

```ts
testDir: "e2e",
testMatch: "**/*.e2e.ts",
```

---

## 主なコマンド

| 用途                     | コマンド                                     |
| ---------------------- | ---------------------------------------- |
| クイズデータ検証               | `bun run validate:quiz`                  |
| クイズpolicy検証            | `bun run validate:quiz-policy`           |
| fixture責務検証            | `bun run validate:quiz-fixtures`         |
| fixture詳細確認            | `bun run validate:quiz-fixtures:verbose` |
| fixture JSON出力         | `bun run validate:quiz-fixtures:json`    |
| クイズ品質レポート生成            | `bun run quiz:report`                    |
| クイズ品質レポート鮮度確認          | `bun run quiz:report:check`              |
| 公開用クイズデータ生成            | `bun run prepare:public-quiz-data`       |
| 公開用クイズデータ鮮度確認          | `bun run prepare:public-quiz-data:check` |
| unit / validation test | `bun run test:unit`                      |
| E2E test               | `bun run test:e2e`                       |
| client typecheck       | `bun run client:typecheck`               |
| client build           | `bun run client:build`                   |
| 統合品質ゲート                | `CI=1 bun run check`                     |

---

## 統合品質ゲートとの関係

以下の検証は、統合品質ゲートに含めます。

```text
bun run validate:quiz
bun run validate:quiz-policy
bun run validate:quiz-fixtures
bun run quiz:report:check
bun run prepare:public-quiz-data:check
bun run client:typecheck
bun run client:build
bun run test:e2e
```

統合品質ゲートは以下で実行します。

```bash
CI=1 bun run check
```

この品質ゲートにより、クイズデータ、公開用データ、UI、E2E、生成レポートの整合性をまとめて確認します。

---

## 完了条件

クイズデータ検証の完了条件は以下です。

| 領域            | 条件                                                       |
| ------------- | -------------------------------------------------------- |
| schema        | `QuizQuestionSchema` が実装されている                            |
| schema        | `SubjectTaxonomySchema` が新taxonomyに対応している                |
| schema        | `legal` と `review` がschemaに含まれている                        |
| data          | `data/raw/quiz-questions.json` が16問構成である                 |
| data          | 各問題がrepo内部source pathを持つ                                 |
| taxonomy      | `data/raw/subject-taxonomy.json` がポートフォリオ理解用カテゴリに更新されている |
| fixture       | `data/fixtures/policy-invalid-quiz-questions.json` が存在する |
| validation    | `bun run validate:quiz` が成功する                            |
| validation    | `bun run validate:quiz-policy` が成功する                     |
| validation    | `bun run validate:quiz-fixtures` が成功する                   |
| report        | `bun run quiz:report:check` が成功する                        |
| public data   | `bun run prepare:public-quiz-data:check` が成功する           |
| test          | `bun run test:unit` が成功する                                |
| E2E           | `bun run test:e2e` が成功する                                 |
| quality gate  | `CI=1 bun run check` が成功する                               |
| documentation | 検証方針がREADMEおよびdocsから参照できる                                |

---

## 更新ワークフロー

クイズ問題またはtaxonomyを更新した場合は、以下の順序で検証します。

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

---

## 関連ファイル

| ファイル                                          | 内容                            |
| --------------------------------------------- | ----------------------------- |
| `data/raw/quiz-questions.json`                | クイズ問題データの正本                   |
| `data/raw/subject-taxonomy.json`              | 分類体系の正本                       |
| `public/study-it/quiz_data.json`              | 公開用クイズデータ                     |
| `src/schemas/quiz-question.schema.ts`         | クイズ問題schema                   |
| `src/schemas/subject-taxonomy.schema.ts`      | taxonomy schema               |
| `src/application/validate-quiz-taxonomy.ts`   | taxonomy validation           |
| `src/application/validate-quiz-policy.ts`     | policy validation             |
| `src/cli/validate-quiz-data.ts`               | クイズデータ検証                      |
| `src/cli/validate-quiz-policy.ts`             | クイズpolicy検証                   |
| `src/cli/validate-quiz-fixtures.ts`           | fixture責務検証                   |
| `src/cli/generate-quiz-report.ts`             | クイズ品質レポート生成                   |
| `src/cli/prepare-public-quiz-data.ts`         | 公開用クイズデータ生成                   |
| `tests/validate-quiz-taxonomy.test.ts`        | taxonomy validation test      |
| `tests/validate-quiz-policy.test.ts`          | policy validation test        |
| `tests/invalid-quiz-schema-fixture.test.ts`   | schema-invalid fixture test   |
| `tests/invalid-quiz-taxonomy-fixture.test.ts` | taxonomy-invalid fixture test |
| `e2e/quiz-smoke.e2e.ts`                       | Playwright E2E                |
| `playwright.config.ts`                        | E2E設定                         |
| `reports/quiz-quality-report.md`              | クイズ品質レポート                     |
| `docs/architecture/architechture.md`          | 全体アーキテクチャ                     |
| `docs/acceptance-criteria.md`                 | 受け入れ基準                        |
