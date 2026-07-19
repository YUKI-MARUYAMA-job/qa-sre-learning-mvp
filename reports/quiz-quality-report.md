# Quiz Quality Report

This report is generated from repository quiz data.

## Summary

| Metric | Value |
|---|---:|
| Total quiz questions | 16 |
| Taxonomy issue count | 0 |
| Policy issue count | 0 |

## Validation Status

| Layer | Status | Issue Count |
|---|---|---:|
| Zod schema | PASS | 0 |
| Taxonomy | PASS | 0 |
| Policy | PASS | 0 |

## Track Distribution

| Key | Count |
|---|---:|
| deployment | 2 |
| documentation | 1 |
| frontend | 2 |
| operations | 1 |
| portfolio | 2 |
| quality | 8 |

## Category Distribution

| Key | Count |
|---|---:|
| data_quality_pipeline | 2 |
| deployment_cloudflare_pages | 2 |
| documentation_workflow | 1 |
| frontend_quiz_ui | 2 |
| git_workflow | 1 |
| policy_validation | 2 |
| project_overview | 2 |
| quality_gate_ci | 2 |
| schema_taxonomy_validation | 2 |

## Difficulty Distribution

| Key | Count |
|---|---:|
| basic | 16 |

## Source Publisher Distribution

| Key | Count |
|---|---:|
| qa-sre-learning-mvp | 16 |

## Review Status Distribution

| Key | Count |
|---|---:|
| reviewed | 16 |

## Legal Flag Summary

| Flag | Count |
|---|---:|
| is_copied_verbatim | 0 |
| is_official_question_reproduction | 0 |
| is_official_certification_claim | 0 |
| is_affiliation_or_endorsement_claim | 0 |
| is_modified_or_original | 16 |

## Taxonomy Coverage

| Category | Label | Questions | Covered Sub Categories | Total Sub Categories | Coverage |
|---|---|---:|---:|---:|---:|
| project_overview | プロジェクト概要 | 2 | 2 | 2 | 100.0% |
| data_quality_pipeline | データ品質パイプライン | 2 | 1 | 2 | 50.0% |
| schema_taxonomy_validation | スキーマ検証と分類検証 | 2 | 2 | 2 | 100.0% |
| policy_validation | ポリシー検証 | 2 | 2 | 3 | 66.7% |
| quality_gate_ci | 品質ゲートとCI | 2 | 2 | 3 | 66.7% |
| frontend_quiz_ui | クイズUI | 2 | 2 | 2 | 100.0% |
| deployment_cloudflare_pages | Cloudflare Pagesデプロイ | 2 | 2 | 2 | 100.0% |
| documentation_workflow | ドキュメントと説明設計 | 1 | 1 | 2 | 50.0% |
| git_workflow | Git運用 | 1 | 1 | 2 | 50.0% |

## Validation Commands

```bash
bun run validate:quiz
bun run validate:quiz-policy
bun run validate:quiz-fixtures
bun run quiz:report
bun run quiz:report:check
bun run check
```
