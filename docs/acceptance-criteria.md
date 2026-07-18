# 受け入れ基準(docs/acceptance-criteria.md)

## 概要

このドキュメントは、`qa-sre-learning-mvp` をポートフォリオMVPとして受け入れるための基準を定義するものです。

本プロジェクトでは、学習用クイズアプリを題材として、以下を再現可能に示すことを目的とします。

- クイズアプリを公開環境で操作できること
- クイズデータを検証できること
- 学習データと品質レポートを生成できること
- 異常系fixtureにより検証層の責務を確認できること
- local環境とGitHub Actionsで同じ品質ゲートを実行できること
- Cloudflare Pagesへ静的アプリケーションをデプロイできること
- README、docs、reportsから技術判断を確認できること

MVPとしての合格条件は、単にアプリケーションコードが存在することではありません。
データ、UI、検証、ビルド、E2E、デプロイ、ドキュメントが、それぞれ確認可能な状態で揃っていることを受け入れ条件とします。

---

## 受け入れ判断の要約

最小限の受け入れ判断では、以下を確認します。

| 観点         | 合格条件                                             |
| :----------- | :--------------------------------------------------- |
| アプリ       | Cloudflare Pages上でクイズを操作できる               |
| データ       | raw dataから公開用JSONを生成できる                   |
| 検証         | schema、taxonomy、policy、fixture検証が成功する      |
| テスト       | unit testとPlaywright E2Eが成功する                  |
| 品質ゲート   | `CI=1 bun run check` が成功する                      |
| デプロイ     | `bun run pages:build` により `dist/app` を生成できる |
| ドキュメント | READMEから主要docsとreportsへ辿れる                  |
| 開発環境     | Dev Container内で主要検証を再現できる                |

---

## 主要コマンド

受け入れ判定で使う主要コマンドは以下です。

```bash
bun install --frozen-lockfile
bun run typecheck
bun run client:typecheck
bun run test:unit
bun run client:build
CI=1 bun run check
```

Dev Container内でE2Eを確認する場合は、必要に応じて以下を実行します。

```bash
bunx playwright install chromium
CI=1 bunx playwright test e2e/quiz-smoke.e2e.ts --trace on
```

Cloudflare Pages向けのデプロイ用ビルドは以下です。

```bash
bun run pages:build
```

---

## 受け入れ対象

| 領域          | 対象                                 | 主な導線                                                         |
| :------------ | :----------------------------------- | :--------------------------------------------------------------- |
| クイズアプリ  | React / Viteによる4択クイズUI        | `src/client/`                                                    |
| クイズデータ  | raw dataと公開用JSON                 | `data/raw/quiz-questions.json`、`public/study-it/quiz_data.json` |
| 学習データ    | 品質レポート生成用の学習項目         | `data/raw/learning-items.json`                                   |
| schema定義    | Zodによる構造検証                    | `src/schemas/`                                                   |
| 検証処理      | validation / report / baseline check | `src/cli/`、`src/application/`                                   |
| 異常系fixture | schema、taxonomy、policy違反の検出   | `data/fixtures/`、`tests/`                                       |
| E2E           | クイズ操作の主要フロー検証           | `e2e/quiz-smoke.e2e.ts`                                          |
| 品質ゲート    | local / GitHub Actionsでの統合検査   | `.github/workflows/quality-gate.yml`                             |
| デプロイ      | Cloudflare Pages向けbuild            | `bun run pages:build`、`dist/app`                                |
| 開発環境      | Dev Containerによる再現環境          | `.devcontainer/`                                                 |
| ドキュメント  | 設計・受け入れ基準・面接説明         | `README.md`、`docs/`、`reports/`                                 |

---

## 受け入れ基準一覧

### 1. クイズアプリ

| 確認項目             | 合格条件                                                   | 確認方法                                                     |
| :------------------- | :--------------------------------------------------------- | :----------------------------------------------------------- |
| アプリ実装           | `src/client/` にクイズUIが実装されている                   | `src/client/App.tsx`、`src/client/components/` を確認        |
| 公開用データ読み込み | `public/study-it/quiz_data.json` を読み込んで動作する      | ブラウザまたはE2Eで確認                                      |
| クイズ操作           | 問題表示、回答、正誤表示、次問題遷移、結果画面表示ができる | `CI=1 bunx playwright test e2e/quiz-smoke.e2e.ts --trace on` |
| 正誤フィードバック   | 正解・不正解、正答、解説が表示される                       | UIまたはE2Eで確認                                            |
| 結果画面             | 正答数、総問題数、正答率、カテゴリ別スコアが表示される     | UIまたはE2Eで確認                                            |
| クライアントビルド   | production buildが成功する                                 | `bun run client:build`                                       |

---

### 2. クイズデータ

