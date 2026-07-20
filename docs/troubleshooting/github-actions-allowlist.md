## GitHub Actions allowlist error

(`docs/troubleshooting/github-actions-allowlist.md`)

Advanced SecurityおよびActions permissionsを制限した後、`actions/checkout`、`actions/upload-artifact`、`oven-sh/setup-bun` がallowlistに一致せず、workflowが起動前に失敗しました。原因は、外部Actionの利用制限とworkflow内の `uses:` 指定の不整合でした。

対応として、GitHub Actions settingsでGitHub公式Actionと `oven-sh/setup-bun` を明示的に許可しました。  
設定修正後、Pull Requestを再送信し、`quality-gate` の通過を確認しました。

今後は、Actions permissionsを変更した場合、以下を確認します。

```text
- workflow内の uses: 一覧
- allowed actions and reusable workflows
- quality-gate
- lighthouse warn-only workflows
- CodeQL workflowを使う場合は github/codeql-action の許可
```
