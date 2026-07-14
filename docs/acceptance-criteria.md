# 受け入れ基準

## 目的

この文書は、`qa-sre-learning-mvp` をMVPとして受け入れるための基準を定義する。

このリポジトリは、learning itemデータを題材として、QA/SRE志向の品質ゲートを小さく構築することを目的とする。

MVPとしての合格条件は、単にアプリケーションコードが存在することではなく、以下が再現可能に検証できることである。

- データ構造が検証できる
- プロジェクト固有の品質ルールが検証できる
- 異常系データを検出できる
- 品質レポートを決定的に生成できる
- 生成物の鮮度を検査できる
- 依存関係の再現性を検査できる
- 公開に不適切なファイル混入を検出できる
- localとGitHub Actionsの両方で同じ品質ゲートを実行できる

## v0.1.0 受け入れ基準

`v0.1.0` は、以下の条件をすべて満たす場合に受け入れ可能とする。

## 1. Data Criteria

### AC-DATA-001: learning item data exists

`data/raw/learning-items.json` が存在すること。

### AC-DATA-002: learning item data has multiple records

`data/raw/learning-items.json` には、複数のlearning itemが含まれていること。

初期MVPでは、少なくとも3件以上を目安とする。

### AC-DATA-003: data schema validation passes

以下のコマンドが成功すること。

```bash
bun run validate:data
```

### AC-DATA-004: schema is implemented with Zod

learning item のschemaがZodで定義されていること。

対象:

```text
src/schemas/learning-item.schema.ts
```

## 2. Source Policy Criteria

### AC-POLICY-001: source policy validation exists

プロジェクト固有のsource policy validationが実装されていること。

対象:

```text
src/application/validate-source-policy.ts
```

### AC-POLICY-002: source policy validation passes

以下のコマンドが成功すること。

```bash
bun run validate:policy
```

### AC-POLICY-003: non-original sources require sourceUrl

`sourceType` が `original-note` ではないlearning itemには、`sourceUrl` が必要であること。

### AC-POLICY-004: sourceUrl must use HTTPS

`sourceUrl` が存在する場合、HTTPS URLであること。

### AC-POLICY-005: tags include category

各learning itemの `tags` には、当該itemの `category` が含まれること。

### AC-POLICY-006: duplicate tags are rejected

`tags` に重複値が含まれる場合、source policy violationとして検出されること。

## 3. Negative Fixture Criteria

### AC-NEG-001: invalid fixture exists

異常系検証用fixtureが存在すること。

対象:

```text
data/fixtures/invalid-learning-items.json
```

### AC-NEG-002: schema-invalid data is rejected

schemaとして不正なfixtureが、testで検出されること。

対象例:

```text
tests/invalid-fixture.test.ts
```

### AC-NEG-003: policy-invalid data is detected

schemaとしては成立するがsource policyに違反するデータが、testで検出されること。

### AC-NEG-004: unit tests pass

以下のコマンドが成功すること。

```bash
bun test
```

## 4. Quality Report Criteria

### AC-REPORT-001: quality report is generated

品質レポートが以下に生成されること。

```text
reports/quality-report.md
```

### AC-REPORT-002: report generation command succeeds

以下のコマンドが成功すること。

```bash
bun run report
```

### AC-REPORT-003: quality report includes validation scope

品質レポートに、検証対象と検証ロジックの範囲が記載されていること。

例:

- data file
- schema
- source policy
- report file

### AC-REPORT-004: quality report includes limitations

品質レポートに、現在保証していない範囲が記載されていること。

例:

- 外部URL到達性
- sourceの鮮度
- 参照内容の事実正確性

### AC-REPORT-005: quality report includes data source summary

品質レポートに、source URLの有無やdomain集計が含まれていること。

### AC-REPORT-006: report output is deterministic

品質レポートは、不要なGit差分を発生させないよう、timestampなどの実行時依存値を含めないこと。

## 5. Report Freshness Criteria

### AC-FRESH-001: report freshness check exists

以下のscriptが存在すること。

```bash
bun run report:check
```

### AC-FRESH-002: report freshness check passes

以下のコマンドが成功すること。

```bash
bun run report:check
```

### AC-FRESH-003: stale report causes failure

`reports/quality-report.md` が現在のデータまたは生成ロジックと一致しない場合、`report:check` が失敗すること。

## 6. Dependency Reproducibility Criteria

### AC-DEP-001: lockfile exists

Bunのlockfileが存在し、commit対象に含まれていること。

対象:

```text
bun.lock
```

### AC-DEP-002: frozen install succeeds in CI

GitHub Actions上で以下が成功すること。

```bash
bun install --frozen-lockfile
```

### AC-DEP-003: dependency policy validation exists

依存関係の再現性を確認する検査が存在すること。

例:

```bash
bun run validate:dependencies
```