| 確認項目       | 合格条件                                               | 確認方法                                 |
| :------------- | :----------------------------------------------------- | :--------------------------------------- |
| raw data       | `data/raw/quiz-questions.json` が存在する              | ファイル確認                             |
| 問題数         | 現行MVPでは13問以上を含む                              | `bun run validate:quiz`                  |
| schema検証     | 構造・必須項目・型が妥当である                         | `bun run validate:quiz`                  |
| taxonomy検証   | `track`、`category`、`difficulty` が定義済み分類に従う | `bun run validate:quiz`                  |
| policy検証     | 公開リポジトリに不適切な情報を含まない                 | `bun run validate:quiz-policy`           |
| 公開用JSON生成 | raw dataからpublic JSONを生成できる                    | `bun run prepare:public-quiz-data`       |
| 公開用JSON鮮度 | 再生成しても不要なGit差分が出ない                      | `bun run prepare:public-quiz-data:check` |

関連ファイル:

```text
data/raw/quiz-questions.json
public/study-it/quiz_data.json
src/cli/prepare-public-quiz-data.ts
src/cli/validate-quiz-data.ts
src/cli/validate-quiz-policy.ts
```

---

### 3. 学習データとsource policy

| 確認項目      | 合格条件                                         | 確認方法                  |
| :------------ | :----------------------------------------------- | :------------------------ |
| 学習データ    | `data/raw/learning-items.json` が存在する        | ファイル確認              |
| schema検証    | learning itemの構造がZod schemaに適合する        | `bun run validate:data`   |
| source policy | 外部参照、URL、tag、categoryのルールを検証できる | `bun run validate:policy` |
| HTTPS URL     | `sourceUrl` が存在する場合はHTTPSである          | `bun run validate:policy` |
| tag整合性     | `tags` に `category` が含まれる                  | `bun run validate:policy` |
| 重複tag検出   | 重複tagをpolicy違反として検出できる              | `bun run validate:policy` |

関連ファイル:

```text
data/raw/learning-items.json
src/schemas/learning-item.schema.ts
src/application/validate-source-policy.ts
src/cli/validate-data.ts
src/cli/validate-policy.ts
```

---

### 4. 異常系fixture

| 確認項目     | 合格条件                                   | 確認方法                         |
| :----------- | :----------------------------------------- | :------------------------------- |
| fixture配置  | `data/fixtures/` に異常系fixtureが存在する | ファイル確認                     |
| schema違反   | schema違反fixtureを検出できる              | `bun run test:unit`              |
| taxonomy違反 | 分類体系違反fixtureを検出できる            | `bun run test:unit`              |
| policy違反   | policy違反fixtureを検出できる              | `bun run test:unit`              |
| 責務検証     | 各fixtureが想定した検証層で失敗する        | `bun run validate:quiz-fixtures` |

関連ファイル:

```text
data/fixtures/
tests/invalid-fixture.test.ts
tests/invalid-quiz-schema-fixture.test.ts
tests/invalid-quiz-taxonomy-fixture.test.ts
tests/validate-quiz-policy.test.ts
src/cli/validate-quiz-fixtures.ts
```

---

### 5. 品質レポート

| 確認項目               | 合格条件                                      | 確認方法                                            |
| :--------------------- | :-------------------------------------------- | :-------------------------------------------------- |
| 学習データ品質レポート | `reports/quality-report.md` が生成される      | `bun run report`                                    |
| クイズ品質レポート     | `reports/quiz-quality-report.md` が生成される | `bun run quiz:report`                               |
| 提出準備レポート       | `reports/portfolio-readiness.md` が存在する   | ファイル確認                                        |
| レポート鮮度           | 再生成しても不要なGit差分が出ない             | `bun run report:check`、`bun run quiz:report:check` |
| 決定的出力             | timestampなど実行時依存値で不要差分を出さない | `git diff --exit-code -- reports/`                  |

関連ファイル:

```text
reports/quality-report.md
reports/quiz-quality-report.md
reports/portfolio-readiness.md
src/cli/generate-report.ts
src/cli/generate-quiz-report.ts
```

---

### 6. 依存関係と公開安全性

| 確認項目       | 合格条件                                          | 確認方法                         |
| :------------- | :------------------------------------------------ | :------------------------------- |
| lockfile       | `bun.lock` が存在し、commit対象に含まれる         | ファイル確認                     |
| frozen install | lockfileに基づいて依存関係を再現できる            | `bun install --frozen-lockfile`  |
| latest禁止     | `package.json` の依存関係に `"latest"` を使わない | `bun run validate:dependencies`  |
| public safety  | `.env` や秘密鍵などを公開repoへ混入させない       | `bun run validate:public-safety` |
| 統合品質ゲート | 依存関係検査とpublic safetyが `check` に含まれる  | `CI=1 bun run check`             |

