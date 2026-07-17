# Quiz Schema and Taxonomy Validation

## Purpose

この文書は、`qa-sre-learning-mvp` におけるクイズデータの schema validation と taxonomy validation の方針を整理する。

Phase 2 では、クイズ UI を追加する前に、教材データを型安全かつ分類整合的に管理できる状態を作る。

## Data Sources

```text
data/raw/quiz-questions.json
data/raw/subject-taxonomy.json
```

`quiz-questions.json` はクイズ問題データの正本である。

`subject-taxonomy.json` は `category`、`sub_category`、`sub_sub_category` の正本である。

## Validation Layers

### Zod schema validation

JSON の構造、必須 field、enum、文字列長、選択肢数を検査する。

### Taxonomy validation

`category` / `sub_category` / `sub_sub_category` が taxonomy master に存在するか検査する。

## Category Keys

```text
frontend_languages
edge_infra_security
qa_test_automation
dev_env_devops
```

## Track Keys

```text
ap
cloudflare
```

## Commands

```bash
bun run validate:quiz
bun test
bun run check
```

## Non-goals

Phase 2 では以下を扱わない。

```text
React / Vite / Hono UI integration
Cloudflare Pages UI deployment changes
NotebookLM import automation
source / legal / brand policy validation
E2E smoke tests
```

これらは後続 phase で段階的に追加する。

## Fixture Responsibility

Invalid fixtures are separated by validation layer.

```text
invalid-quiz-schema.json:
  expected schema result: false
  expected taxonomy result: not evaluated
  expected policy result: not evaluated

invalid-quiz-taxonomy.json:
  expected schema result: true
  expected taxonomy result: false
  expected policy result: not required

policy-invalid-quiz-questions.json:
  expected schema result: true
  expected taxonomy result: true
  expected policy result: false
```

This responsibility split prevents fixture drift when the quiz schema is extended.

## Fixture Validation Command

```bash
bun run validate:quiz-fixtures
```

The fixture validation command mechanically checks that each fixture fails at the intended validation layer.

```text
invalid-quiz-schema.json:
  must fail Zod schema validation.

invalid-quiz-taxonomy.json:
  must pass Zod schema validation and fail taxonomy validation.

policy-invalid-quiz-questions.json:
  must pass Zod schema validation, pass taxonomy validation, and fail quiz policy validation.
```

This command is included in `bun run check` so that fixture responsibility drift is detected in CI.

## Phase 3: Quiz Source, Legal, and Brand Policy Validation

Phase 3 では、schema validation と taxonomy validation では検出できない、出典・法務・ブランド誤認リスクを検査する。

この段階の目的は、クイズデータが構造的に正しいだけでなく、公開ポートフォリオとして安全に扱える教材データであることを確認することである。

## Policy Validation Scope

Phase 3 の policy validation では、以下を検査する。

```text
source:
  source.url が HTTPS URL であること。
  source.publisher が明示されていること。
  source.title が明示されていること。
  retrieved_at が YYYY-MM-DD 形式であること。

legal:
  公式問題の丸写しではないこと。
  公式認定試験、公式問題集、実問再現などと誤認されないこと。
  提携・公認・後援・承認を示唆しないこと。
  自作または改変問題として扱えること。
  attribution が空でないこと。

review:
  本番用 quiz data は reviewed 状態であること。
  reviewed data には reviewed_at があること。
  generated 状態のまま本番データへ混入しないこと。
```

## Added Data Fields

Phase 3 では、`QuizQuestionSchema` に `legal` と `review` を追加する。

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

## Policy Invalid Fixture

Phase 3 では、policy validation 専用の invalid fixture を追加する。

```text
data/fixtures/policy-invalid-quiz-questions.json
```

この fixture は、以下の状態を満たす必要がある。

```text
Zod schema validation:
  pass

taxonomy validation:
  pass

quiz policy validation:
  fail
```

つまり、`policy-invalid-quiz-questions.json` は構造や分類が壊れたデータではなく、公開教材としての policy に違反するデータである。

## Validation Layers

Phase 3 時点での検証レイヤーは以下の通りである。

```text
Layer 1: Zod schema validation
  JSON の構造、必須 field、enum、文字列長、選択肢数を検査する。

Layer 2: Taxonomy validation
  category / sub_category / sub_sub_category が taxonomy master と整合するか検査する。

Layer 3: Policy validation
  出典、法務、公式誤認、ブランド誤認、review 状態を検査する。

Layer 4: Fixture responsibility validation
  invalid fixture が意図した validation layer で失敗するか検査する。
```

