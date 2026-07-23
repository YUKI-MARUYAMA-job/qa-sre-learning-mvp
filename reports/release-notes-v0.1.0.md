# v0.1.0: QA/SRE Learning MVP Quality Gate

## 概要

`qa-sre-learning-mvp` v0.1.0 は、QA/SRE志向の小型ポートフォリオMVPとして、最初に固定するreleaseです。

このreleaseでは、単なるReactクイズアプリではなく、構造化データ、schema validation、taxonomy validation、policy validation、異常系fixture、生成物鮮度確認、E2E、CI/CD、Cloudflare Pagesデプロイまでを小さく統合した品質パイプラインを示します。

クイズ問題のコンセプトは、外部機関の公式問題、過去問、実問再現、認定試験対策ではありません。
本リポジトリの技術スタック、品質ゲート、データ検証、E2E、デプロイ構成、ドキュメント設計を理解するための内製クイズとして再設計しています。

現在のクイズは16問で構成されています。

---

## 実装済み機能

v0.1.0では、以下を実装済みです。

- TypeScript / Bunプロジェクト構成
- React / ViteによるクイズUI
- `data/raw/quiz-questions.json` を正本とするクイズデータ管理
- Zodによるquiz question schema validation
- subject taxonomy validation
- quiz policy validation
- fixture responsibility validation
- `public/study-it/quiz_data.json` への公開用クイズデータ生成
- `reports/quiz-quality-report.md` の生成
- quiz report freshness check
- public quiz data freshness check
- Zodによるlearning item schema validation
- source policy validation
- negative validation fixtures
- `reports/quality-report.md` の生成
- quality report freshness check
- dependency policy validation
- public repository safety check
- security baseline
- performance baseline
- Playwright E2E smoke test
- `CI=1 bun run check` による統合local quality gate
- GitHub Actions quality gate
- GitHub Actions allowlist troubleshooting documentation
- Cloudflare Pages向けbuild
- `robots.txt`、`meta noindex`、`X-Robots-Tag` による検索露出制御
- Cloudflare Pages向けsecurity header設定
- Lighthouse CI warn-only補助検査
- devcontainer内でのLighthouse app check実行手順
- Playwright Chromiumを用いたLighthouse補助実行script
- `.option-button` のaccessible name改善
- favicon / icon link設定
- architecture documentation
- acceptance criteria documentation
- quiz schema / taxonomy / policy validation documentation
- dependency and TypeScript configuration policy documentation
- Lighthouse CI operation documentation
- devcontainer Lighthouse Chrome troubleshooting documentation
- portfolio readiness report
- quiz app technical explanation memo

---

## クイズ問題コンセプト

v0.1.0のクイズ問題は、本ポートフォリオ成果物を理解するための内製教材として位置づけています。

当初のクイズ問題は、外部技術学習や外部機関試験対策に寄った構成を含んでいました。
その後、公開ポートフォリオとしての説明可能性、第三者教材への依存回避、公式問題再現リスクの低減を考慮し、本リポジトリ自体の技術スタック・品質ゲート・データ検証・E2E・デプロイ構成を理解するためのクイズへ転換しました。

現在の主な出題領域は以下です。

- プロジェクト概要
- データ品質パイプライン
- schema validation / taxonomy validation
- policy validation
- 品質ゲートとCI
- React / ViteクイズUI
- Cloudflare Pagesデプロイ
- ドキュメントと説明設計
- Git運用

この転換により、外部公式問題の再現ではなく、ポートフォリオ成果物自体の設計意図を説明するクイズとして扱える状態になっています。

---

## 変更管理方針

v0.1.0固定前の変更では、公開前のリスクを下げるため、変更を責務単位で分離してコミットしました。

主な変更単位は以下です。

| 変更単位               | 主な内容                                                                                          | 目的                                                             |
| ---------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 検索露出制御           | [robots.txt](/robots.txt)、`meta noindex`、`X-Robots-Tag`、Cloudflare Pages向け `_headers` を整備 | 公開demoの検索engine indexを抑制する                             |
| Security header設定    | `Content-Security-Policy`、`Strict-Transport-Security` などを `_headers` に追加                   | Cloudflare Pages配信時の基本的なbrowser security postureを整える |
| GitHub Actions運用     | Actions allowlistエラーの原因と復旧手順をtroubleshooting docsに記録                               | CI実行権限の設定不備を再現・説明できるようにする                 |
| Lighthouse補助観測     | [lighthouserc.app.json](/lighthouserc.app.json) とPlaywright Chromiumを使う補助scriptを追加       | devcontainer内でもブラウザ品質観測を再現可能にする               |
| UI / accessibility改善 | favicon、icon link、`QuizCard` の選択肢button semanticsを整理                                     | Lighthouse指摘に基づき、軽微なUI品質とaccessibilityを改善する    |
| 生成物管理             | `.lighthouseci/`、`dist/`、core dumpをGit管理対象外に整理                                         | 生成物やcrash dumpをPublic repoへ混入させない                    |