関連ファイル:

```text
package.json
bun.lock
src/cli/check-dependency-policy.ts
scripts/check-public-safety.sh
```

---

### 7. 統合品質ゲート

| 確認項目  | 合格条件                                        | 確認方法                             |
| :-------- | :---------------------------------------------- | :----------------------------------- |
| local実行 | local環境で統合品質ゲートが成功する             | `CI=1 bun run check`                 |
| CI実行    | GitHub Actionsで同じ品質ゲートが成功する        | `.github/workflows/quality-gate.yml` |
| PR実行    | pull requestでquality gateが実行される          | GitHub Actions確認                   |
| main実行  | main branchへのpush後にquality gateが実行される | GitHub Actions確認                   |
| E2E含有   | Playwright E2E smoke testが含まれる             | `bun run test:e2e`                   |

`bun run check` に含める主な検査:

```text
- TypeScript typecheck
- client typecheck
- unit tests
- data schema validation
- source policy validation
- quiz schema validation
- quiz taxonomy validation
- quiz policy validation
- fixture responsibility validation
- report freshness check
- public quiz data freshness check
- dependency policy validation
- public repository safety check
- static site build check
- client build
- security baseline check
- performance baseline check
- Playwright E2E smoke test
```

---

### 8. Cloudflare Pagesデプロイ

| 確認項目        | 合格条件                                                                    | 確認方法               |
| :-------------- | :-------------------------------------------------------------------------- | :--------------------- |
| 公開URL         | Cloudflare Pages上でクイズアプリを確認できる                                | ブラウザで確認         |
| デプロイ用build | `pages:build` が成功する                                                    | `bun run pages:build`  |
| 出力先          | `dist/app` が生成される                                                     | `test -d dist/app`     |
| 責務分離        | GitHub Actionsは完全品質ゲート、Cloudflare Pagesはデプロイ用buildに限定する | READMEまたはdocsで確認 |

Cloudflare Pagesの想定設定:

```text
Build command:
  bun install --frozen-lockfile && bun run pages:build

Build output directory:
  dist/app

Root directory:
  blank

NODE_VERSION:
  22.16.0
```

---

### 9. security / performance baseline

| 確認項目             | 合格条件                                             | 確認方法                                |
| :------------------- | :--------------------------------------------------- | :-------------------------------------- |
| security baseline    | 必要なsecurity headers等の基準を確認できる           | `bun run validate:security-baseline`    |
| performance baseline | 静的成果物のfile-size budgetを確認できる             | `bun run validate:performance-baseline` |
| 品質ゲート統合       | security / performance baselineが `check` に含まれる | `CI=1 bun run check`                    |

関連ファイル:

```text
src/cli/check-security-baseline.ts
src/cli/check-performance-baseline.ts
site/static/_headers
```

---

### 10. Dev Container

| 確認項目     | 合格条件                                                   | 確認方法          |
| :----------- | :--------------------------------------------------------- | :---------------- |
| 設定ファイル | Dev Container設定が存在する                                | `.devcontainer/`  |
| Bun          | Dev Container内でBunを実行できる                           | `bun --version`   |
| bunx         | Dev Container内でbunxを実行できる                          | `command -v bunx` |
| 主要検証     | Dev Container内で型検査・unit test・client buildが成功する | 下記コマンド      |
| E2E          | Chromium導入後にPlaywright E2Eを実行できる                 | 下記コマンド      |

主要検証:

```bash
bun install --frozen-lockfile
bun run typecheck
bun run client:typecheck
bun run test:unit
bun run client:build
```

E2E確認:

```bash
bunx playwright install chromium
CI=1 bunx playwright test e2e/quiz-smoke.e2e.ts --trace on
```

関連ファイル:

```text
.devcontainer/devcontainer.json
.devcontainer/Dockerfile
.devcontainer/post-create.sh
```

---

### 11. ドキュメント

| 確認項目       | 合格条件                                                                        | 主な導線                                  |
| :------------- | :------------------------------------------------------------------------------ | :---------------------------------------- |
| README         | プロジェクト概要、公開URL、機能、技術スタック、品質ゲート、デプロイ手順が分かる | `README.md`                               |
| アーキテクチャ | データ境界、検証層、デプロイ責務が分かる                                        | `docs/architecture.md`                    |
| 受け入れ基準   | MVPとしての合格条件が分かる                                                     | `docs/acceptance-criteria.md`             |
| 面接説明       | 技術判断と説明ポイントが分かる                                                  | `docs/interview-notes.md`                 |
| クイズ検証方針 | schema / taxonomy validationの方針が分かる                                      | `docs/quiz-schema-taxonomy-validation.md` |
| 品質レポート   | 検証結果と提出準備状況が分かる                                                  | `reports/`                                |

