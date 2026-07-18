# Quiz Quality Report

This report is generated from repository quiz data.

## Summary

| Metric | Value |
|---|---:|
| Total quiz questions | 13 |
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
| ap | 12 |
| cloudflare | 1 |

## Category Distribution

| Key | Count |
|---|---:|
| dev_env_devops | 1 |
| edge_infra_security | 1 |
| frontend_languages | 11 |

## Difficulty Distribution

| Key | Count |
|---|---:|
| basic | 13 |

## Source Publisher Distribution

| Key | Count |
|---|---:|
| Cloudflare | 1 |
| Dev Containers | 1 |
| This project | 11 |

## Review Status Distribution

| Key | Count |
|---|---:|
| reviewed | 13 |

## Legal Flag Summary

| Flag | Count |
|---|---:|
| is_copied_verbatim | 0 |
| is_official_question_reproduction | 0 |
| is_official_certification_claim | 0 |
| is_affiliation_or_endorsement_claim | 0 |
| is_modified_or_original | 13 |

## Taxonomy Coverage

| Category | Label | Questions | Covered Sub Categories | Total Sub Categories | Coverage |
|---|---|---:|---:|---:|---:|
| frontend_languages | 言語とフロントエンド | 11 | 1 | 4 | 25.0% |
| edge_infra_security | エッジインフラとセキュリティ | 1 | 1 | 2 | 50.0% |
| qa_test_automation | 品質保証と自動テスト | 0 | 0 | 2 | 0.0% |
| dev_env_devops | 開発環境とDevOps | 1 | 1 | 2 | 50.0% |

## Validation Commands

```bash
bun run validate:quiz
bun run validate:quiz-policy
bun run validate:quiz-fixtures
bun run quiz:report
bun run quiz:report:check
bun run check
```