このように変更を分けることで、各変更の目的、影響範囲、検証方法を追跡しやすくしました。
また、問題が発生した場合に、検索露出制御、CI設定、Lighthouse実行環境、UI semantics、生成物管理のどの層に起因するかを切り分けやすくしています。

---

## 品質ゲート

主要なlocal品質ゲートは以下です。

```bash
CI=1 bun run check
```

このコマンドには、主に以下が含まれます。

- TypeScript typecheck
- client typecheck
- Bun unit tests
- learning data schema validation
- source policy validation
- quiz schema validation
- quiz taxonomy validation
- quiz policy validation
- quiz fixture responsibility validation
- quiz quality report freshness check
- public quiz data freshness check
- dependency policy validation
- public repository safety check
- quality report freshness check
- static site check
- client production build
- security baseline check
- performance baseline check
- Playwright E2E smoke test

この品質ゲートにより、データ、検証、生成物、UI、E2E、baselineをまとめて確認できます。

---

## 補助的な品質観測

v0.1.0では、必須品質ゲートとは別に、Lighthouse CIをwarn-onlyの補助検査として扱います。

Lighthouse CIは、現時点ではmerge blockやrequired quality gateには含めません。
理由は、Lighthouse scoreがCI環境の負荷、Chrome version、実行タイミング、container条件の影響を受けるためです。

現在のLighthouse CIでは、以下を分けて扱います。

| 設定                    | 測定対象    | 目的                                   |
| ----------------------- | ----------- | -------------------------------------- |
| `lighthouserc.json`     | `dist/site` | 静的レポートサイトの補助観測           |
| `lighthouserc.app.json` | `dist/app`  | React / Viteクイズアプリ本体の補助観測 |


アプリ向けLighthouse CIは、通常環境では以下のコマンドで実行します。

```bash
bun run lighthouse:app:check
```

devcontainer内では、Playwrightが管理するChromiumを明示的に使う以下のコマンドを推奨します。

```bash
bun run lighthouse:app:check:pw
```

この検査は、主成果物であるクイズアプリ本体のperformance、accessibility、best practices、SEOの改善候補を把握するために使います。

---

## devcontainer内Lighthouse実行の再現性

devcontainer内では、host OS側のChromeを直接参照できないため、Lighthouse CIが次のように失敗する場合があります。

```text
Chrome installation not found
```

また、Playwright Chromiumを参照できても、container内のChromium sandbox制約により次のエラーが発生する場合があります。

```text
No usable sandbox
Unable to connect to Chrome
```

v0.1.0では、Playwrightが管理するChromium executable pathを取得し、`CHROME_PATH` としてLighthouse CIへ渡す補助scriptを用意しました。

devcontainer向けのLighthouse実行では、以下のChrome flagsを使います。

```text
--headless=new --no-sandbox --disable-dev-shm-usage
```

この対応により、devcontainer内でもLighthouse app checkを再現可能にします。

なお、`--no-sandbox` は一般論として安全側の設定ではないため、本リポジトリでは以下の範囲に限定して利用します。

```text
- 測定対象は自分のlocal build済み静的アプリ
- 任意の外部Webサイトを巡回しない
- devcontainer内の補助検査として実行する
- Lighthouse CIはwarn-only補助観測として扱う
- GitHub tokenやsecretをbrowserへ渡さない
```

---

## Lighthouse診断に基づくUI / accessibility改善

Lighthouse app reportでは、選択肢buttonに対して `label-content-name-mismatch` が検出される場合がありました。

対象は以下です。

```text
src/client/components/QuizCard.tsx
```

原因は、button内部に十分な可視テキストがあるにもかかわらず、`aria-label` でaccessible nameを手動上書きしていたことです。

v0.1.0では、`.option-button` の `aria-label` による名前上書きを見直し、button内部の可視テキストからaccessible nameが自然に計算されるように整理しました。

この変更により、以下を維持したままaccessibility上の整合性を改善します。

```text
維持する:
  - 選択肢の表示
  - 選択肢click
  - 正誤判定
  - selected / correct / incorrect class
  - feedback表示
  - 次の問題への遷移

改善する:
  - visible text と accessible name の整合性
  - screen reader / 音声操作から見たbutton名
  - Lighthouse accessibility audit上の警告
```

また、favicon / icon linkも追加し、`/favicon.ico` 404に起因するconsole errorを避けるようにしました。

---

## SEO warningと検索露出制御

