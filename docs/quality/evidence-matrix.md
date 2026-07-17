# Evidence Matrix

## Purpose

このドキュメントは、ポートフォリオ内の実装・検証・説明資料を、QA / SRE / Data quality の評価観点に対応づける。

## Matrix

| Evaluation Area | Evidence | File / Command |
|---|---|---|
| Type safety | TypeScript typecheck | `bun run typecheck` |
| Client type safety | React / Vite client typecheck | `bun run client:typecheck` |
| Unit testing | Unit / validation tests | `bun run test:unit` |
| Data quality | Learning data validation | `bun run validate:data` |
| Source policy | Source policy validation | `bun run validate:policy` |
| Quiz schema | Quiz schema validation | `bun run validate:quiz` |
| Quiz taxonomy | Quiz taxonomy validation | `bun run validate:quiz-policy` / taxonomy validator |
| Fixture responsibility | Invalid fixtures fail at expected layer | `bun run validate:quiz-fixtures` |
| Report freshness | Generated report is up to date | `bun run quiz:report:check` |
| Public data projection | Public quiz JSON generation | `bun run prepare:public-quiz-data:check` |
| Public safety | Repository safety check | `bun run validate:public-safety` |
| Security baseline | Security baseline check | `bun run validate:security-baseline` |
| Performance baseline | Performance baseline check | `bun run validate:performance-baseline` |
| Frontend build | React / Vite production build | `bun run client:build` |
| E2E testing | Playwright smoke test | `bun run test:e2e` |
| CI quality gate | Full remote quality gate | `bun run check` |
| Deployment build | Cloudflare Pages build | `bun run pages:build` |
| Portfolio readiness | Readiness report | `reports/portfolio-readiness.md` |
| Architecture | Quality pipeline diagram | `docs/architecture/quiz-app-quality-pipeline.md` |

## Interpretation

このプロジェクトの評価対象は、UIの見た目だけではない。

```text
中心評価:
  データ品質
  検証責務の分離
  CI/CDの責務分離
  public data safety
  再現可能な品質ゲート
```