## Fixture Responsibility

Phase 3 では、invalid fixture の責務を以下のように固定する。

```text
invalid-quiz-schema.json:
  expected schema result: false
  expected taxonomy result: not evaluated
  expected policy result: not evaluated

invalid-quiz-taxonomy.json:
  expected schema result: true
  expected taxonomy result: false
  expected policy result: not required

policy-invalid-quiz-questions.json:
  expected schema result: true
  expected taxonomy result: true
  expected policy result: false
```

この責務分離により、schema 拡張時に fixture が意図しない layer で失敗する状態を検出できる。

## Commands

Phase 3 で追加・利用する主なコマンドは以下である。

```bash
bun run validate:quiz
bun run validate:quiz-policy
bun run validate:quiz-fixtures
bun test
bun run check
```

詳細確認用には以下を使う。

```bash
bun run validate:quiz-fixtures:verbose
```

機械処理・将来の report 連携用には以下を使う。

```bash
bun run validate:quiz-fixtures:json
```

## Expected Normal Output

通常の fixture validation では、以下のような簡潔な出力を期待する。

```text
Checking quiz fixtures by expected validation layer...
PASS fixture: schema-invalid | schema=fail | taxonomyIssues=n/a | policyIssues=n/a | path=data/fixtures/invalid-quiz-schema.json
PASS fixture: taxonomy-invalid | schema=pass | taxonomyIssues=1 | policyIssues=0 | path=data/fixtures/invalid-quiz-taxonomy.json
PASS fixture: policy-invalid | schema=pass | taxonomyIssues=0 | policyIssues=10 | path=data/fixtures/policy-invalid-quiz-questions.json

Quiz fixture validation passed.
```

## Policy Rules

Phase 3 の主な policy rule は以下である。

```text
https-source-url:
  source.url must use HTTPS.

review-required:
  production quiz data must be reviewed.

review-date-required:
  reviewed quiz data must include reviewed_at.

no-verbatim-copy:
  quiz data must not be copied verbatim.

official-reproduction-conflict:
  official reproduction cannot also be marked as modified or original.

no-official-certification-claim:
  quiz data must not claim official certification, official exam, or official training status.

no-affiliation-endorsement-claim:
  quiz data must not imply affiliation, endorsement, sponsorship, or support.

official-misrepresentation-text:
  quiz text may imply official, certified, endorsed, or exam-reproduction status.

cloudflare-official-misrepresentation:
  Cloudflare-inspired quiz data must not imply official Cloudflare certification, official exam, endorsement, or partnership.

cloudflare-attribution-required:
  Cloudflare-inspired quiz data requires Cloudflare attribution.

ipa-attribution-required:
  IPA-inspired quiz data requires IPA attribution.

no-official-question-reproduction:
  this MVP should use modified or original IPA-inspired questions, not official question reproduction.
```

## Design Notes

Phase 3 の policy validation は、法的助言ではなく、公開ポートフォリオとして安全側に倒すための品質ゲートである。

この MVP では、公式問題の再現や認定試験対策を主張するのではなく、公開ドキュメントや公開情報に着想を得た自作・改変教材としてクイズデータを扱う。

## Completion Criteria

Phase 3 の完了条件は以下である。

```text
Schema:
  legal field が QuizQuestionSchema に追加されている。
  review field が QuizQuestionSchema に追加されている。

Data:
  data/raw/quiz-questions.json の各 item に legal / review がある。
  data/fixtures/policy-invalid-quiz-questions.json がある。

Validation:
  validateQuizPolicy が実装されている。
  bun run validate:quiz-policy が成功する。
  bun run validate:quiz-fixtures が成功する。

Tests:
  policy-invalid fixture が schema validation を通る。
  policy-invalid fixture が taxonomy validation を通る。
  policy-invalid fixture が policy validation で失敗する。
  bun test が成功する。

Quality Gate:
  bun run check に validate:quiz-policy と validate:quiz-fixtures が含まれている。
  bun run check が成功する。

Documentation:
  Phase 3 の policy validation 方針が docs に記録されている。
```


## Quiz Quality Report

Phase 4 では、validated quiz data から品質レポートを生成する。

