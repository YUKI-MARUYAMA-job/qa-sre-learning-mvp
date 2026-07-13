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

このリポジトリでは、VS Code GUIのSync操作に依存しすぎないよう、local branch と remote branch の状態を事前に確認する診断スクリプトを用意している。

```bash
bash scripts/git-sync-diagnose.sh
```

このスクリプトは、次の情報を表示する。

- repository root
- 現在のbranch
- upstream branch
- `git fetch --tags origin` 実行後の ahead / behind 数
- local-only commit と remote-only commit
- working tree の未commit変更・未追跡ファイル
- branch tracking summary

この確認により、次の状態を切り分ける。

| 状態 | 意味 | 推奨操作 |
|---|---|---|
| `0 0` | local と remote のcommit履歴は同期済み | 未commit変更のみ確認 |
| `0 N` | remote のみ進んでいる | `git pull --ff-only` |
| `N 0` | local のみ進んでいる | 検査後に `git push` |
| `N M` | local と remote が分岐している | `rebase` / `merge` / `reset` を明示判断 |

GUI同期で意図しないmerge commitや履歴分岐を発生させないため、作業開始時やpush前にはこの診断を実行する。

```bash
bash scripts/git-sync-diagnose.sh
bun run check
git status --short
```