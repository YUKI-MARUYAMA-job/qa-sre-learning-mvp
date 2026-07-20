# Lighthouse CI運用方針

`docs/lighthouse-ci.md`

## 1. 目的

この文書は、`qa-sre-learning-mvp` におけるLighthouse CIの運用方針を整理するものです。

本リポジトリでは、TypeScript型検査、データ検証、policy validation、生成物の鮮度確認、Playwright E2E、security / performance baselineを必須品質ゲートとして扱います。
一方、Lighthouse CIは、ブラウザ観点の品質を観測するための補助検査として扱います。

現在は、Lighthouse CIを必須品質ゲートには含めず、warn-onlyで運用します。

---

## 2. 位置づけ

本リポジトリの必須品質ゲートは、以下のコマンドで実行します。

```bash
CI=1 bun run check
```

この品質ゲートでは、主に以下を確認します。

- TypeScript型検査
- client typecheck
- unit test
- learning data validation
- source policy validation
- quiz schema validation
- quiz taxonomy validation
- quiz policy validation
- quiz fixture responsibility validation
- quiz quality report freshness check
- public quiz data freshness check
- dependency policy validation
- public repository safety check
- static site check
- client build
- security baseline
- performance baseline
- Playwright E2E

Lighthouse CIは、この必須品質ゲートとは別に、ブラウザ観点の品質を観測するために使います。
そのため、Lighthouse CIの警告は改善候補として扱いますが、現時点ではpull requestやmain branchの通過条件にはしません。

---

## 3. 現在の測定対象

現在のLighthouse CIでは、2種類のbuild outputを分けて扱います。

| 設定                    | 測定対象    | 目的                                   |
| ----------------------- | ----------- | -------------------------------------- |
| `lighthouserc.json`     | `dist/site` | 静的レポートサイトの補助観測           |
| `lighthouserc.app.json` | `dist/app`  | React / Viteクイズアプリ本体の補助観測 |

`dist/site` は、品質レポートやポートフォリオ提出準備レポートなどの静的レポートサイトを対象にします。
`dist/app` は、React / Viteでbuildされたクイズアプリ本体を対象にします。

現在のポートフォリオ成果物では、クイズアプリ本体が主要な提示対象です。
そのため、`dist/app` 向けLighthouse CIを追加し、クイズアプリ本体のブラウザ品質も観測できるようにしています。

---

## 4. `dist/site` 向けLighthouse CI

`dist/site` 向けの設定は、以下のファイルで管理します。

```text
lighthouserc.json
```

対象成果物は以下です。

```text
dist/site
```

対象URLは以下です。

```text
http://localhost/
http://localhost/quality-report.html
http://localhost/portfolio-readiness.html
```

実行コマンドは以下です。

```bash
bun run lighthouse:site:check
```

既存互換のため、`lighthouse:check` を `dist/site` 向けの補助検査として残す場合があります。

```bash
bun run lighthouse:check
```

---

## 5. `dist/app` 向けLighthouse CI

`dist/app` 向けの設定は、以下のファイルで管理します。

```text
lighthouserc.app.json
```

対象成果物は以下です。

```text
dist/app
```

対象URLは以下です。

```text
http://localhost/
```

実行コマンドは以下です。

```bash
bun run lighthouse:app:check
```

このコマンドでは、先に公開用クイズデータを生成し、その後にReact / Viteクイズアプリをproduction buildします。

```bash
bun run client:build && lhci autorun --config=lighthouserc.app.json
```

`client:build` では、内部的に以下を実行します。

```bash
bun run prepare:public-quiz-data && bunx --bun vite build
```

これにより、`public/study-it/quiz_data.json` を更新したうえで、`dist/app` を生成します。

現在のbuild結果では、以下の成果物が生成されています。

| ファイル                      |    サイズ |     gzip |
| ----------------------------- | --------: | -------: |
| `dist/app/index.html`         |   0.63 kB |  0.43 kB |
| `dist/app/assets/index-*.css` |   3.64 kB |  1.18 kB |
| `dist/app/assets/index-*.js`  | 259.79 kB | 79.13 kB |

この規模は、現段階のMVPとしては妥当な範囲です。

---

## 6. production URLを直接対象にしない理由

現在のLighthouse CIでは、Cloudflare Pagesのproduction URLを直接対象にしていません。

理由は以下です。

- 外部ネットワーク状況の影響を受けます。
- Cloudflare側の一時的な状態に影響される可能性があります。
- デプロイ直後の反映待ちに影響される可能性があります。
- CI内の静的成果物を対象にした方が再現性を高めやすいです。
- 現段階では、公開後監視よりもbuild済み成果物の品質観測を優先します。

