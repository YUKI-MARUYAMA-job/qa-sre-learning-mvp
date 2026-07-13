# qa-sre-learning-mvp

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.3.14. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

## Git同期診断

VS Code GUIの同期操作を行う前に、local branch と remote branch の差分を確認するための診断スクリプトを用意している。

```bash
bash scripts/git-sync-diagnose.sh
```

このスクリプトでは、以下を確認する。

- 現在のbranch
- upstream branch
- local-only / remote-only commit数
- local-only / remote-only commitの一覧
- 未commit変更および未追跡ファイル

`Ahead / Behind` が `0 0` の場合、local と remote のcommit履歴は同期済みである。  
未追跡ファイルが表示された場合は、commitするか、削除するか、local専用として除外するかを判断する。
