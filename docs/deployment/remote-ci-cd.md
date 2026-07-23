# Remote CI/CD Strategy


## 1. 目的

この文書は、`qa-sre-learning-mvp` におけるremote CI/CDの責務分離を整理するものです。

本リポジトリでは、React / Viteクイズアプリ、構造化クイズデータ、schema / taxonomy / policy validation、Playwright E2E、品質レポート生成、Cloudflare Pagesデプロイを扱います。

remote CI/CDでは、GitHub ActionsとCloudflare Pagesに同じ責務を持たせません。
GitHub Actionsは完全な品質ゲートを担当し、Cloudflare Pagesは公開用buildと静的配信を担当します。

---

## 2. 基本方針

remote CI/CDの基本方針は以下です。

```text
GitHub Actions:
  完全な品質ゲートを実行する
  TypeScript typecheck、validation、unit test、Playwright E2Eを含める
  Playwright ChromiumをinstallしてからE2Eを実行する
  生成物の鮮度確認とpublic safety checkを実行する

Cloudflare Pages:
  deployment-safe buildを実行する
  Playwright E2Eは実行しない
  公開用のdist/appを生成する
  静的配信を担当する

Lighthouse CI:
  必須品質ゲートには含めない
  warn-onlyの補助観測として扱う
  dist/siteまたはdist/appを対象にブラウザ観点の品質を観測する
```

この分離により、GitHub Actionsでは品質保証を行い、Cloudflare Pagesではdeployに必要なbuildだけを行います。

---

## 3. 責務分離

| 領域                             | GitHub Actions | Cloudflare Pages |       Lighthouse CI |
| -------------------------------- | -------------: | ---------------: | ------------------: |
| TypeScript typecheck             |       実行する |       実行しない |          実行しない |
| client typecheck                 |       実行する |       実行しない |          実行しない |
| unit test                        |       実行する |       実行しない |          実行しない |
| data validation                  |       実行する |   必要最小限のみ |          実行しない |
| quiz validation                  |       実行する |   必要最小限のみ |          実行しない |
| report freshness check           |       実行する |       実行しない |          実行しない |
| public quiz data freshness check |       実行する |    build内で生成 |          実行しない |
| dependency policy validation     |       実行する |       実行しない |          実行しない |
| public safety check              |       実行する |       実行しない |          実行しない |
| security baseline                |       実行する |       実行しない |          実行しない |
| performance baseline             |       実行する |       実行しない |          実行しない |
| Playwright E2E                   |       実行する |       実行しない |          実行しない |
| React / Vite build               |       実行する |         実行する |    測定前に実行する |
| deployment                       |     実行しない |         実行する |          実行しない |
| Lighthouse score observation     |           任意 |       実行しない | warn-onlyで実行する |

Cloudflare Pagesに完全品質ゲートを持たせない理由は、deployment環境の責務を単純に保つためです。
E2Eや生成物鮮度確認のような失敗原因の切り分けが必要な検査は、GitHub Actions側で実行します。

---

## 4. 主要コマンド

localおよびGitHub Actionsでの主要品質ゲートは以下です。

```bash
CI=1 bun run check
```

Cloudflare Pages向けのbuildは以下です。

```bash
bun run pages:build
```

Lighthouse CIによる補助観測は以下です。

```bash
bun run lighthouse:site:check
bun run lighthouse:app:check
```

Lighthouse CIはwarn-onlyの補助検査とし、`CI=1 bun run check` の代替にはしません。

---

## 5. GitHub Actions

GitHub Actionsでは、完全な品質ゲートを実行します。

代表的な実行手順は以下です。

```bash
bun install --frozen-lockfile
bunx playwright install --with-deps chromium
CI=1 bun run check
```

`CI=1 bun run check` には、主に以下を含めます。

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

GitHub Actionsでは、Playwright E2Eを実行する前にChromiumをinstallします。
これにより、localだけでなくremote CIでもブラウザテストを再現できるようにします。

