# Devcontainer内Lighthouse Chromeトラブルシューティング

## 1. 目的

この文書は、`qa-sre-learning-mvp` のdevcontainer内でLighthouse CIを実行する際に発生したChrome / Chromium関連トラブルと、その切り分け・修正・再発防止方針を整理するものです。

対象は、主に以下のコマンドです。

```bash
bun run lighthouse:app:check
bun run lighthouse:app:check:pw
```

本リポジトリでは、Lighthouse CIを必須品質ゲートではなく、ブラウザ観点の品質を観測するwarn-only補助検査として扱います。

必須品質ゲートは以下に集約します。

```bash
CI=1 bun run check
```

---

## 2. 発生した症状

devcontainer内でLighthouse CIを実行した際、以下の問題が発生しました。

### 2.1 Chrome installation not found

```text
Chrome installation not found
Healthcheck failed!
```

これは、Lighthouse CIがdevcontainer内で利用可能なChrome / Chromium実行ファイルを検出できない状態です。

### 2.2 No usable sandbox

Playwright Chromiumを `CHROME_PATH` 経由でLighthouse CIへ渡した後、次のエラーが発生しました。

```text
Chrome installation found
Healthcheck passed!
...
No usable sandbox!
Unable to connect to Chrome
```

これは、Chromiumの実行ファイルは見つかったものの、container内でChromium sandboxが利用できず、Chrome processが起動に失敗した状態です。

### 2.3 core dumpの生成

Lighthouse / Chromiumの異常終了後、以下のような大きなfileが生成される場合があります。

```text
.lighthouseci/app-reports/core
```

これはLighthouse reportではなく、Chromium異常終了時のcore dumpである可能性が高いです。Git管理対象にはしません。

---

## 3. 原因整理

devcontainer内では、host OS側のGoogle Chromeをそのまま参照できません。

そのため、Lighthouse CIは以下の理由で失敗することがあります。

```text
原因:
  - host側Chromeとcontainer内実行環境が分離されている
  - container内にChrome / Chromium executableが存在しない
  - Playwright Chromiumは存在しても、Lighthouse CIが自動検出できない
  - Linux container内でChromium sandboxが利用できない
  - /dev/shm が小さく、Chromiumが不安定になる可能性がある
```

Playwright E2Eが成功していても、Lighthouse CIが成功するとは限りません。

```text
Playwright:
  Playwrightが管理するChromiumを利用する

Lighthouse CI:
  Chrome / Chromium executableを別経路で検出・起動する
```

したがって、devcontainer内では、Playwright Chromiumの実行pathを明示的にLighthouse CIへ渡す必要があります。

---

## 4. 採用した解決方針

本リポジトリでは、devcontainer内のLighthouse実行において、Google ChromeをDockerfileへ直接installするのではなく、Playwrightが管理するChromiumを利用します。

方針は以下です。

```text
採用:
  Playwright ChromiumをLighthouse CIに使わせる

手段:
  CHROME_PATHでChromium executable pathを渡す

container起動対策:
  --headless=new
  --no-sandbox
  --disable-dev-shm-usage
```

この方式により、Playwright E2EとLighthouse CIのbrowser runtimeを近づけ、devcontainer内での再現性を高めます。

---

## 5. 関連ファイル

| ファイル                                                                                                          | 役割                                                                   |
| ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| [lighthouserc.app.json](/lighthouserc.app.json)                                                                   | [dist/app](/dist/app) 向けLighthouse CI設定                            |
| [scripts/run-lhci-app-with-playwright-chromium.mjs](/scripts/run-lhci-app-with-playwright-chromium.mjs)           | Playwright Chromiumの実行pathを取得し、Lighthouse CIへ渡す補助script   |
| [.devcontainer/devcontainer.json](/.devcontainer/devcontainer.json)                                               | devcontainer作成後の依存関係installとPlaywright Chromium installを定義 |
| [.gitignore](/.gitignore)                                                                                         | `.lighthouseci/`、`dist/`、core dumpなどの生成物をGit管理対象外にする  |
| [docs/lighthouse-ci.md](/docs/lighthouse-ci.md)                                                                   | Lighthouse CI全体の運用方針                                            |
| [docs/troubleshooting/devcontainer-lighthouse-chrome.md](/docs/troubleshooting/devcontainer-lighthouse-chrome.md) | 本トラブルシューティング記録                                           |
|||


## 6. devcontainer作成時の前提

devcontainer内では、以下を実行して依存関係とPlaywright Chromiumを用意します。

```bash
bun install --frozen-lockfile
bunx playwright install --with-deps chromium
```

