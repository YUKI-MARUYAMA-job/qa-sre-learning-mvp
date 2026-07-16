# Dependency and TypeScript Configuration Policy

## Purpose

この文書は、`qa-sre-learning-mvp` における依存関係と TypeScript 設定の運用方針を整理する。

Phase 1 では、クイズアプリ統合前に、Bun、TypeScript、Zod、Lighthouse CI の実行基盤を安定化する。

## Dependency Policy

このリポジトリはアプリケーション型のポートフォリオであり、ライブラリ配布を目的としない。

そのため、TypeScript は `peerDependencies` ではなく `devDependencies` に配置する。

```text
devDependencies:
  TypeScript compiler
  Bun types
  Lighthouse CI

dependencies:
  runtime validation libraries such as Zod
```

`latest` 指定は再現性を低下させるため使用しない。依存解決の正本は `bun.lock` とする。

## TypeScript Policy

Bun 実行環境に合わせ、`tsconfig.json` では以下を採用する。

```text
types: ["bun"]
moduleResolution: "bundler"
allowImportingTsExtensions: true
verbatimModuleSyntax: true
noEmit: true
strict: true
```

Phase 1 では、React / Vite / Hono 向けの JSX 設定はまだ追加しない。

将来、クイズアプリ UI を統合する場合は、React / Vite 用と Hono SSG 用の `tsconfig` を分割する。

## Future Split

```text
tsconfig.json          common CLI / schema / tests
tsconfig.client.json   React / Vite client
tsconfig.site.json     Hono SSG documentation site
```

## Validation Commands

```bash
bun run typecheck
bun run validate:dependencies
bun run check
```
