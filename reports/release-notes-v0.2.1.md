## 概要

v0.2.1では、クイズアプリの機能や挙動を変更せず、主要ドキュメントおよびレポートへのリンク導線、文体、記述内容の一貫性を改善しました。

## 主な変更

- 主要ドキュメントおよびレポートへの相対リンクを追加し、READMEや各文書から関連資料へ移動しやすくしました。
- 提出準備関連ドキュメントの本文を、です・ます調に統一し、表現の一貫性と可読性を改善しました。
- 現行構成では参照しない旧版のポートフォリオ提出準備ドキュメントを削除しました。
- GitHub ActionsおよびTypeScriptに関するトラブルシューティング文書の見出し、リンク、説明を整理しました。
- v0.1.0およびv0.2.0のリリースノートにリンクを追加し、セキュリティ、アクセシビリティ、デプロイに関する変更内容を明確化しました。

## 品質確認

以下の統合品質ゲートが成功することを確認しました。

```bash
CI=1 bun run check
```

また、以下のリモート品質ゲートが成功することをGitHub上で確認しました。

- Pull Request上のGitHub Actions `quality-gate`
- `main` push後のGitHub Actions `quality-gate`

## 関連Pull Request

- [#72: Refactor/internal portfolio quiz](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/pull/72)
- [#73: Refactor/internal portfolio quiz](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/pull/73)

## 完全な変更履歴

[v0.2.0...v0.2.1](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/compare/v0.2.0...v0.2.1)

## Previous release

- [v0.2.0](https://github.com/YUKI-MARUYAMA-job/qa-sre-learning-mvp/blob/v0.3.0/reports/release-notes-v0.2.0.md)