Cloudflare Pages demoでは、検索エンジンへのindexを抑制するため、以下を意図的に設定します。

```html
<meta name="robots" content="noindex,nofollow,noarchive" />
```

```text
X-Robots-Tag: noindex, nofollow, noarchive
```

また、`robots.txt` でもcrawler巡回抑制を指定します。

```text
User-agent: *
Disallow: /
```

このため、Lighthouse SEO auditでは `is-crawlable` が失敗し、SEO category scoreが閾値を下回る場合があります。

これは、検索露出低減方針に伴う既知のwarningとして扱います。
SEO scoreを上げるために `noindex` を外すことはしません。

一方で、以下の基本metadataは維持します。

```text
- lang
- title
- description
- viewport
- valid robots.txt
```

---

## 主要成果物

v0.1.0の主要成果物は以下です。

| 成果物                                                                                                            | 役割                                                      |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| [src/client/](/src/client/)                                                                                       | React / ViteクイズUI                                      |
| [src/client/components/QuizCard.tsx](/src/client/components/QuizCard.tsx)                                         | クイズカードと選択肢buttonの描画                          |
| [data/raw/quiz-questions.json](/data/raw/quiz-questions.json)                                                     | クイズ問題の正本データ                                    |
| [data/raw/subject-taxonomy.json](/data/raw/subject-taxonomy.json)                                                 | クイズ分類体系の正本                                      |
| [public/study-it/quiz_data.json](/public/study-it/quiz_data.json)                                                 | UIが読み込む公開用クイズデータ                            |
| [public/robots.txt](/public/robots.txt)                                                                           | crawler巡回抑制方針                                       |
| [public/\_headers](/public/_headers)                                                                              | Cloudflare Pages向けsecurity header / `X-Robots-Tag` 設定 |
| [public/favicon.svg](/public/favicon.svg)                                                                         | favicon                                                   |
| [reports/quiz-quality-report.md](/reports/quiz-quality-report.md)                                                 | クイズデータ品質レポート                                  |
| [reports/quality-report.md](/reports/quality-report.md)                                                           | learning data品質レポート                                 |
| [reports/portfolio-readiness.md](/reports/portfolio-readiness.md)                                                 | ポートフォリオ提出準備レポート                            |
| [reports/local-reproducibility-check-v0.1.0.md](/reports/local-reproducibility-check-v0.1.0.md)                   | local再現性確認レポート                                   |
| [docs/architecture/architecture.md](/docs/architecture/architecture.md)                                           | アーキテクチャ説明                                        |
| [docs/acceptance-criteria.md](/docs/acceptance-criteria.md)                                                       | 受け入れ基準                                              |
| [docs/quiz-schema-taxonomy-validation.md](/docs/quiz-schema-taxonomy-validation.md)                               | クイズデータ検証方針                                      |
| [docs/dependency-and-tsconfig-policy.md](/docs/dependency-and-tsconfig-policy.md)                                 | 依存関係とTypeScript設定方針                              |
| [docs/lighthouse-ci.md](/docs/lighthouse-ci.md)                                                                   | Lighthouse CI運用方針                                     |
| [docs/troubleshooting/devcontainer-lighthouse-chrome.md](/docs/troubleshooting/devcontainer-lighthouse-chrome.md) | devcontainer内Lighthouse Chromeトラブルシューティング     |
| [docs/troubleshooting/github-actions-allowlist.md](/docs/troubleshooting/github-actions-allowlist.md)             | GitHub Actions allowlistトラブルシューティング            |
| [docs/interview/quiz-app-explanation.md](/docs/interview/quiz-app-explanation.md)                                 | クイズアプリ技術説明メモ                                  |
| [.github/workflows/quality-gate.yml](/.github/workflows/quality-gate.yml)                                         | 必須品質ゲートworkflow                                    |
| [.github/workflows/lighthouse-warn.yml](/.github/workflows/lighthouse-warn.yml)                                   | 静的レポートサイト向けLighthouse補助workflow              |
| [.github/workflows/lighthouse-app-warn.yml](/.github/workflows/lighthouse-app-warn.yml)                           | クイズアプリ向けLighthouse補助workflow                    |
| [lighthouserc.json](/lighthouserc.json)                                                                           | 静的レポートサイト向けLighthouse設定                      |
| [lighthouserc.app.json](/lighthouserc.app.json)                                                                   | クイズアプリ向けLighthouse設定                            |
| [scripts/run-lhci-app-with-playwright-chromium.mjs](/scripts/run-lhci-app-with-playwright-chromium.mjs)           | devcontainer向けLighthouse実行補助script                  |


## デプロイ

v0.1.0では、Cloudflare Pagesをデプロイ先として扱います。

