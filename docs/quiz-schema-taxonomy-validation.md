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
