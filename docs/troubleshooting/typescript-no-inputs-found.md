# TypeScript no inputs found対応記録

## 概要

`tsconfig.json` に `include` を設定した状態で `tsc --noEmit` を実行したところ、型検査対象の入力ファイルが見つからず停止しました。

## エラー

```text
構成ファイル 'tsconfig.json' で入力が見つかりませんでした。
指定された 'include' パスは '["src/**/*.ts","tests/**/*.ts"]' で、
'exclude' パスは '["node_modules","dist","coverage","reports"]' でした。
```

## 原因

- `include` は `src/**/*.ts` と `tests/**/*.ts` を対象にしていたが、該当する `.ts` ファイルがまだ存在していなかった
- 空の `src/` や `tests/` ディレクトリだけでは、TypeScript compilerの入力にはならない

## 対応

最小のTypeScriptファイルを作成しました。

```bash
mkdir -p src tests
```

```bash
cat > src/index.ts <<'SRC'
export function getProjectName(): string {
  return "qa-sre-learning-mvp";
}
SRC
```

```bash
cat > tests/index.test.ts <<'TEST'
import { expect, test } from "bun:test";
import { getProjectName } from "../src/index";

test("returns project name", () => {
  expect(getProjectName()).toBe("qa-sre-learning-mvp");
});
TEST
```

## 再発防止策

- `tsconfig.json` の `include` を変更したら、対象となるファイルが存在するか確認する
- 空ディレクトリではなく、最小の `.ts` ファイルを作る
- `bun run typecheck` と `bun test` を初期段階で実行する
