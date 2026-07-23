# 依存関係とTypeScript設定の運用方針

## 1. 目的

この文書は、`qa-sre-learning-mvp` における依存関係とTypeScript設定の運用方針を整理するものです。

本リポジトリは、QA/SRE志向のポートフォリオMVPです。
現在は、クイズアプリ、データ検証CLI、クイズデータ検証、品質レポート生成、公開用JSON生成、React / Vite UI、Playwright E2E、GitHub Actions品質ゲート、Cloudflare Pagesデプロイを扱います。

そのため、依存関係とTypeScript設定では、以下を重視します。

- localとCIで同じ検証を再現できること
- `bun.lock` により依存関係を固定できること
- TypeScriptの型検査を品質ゲートに含めること
- CLI、schema、test、clientの責務を分けて扱えること
- 不安定な依存指定を避けること
- アプリケーション型ポートフォリオとして過剰なpackage設計を避けること

---

## 2. 基本方針

このリポジトリは、npm packageとしてライブラリ配布することを目的としていません。
そのため、依存関係は「このアプリケーションを再現・検証・buildするために必要か」という観点で整理します。

主な分類は以下です。

| 区分                   | 役割                                          | 例                                                     |
| ---------------------- | --------------------------------------------- | ------------------------------------------------------ |
| `dependencies`         | 実行時に必要な依存関係                        | Zodなどのruntime validation library                    |
| `devDependencies`      | 開発、型検査、test、build、CIで必要な依存関係 | TypeScript、Bun types、Vite、Playwright、Lighthouse CI |
| `bun.lock`             | 依存解決結果の正本                            | CIでの再現性確保                                       |
| `package.json` scripts | 検証・build・生成処理の入口                   | `check`、`validate:*`、`client:build`                  |


TypeScriptは、このリポジトリでは開発・型検査・buildのために利用するため、`peerDependencies` ではなく `devDependencies` に配置します。

---

## 3. 依存関係の運用方針

依存関係の運用では、再現性を優先します。

- `latest` 指定は使用しない
- lockfileをcommit対象にする
- CIでは `bun install --frozen-lockfile` を使う
- 依存関係の追加後は `bun run validate:dependencies` を実行する
- 依存関係の変更後は `CI=1 bun run check` を実行する
- runtimeで必要なlibraryと開発時だけ必要なtoolを分ける

`latest` 指定を避ける理由は、同じcommitでもinstall時点によって依存関係が変わる可能性があるためです。
ポートフォリオとして再現可能な品質ゲートを示すには、依存解決結果を固定する必要があります。

---

## 4. dependency policy validation

本リポジトリでは、依存関係の運用方針を手作業の注意だけに依存させません。
`validate:dependencies` により、依存関係の指定が方針に反していないかを確認します。

検証コマンドは以下です。

```bash
bun run validate:dependencies
```

主な確認観点は以下です。

- `latest` 指定が含まれていないこと
- lockfileが存在すること
- `package.json` のscriptが品質ゲートから呼び出せること
- CIで再現可能な依存関係管理になっていること

この検査は、完全なsoftware composition analysisの代替ではありません。
ただし、MVP段階における依存関係の再現性確認としては有効です。

---

## 5. TypeScript設定の基本方針

TypeScript設定では、CLI、schema、test、clientの責務を分けて扱います。

本リポジトリでは、主に以下の領域でTypeScriptを使用します。

| 領域         | 主な対象                                                             | 目的                                 |
| ------------ | -------------------------------------------------------------------- | ------------------------------------ |
| 共通ロジック | [src/application/](/src/application/)、[src/schemas/](/src/schemas/) | validationやreport生成の型安全性     |
| CLI          | [src/cli/](/src/cli/)                                                | localとCIで実行する検証コマンド      |
| test         | [tests/](/tests/)                                                    | Bun testによるunit / validation test |
| client       | [src/client/](/src/client/)                                          | React / ViteクイズUI                 |
| E2E          | [e2e/](/e2e/)                                                        | Playwrightによるbrowser smoke test   |


このように、TypeScriptはUIだけでなく、データ検証、生成処理、品質ゲートの基盤として利用しています。

---

## 6. 共通TypeScript設定

共通のTypeScript設定では、Bun実行環境とESM構成を前提にします。

代表的な方針は以下です。

```text
types: ["bun"]
moduleResolution: "bundler"
allowImportingTsExtensions: true
verbatimModuleSyntax: true
noEmit: true
strict: true
```

これらの設定により、BunでのCLI実行、TypeScript import、Zod schema、unit testを扱いやすくします。

`noEmit: true` を使う理由は、TypeScript compilerで出力物を生成するのではなく、型検査を主目的として利用するためです。
実際のclient buildはVite側で実行します。

---

## 7. client用TypeScript設定

React / ViteクイズUIでは、client側に必要なTypeScript設定を分けて扱います。

client側では、以下の観点が重要です。

