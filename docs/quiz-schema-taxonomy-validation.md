# クイズデータ検証方針(quiz-schema-taxonomy-validation.md)

## 概要

このドキュメントは、`qa-sre-learning-mvp` におけるクイズデータの検証方針を整理するものです。

本プロジェクトでは、クイズアプリのUIだけでなく、クイズデータそのものを検証対象として扱います。
クイズデータは、構造、分類、公開方針、fixture責務、公開用JSON生成、品質レポート生成の各段階で確認します。

目的は、以下を再現可能に示すことです。

* クイズデータの構造を検証する
* 分野、カテゴリ、難易度の分類を検証する
* 公開ポートフォリオとして不適切なデータを検出する
* 異常系fixtureが想定した検証層で失敗することを確認する
* 検証済みデータから公開用JSONを生成する
* 品質レポートを決定的に生成する
* localとGitHub Actionsで同じ検証を実行する

---

## 対象データ

| ファイル                             | 役割                   |
| :------------------------------- | :------------------- |
| `data/raw/quiz-questions.json`   | クイズ問題データの正本          |
| `data/raw/subject-taxonomy.json` | 分類体系の正本              |
| `public/study-it/quiz_data.json` | Webアプリが読み込む公開用クイズデータ |
| `reports/quiz-quality-report.md` | クイズデータの品質レポート        |
| `data/fixtures/`                 | 異常系検証用fixture        |

`data/raw/quiz-questions.json` は、検証対象となる内部用の正本データです。
`public/study-it/quiz_data.json` は、Webアプリが実行時に取得する公開用データです。

内部レビューや公開方針の確認に必要な情報はraw data側に保持し、UIに不要な内部メタデータはpublic JSONから除外します。

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
| :-------------------------------- | :------------------------------------------------------------- | :-------------------- |
| Schema validation                 | JSON構造、必須項目、型、選択肢数、文字列長を検証する                                   | データとして成立していることを確認する   |
| Taxonomy validation               | `category`、`sub_category`、`sub_sub_category` が分類体系に存在することを検証する | 分類の整合性を確認する           |
| Policy validation                 | 出典、法務、公式誤認、ブランド誤認、review状態を検証する                                | 公開ポートフォリオとしての安全性を確認する |
| Fixture responsibility validation | 異常系fixtureが想定した層で失敗することを検証する                                   | 検証層の責務ずれを検出する         |
| Report freshness check            | 品質レポートが最新であることを検証する                                            | 生成物の更新漏れを検出する         |
| Public data freshness check       | 公開用JSONがraw dataと同期していることを検証する                                 | UI配信用データの更新漏れを検出する    |

---

## 分類体系

### Category

現行の主なカテゴリは以下です。


- frontend_languages
- edge_infra_security
- qa_test_automation
- dev_env_devops


### Track

現行の主なtrackは以下です。

- ap
- cloudflare

分類体系は、`data/raw/subject-taxonomy.json`を正本として扱います。

クイズ問題側の `category`、`sub_category`、`sub_sub_category` は、この分類体系と整合している必要があります。

---

## Schema validation

schema validationでは、クイズデータの構造的な妥当性を確認します。

主な検証対象は以下です。

| 項目            | 検証内容               |
| :------------ | :----------------- |
| `id`          | 一意な識別子として扱えること     |
| `track`       | 定義済みのtrackであること    |
| `category`    | 定義済みのcategoryであること |
| `question`    | 問題文として必要な文字列を持つこと  |
| `options`     | 4択として必要な選択肢数を持つこと  |
| `answer`      | 選択肢に対応する正答キーであること  |
| `explanation` | 解説として必要な文字列を持つこと   |
| `source`      | 出典管理に必要な情報を持つこと    |
| `legal`       | 公開方針上の確認情報を持つこと    |
| `review`      | review状態と確認日を持つこと  |

主な関連ファイルは以下です。