production URLのLighthouse測定は、将来的な補助観測として追加する余地があります。

---

## 7. warn-onlyで運用する理由

Lighthouse CIをwarn-onlyで運用する理由は以下です。

- Lighthouse scoreはCI環境の負荷や実行タイミングの影響を受けます。
- 初期MVPでは、scoreによるブロックよりも観測と改善候補の把握を優先します。
- required quality gateに含めると、軽微なscore変動でPRが不安定化する可能性があります。
- `validate:performance-baseline` はfile-size budgetを確認する決定的検査ですが、Lighthouse CIはブラウザ実行時の観測値を扱います。
- Playwright E2Eは主要導線の動作確認、Lighthouse CIは性能・アクセシビリティ・SEOなどの観測という別の責務を持ちます。
- error閾値化は、scoreの安定性と改善方針を確認した後に判断します。

---

## 8. 現在の閾値

現在のLighthouse CIは、すべてwarn-onlyで運用します。

| Category       | Level | Minimum score | Aggregation |
| -------------- | ----: | ------------: | ----------- |
| Performance    |  warn |           0.8 | median      |
| Accessibility  |  warn |           0.9 | median      |
| Best Practices |  warn |           0.9 | median      |
| SEO            |  warn |           0.8 | median      |

現在は `numberOfRuns: 3` とし、3回実行した結果のmedianを評価します。
これにより、単発実行の揺らぎをある程度抑えます。

これらの閾値は、品質改善の目安として扱います。
現時点では、scoreが閾値を下回った場合でも、必須品質ゲートを失敗させる運用にはしません。

---

## 9. SEO warningの扱い

本リポジトリのCloudflare Pages demoでは、検索エンジンへのindexを抑制するため、`noindex`、`nofollow`、`noarchive` を意図的に設定します。

対象は主に以下です。

```html
<meta name="robots" content="noindex,nofollow,noarchive" />
```

```text
X-Robots-Tag: noindex, nofollow, noarchive
```

また、`robots.txt` でも検索crawlerへの巡回抑制を指示します。

```text
User-agent: *
Disallow: /
```

LighthouseのSEO auditには、ページが検索エンジンにindex可能かを確認する項目が含まれます。
そのため、`noindex`、`nofollow`、`noarchive` を意図的に設定している場合、SEO category scoreが閾値を下回ることがあります。

このwarningは、検索露出低減方針に伴う既知の警告として扱います。
現時点では、SEO category scoreが閾値を下回っても、必須品質ゲートの失敗とはみなしません。

一方で、検索indexを抑制する場合でも、HTML文書としての基本metadataは維持します。

確認対象は以下です。

| 項目           | 方針                                                     |
| -------------- | -------------------------------------------------------- |
| `lang`         | `ja` または `en` を明示します                            |
| `title`        | アプリ内容を表すtitleを設定します                        |
| `description`  | ポートフォリオ内容を説明するmeta descriptionを設定します |
| `viewport`     | responsive表示のために設定します                         |
| `robots`       | `noindex,nofollow,noarchive` を維持します                |
| `X-Robots-Tag` | Cloudflare Pages response headerとして設定します         |
| `robots.txt`   | crawler巡回抑制のために配置します                        |

したがって、SEO warningが出た場合は、まずLighthouse reportで原因を確認します。

```text
許容するwarning:
  noindex / nofollow / noarchive に由来するSEO score低下

修正対象:
  title欠落
  description欠落
  viewport欠落
  lang欠落
  robots.txtの形式不備
  HTTP status不備
  link text不備
```

SEO scoreを上げるために `noindex` を外すことはしません。
本リポジトリでは、検索流入の最大化よりも、提出用demoの検索露出低減を優先します。

Lighthouse CIは、SEO warningを改善候補として可視化します。
ただし、主要な品質判定は引き続き以下の必須品質ゲートに集約します。

```bash
CI=1 bun run check
```

---

## 10. 実行コマンド

静的レポートサイトを測定する場合は、以下を使います。

```bash
bun run lighthouse:site:check
```

クイズアプリ本体を測定する場合は、以下を使います。

```bash
bun run lighthouse:app:check
```

Lighthouse CI自体の設定確認には、以下を使います。

```bash
bun run lighthouse:healthcheck
```

ポートフォリオ提出前には、必須品質ゲートとアプリ向けLighthouse補助検査を分けて確認します。

```bash
CI=1 bun run check
bun run lighthouse:app:check
```

---

## 11. レポート出力

