# Local Reproducibility Check for v0.1.0

## 1. 目的

このレポートは、`qa-sre-learning-mvp` をホストPC上の任意ディレクトリへ新規cloneし、依存関係のinstall、公開用クイズデータ生成、production build、品質ゲート、E2E、Lighthouse補助観測が再現できることを確認するものです。

本ポートフォリオでは、単にアプリが手元で動くことだけではなく、localとCIで同じ検証を再現できることを重視しています。
そのため、このレポートでは、提出前の再現性確認として、主要な検証コマンドの実行結果を整理します。

---

## 2. 確認対象

確認対象は、`qa-sre-learning-mvp` のv0.1.0相当の成果物です。

この成果物には、以下が含まれます。

- React / Viteによるクイズアプリ
- 16問のポートフォリオ理解用クイズ
- raw quiz dataからpublic quiz JSONへの生成処理
- schema validation
- taxonomy validation
- policy validation
- fixture responsibility validation
- report freshness check
- public data freshness check
- public repository safety check
- security baseline
- performance baseline
- Playwright E2E
- Lighthouse CI warn-only補助観測

---

## 3. 実行環境

確認は、ホストPC上の任意ディレクトリで、新規cloneしたrepositoryに対して実行しました。

| 項目                      | 内容                            |
| ------------------------- | ------------------------------- |
| package manager / runtime | Bun                             |
| Bun version               | `1.3.14`                        |
| client build tool         | Vite                            |
| client framework          | React                           |
| E2E framework             | Playwright                      |
| Lighthouse tool           | Lighthouse CI                   |
| install mode              | `bun install --frozen-lockfile` |


この確認では、既存の作業ディレクトリではなく、新規cloneした作業ツリーで再現性を確認しています。

---

## 4. 実行した主要コマンド

今回の確認では、以下のコマンドを実行しました。

```bash id="buyr8l"
bun install --frozen-lockfile
bun run prepare:public-quiz-data
bun run client:build
bunx playwright install --with-deps chromium
CI=1 bun run check
bun run lighthouse:app:check
```

これにより、依存関係、データ生成、client build、統合品質ゲート、E2E、Lighthouse補助観測を確認しました。

---

## 5. public quiz data生成

公開用クイズデータ生成は成功しました。

```text id="ralz1h"
Public quiz data generated: public/study-it/quiz_data.json
Questions: 16
```

この結果により、`data/raw/quiz-questions.json` を正本として、UIが読み込む `public/study-it/quiz_data.json` を再生成できることを確認しました。

---

## 6. client production build

React / Viteクイズアプリのproduction buildは成功しました。

```text id="a17sir"
vite building client environment for production
104 modules transformed
dist/app/index.html
dist/app/assets/index-*.css
dist/app/assets/index-*.js
build completed
```

生成された主な成果物は以下です。

| Build artifact                |      Size |     gzip |
| ----------------------------- | --------: | -------: |
| `dist/app/index.html`         |   0.63 kB |  0.43 kB |
| `dist/app/assets/index-*.css` |   3.64 kB |  1.18 kB |
| `dist/app/assets/index-*.js`  | 259.79 kB | 79.13 kB |


この結果により、Cloudflare Pagesの公開対象である `dist/app` を新規clone環境でも生成できることを確認しました。

---

## 7. 統合品質ゲート

統合品質ゲートは以下のコマンドで実行しました。

```bash id="bs8ml0"
CI=1 bun run check
```

このコマンドでは、以下の検査が実行されました。

- TypeScript typecheck
- client typecheck
- Bun unit tests
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
- quality report freshness check
- static site check
- client production build
- security baseline check
- performance baseline check
- Playwright E2E smoke test

統合品質ゲートは成功しました。

---

## 8. unit test結果

Bun unit testsは成功しました。

```text id="h3iw82"
22 pass
0 fail
68 expect() calls
12 files
```

主な確認対象は以下です。

- quiz result summary
- source policy validation
- quiz question schema validation
- invalid quiz schema fixture
- invalid quiz taxonomy fixture
- invalid quiz policy fixture
- learning item schema
- quiz taxonomy validation
- shuffle behavior
- quality report generation

この結果により、validation logic、fixture責務、report生成、quiz data構造の基本動作を確認しました。

---

## 9. validation結果

主なvalidationは成功しました。

| Validation                             | Result              |
| -------------------------------------- | ------------------- |
| learning data validation               | passed              |
| source policy validation               | passed              |
| quiz schema / taxonomy validation      | 16 questions passed |
| quiz policy validation                 | 16 questions passed |
| quiz fixture responsibility validation | passed              |
| dependency policy validation           | passed              |
| public repository safety check         | passed              |


fixture responsibility validationでは、異常系fixtureが期待した検証層で失敗することを確認しました。