### AC-DEP-004: dependency versions avoid latest

`package.json` の依存関係に `"latest"` を使わないこと。

## 7. Public Safety Criteria

### AC-SAFE-001: public safety check exists

公開repoに含めるべきでないファイルを検出するcheckが存在すること。

例:

```bash
bun run validate:public-safety
```

### AC-SAFE-002: public safety check passes

以下のコマンドが成功すること。

```bash
bun run validate:public-safety
```

### AC-SAFE-003: unsafe files are rejected

以下のようなファイルが存在する場合、public safety checkが失敗すること。

- `.env`
- `.env.*`
- private key files
- certificate files
- local editor profile files
- bundle files

### AC-SAFE-004: public safety check is included in integrated quality gate

public safety checkが以下に含まれていること。

```bash
bun run check
```

## 8. Integrated Quality Gate Criteria

### AC-QG-001: integrated quality gate exists

以下の統合品質ゲートが存在すること。

```bash
bun run check
```

### AC-QG-002: integrated quality gate passes locally

local環境で以下が成功すること。

```bash
bun run check
```

### AC-QG-003: integrated quality gate includes all required checks

`bun run check` には、少なくとも以下が含まれていること。

- TypeScript typecheck
- Bun unit tests
- data schema validation
- source policy validation
- dependency policy validation
- public safety check
- report freshness check

## 9. GitHub Actions Criteria

### AC-CI-001: quality-gate workflow exists

GitHub Actions workflowが存在すること。

対象:

```text
.github/workflows/quality-gate.yml
```

### AC-CI-002: workflow runs on pull requests

pull requestに対してquality gateが実行されること。

### AC-CI-003: workflow runs on push

main branchへのpush後にquality gateが実行されること。

### AC-CI-004: workflow uses frozen lockfile install

CI上で以下が実行されること。

```bash
bun install --frozen-lockfile
```

### AC-CI-005: workflow runs integrated quality gate

CI上で以下が実行されること。

```bash
bun run check
```

### AC-CI-006: quality report artifact is uploaded

CI上で生成されたquality reportがartifactとしてuploadされること。

## 10. Documentation Criteria

### AC-DOC-001: README exists

`README.md` が存在すること。

### AC-DOC-002: architecture document exists

以下が存在すること。

```text
docs/architecture.md
```

### AC-DOC-003: acceptance criteria document exists

以下が存在すること。

```text
docs/acceptance-criteria.md
```

### AC-DOC-004: README links to architecture document

READMEから `docs/architecture.md` へ辿れること。

### AC-DOC-005: README links to acceptance criteria document

READMEから `docs/acceptance-criteria.md` へ辿れること。

## 11. Git Operation Criteria

### AC-GIT-001: Git sync diagnosis script exists

Git同期状態を確認するscriptが存在すること。

例:

```text
scripts/git-sync-diagnose.sh
```

### AC-GIT-002: feature branches are short-lived

新規開発は、原則として `main` から短命feature branchを切って行うこと。

### AC-GIT-003: pull requests are used for main integration

mainへ統合する変更は、pull request経由で検査すること。

## 12. Non-Goals

`v0.1.0` 時点では、以下は必須要件としない。

- Web UI
- Cloudflare Pages deployment
- performance baseline
- security headers baseline
- external URL availability check
- source freshness check
- factual correctness check
- full secret scanning engine

これらは、後続phaseで検討する。

## 13. Completion Checklist

`v0.1.0` の完了時には、以下を確認する。

- [ ] `bun run typecheck` が成功する
- [ ] `bun test` が成功する
- [ ] `bun run validate:data` が成功する
- [ ] `bun run validate:policy` が成功する
- [ ] `bun run validate:dependencies` が成功する
- [ ] `bun run validate:public-safety` が成功する
- [ ] `bun run report` が成功する
- [ ] `bun run report:check` が成功する
- [ ] `bun run check` が成功する
- [ ] GitHub Actions `quality-gate` がpull request上で成功する
- [ ] GitHub Actions `quality-gate` がmain push後に成功する
- [ ] `reports/quality-report.md` が最新である
- [ ] `docs/architecture.md` が存在する
- [ ] `docs/acceptance-criteria.md` が存在する
- [ ] READMEから主要docsへ辿れる
- [ ] public safety checkが品質ゲートに含まれている
- [ ] dependency policy checkが品質ゲートに含まれている

## 14. Acceptance Decision

上記の必須項目を満たした場合、`qa-sre-learning-mvp` は `v0.1.0` として受け入れ可能とする。

この時点で、本リポジトリは以下を示すMVPとして扱う。

```text
structured learning data
  -> validation
  -> policy checks
  -> negative fixtures
  -> quality report
  -> report freshness
  -> dependency reproducibility
  -> public safety
  -> GitHub Actions quality gate
```