`dist/site` 向けLighthouse CIのレポートは、以下に出力します。

```text
.lighthouseci/reports
```

`dist/app` 向けLighthouse CIのレポートは、以下に出力します。

```text
.lighthouseci/app-reports
```

これらのディレクトリはGit管理対象外にします。
GitHub Actionsでは、必要に応じてLighthouse reportをartifactとしてuploadします。

---

## 12. GitHub Actionsでの運用

Lighthouse CIは、必須品質ゲートとは別workflowとして運用します。

関連workflowは以下です。

```text
.github/workflows/lighthouse-warn.yml
.github/workflows/lighthouse-app-warn.yml
```

これらのworkflowは、Lighthouse結果を観測するための補助検査です。
`quality-gate.yml` の代替ではありません。

役割分担は以下です。

| Workflow                  | 役割                                         | 失敗時の扱い           |
| ------------------------- | -------------------------------------------- | ---------------------- |
| `quality-gate.yml`        | 必須品質ゲートを実行します                   | 修正対象               |
| `lighthouse-warn.yml`     | 静的レポートサイトのブラウザ品質を観測します | 改善候補として扱います |
| `lighthouse-app-warn.yml` | クイズアプリ本体のブラウザ品質を観測します   | 改善候補として扱います |

---

## 13. performance baselineとの違い

本リポジトリには、Lighthouse CIとは別にperformance baselineがあります。

performance baselineでは、主に静的成果物のfile-size budgetを確認します。
これは、決定的に検査しやすく、CIで安定して扱いやすい指標です。

一方、Lighthouse CIは、ブラウザでページを読み込んだときのPerformance、Accessibility、Best Practices、SEOなどを観測します。
これは実行環境の影響を受けやすいため、現時点ではwarn-onlyで扱います。

| 検査                            | 主な対象              | 性質       | 必須ゲート |
| ------------------------------- | --------------------- | ---------- | ---------- |
| `validate:performance-baseline` | file-size budget      | 決定的検査 | 含める     |
| Lighthouse CI                   | ブラウザ上の品質score | 観測値     | 含めない   |

---

## 14. 現在の制約

現在の制約は以下です。

- Lighthouse scoreはCI環境の負荷や実行タイミングに影響されます。
- warn-only運用であるため、score低下を自動的にmerge blockするものではありません。
- Lighthouse CIは、Playwright E2Eやunit testの代替ではありません。
- Lighthouse CIは、security / performance baselineの代替ではありません。
- Lighthouse CIは、本格的なreal user monitoringの代替ではありません。
- Lighthouse CIは、production環境の継続監視やアラート通知の代替ではありません。
- `dist/app` 向け測定は、初期表示ページを中心とした補助観測であり、全ユーザー操作フローを検査するものではありません。
- 現在の閾値は初期MVP向けであり、長期運用では見直す余地があります。

---

## 15. 今後の強化候補

今後の段階では、以下を検討します。

- `numberOfRuns` を3から5以上へ増やし、scoreの揺らぎをさらに抑える
- production URLのscoreを補助的に収集する
- `dist/app` でクイズ結果画面など複数状態を測定する
- 一部categoryだけをerror assertionへ昇格する
- Lighthouse結果の要約を `reports/` に出力する
- releaseごとのscore差分を追跡する
- accessibility改善項目をissue化する
- Lighthouse結果をPRコメントへ要約する

---

## 16. 関連ファイル

| ファイル                                    | 役割                                          |
| ------------------------------------------- | --------------------------------------------- |
| `lighthouserc.json`                         | 静的レポートサイト向けLighthouse CI設定       |
| `lighthouserc.app.json`                     | クイズアプリ本体向けLighthouse CI設定         |
| `.github/workflows/lighthouse-warn.yml`     | 静的レポートサイト向けwarn-only workflow      |
| `.github/workflows/lighthouse-app-warn.yml` | クイズアプリ本体向けwarn-only workflow        |
| `package.json`                              | `lighthouse:*` scripts定義                    |
| `site/`                                     | 静的レポートサイトのsource                    |
| `src/client/`                               | React / Viteクイズアプリ                      |
| `public/study-it/quiz_data.json`            | クイズアプリが読み込む公開用JSON              |
| `dist/site`                                 | 静的レポートサイトのbuild output              |
| `dist/app`                                  | React / Viteクイズアプリのbuild output        |
| `.lighthouseci/reports`                     | 静的レポートサイト向けLighthouse report出力先 |
| `.lighthouseci/app-reports`                 | クイズアプリ向けLighthouse report出力先       |