`.devcontainer/devcontainer.json` では、必要に応じて以下のように設定します。

```json
{
  "postCreateCommand": "bun install --frozen-lockfile && bunx playwright install --with-deps chromium"
}
```

---

## 7. devcontainer向けLighthouse実行コマンド

通常のLighthouse app checkは以下です。

```bash
bun run lighthouse:app:check
```

devcontainer内では、Playwright Chromiumを明示的に使う以下のコマンドを推奨します。

```bash
bun run lighthouse:app:check:pw
```

このコマンドは、内部的に以下を行います。

```text
1. React / Vite appをproduction buildする
2. Playwright Chromiumの実行pathを取得する
3. 取得したpathをCHROME_PATHとしてLighthouse CIへ渡す
4. container-compatible Chrome flagsを付けてLighthouse CIを実行する
```

---

## 8. `scripts/run-lhci-app-with-playwright-chromium.mjs` の役割

このscriptは、Playwrightが管理するChromium executable pathを取得し、Lighthouse CIへ渡します。

概念的には以下の処理です。

```text
Playwright Chromium executable path
  -> CHROME_PATH
  -> lhci autorun
```

使用するChrome flagsは以下です。

```text
--headless=new --no-sandbox --disable-dev-shm-usage
```

各flagの意味は以下です。

| flag                      | 目的                                                            |
| ------------------------- | --------------------------------------------------------------- |
| `--headless=new`          | GUIなしでChromiumを起動する                                     |
| `--no-sandbox`            | container内でChromium sandboxが使えない場合の起動失敗を回避する |
| `--disable-dev-shm-usage` | container内の小さい `/dev/shm` によるChromium不安定化を避ける   |

---

## 9. `--no-sandbox` の扱い

`--no-sandbox` は、Chromiumのsandboxを無効化するため、一般論としては安全側の設定ではありません。

ただし、本リポジトリでの利用条件は限定されています。

```text
利用条件:
  - 測定対象は自分のlocal build済み静的アプリ
  - 任意の外部Webサイトを巡回しない
  - devcontainer内の補助検査として実行する
  - Lighthouse CIはwarn-only補助観測として扱う
  - GitHub tokenやsecretをbrowserへ渡さない
```

したがって、現段階では、devcontainer内のLighthouse補助観測に限って `--no-sandbox` を許容します。

未知の外部URLを測定するcrawler用途や、本格的な共有CI基盤では、sandboxを有効にする構成を別途検討します。

---

## 10. Lighthouse実行結果の読み方

成功時は、以下のような流れになります。

```text
Chrome installation found
Healthcheck passed!
Started a web server
Running Lighthouse 3 time(s)
Run #1...done.
Run #2...done.
Run #3...done.
Done running Lighthouse!
Dumping reports to disk
Done running autorun.
```

以下のwarningは、local filesystem出力では通常問題ありません。

```text
GitHub token not set
```

本リポジトリでは、Lighthouse reportをfilesystemへ出力します。

```json
{
  "upload": {
    "target": "filesystem",
    "outputDir": ".lighthouseci/app-reports"
  }
}
```

そのため、local実行時にGitHub tokenが未設定でも問題ありません。

---

## 11. SEO warningの扱い

Cloudflare Pages demoでは、検索露出低減のために以下を意図的に設定します。

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

このため、Lighthouse SEO auditで `is-crawlable` が失敗し、SEO category scoreが閾値を下回る場合があります。

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

## 12. `.option-button` のaccessibility改善との関係

Lighthouse app reportでは、選択肢buttonに対して `label-content-name-mismatch` が検出される場合があります。

対象は以下です。

[src/client/components/QuizCard.tsx](/src/client/components/QuizCard.tsx)

主な原因は、button内部に十分な可視テキストがあるにもかかわらず、`aria-label` でaccessible nameを手動上書きしていることです。

修正方針は以下です。

```text
- option buttonのaria-labelを削除する
- button内部の可視テキストからaccessible nameを自然に計算させる
- option-statusのaria-hiddenを見直す
```

この修正により、見た目やclick動作は変えずに、支援技術から見たbutton名と可視テキストの整合性を改善します。

---

## 13. 生成物とcore dumpの扱い

Lighthouse CIは、local reportを以下に出力します。

```text
.lighthouseci/app-reports
```

このdirectoryは生成物であり、Git管理対象外です。

Chromiumが異常終了した場合、以下のようなcore dumpが生成されることがあります。

```text
.lighthouseci/app-reports/core
```

これはLighthouse reportではなく、local crash dumpです。Git管理対象にはしません。

削除する場合は以下です。

```bash
rm -rf .lighthouseci
```

再生成は以下で可能です。

