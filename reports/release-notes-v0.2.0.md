# v0.2.0: Browser Quality, Deployment, and Accessibility

`reports/release-notes-v0.2.0.md`

## 概要

`qa-sre-learning-mvp` v0.2.0 は、v0.1.0で整備したdata validation / report / CI quality gateを土台に、React / ViteクイズUI、Cloudflare Pages向けbuild、Lighthouse CIによるbrowser quality observation、devcontainer内Lighthouse再現性、検索露出制御、security header、accessibility改善を追加したreleaseです。

このreleaseでは、単にWeb UIを追加するのではなく、公開demoとして見せるための品質観測、生成物管理、検索index抑制、UI semantics改善を含めて整備しています。

---

## v0.1.0からの主な変更

| 領域               | v0.1.0                | v0.2.0                                          |
| ------------------ | --------------------- | ----------------------------------------------- |
| 主対象             | data quality pipeline | browser-facing portfolio MVP                    |
| UI                 | 未実装                | React / ViteクイズUI                            |
| Deployment         | 未整備                | Cloudflare Pages向けbuild                       |
| E2E                | 限定的                | Playwright smoke testを品質ゲートへ統合         |
| Lighthouse         | 未整備                | `dist/site` / `dist/app` のwarn-only補助観測    |
| devcontainer再現性 | 基本開発環境          | Playwright Chromiumを使ったLighthouse実行を追加 |
| 検索露出制御       | 未整備                | `robots.txt`、`meta noindex`、`X-Robots-Tag`    |
| Security headers   | 未整備                | `_headers` にCSP / HSTS等を追加                 |
| Accessibility      | 基本UI                | `.option-button` のaccessible nameを改善        |
| 生成物管理         | 基本ignore            | `.lighthouseci/`、core dump除外を明確化         |

---

## 実装内容

v0.2.0では、主に以下を追加・改善しました。

- React / ViteクイズUI
- `public/study-it/quiz_data.json` を読み込む公開用クイズアプリ
- Playwright E2E smoke test
- Cloudflare Pages向けbuild設定
- `robots.txt` によるcrawler巡回抑制
- `index.html` の `meta noindex`
- `public/_headers` の `X-Robots-Tag`
- `Content-Security-Policy` と `Strict-Transport-Security`
- favicon / icon link
- `lighthouserc.app.json`
- devcontainer向け `lighthouse:app:check:pw`
- Playwright Chromiumを `CHROME_PATH` としてLighthouse CIへ渡す補助script
- `.option-button` のaccessible name改善
- GitHub Actions allowlist troubleshooting docs
- devcontainer Lighthouse Chrome troubleshooting docs
- `.lighthouseci/` とcore dumpのGit管理対象外化

---

## 変更管理方針

v0.2.0では、公開前の変更を責務単位で分離して実装しました。

| 変更単位            | 主な内容                                     | 目的                                 |
| ------------------- | -------------------------------------------- | ------------------------------------ |
| 検索露出制御        | `robots.txt`、`meta noindex`、`X-Robots-Tag` | 公開demoの検索engine indexを抑制する |
| Security header設定 | CSP、針                                      |

v0.2.0では、公開前の変更を責務単位で分離して実装しました。

| 変更単位               | 主な内容                                               | 目的                                                             |
| ---------------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| 検索露出制御           | `robots.txt`、`meta noindex`、`X-Robots-Tag`           | 公開demoの検索engine indexを抑制する                             |
| Security header設定    | CSP、HSTS、その他browser security header               | Cloudflare Pages配信時の基本的なbrowser security postureを整える |
| GitHub Actions運用     | allowlistエラーのtroubleshooting docs                  | CI実行権限の設定不備を再現・説明できるようにする                 |
| Lighthouse補助観測     | `lighthouserc.app.json`、Playwright Chromium補助script | devcontainer内でもブラウザ品質観測を再現可能にする               |
| UI / accessibility改善 | favicon、icon link、`.option-button` semantics         | Lighthouse指摘に基づきUI品質とaccessibilityを改善する            |
| 生成物管理             | `.lighthouseci/`、`dist/`、core dump除外               | 生成物やcrash dumpをPublic repoへ混入させない                    |

このように変更を分けることで、変更理由、影響範囲、検証方法を追跡しやすくしています。

---

## 品質ゲート