| Fixture                                                                   | Expected layer | Result                              |
| ------------------------------------------------------------------------- | -------------- | ----------------------------------- |
| [invalid-quiz-schema.json](/invalid-quiz-schema.json)                     | schema         | fail at schema                      |
| [invalid-quiz-taxonomy.json](/invalid-quiz-taxonomy.json)                 | taxonomy       | pass schema, fail taxonomy          |
| [policy-invalid-quiz-questions.json](/policy-invalid-quiz-questions.json) | policy         | pass schema / taxonomy, fail policy |

この結果により、単に異常系が失敗するだけでなく、どの検証層で失敗すべきかを分離して確認できることを示しました。

---

## 10. 生成物鮮度確認

生成物の鮮度確認は成功しました。

| Generated artifact                                                 | Check                                    |
| ------------------------------------------------------------------ | ---------------------------------------- |
| [reports/quiz-quality-report.md](/reports/quiz-quality-report.md)` | `bun run quiz:report:check`              |
| [public/study-it/quiz_data.json](/public/study-it/quiz_data.json)  | `bun run prepare:public-quiz-data:check` |
| [reports/quality-report.md](/reports/quality-report.md)            | `bun run report:check`                   |


これらの検査では、生成コマンドを実行した後に `git diff --exit-code` を使い、生成物が最新状態であることを確認します。

この仕組みにより、raw dataを更新したにもかかわらず、reportやpublic JSONを更新し忘れる状態を検出できます。

---

## 11. static site / baseline確認

static site buildとbaseline checkは成功しました。

| Check                | Result |
| -------------------- | ------ |
| static site build    | passed |
| security baseline    | passed |
| performance baseline | passed |


performance baselineでは、以下の結果を確認しました。

```text id="x57ms7"
Performance baseline check passed.
Total size: 50465 bytes.
```

このbaselineは、本格的なproduction monitoringではありません。
ただし、MVP段階で扱いやすい決定的な品質指標として、静的成果物のサイズや最低限の品質基準を確認しています。

---

## 12. Playwright E2E

Playwright E2Eは成功しました。

```text id="ssz0fp"
2 passed
```

確認した主な導線は以下です。

- クイズアプリが読み込まれること
- 最小セッションを完了できること
- 回答後のfeedbackが表示されること
- 正誤feedbackが視覚的に区別できること

Playwrightでは、preview serverを起動し、Chromium上で実際のユーザー導線を確認しました。
これにより、build済みアプリがブラウザ上で最低限動作することを確認しました。

---

## 13. Lighthouse app補助観測

React / Viteクイズアプリ本体に対するLighthouse CI補助観測は成功しました。

```text id="prv9ih"
Healthcheck passed
Running Lighthouse 3 time(s)
All results processed
Done writing reports to disk
```

対象は `dist/app` であり、出力先は以下です。

```text id="buby6a"
.lighthouseci/app-reports
```

Lighthouse CIはwarn-onlyの補助観測として扱っています。
そのため、必須品質ゲートやmerge blockには含めていません。

GitHub token未設定のwarningは表示されましたが、今回の設定ではfilesystem出力を使っているため、レポート生成には影響しませんでした。

---

## 14. 確認結果の解釈

今回の確認により、以下を示せました。

```text id="i5wkju"
git clone
  -> frozen install
  -> public quiz data generation
  -> client production build
  -> integrated quality gate
  -> Playwright E2E
  -> Lighthouse warn-only observation
```

この流れがホストPC上の任意ディレクトリで再現できたため、`qa-sre-learning-mvp` は、第三者がcloneして検証できるポートフォリオ成果物として扱いやすい状態にあります。

---

## 15. 現在の制約

現在の制約は以下です。

- この確認は、1つのホストPC環境でのlocal再現性確認です。
- すべてのOS、CPU architecture、Node / Bun versionでの動作を保証するものではありません。
- Lighthouse scoreはCI環境や実行タイミングの影響を受けるため、warn-onlyの補助観測として扱います。
- Playwright E2Eはsmoke testであり、全ブラウザ、全端末、全アクセシビリティ観点を網羅するものではありません。
- public safety checkは、専用secret scanning engineの完全な代替ではありません。
- production環境の継続監視、alert、real user monitoringはまだ実装していません。

---

## 16. まとめ

今回のlocal再現性確認では、依存関係install、公開用クイズデータ生成、client production build、統合品質ゲート、Playwright E2E、Lighthouse app補助観測が成功しました。

これにより、`qa-sre-learning-mvp` は、単なるUI実装ではなく、データ品質、検証責務、生成物鮮度、E2E、CI/CD、公開安全性を含むQA/SRE志向のポートフォリオMVPとして、第三者に提示しやすい状態にあることを確認しました。