```bash
bun run lighthouse:app:check:pw
```

---

## 14. `.gitignore` 方針

`.gitignore` には、少なくとも以下を含めます。

```gitignore
# Build outputs
dist/

# Test and browser reports
playwright-report/
test-results/
.lighthouseci/

# Crash dumps
core
core.*
*.core
```

`.lighthouseci/` がignoreされていれば、その配下のHTML reportやcore dumpもGit追跡対象になりません。

ただし、core dumpは別directoryに生成される可能性もあるため、`core`、`core.*`、`*.core` も明示的にignoreします。

---

## 15. 診断コマンド

### 15.1 Chrome / Chromium path確認

```bash
bun -e "import { chromium } from '@playwright/test'; console.log(chromium.executablePath())"
```

### 15.2 実行fileの存在確認

```bash
CHROME_PATH="$(bun -e "import { chromium } from '@playwright/test'; console.log(chromium.executablePath())")"
ls -l "$CHROME_PATH"
```

### 15.3 Lighthouse healthcheck

```bash
CHROME_PATH="$(bun -e "import { chromium } from '@playwright/test'; console.log(chromium.executablePath())")" \
  bunx lhci healthcheck --config=lighthouserc.app.json
```

### 15.4 devcontainer向けLighthouse実行

```bash
bun run lighthouse:app:check:pw
```

---

## 16. 検証ワークフロー

Lighthouse修正後は、以下の順に確認します。

```bash
bun run client:typecheck
bun run test:e2e
bun run lighthouse:app:check:pw
```

さらに、必須品質ゲートを確認します。

```bash
bun run validate:public-safety
CI=1 bun run check
```

生成物がGit追跡対象になっていないことも確認します。

```bash
git status -sb
git status --ignored -s | grep -E "\.lighthouseci|dist|playwright-report|test-results|core" || true
```

期待される状態は以下です。

```text
- .lighthouseci/ が git status -sb に未追跡fileとして出ない
- dist/ が git status -sb に未追跡fileとして出ない
- core dumpがGit管理対象になっていない
- CI=1 bun run check が成功する
- bun run lighthouse:app:check:pw が完走する
```

---

## 17. Public repository向けの扱い

Public repoには、以下を残します。

```text
残す:
  - Lighthouse CI設定
  - devcontainer向け実行script
  - troubleshooting docs
  - warn-only運用方針
  - 検証コマンド
  - 再発防止方針
```

Public repoには、以下を残しません。

```text
残さない:
  - .lighthouseci/app-reports/*.html
  - .lighthouseci/app-reports/*.json
  - .lighthouseci/app-reports/core
  - dist/
  - playwright-report/
  - test-results/
  - local absolute pathを含む生ログ
  - token / secret / private memo
```

Lighthouse結果を証跡として残す場合は、report本体ではなく、`docs/` または `reports/` に要約して残します。

---

## 18. commit例

devcontainer内Lighthouse実行環境の安定化は、以下のようにcommitします。

```bash
git add \
  lighthouserc.app.json \
  scripts/run-lhci-app-with-playwright-chromium.mjs \
  docs/troubleshooting/devcontainer-lighthouse-chrome.md

git commit -m "docs: devcontainer内Lighthouse Chromeトラブルシューティングを追加"
```

`.gitignore` も更新した場合は、以下を含めます。

```bash
git add .gitignore docs/troubleshooting/devcontainer-lighthouse-chrome.md
```

commit message例は以下です。

```bash
git commit -m "docs: devcontainer内Lighthouse Chromeトラブルシューティングを追加" \
  -m "Chrome installation not found、No usable sandbox、core dump生成など、devcontainer内でLighthouse CIを実行する際の問題と対処方針を整理した。" \
  -m "Playwright ChromiumをCHROME_PATHとして渡す方針、container-compatible Chrome flags、生成物をGit管理対象外にする運用を明記した。"
```

---

## 19. 最終判断

本トラブルは、アプリ本体の品質低下ではなく、browser-based品質観測をdevcontainer内で再現するための実行環境問題です。

本リポジトリでは、以下の方針で扱います。

```text
- 必須品質ゲートは CI=1 bun run check に集約する
- Lighthouse CIはwarn-only補助観測として扱う
- devcontainerでは Playwright Chromium を Lighthouse CI に使わせる
- container内のChromium起動には互換flagを使う
- SEO warningはnoindex方針に由来する場合は許容する
- .lighthouseci/ と core dump はGit管理しない
```

この対応により、devcontainer内でもLighthouse app checkを再現可能にしつつ、Public repoには安全で説明可能な設定・手順・判断理由だけを残します。
