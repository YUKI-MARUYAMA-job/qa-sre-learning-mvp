# Lighthouse CI

## Purpose

この文書は、`qa-sre-learning-mvp` における Lighthouse CI の運用方針を整理する。

Phase 15では、Lighthouse CIをrequired quality-gateには含めず、warn-onlyの補助検査として運用する。

## Positioning

既存の品質ゲートは以下である。

```bash
bun run check
```

この品質ゲートは、schema validation、source policy validation、test、report freshness、static site build、security baseline、performance file-size budgetを検査する。

Lighthouse CIは、これに加えてブラウザ観点の品質を観測する補助検査である。

## Target

Lighthouse CIは、Cloudflare Pagesのproduction URLではなく、CI内で生成した静的サイトを対象にする。

```text
dist/site
```

対象ページは以下である。

```text
/
quality-report.html
portfolio-readiness.html
```

## Operation Mode

Phase 15では、以下の理由によりwarn-onlyで運用する。

- Lighthouse scoreは実行環境の揺らぎを受ける
- 初期MVPでは観測と改善候補の把握を優先する
- required quality-gateを不安定化させない
- error閾値化は安定後に判断する

## Commands

Local execution:

```bash
bun run lighthouse:check
```

Static site build and Lighthouse CI:

```bash
bun run site:build
bun run lighthouse:check
```

## Current Thresholds

| Category | Level | Minimum score |
|---|---:|---:|
| Performance | warn | 0.8 |
| Accessibility | warn | 0.9 |
| Best Practices | warn | 0.9 |
| SEO | warn | 0.8 |

## Report Output

Lighthouse reports are written to:

```text
.lighthouseci/reports
```

This directory is ignored by Git and uploaded as a GitHub Actions artifact in the `lighthouse-warn` workflow.

## Future Hardening

Future phases may consider:

- increasing `numberOfRuns`
- collecting production URL scores separately
- enabling selected `error` assertions
- adding Lighthouse result summaries to reports
- tracking score deltas across releases
