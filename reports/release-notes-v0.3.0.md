# v0.2.1 — サイト内のナビゲーションとドキュメントの改善


## 概要

v0.3.0では、v0.2.1までに構築したブラウザ向けQA/SREポートフォリオMVPへ、Pull Request単位のセキュリティ検査とソフトウェアサプライチェーン管理を追加しました。

主な変更は、CodeQLの明示的な解析workflow、依存関係差分レビュー、GitHub Actionsの最小権限化、Dependabotによる定期更新、および依存関係更新PRの検証・逐次マージ手順の整備です。

今回の改善では、単にセキュリティツールを追加するのではなく、各検査の責務を次のように分離しました。

- CodeQL：ソースコードとGitHub Actions workflowの静的解析
- Dependency Review：Pull Requestが導入する依存関係差分の検査
- Dependabot：依存関係更新Pull Requestの自動作成
- Quality Gate：型検査、データ検証、テスト、ビルド、E2Eなどの回帰確認
- Lighthouse CI：性能・アクセシビリティ等の補助的なwarn-only観測

## 主な追加内容

### CodeQL Advanced Setup

`.github/workflows/codeql.yml`を追加し、次の2対象を明示的に解析する構成へ移行しました。

- GitHub Actions
- JavaScript / TypeScript

Pull Requestおよび`main`へのpushを解析対象とし、PRとdefault branchの双方で一貫した解析結果を生成できる構成としています。

### Dependency Review

`.github/workflows/dependency-review.yml`を追加しました。

`main`を対象とするPull Requestについて依存関係差分を検査し、新規または更新された依存関係にHighまたはCritical重大度の既知脆弱性が含まれる場合、checkを失敗させます。

この検査はCodeQLを置き換えるものではなく、依存関係変更に特化した補完的な品質ゲートです。

### Dependabot version updates

`.github/dependabot.yml`に基づき、次の更新を自動的にPull Request化する運用を整備しました。

- Bun依存関係
- GitHub Actions

更新Pull Requestは自動マージせず、差分、Release notes、品質ゲート、対象機能の動作を確認してから個別にマージします。

### GitHub Actionsの最小権限化

`.github/workflows/lighthouse-app-warn.yml`を含むworkflowについて、`GITHUB_TOKEN`の権限を明示しました。

```yaml
permissions:
  contents: read
```

リポジトリまたはOrganizationの既定権限へ暗黙的に依存せず、workflowが必要とする読み取り権限だけを付与しています。

この変更により、CodeQLで検出されていた`actions/missing-workflow-permissions`アラートを解消しました。

## 依存関係更新

以下のDependabot生成Pull Requestを、各検査の成功と差分確認後にsquash mergeしました。

- `actions/upload-artifact`の更新
- `actions/checkout`の更新
- Bun minor / patch依存関係の更新

各Pull Requestは個別に検証し、1件ずつ`main`へ統合しました。

これにより、問題が発生した場合に原因となる更新を特定しやすい逐次マージ方式を維持しています。

## CodeQL診断の改善

Dependabot生成Pull Requestでは、当初、次のneutral checkが表示されました。

```text
2 configurations not found

Default setup
/language:actions
/language:javascript-typescript
```

調査では、次を切り分けました。

- `gh pr checks`に表示されるCodeQL check
- `gh run list`に表示されるGitHub Actions workflow run
- GitHub Advanced Securityが生成する集約check
- `main`上の実在するCodeQL alert
- Dependabot Pull Request固有の解析結果不足

Checks APIを使用して、該当checkの生成元が`github-advanced-security`であり、通常のGitHub Actions workflow runではないことを確認しました。

その後、CodeQLの明示的なworkflowとDependency Reviewを追加し、Dependabot生成Pull Requestについてもマージ前の診断を成立させました。

## 品質ゲート

リリース候補は、次のコマンドで検証します。

```bash
CI=1 bun run check
bun run pages:build
```