ドキュメント記述方針:

```text
- 絵文字を使わない
- 強調はMarkdown構文で表現する
- 技術名として一般に定着しているものを除き、日本語で記述する
- README、docs、reportsの説明粒度を揃える
- 主要ファイルや確認コマンドへの導線を明記する
```

---

### 12. Git運用

| 確認項目   | 合格条件                                         | 確認方法                       |
| :--------- | :----------------------------------------------- | :----------------------------- |
| 同期診断   | Git同期状態を確認するscriptが存在する            | `scripts/git-sync-diagnose.sh` |
| 短命branch | 新規開発は原則として `main` から短命branchを切る | branch運用確認                 |
| PR統合     | mainへの統合はpull request経由で行う             | GitHub確認                     |
| main安定性 | main branchが展示可能状態である                  | `CI=1 bun run check`           |

作業前後の確認:

```bash
bash scripts/git-sync-diagnose.sh
git status --short
CI=1 bun run check
```

---

## 現時点での対象外

現時点では、以下は必須要件としません。

| 対象外項目                     | 理由                                    |
| :----------------------------- | :-------------------------------------- |
| 複数ユーザー利用               | 個人ポートフォリオMVPの範囲外           |
| ログイン機能                   | 学習履歴の個別管理をまだ扱わないため    |
| 学習履歴の永続保存             | 後続拡張として扱うため                  |
| 本格的な監視機能               | SRE観点の将来拡張として扱うため         |
| アラート通知                   | 運用体制を前提としないため              |
| 外部URL到達性の自動確認        | 参照元の可用性保証までは含めないため    |
| 外部参照元の鮮度確認           | 参照資料の更新追跡は後続課題とするため  |
| 参照内容そのものの事実確認     | 自動検証の対象外とするため              |
| 本格的なsecret scanning engine | public safety checkの範囲に限定するため |
| production-grade monitoring    | 本格運用サービスではなくMVPであるため   |

---

## 完了チェックリスト

### データ・検証

- [ ] `bun run validate:data` が成功する
- [ ] `bun run validate:policy` が成功する
- [ ] `bun run validate:quiz` が成功する
- [ ] `bun run validate:quiz-policy` が成功する
- [ ] `bun run validate:quiz-fixtures` が成功する

### 型検査・テスト

- [ ] `bun run typecheck` が成功する
- [ ] `bun run client:typecheck` が成功する
- [ ] `bun run test:unit` が成功する
- [ ] `CI=1 bunx playwright test e2e/quiz-smoke.e2e.ts --trace on` が成功する

### 生成物

- [ ] `bun run report` が成功する
- [ ] `bun run quiz:report` が成功する
- [ ] `bun run report:check` が成功する
- [ ] `bun run quiz:report:check` が成功する
- [ ] `bun run prepare:public-quiz-data:check` が成功する

### build・baseline

- [ ] `bun run client:build` が成功する
- [ ] `bun run site:check` が成功する
- [ ] `bun run validate:security-baseline` が成功する
- [ ] `bun run validate:performance-baseline` が成功する

### 統合品質ゲート

- [ ] `CI=1 bun run check` が成功する
- [ ] GitHub Actions `quality-gate` がpull request上で成功する
- [ ] GitHub Actions `quality-gate` がmain push後に成功する

### デプロイ

- [ ] Cloudflare Pagesでクイズアプリを確認できる
- [ ] `bun run pages:build` が成功する
- [ ] `dist/app` が生成される

### ドキュメント

- [ ] `README.md` が存在する
- [ ] `docs/architecture.md` が存在する
- [ ] `docs/acceptance-criteria.md` が存在する
- [ ] `docs/interview-notes.md` が存在する
- [ ] READMEから主要docsへ辿れる
- [ ] READMEから主要reportsへ辿れる

### 開発環境

- [ ] Dev Container内で `bun` が利用できる
- [ ] Dev Container内で `bunx` が利用できる
- [ ] Dev Container内で主要検証が成功する

---

## 受け入れ判断

上記の必須項目を満たした場合、`qa-sre-learning-mvp` はポートフォリオMVPとして受け入れ可能とします。

この時点で、本リポジトリは以下を示すMVPとして扱います。

```text
structured learning data
  -> validation
  -> policy checks
  -> negative fixtures
  -> quality reports
  -> public quiz data generation
  -> React / Vite quiz UI
  -> Playwright E2E
  -> dependency reproducibility
  -> public safety
  -> security / performance baseline
  -> GitHub Actions quality gate
  -> Cloudflare Pages deployment
```

この受け入れ基準を満たすことで、本プロジェクトは「小さなクイズアプリ」ではなく、**品質ゲート付きのQA/SRE志向ポートフォリオMVP**として提示できる状態になります。