- `src/schemas/`
- `src/cli/validate-quiz-data.ts`
- `data/raw/quiz-questions.json`
```

実行コマンド:

```bash
bun run validate:quiz
```

---

## taxonomy validation

taxonomy validationでは、クイズ問題の分類が正本の分類体系に存在することを確認します。

主な検証対象は以下です。

- category
- sub_category
- sub_sub_category
- difficulty

この検証により、以下のような問題を検出します。

* 存在しないカテゴリを指定している
* 存在しないサブカテゴリを指定している
* 分類体系と問題データの対応が崩れている
* 問題追加時に分類名の表記揺れが発生している

関連ファイル:


- `data/raw/subject-taxonomy.json`
- `src/cli/validate-quiz-data.ts`
- `tests/validate-quiz-taxonomy.test.ts`
```

実行コマンド:

```bash
bun run validate:quiz
```

---

## Policy validation

policy validationでは、schema validationとtaxonomy validationでは検出できない、公開ポートフォリオとしての安全性を確認します。

この検証は法的助言ではなく、公開リポジトリとして安全側に倒すための品質ゲートです。

主な検証対象は以下です。

| 分類     | 検証内容                               |
| :----- | :--------------------------------- |
| source | `source.url` がHTTPSであること           |
| source | `source.publisher` が明示されていること      |
| source | `source.title` が明示されていること          |
| source | `retrieved_at` が日付形式であること          |
| legal  | 公式問題の丸写しではないこと                     |
| legal  | 公式認定試験、公式問題集、実問再現などと誤認されないこと       |
| legal  | 提携、公認、後援、承認を示唆しないこと                |
| legal  | 自作または改変問題として扱えること                  |
| legal  | attributionが空でないこと                 |
| review | 本番用データがreview済みであること               |
| review | reviewed dataに `reviewed_at` があること |
| review | generated状態のまま本番データへ混入しないこと        |

関連ファイル:

- `src/cli/validate-quiz-policy.ts`
- `data/raw/quiz-questions.json`
- `data/fixtures/policy-invalid-quiz-questions.json`

実行コマンド:

```bash
bun run validate:quiz-policy
```

---

## Policy rules

主なpolicy ruleは以下です。

| rule                                    | 目的                                      |
| :-------------------------------------- | :-------------------------------------- |
| `https-source-url`                      | 出典URLがHTTPSであることを確認する                   |
| `review-required`                       | 本番用クイズデータがreview済みであることを確認する            |
| `review-date-required`                  | review済みデータにreview日があることを確認する           |
| `no-verbatim-copy`                      | 問題文が丸写しでないことを確認する                       |
| `official-reproduction-conflict`        | 公式問題再現と自作・改変扱いが矛盾しないことを確認する             |
| `no-official-certification-claim`       | 公式認定、公式試験、公式教材を主張しないことを確認する             |
| `no-affiliation-endorsement-claim`      | 提携、後援、承認、支援を示唆しないことを確認する                |
| `official-misrepresentation-text`       | 問題文が公式・認定・承認済みであるかのように見えないことを確認する       |
| `cloudflare-official-misrepresentation` | Cloudflare関連問題が公式認定や提携を示唆しないことを確認する     |
| `cloudflare-attribution-required`       | Cloudflare関連問題に必要なattributionがあることを確認する |
| `ipa-attribution-required`              | IPA関連問題に必要なattributionがあることを確認する        |
| `no-official-question-reproduction`     | 公式問題の再現ではなく、自作・改変問題として扱うことを確認する         |

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
    "attribution": "Source: Example"
  },
  "review": {
    "status": "reviewed",
    "reviewed_at": "2026-07-16"
  }
}
```

`legal` は、公式問題の再現、丸写し、公式認定の主張、提携・承認の示唆などを避けるための内部確認項目です。

`review` は、公開用データとして利用可能な状態かを確認するための内部確認項目です。

---

## 異常系fixtureの責務分離

異常系fixtureは、検証層ごとに責務を分けます。

| fixture                              | schema validation | taxonomy validation | policy validation | 目的          |
| :----------------------------------- | :---------------- | :------------------ | :---------------- | :---------- |
| `invalid-quiz-schema.json`           | 失敗                | 評価しない               | 評価しない             | 構造不正を検出する   |
| `invalid-quiz-taxonomy.json`         | 成功                | 失敗                  | 評価不要              | 分類不整合を検出する  |
| `policy-invalid-quiz-questions.json` | 成功                | 成功                  | 失敗                | 公開方針違反を検出する |

この責務分離により、schema拡張やpolicy追加によって、fixtureが意図しない検証層で失敗する状態を検出できます。

関連ファイル:

```text
data/fixtures/invalid-quiz-schema.json
data/fixtures/invalid-quiz-taxonomy.json
data/fixtures/policy-invalid-quiz-questions.json
src/cli/validate-quiz-fixtures.ts
```

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
PASS fixture: policy-invalid | schema=pass | taxonomyIssues=0 | policyIssues=10 | path=data/fixtures/policy-invalid-quiz-questions.json

Quiz fixture validation passed.
```