`CI=1 bun run check`には、プロジェクトの構成に応じて次の検査が含まれます。

- TypeScript型検査
- Bun unit test
- クイズデータのスキーマ検証
- タクソノミーおよびポリシー検証
- negative fixture検証
- 生成レポートのfreshness確認
- 公開データのfreshness確認
- React / Vite production build
- Playwright E2E
- セキュリティ基準確認
- 性能基準の補助観測

## セキュリティ検査の責務

| 検査 | 主な責務 |
| --- | --- |
| CodeQL | GitHub ActionsおよびJavaScript / TypeScriptの静的解析 |
| Dependency Review | Pull Requestが導入する依存関係差分の検査 |
| Dependabot | 依存関係更新Pull Requestの自動作成 |
| Workflow permissions | `GITHUB_TOKEN`の最小権限化 |
| Public safety validation | 公開リポジトリへ含めてはならない情報・生成物の検査 |
| Quality Gate | 型、データ、テスト、ビルド、E2Eを含む統合確認 |

## 運用方針

### Dependabot Pull Request

Dependabot Pull Requestは、次の条件を確認してからマージします。

- 変更対象が想定した依存関係またはActionに限定されている
- major / minor / patchの区分を確認している
- Release notesまたは変更履歴を確認している
- Dependency Reviewが成功している
- CodeQL解析が成功している
- `CI=1 bun run check`が成功している
- 対象機能の成果物または動作を確認している
- 自動マージを使用していない

### マージ方式

変更は原則として1Pull Requestずつsquash mergeします。

```text
1 PRを検証
→ squash merge
→ mainを再検証
→ 次のPRを最新mainへ更新
→ 次のPRを検証
```

この方式により、変更履歴を簡潔に保ちながら、障害発生時の原因分離性を維持します。

## v0.2.1からの主な変更

- CodeQL Advanced Setupの追加
- GitHub Actions解析の明示化
- JavaScript / TypeScript解析の明示化
- Dependency Review workflowの追加
- High / Critical依存関係脆弱性のblocking check
- Dependabot version updatesの運用整備
- GitHub Actions workflowの最小権限化
- `actions/upload-artifact`の更新
- `actions/checkout`の更新
- Bun minor / patch依存関係の更新
- Dependabot Pull Requestの診断・逐次マージ手順の整備

## 制限事項

- CodeQLおよびDependency Reviewは、脆弱性が存在しないことを証明するものではありません。
- Dependency Reviewは、Pull Requestが導入する依存関係差分を主な検査対象とします。
- Dependabot Pull Requestは自動マージしません。
- Copilot Autofixの提案は自動的に採用せず、差分、テスト結果、影響範囲を人間が確認します。
- AI findings Previewは必須検査として使用していません。
- Lighthouse CIは引き続きwarn-onlyの補助観測です。
- Cloudflare Pagesのデモは意図的に`noindex`、`nofollow`、`noarchive`を使用しているため、SEO関連の警告が発生する場合があります。

## 非対象

v0.3.0では、次を対象としていません。

- 依存関係更新の自動マージ
- セキュリティ修正案の無人適用
- 本番環境への自動ロールバック
- 24時間の監視・オンコール運用
- 脆弱性不存在の保証
- Enterprise規模の組織ポリシー管理
- 外部ユーザー向けの安定API保証

## リリース判定

v0.3.0は、以下を確認した時点の`main`を安定スナップショットとしてタグ付けします。

- ローカル品質ゲート成功
- GitHub Actions上の品質ゲート成功
- CodeQL解析成功
- Dependency Review成功
- 既知のworkflow permissionsアラート解消
- Dependabot更新Pull Requestの個別検証完了
- Cloudflare Pages用ビルド成功
- 公開デモの主要操作確認
- 作業ツリーがcleanであること

## Previous release

- [v0.2.1](/reports/release-notes-v0.2.1.md)