# アーキテクチャ

## 目的

`qa-sre-learning-mvp` は、QA/SRE志向の小型学習プロジェクトである。

このリポジトリの目的は、構造化された学習データを、再現可能な品質ゲートを通じて検証・検査・レポート化・CI上で確認する流れを示すことである。

このリポジトリでは、主に以下の観点を扱う。

- データスキーマ検証
- ソースポリシー検証
- 異常系検証fixture
- 決定的な品質レポート生成
- レポート鮮度検査
- 依存関係の再現性
- 公開安全性チェック
- GitHub Actionsによる品質ゲート

## パイプライン

主要なデータ処理パイプラインは以下である。

```text
data/raw/learning-items.json
  -> Zod schema validation
  -> source policy validation
  -> quality report generation
  -> report freshness check
  -> GitHub Actions quality gate
```

このパイプラインの目的は、learning itemデータが構文的に正しいだけでなく、プロジェクト固有の品質ルールにも従っていることを確認することである。

## ディレクトリ構成

```text
qa-sre-learning-mvp/
  data/
    raw/
      learning-items.json
    fixtures/
      invalid-learning-items.json
  docs/
    architecture.md
  reports/
    quality-report.md
  scripts/
    check-public-safety.sh
    git-sync-diagnose.sh
  src/
    application/
      build-quality-report.ts
      validate-source-policy.ts
    cli/
      generate-report.ts
      validate-data.ts
      validate-policy.ts
    domain/
      learning-item.ts
    infrastructure/
      read-json.ts
    schemas/
      learning-item.schema.ts
  tests/
    build-quality-report.test.ts
    invalid-fixture.test.ts
    learning-item.test.ts
    validate-source-policy.test.ts
  .github/
    workflows/
      quality-gate.yml
```

## レイヤー構成

### Schema Layer

配置場所:

```text
src/schemas/
```

責務:

- learning itemデータの構造を定義する
- 必須フィールドを検証する
- enum値を検証する
- 不正な入力データを拒否する

主要ファイル:

```text
src/schemas/learning-item.schema.ts
```

### Application Layer

配置場所:

```text
src/application/
```

責務:

- プロジェクト固有のソースポリシールールを検証する
- 決定的な品質レポートを生成する
- ビジネスロジックをCLIおよびファイルI/Oから分離する

主要ファイル:

```text
src/application/validate-source-policy.ts
src/application/build-quality-report.ts
```

### Infrastructure Layer

配置場所:

```text
src/infrastructure/
```

責務:

- JSONファイルを読み込む
- ファイルI/Oを検証ロジックから分離する

主要ファイル:

```text
src/infrastructure/read-json.ts
```

### CLI Layer

配置場所:

```text
src/cli/
```

責務:

- 検証およびレポート生成の実行コマンドを提供する
- データファイル、スキーマ、ポリシー検査、レポート出力を接続する

主要ファイル:

```text
src/cli/validate-data.ts
src/cli/validate-policy.ts
src/cli/generate-report.ts
```

### Test Layer

配置場所:

```text
tests/
```

責務:

- スキーマ互換データの挙動を検証する
- ソースポリシー違反を検証する
- 品質レポートの内容を検証する
- 異常系fixtureの挙動を検証する

主要ファイル:

```text
tests/validate-source-policy.test.ts
tests/build-quality-report.test.ts
tests/invalid-fixture.test.ts
```

## データモデル

中心となるデータ単位は learning item である。

learning item は以下の項目を持つ。

- `id`
- `title`
- `category`
- `difficulty`
- `sourceType`
- `sourceUrl`
- `summary`
- `tags`

スキーマはZodで実装している。

## ソースポリシー

ソースポリシーは、基本的なスキーマ検証を超えた、プロジェクト固有の品質ルールを検証する。

例:

- `original-note` 以外のsourceには `sourceUrl` が必要である
- `sourceUrl` はHTTPSでなければならない
- `id` はcategory prefixで始まるべきである
- tagsには重複値を含めてはならない
- tagsにはitemのcategoryを含めるべきである
- tag値は安定した小文字形式を用いるべきである

## 品質レポート

品質レポートは以下に生成される。

```text
reports/quality-report.md
```

レポートには以下を含める。

- summary counts
- quality gate status
- validation scope
- limitations
- data source summary
- source URL domain counts
- category counts
- difficulty counts
- source type counts
- tag counts
- source policy violations

このレポートは決定的に生成される。不要なGit差分を発生させないため、timestampは含めない。

## レポート鮮度

レポート鮮度検査では、commit済みのレポートが、現在のデータおよびレポート生成ロジックと一致していることを確認する。

コマンド:

```bash
bun run report:check
```

このコマンドはレポートを再生成し、`reports/quality-report.md` がcommit済みの版と異なる場合に失敗する。

## 品質ゲート

統合されたlocal品質ゲートは以下である。

```bash
bun run check
```

このコマンドには以下が含まれる。

- TypeScript typecheck
- Bun unit tests
- data schema validation
- source policy validation
- dependency policy validation
- public safety check
- report freshness check

## GitHub Actions

GitHub Actionsでは、pushおよびpull request eventに対して同じ品質ゲートを実行する。

Workflow file:

```text
.github/workflows/quality-gate.yml
```

CI workflow:

```text
checkout repository
  -> setup Bun
  -> install dependencies with frozen lockfile
  -> run bun run check
  -> upload quality-report artifact
```

## 公開安全性チェック

公開安全性チェックでは、公開リポジトリにcommitすべきでないファイルを検出する。

例:

- `.env`
- `.env.*`
- private key files
- certificate files
- local editor profile files
- bundle files

コマンド:

```bash
bun run validate:public-safety
```

この検査は以下に含まれる。

```bash
bun run check
```

## 成果物

主要な生成成果物:

```text
reports/quality-report.md
```

CI artifact:

```text
quality-report
```

このartifactは、各quality-gate実行後にGitHub Actionsから確認できるようuploadされる。

## 設計原則

このプロジェクトでは、以下の設計原則に従う。

- MVPを小さく保つ
- schema validation と policy validation を分離する
- レポート生成を決定的にする
- 品質ゲートをlocalとCIの両方で再現可能にする
- 既知の制約を文書化する
- 隠れた手作業検証を避ける
- 暗黙的なworkflowよりも明示的なscriptを優先する

## 制約

現在の制約は以下である。

- 外部URLの到達可能性は検査していない
- sourceの鮮度は検査していない
- 参照内容の事実正確性は検査していない
- Web UIはまだ提供していない
- performance baselineはまだ実装していない
- deployment targetはまだ設定していない

## 次のステップ

今後の予定は以下である。

- acceptance criteria documentを追加する
- portfolio readiness reportを追加する
- `v0.1.0` release tagを作成する
- required quality-gate checkを伴うbranch protectionを検討する
- 任意で、レポートをstatic siteとして公開する