- React JSXを扱えること
- Vite buildと整合すること
- browser環境の型を扱えること
- public quiz dataのruntime validationと型定義が整合すること
- server / CLI用のBun前提設定と混ざりすぎないこと

そのため、client側は `tsconfig.client.json` のような分離設定で管理するのが妥当です。

代表的な責務は以下です。

| 設定ファイル                                  | 主な責務                                              |
| --------------------------------------------- | ----------------------------------------------------- |
| [tsconfig.json](/tsconfig.json)               | CLI、schema、application logic、unit testの共通型検査 |
| [tsconfig.client.json](/tsconfig.client.json) | React / Vite clientの型検査                           |
| [playwright.config.ts](/playwright.config.ts) | E2E testの実行設定                                    |


site生成やドキュメントサイトの構成が拡大した場合は、必要に応じて `tsconfig.site.json` のように追加分離します。

---

## 8. 型検査と品質ゲートの関係

型検査は、単独の作業ではなく、品質ゲートの一部として扱います。

主な検査は以下です。

```bash
bun run typecheck
bun run client:typecheck
CI=1 bun run check
```

`typecheck` は、主にCLI、schema、application logic、unit testの型整合性を確認します。
`client:typecheck` は、React / ViteクイズUIの型整合性を確認します。

統合品質ゲートである `CI=1 bun run check` には、型検査だけでなく、以下の要素も含めます。

- unit test
- learning data validation
- source policy validation
- quiz schema validation
- quiz taxonomy validation
- quiz policy validation
- quiz fixture responsibility validation
- quiz report freshness check
- public quiz data freshness check
- dependency policy validation
- public repository safety check
- static site check
- client build
- security baseline check
- performance baseline check
- Playwright E2E

この構成により、TypeScript設定の破綻を早期に検出しつつ、データ・UI・生成物・E2Eまで含めた品質確認を行います。

---

## 9. 設定変更時の運用

依存関係やTypeScript設定を変更した場合は、影響範囲が広いため、以下の順序で確認します。

```bash
bun install --frozen-lockfile
bun run validate:dependencies
bun run typecheck
bun run client:typecheck
bun run test:unit
bun run client:build
bun run test:e2e
CI=1 bun run check
```

変更内容ごとの確認観点を以下に示します。

| 変更内容                      | 優先して確認すること                           |
| ----------------------------- | ---------------------------------------------- |
| `package.json` の依存関係変更 | lockfile、`validate:dependencies`、CI install  |
| `tsconfig.json` の変更        | CLI、schema、testの型検査                      |
| `tsconfig.client.json` の変更 | React / Vite build、client typecheck           |
| Playwright関連の変更          | `bun run test:e2e`                             |
| Vite関連の変更                | `bun run client:build`、Cloudflare Pages build |
| Bun関連の変更                 | CLI実行、unit test、CI install                 |



## 10. 現在の制約

現在の制約は以下です。

- dependency policy validationは、専用の脆弱性診断やsoftware composition analysisの代替ではありません。
- public safety checkは、専用のsecret scanning engineの代替ではありません。
- TypeScriptの型検査は、runtimeの全不具合を検出するものではありません。
- `bun.lock` により依存関係の再現性は高まりますが、外部packageの供給リスクを完全に排除するものではありません。
- client側の型検査とPlaywright E2Eは、アクセシビリティや全ブラウザ互換性を網羅するものではありません。
- Lighthouse CIは補助的な観測であり、必須品質ゲートには含めていません。

---

## 11. 関連ファイル

| ファイル                                                                  | 役割                                 |
| ------------------------------------------------------------------------- | ------------------------------------ |
| [package.json](/package.json)                                             | 依存関係とscript定義                 |
| [bun.lock](/bun.lock)                                                     | 依存解決結果の正本                   |
| [tsconfig.json](/tsconfig.json)                                           | 共通TypeScript設定                   |
| [tsconfig.client.json](/tsconfig.client.json)                             | React / Vite client用TypeScript設定  |
| [src/cli/check-dependency-policy.ts](/src/cli/check-dependency-policy.ts) | dependency policy validation         |
| [src/schemas/](/src/schemas/)                                             | Zod schema定義                       |
| [src/application/](/src/application/)                                     | validationやreport生成の中心ロジック |
| [src/client/](/src/client/)                                               | React / ViteクイズUI                 |
| [tests/](/tests/)                                                         | Bun unit / validation tests          |
| [e2e/](/e2e/)                                                             | Playwright E2E tests                 |
| [.github/workflows/quality-gate.yml](/.github/workflows/quality-gate.yml) | GitHub Actions品質ゲート             |



## 12. まとめ

このリポジトリでは、依存関係とTypeScript設定を、再現可能な品質ゲートの一部として扱います。

`bun.lock`、`bun install --frozen-lockfile`、`validate:dependencies`、`typecheck`、`client:typecheck`、`CI=1 bun run check` を組み合わせることで、localとCIの差異を小さくし、ポートフォリオとして説明可能な品質管理を実現します。
