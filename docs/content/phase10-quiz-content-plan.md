# Phase 10 Quiz Content Plan

## Purpose

Phase 10では、クイズ問題をポートフォリオの技術スタックと品質保証設計に密接に関連づけて拡張する。

## Target

```text
Current:
  2 questions

Phase 10 target:
  12 questions

First batch:
  +6 questions

Second batch:
  +4 questions or more
```

## Content Principles

```text
- 本プロジェクトの技術スタックに関連する内容を扱う
- 公式試験問題や公式教材の本文を転載しない
- 解説は自作し、実装・CI/CD・品質保証との関係を説明する
- legal / review metadata を必ず付与する
- public JSONには内部metadataを出さない
```

## Recommended Topic Matrix

| No. | Area | Topic | Difficulty | Purpose |
|---:|---|---|---|---|
| 1 | TypeScript | typecheckの目的 | easy | 型安全性の基本理解 |
| 2 | TypeScript | optional / undefined対策 | medium | UI実装時の境界理解 |
| 3 | Zod | schema validation | easy | runtime validation理解 |
| 4 | Zod | public data schema | medium | raw/public境界理解 |
| 5 | Data quality | raw dataとpublic dataの分離 | easy | metadata除外の意義 |
| 6 | Data quality | fixture responsibility | medium | 失敗責務の切り分け |
| 7 | Playwright | E2E smoke test | easy | UI主要導線の検証 |
| 8 | Playwright | webServer / strictPort | medium | CI不安定性対策 |
| 9 | GitHub Actions | quality gate | easy | remote品質保証 |
| 10 | GitHub Actions | required checks | medium | merge blocker理解 |
| 11 | Cloudflare Pages | pages:build | easy | deploy build責務 |
| 12 | Cloudflare Pages | GitHub Actionsとの責務分離 | medium | CI/CD設計理解 |

## Review Checklist

```text
[ ] 公式問題文を転載していない
[ ] 解説が自作である
[ ] 技術スタックと関連している
[ ] 正答が一意である
[ ] 誤答選択肢が不自然ではない
[ ] explanationが単なる答えではなく理由を説明している
[ ] legal metadataがある
[ ] review metadataがある
[ ] validationが通る
[ ] reportとpublic dataが更新される
```