主要なlocal品質ゲートは以下です。

```bash
CI=1 bun run check
```

この品質ゲートでは、TypeScript typecheck、client typecheck、unit test、schema validation、policy validation、quiz validation、fixture validation、freshness check、dependency policy validation、public safety check、static site check、client build、security / performance baseline、Playwright E2Eをまとめて確認します。

---

## Lighthouse補助観測

Lighthouse CIは、必須品質ゲートではなくwarn-onlyの補助観測として扱います。

通常環境では以下を使います。

```bash
bun run lighthouse:app:check
```

devcontainer内では以下を使います。

```bash
bun run lighthouse:app:check:pw
```

devcontainer向け実行では、Playwright Chromiumを `CHROME_PATH` として渡し、以下のChrome flagsを使います。

```text
--headless=new --no-sandbox --disable-dev-shm-usage
```

この設定により、`Chrome installation not found` や `No usable sandbox` によるLighthouse実行失敗を回避します。

---

## Accessibility改善

Lighthouse app reportで、選択肢buttonに対する `label-content-name-mismatch` が検出されました。

対象は以下です。

```text
src/client/components/QuizCard.tsx
```

v0.2.0では、`.option-button` の `aria-label` によるaccessible nameの手動上書きを見直し、button内部の可視テキストからaccessible nameが自然に計算されるように整理しました。

これにより、見た目やclick動作、正誤判定、画面遷移を維持したまま、DOM semanticsを改善しています。

---

## SEO warningと検索露出制御

Cloudflare Pages demoでは、検索engineへのindexを抑制するため、`robots.txt`、`meta noindex`、`X-Robots-Tag` を設定します。

そのため、Lighthouse SEO auditでは `is-crawlable` が失敗し、SEO category scoreが低く出る場合があります。

これは検索露出低減方針に伴う既知のwarningとして扱います。  
SEO scoreを上げるために `noindex` を外すことはしません。

---

## 生成物とGit管理対象外ファイル

以下は生成物または一時fileとして扱い、Git管理対象にはしません。

```text
dist/
.lighthouseci/
playwright-report/
test-results/
core
core.*
*.core
```

`.lighthouseci/app-reports/core` は、Chromium異常終了時に生成されるcore dumpである可能性があります。  
これはLighthouse reportではなくlocal crash dumpであるため、Public repoには含めません。

---

## 既知の制約

v0.2.0には、以下の制約があります。

- Web UIは実装済みですが、ログイン、複数ユーザー利用、学習履歴の永続保存はありません。
- Playwright E2Eは主要導線のsmoke testに限定しています。
- Lighthouse CIはwarn-onlyであり、required quality gateには含めていません。
- Lighthouse SEO scoreは、検索露出低減方針により低く出る場合があります。
- `--no-sandbox` はdevcontainer内でlocal build済み静的アプリを測定する場合に限定して利用します。
- production URLの継続的なsynthetic monitoringやalert通知は未実装です。
- public safety checkはfull secret scanning engineの代替ではありません。
- クイズは16問構成であり、今後20〜24問程度へ拡充する余地があります。

---

## Release Decision

v0.2.0は、v0.1.0のdata quality MVPを、公開可能なbrowser-facing portfolio MVPへ拡張するreleaseとして扱います。

このreleaseは本番運用サービスではありません。  
一方で、QA/SRE志向のポートフォリオとして、以下を説明できる状態です。

```text
data validation
  -> generated reports
  -> React / Vite quiz UI
  -> Playwright E2E
  -> GitHub Actions quality gate
  -> Cloudflare Pages build
  -> Lighthouse warn-only observation
  -> devcontainer reproducibility
  -> accessibility refinement
  -> public exposure control
  -> generated artifact control
  -> documentation
```

---

## 次のステップ

v0.2.0固定後は、以下を検討します。

- GitHub Release `v0.2.0` の作成
- branch protection / rulesetの確認
- required quality-gate checkの有効化
- Cloudflare Pages production URLの最終確認
- READMEから主要docs / reportsへの導線整理
- クイズ問題を20〜24問程度へ拡充
- repo内部pathの存在確認検査
- production URLのLighthouse補助測定
- Lighthouse結果の要約report化
- accessibility改善項目のissue化
- synthetic monitoringの検討
- releaseごとの品質指標比較