---

## 6. Cloudflare Pages

Cloudflare Pagesでは、deployment-safe buildのみを実行します。

設定例は以下です。

```text
Build command:
  bun install --frozen-lockfile && bun run pages:build

Build output directory:
  dist/app

Root directory:
  空欄

NODE_VERSION:
  22.16.0
```

Cloudflare Pagesでは、Playwright E2Eを実行しません。
E2E、validation、public safety check、baseline checkは、GitHub Actions側で完了させる方針です。

`pages:build` は、公開用クイズデータを生成したうえでReact / Viteアプリをbuildします。
最終的な公開対象は `dist/app` です。

---

## 7. Lighthouse CI

Lighthouse CIは、必須品質ゲートではなくwarn-onlyの補助観測として扱います。

現在は、以下の2系統を分けて扱います。

| 設定                    | 測定対象    | 出力先                      |
| ----------------------- | ----------- | --------------------------- |
| `lighthouserc.json`     | `dist/site` | `.lighthouseci/reports`     |
| `lighthouserc.app.json` | `dist/app`  | `.lighthouseci/app-reports` |

静的レポートサイトを測定する場合は、以下を実行します。

```bash
bun run lighthouse:site:check
```

クイズアプリ本体を測定する場合は、以下を実行します。

```bash
bun run lighthouse:app:check
```

Lighthouse CIの結果は、改善候補の把握に使います。
Lighthouse scoreはCI環境の負荷や実行タイミングに影響されるため、現時点ではmerge blockには使いません。

---

## 8. build output

主なbuild outputは以下です。

| 出力先                                  | 生成元                    | 用途                                    | Git管理    |
| --------------------------------------- | ------------------------- | --------------------------------------- | ---------- |
| `dist/app`                              | React / Vite client build | Cloudflare Pages公開対象                | 管理しない |
| `dist/site`                             | static site build         | レポートサイト・Lighthouse site測定対象 | 管理しない |
| `.ポートサイト・Lighthouse site測定対象 | 管理しない                |                                         |            |
| `.lighthouseci/reports`                 | Lighthouse site測定       | 補助観測report                          | 管理しない |
| `.lighthouseci/app-reports`             | Lighthouse app測定        | 補助観測report                          | 管理しない |
| `playwright-report/`                    | Playwright E2E            | E2E report                              | 管理しない |
| `test-results/`                         | Playwright E2E            | test artifact                           | 管理しない |

これらの生成物は実行ごとに変化するため、通常はGit管理対象にしません。

---

## 9. branch protection

GitHub上でbranch protectionを設定する場合は、必須checkをGitHub Actionsのquality gateに集約します。

推奨されるrequired checkは以下です。

```text
quality-gate
```

Lighthouse系workflowは、当面required checkにしません。

```text
lighthouse-warn:
  requiredにしない

lighthouse-app-warn:
  requiredにしない
```

理由は、Lighthouse scoreが実行環境の揺らぎを受けるためです。
品質保証の中心は、決定的に再現しやすい `CI=1 bun run check` に置きます。

---

## 10. 失敗分類

remote CI/CDで想定される主な失敗分類は以下です。

### 10.1 script not found

```text
Cause:
  package.json script mismatch
  old commit deployed
  Cloudflare Pagesが古いbranchまたは古いcommitをbuildしている

Example:
  error: Script not found "pages:build"

Policy:
  package.jsonのscriptsを確認する
  Cloudflare Pagesのconnected branchを確認する
  latest commitがdeploy対象になっているか確認する
```

### 10.2 cannot find cwd

```text
Cause:
  Cloudflare PagesのRoot directory設定が不正
  repository root以外を誤って指定している

Example:
  Error: Cannot find cwd: /opt/buildhome/repo/repository root

Policy:
  Root directoryは空欄にする
  Build commandはrepository rootから実行される前提にする
```

### 10.3 Playwright executable missing

```text
Cause:
  Playwright browser binaries were not installed