Cloudflare Pagesでは、完全品質ゲートではなく、デプロイ用buildと静的配信に責務を限定します。
完全な品質確認は、GitHub Actionsの `CI=1 bun run check` で行います。
`
Cloudflare Pages向けのbuildでは、以下を想定します。

```text
Build command:
  bun install --frozen-lockfile && bun run pages:build

Build output directory:
  dist/app
```

この責務分離により、GitHub Actionsでは品質保証を行い、Cloudflare Pagesでは公開用buildと配信を担います。

---

## 生成物とGit管理対象外ファイル

v0.1.0では、生成物や一時fileをGit管理対象外として扱います。

主な対象は以下です。

```text
- dist/
- .lighthouseci/
- .lighthouseci/app-reports/*.html
- .lighthouseci/app-reports/*.json
- .lighthouseci/app-reports/core
- playwright-report/
- test-results/
- core
- core.*
- *.core
```

`.lighthouseci/app-reports/core` は、Chromium異常終了時に生成されるcore dumpである可能性があります。
これはLighthouse reportではなく、local crash dumpであり、Git管理対象にはしません。

Lighthouse結果を証跡として残す場合は、HTML report本体ではなく、`docs/` または `reports/` に要約して残します。

---

## 既知の制約

このreleaseには、以下の制約があります。

- learning data側の外部URLについて、到達可能性の自動検査はまだ実装していません。
- learning data側の外部sourceについて、参照元の鮮度や更新状況の自動検査はまだ実装していません。
- 参照内容そのものの事実正確性は、自動検証の対象にしていません。
- quiz dataのsourceはrepo内部pathを前提としていますが、repo内部pathの存在確認や参照先内容との意味的整合性までは完全には検査していません。
- Web UIはReact / Viteで実装済みですが、複数ユーザー利用、ログイン、学習履歴の永続保存は実装していません。
- Playwright E2Eは主要導線のsmoke testに限定しており、網羅的なブラウザ・端末・アクセシビリティ検証はまだ実装していません。
- security / performance baselineは実装済みですが、本格的な継続監視、アラート通知、real user monitoring、production-grade observabilityはまだ実装していません。
- Cloudflare Pages向けbuildは整備済みですが、デプロイ後の継続的なsynthetic monitoringや自動復旧運用はまだ実装していません。
- public repository safety checkは導入済みですが、専用ツールによるfull secret scanning engineの代替にはなりません。
- Lighthouse CIはwarn-onlyの補助観測であり、必須品質ゲートには含めていません。
- Lighthouse SEO scoreは、検索露出低減のための `noindex` / `nofollow` / `noarchive` 設定により低く出る場合があります。
- devcontainer向けLighthouse実行では、container制約を回避するために `--no-sandbox` を使います。この運用はlocal build済み静的アプリの補助観測に限定します。
- 現在のクイズは16問構成であり、taxonomy coverageや出題粒度は今後20〜24問程度へ拡充する余地があります。

---

## Release Decision

このreleaseは、以下に焦点を当てた小型QA/SREポートフォリオMVPとして適しています。

```text
portfolio-focused quiz app
  -> structured raw data
  -> schema validation
  -> taxonomy validation
  -> policy validation
  -> negative fixtures
  -> public data generation
  -> report generation
  -> report freshness
  -> client build
  -> Playwright E2E
  -> dependency reproducibility
  -> public safety
  -> browser security headers
  -> security / performance baseline
  -> CI quality gate
  -> Cloudflare Pages deployment
  -> Lighthouse warn-only observation
  -> devcontainer reproducibility
  -> accessibility refinement
  -> documentation
```

v0.1.0は、本番運用サービスではありません。
一方で、QA/SRE志向のポートフォリオとして、変更を安全に検証し、生成物を同期し、CI/CDとデプロイ責務を説明できるMVPとして扱えます。

また、公開前の変更を責務単位で分離したことで、検索露出制御、CI設定、Lighthouse実行環境、UI/accessibility改善、生成物管理を独立して説明しやすい構成になっています。

---

## 次のステップ

v0.1.0固定後は、以下を検討します。

- branch protectionの設定
- required quality-gate checkの有効化
- GitHub Releaseの作成
- release tag `v0.1.0` の作成
- Cloudflare Pages production URLの最終確認
- READMEから主要docs / reportsへの導線整理
- クイズ問題を20〜24問程度へ拡充
- taxonomy coverageの改善
- repo内部pathの存在確認検査
- クイズsourceと参照先内容の意味的整合性確認
- production URLのLighthouse補助測定
- Lighthouse結果の要約report化
- accessibility改善項目のissue化
- synthetic monitoringの検討
- alert通知の検討
- releaseごとの品質指標比較