この出力により、各fixtureが想定した検証層で失敗していることを確認できます。

---

## クイズ品質レポート

検証済みのクイズデータから、以下の品質レポートを生成します。

```text
reports/quiz-quality-report.md
```

このレポートでは、主に以下を集計します。

| 集計項目                          | 内容             |
| :---------------------------- | :------------- |
| total quiz questions          | 問題数            |
| validation status             | 検証状態           |
| track distribution            | track別分布       |
| category distribution         | category別分布    |
| difficulty distribution       | 難易度別分布         |
| source publisher distribution | 出典publisher別分布 |
| review status distribution    | review状態別分布    |
| legal flag summary            | legal flagの概要  |
| taxonomy coverage             | 分類体系の利用状況      |

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
Total quiz questions: 13
```

避ける例:

```text
Generated at: 2026-07-16T12:34:56.789Z
```

非決定的な値を含めると、実行のたびにGit差分が発生し、freshness checkが不安定になります。

---

## 公開用クイズデータ生成

検証済みのraw dataから、Webアプリ配信用のpublic quiz dataを生成します。

```text
data/raw/quiz-questions.json
  正本データ。schema、taxonomy、policy、reportの対象。

public/study-it/quiz_data.json
  Webアプリがfetchする配信用データ。
```

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
| :--- | :----------------- |
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
version: 2026-07-16
```

避ける例:

```text
generated_at: 2026-07-16T12:34:56.789Z
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
```

主な確認コマンド:

```bash
bun run prepare:public-quiz-data
bun run prepare:public-quiz-data:check
bun run client:typecheck
bun run client:build
bun run test:unit
bun run check
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
- restartが動作する
- browser consoleに致命的なerrorがない
```

---

## ビルド成果物の扱い

| 出力                               | 方針                                        |
| :------------------------------- | :---------------------------------------- |
| `public/study-it/quiz_data.json` | commit対象の生成済み公開用データ                       |
| `dist/app`                       | Vite production build output。通常はcommitしない |
| `reports/quiz-quality-report.md` | commit対象の品質レポート                           |
| `test-results/`                  | Playwright実行結果。通常はcommitしない               |

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
| :--------------------- | :--------------------------------------- |
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
| 統合品質ゲート                | `bun run check`                          |

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
| :------------ | :------------------------------------------------------- |
| schema        | `QuizQuestionSchema` が実装されている                            |
| schema        | `legal` と `review` がschemaに含まれている                        |
| data          | `data/raw/quiz-questions.json` の各itemに必要項目がある            |
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

## 関連ファイル

| ファイル                                  | 内容                      |
| :------------------------------------ | :---------------------- |
| `data/raw/quiz-questions.json`        | クイズ問題データの正本             |
| `data/raw/subject-taxonomy.json`      | 分類体系の正本                 |
| `public/study-it/quiz_data.json`      | 公開用クイズデータ               |
| `src/schemas/`                        | Zod schema定義            |
| `src/cli/validate-quiz-data.ts`       | クイズデータ検証                |
| `src/cli/validate-quiz-policy.ts`     | クイズpolicy検証             |
| `src/cli/validate-quiz-fixtures.ts`   | fixture責務検証             |
| `src/cli/generate-quiz-report.ts`     | クイズ品質レポート生成             |
| `src/cli/prepare-public-quiz-data.ts` | 公開用クイズデータ生成             |
| `tests/`                              | unit / validation tests |
| `e2e/quiz-smoke.e2e.ts`               | Playwright E2E          |
| `playwright.config.ts`                | E2E設定                   |
| `reports/quiz-quality-report.md`      | クイズ品質レポート               |
| `docs/architecture.md`                | 全体アーキテクチャ               |
| `docs/acceptance-criteria.md`         | 受け入れ基準                  |