```text
reports/quiz-quality-report.md
```

このレポートは、以下を集計する。

```text
total quiz questions
validation status
track distribution
category distribution
difficulty distribution
source publisher distribution
review status distribution
legal flag summary
taxonomy coverage
```

## Report Freshness Check

```bash
bun run quiz:report
bun run quiz:report:check
```

`quiz:report:check` は、レポートを再生成した後に以下を実行する。

```bash
git diff --exit-code -- reports/quiz-quality-report.md
```

これにより、quiz data を変更したにもかかわらず report を更新していない状態を CI で検出できる。

## Deterministic Report Policy

`quiz-quality-report.md` には現在時刻などの非決定的な値を入れない。

```text
Good:
  Total quiz questions: 2

Bad:
  Generated at: 2026-07-16T12:34:56.789Z
```

非決定的な値を入れると、毎回 `git diff` が発生し、freshness check が不安定になる。

## Phase 5: Public Quiz Data Generation

Phase 5 では、validated quiz data から Web アプリ配信用の public quiz data を生成する。

```text
data/raw/quiz-questions.json
  正本データ。schema / taxonomy / policy / report の対象。

public/study-it/quiz_data.json
  Web アプリが fetch する配信用データ。
```

## Public Data Generation Pipeline

```text
data/raw/quiz-questions.json
  -> Zod schema validation
  -> taxonomy validation
  -> policy validation
  -> public quiz data projection
  -> public quiz data schema validation
  -> public/study-it/quiz_data.json
```

## Public Data Policy

配信用データには、クイズ UI に必要な field だけを含める。

```text
included:
  id
  track
  category
  sub_category
  sub_sub_category
  difficulty
  question
  options
  answer
  explanation
  source
  tags

excluded:
  legal
  review
```

`legal` と `review` は内部品質管理用 metadata であり、Web UI の表示には不要である。

## Commands

```bash
bun run prepare:public-quiz-data
bun run prepare:public-quiz-data:check
bun run check
```

`prepare:public-quiz-data:check` は、配信用 JSON を再生成した後に以下を実行する。

```bash
git diff --exit-code -- public/study-it/quiz_data.json
```

これにより、正本データを変更したにもかかわらず配信用 JSON を更新していない状態を CI で検出できる。

## Deterministic Public Data Policy

`public/study-it/quiz_data.json` には現在時刻などの非決定的な値を入れない。

```text
Good:
  version: 2026-07-16

Bad:
  generated_at: 2026-07-16T12:34:56.789Z
```

非決定的な値を入れると、毎回 `git diff` が発生し、freshness check が不安定になる。

## Phase 6 Post-Implementation Workflow

Phase 6 実装後は、React / Vite UI が validated public quiz data を安全に利用できることを確認する。

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

## Post-Implementation Checks

```bash
bun run prepare:public-quiz-data
bun run prepare:public-quiz-data:check
bun run client:typecheck
bun run client:build
bun test
bun run check
```

## Manual UI Checks

```text
loading state is displayed
quiz data is loaded from /study-it/quiz_data.json
question text is displayed
answer options are selectable
correct / incorrect feedback is displayed
explanation is displayed
result screen is displayed
restart works
browser console has no fatal error
```

## Build Output Policy

```text
public/study-it/quiz_data.json:
  committed generated public data

dist/app:
  Vite production build output
  normally not committed
```

## Phase 6 Completion Criteria

```text
client:typecheck:
  pass

client:build:
  pass

prepare:public-quiz-data:check:
  pass

check:
  pass

UI:
  loads public quiz data
  validates data at runtime
  supports question, answer, feedback, result, and restart
```


## Test Responsibility Split

Phase 7B 以降は、unit / validation tests と E2E tests を分離する。

```text
tests/
  Bun test runner が実行する unit / validation tests

e2e/
  Playwright test runner が実行する browser smoke tests
```

## Test Commands

```bash
bun run test:unit
bun run test:e2e
bun run check
```

`bun test` が Playwright 専用の test file を誤って実行しないように、unit test は `tests/` に限定する。

Playwright test file は、必要に応じて以下のように命名する。

```text
e2e/quiz-smoke.e2e.ts
```

`playwright.config.ts` では、以下のように E2E test file を明示する。

```ts
testDir: "e2e",
testMatch: "**/*.e2e.ts",
```