Example:
  browserType.launch: Executable does not exist

Policy:
  GitHub Actionsで `bunx playwright install --with-deps chromium` を実行する
  Cloudflare PagesではPlaywright E2Eを実行しない
```

### 10.4 modified playwright-report

```text
Cause:
  generated artifacts are tracked by Git
  Playwright実行後にreport directoryが変更扱いになる

Policy:
  playwright-report/ and test-results/ should be ignored
  generated E2E artifacts should not be committed
```

### 10.5 stale generated report

```text
Cause:
  raw dataを更新したが、quality reportまたはquiz quality reportを再生成していない

Example:
  report freshness check failed
  git diff --exit-code failed

Policy:
  bun run quiz:report
  bun run prepare:public-quiz-data
  bun run quiz:report:check
  bun run prepare:public-quiz-data:check
```

### 10.6 stale public quiz data

```text
Cause:
  data/raw/quiz-questions.jsonを更新したが、public/study-it/quiz_data.jsonを更新していない

Policy:
  bun run prepare:public-quiz-data
  bun run prepare:public-quiz-data:check
```

### 10.7 Cloudflare Pages build output mismatch

```text
Cause:
  Build output directoryがdist/app以外になっている
  pages:buildがdist/appを生成していない

Policy:
  Cloudflare PagesのBuild output directoryをdist/appにする
  bun run pages:buildでdist/appが生成されることを確認する
```

### 10.8 Lighthouse report generated

```text
Cause:
  Lighthouse CI実行により.lighthouseci/配下にreportが生成された

Policy:
  .lighthouseci/ should be ignored
  Lighthouse reports should be uploaded as CI artifacts if needed
  Lighthouse reports should not be committed
```

### 10.9 public safety check failure

```text
Cause:
  公開repoに含めるべきではない文字列やファイルが検出された
  privateな就活メモ、secret-like text、token、passwordなどが含まれている

Policy:
  public safety checkの検出結果を確認する
  private/配下へ移動する
  .gitignoreを確認する
  実在するsecretが含まれる場合は即時rotateする
```

---

## 11. 推奨確認手順

remote CI/CDへpushする前には、localで以下を確認します。

```bash
git status -sb
bun run validate:public-safety
CI=1 bun run check
bun run lighthouse:app:check
```

静的レポートサイト側も確認する場合は、以下を実行します。

```bash
bun run lighthouse:site:check
```

生成物が誤ってcommit対象になっていないか確認します。

```bash
git status --ignored -s | grep -E "dist/|.lighthouseci/|playwright-report/|test-results/" || true
```

commit対象を確認します。

```bash
git diff --stat
git status -sb
```

---

## 12. 推奨運用

通常の開発では、以下の順序で運用します。

```text
local edit
  -> local validation
  -> CI=1 bun run check
  -> optional Lighthouse warn-only check
  -> commit
  -> push
  -> GitHub Actions quality gate
  -> Cloudflare Pages deploy
```

release前には、以下を確認します。

```text
quality-gate:
  success

Cloudflare Pages:
  latest deployment success

Lighthouse:
  warn-only report generated

README/docs/reports:
  current implementationと矛盾しない

generated artifacts:
  required files are fresh
  ignored artifacts are not committed
```

---

## 13. まとめ

本リポジトリでは、GitHub ActionsとCloudflare Pagesの責務を明確に分けます。

GitHub Actionsは、`CI=1 bun run check` により、型検査、validation、生成物鮮度確認、public safety check、security / performance baseline、Playwright E2Eを含む完全な品質ゲートを実行します。

Cloudflare Pagesは、`bun install --frozen-lockfile && bun run pages:build` により、公開用の [dist/app](/dist/app) を生成して静的配信します。

Lighthouse CIは、必須品質ゲートではなく、warn-onlyの補助観測として扱います。
この分離により、remote CI/CDを安定させながら、QA/SRE志向のポートフォリオとして説明可能な品質保証とデプロイ構成を維持します。
