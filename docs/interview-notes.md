# Interview Notes

## 1. Purpose

この文書は、`qa-sre-learning-mvp` を面接で説明するための補助資料である。

READMEは第三者が読む入口として整理し、この文書では、自分が口頭で説明する際の構成、強調点、想定質問、今後の拡張方針を整理する。

このプロジェクトは、大規模なアプリケーションを作ることではなく、QA/SRE志向の品質管理パイプラインを小さく再現可能に実装することを目的とした。

## 2. 30秒説明

`qa-sre-learning-mvp` は、QA/SRE志向の小型ポートフォリオMVPです。

構造化された学習データを対象に、Zodによるschema validation、source policy validation、negative fixtures、quality report generation、report freshness checkを実装しました。

さらに、dependency reproducibility、public safety check、performance / security baselineをGitHub Actionsのquality-gateに統合し、生成したレポートをCloudflare Pagesでproduction deployしています。

## 3. 1分説明

このリポジトリでは、学習データを単にJSONとして管理するのではなく、品質検査の対象として扱っています。

まず、Zodでデータ構造を検証し、その上で、source URLの有無、HTTPS、tag重複、categoryとの整合など、プロジェクト固有のsource policyを検査しています。

また、正しいデータが通るだけでは不十分なので、異常系fixtureを用意し、不正なデータが検出されることもtestしています。

検査結果はquality reportとしてMarkdownに出力し、report freshness checkにより、dataや生成ロジックを変更したのにreportを更新し忘れる状態を検出できるようにしています。

最終的には、これらの検査を `bun run check` に統合し、GitHub Actions上でも同じquality-gateを実行しています。

## 4. 3分説明

このプロジェクトの狙いは、QA/SREの基本的な考え方を、小さな題材で一貫して実装することです。

題材としては、Git、CI、TypeScript、Bunなどのlearning itemをJSONで管理しています。ただし、単なる学習メモではなく、検査対象データとして扱っています。

実装は、schema layer、application layer、infrastructure layer、CLI layer、test layerに分けています。

schema layerでは、Zodを使ってlearning itemの構造、必須項目、enum値を検証します。application layerでは、schema validationを通過したデータに対して、source policy validationやquality report generationを行います。

quality reportには、件数、category別集計、source type別集計、tag別集計、policy violations、validation scope、limitationsなどを出力します。

さらに、report freshness checkを導入し、`reports/quality-report.md` が現在のデータ・ロジックと一致していない場合にCIを失敗させるようにしています。

CIではGitHub Actionsを使い、typecheck、test、data validation、policy validation、dependency policy、public safety check、report freshness、static site build、security baseline、performance baselineを統合しています。

main branchにはbranch protectionを設定し、pull request経由でrequired quality-gateが成功した変更のみmergeする運用にしています。

また、生成されたquality reportとportfolio readiness reportは静的HTMLに変換し、Cloudflare Pagesでproduction deployしています。公開後はdeployment baselineにより、ページ到達性とsecurity headersの反映を確認できるようにしています。

## 5. Architecture Summary

主要な処理の流れは以下である。

```text
data/raw/learning-items.json
  -> Zod schema validation
  -> source policy validation
  -> negative fixture tests
  -> quality report generation
  -> report freshness check
  -> static site generation
  -> performance / security baseline
  -> GitHub Actions quality-gate
  -> Cloudflare Pages production deployment
```

主要ディレクトリは以下である。

| Path | Role |
|---|---|
| `data/raw/learning-items.json` | 検査対象データ |
| `data/fixtures/invalid-learning-items.json` | 異常系fixture |
| `src/schemas/` | Zod schema |
| `src/application/` | validation / report generation |
| `src/cli/` | CLI entry points |
| `tests/` | unit tests / negative tests |
| `reports/` | generated reports |
| `docs/` | architecture / acceptance / interview notes |
| `site/static/` | static site assets / `_headers` |
| `.github/workflows/quality-gate.yml` | CI quality-gate |

## 6. QA Perspective

QA観点で説明する場合は、以下を強調する。

### 6.1 検査対象を定義した

このプロジェクトでは、learning itemを検査対象として定義した。

単にJSONを置くのではなく、以下のように検査可能なデータとして扱っている。

- required fields
- enum values
- source type
- source URL
- summary
- tags

### 6.2 正常系だけでなく異常系も検証した

`data/fixtures/invalid-learning-items.json` を用意し、schema-invalid dataとpolicy-invalid dataを検出できることを確認している。

面接での説明例:

```text
正しいデータが通ることだけでなく、壊れたデータが品質ゲートで検出されることを確認しています。
そのために、invalid fixtureを用意し、schema validationとsource policy validationの両方で異常系を検証しています。
```

### 6.3 受け入れ基準を文書化した

`docs/acceptance-criteria.md` に、MVPとして受け入れるための条件を整理している。

QA観点では、実装後に「何をもって完了とするか」を明示している点が重要である。

## 7. SRE Perspective

SRE観点で説明する場合は、以下を強調する。

### 7.1 localとCIで同じquality gateを実行できる

統合品質ゲートは以下である。

```bash
bun run check
```

このコマンドをlocalでもGitHub Actionsでも実行することで、環境差を減らしている。

### 7.2 report freshnessを検査している

reportを生成するだけでなく、commit済みreportが現在のdataやlogicと一致しているかを検査している。

面接での説明例:

```text
生成物をcommitするだけだと、dataや生成ロジックを変更したのにreportを更新し忘れる可能性があります。
そこで、report:checkで再生成後の差分を検出し、stale reportをCIで防いでいます。
```

### 7.3 main branchを保護している

main branchにはbranch protectionを設定し、直接pushではなくPR経由でquality-gateが成功した変更だけをmergeする運用にしている。

面接での説明例:

```text
main branchはprotected branchにしており、pull requestとrequired quality-gateを通った変更だけを統合するようにしています。
これにより、localで動くだけでなく、mainの品質を継続的に保護する運用にしています。
```

## 8. Security / Performance Perspective

### 8.1 Public safety check

公開repoに含めるべきでないファイルを検出するcheckを実装している。

検出対象例:

- `.env`
- `.env.*`
- private key files
- certificate files
- local editor profile files
- bundle files

### 8.2 Security headers baseline

Cloudflare Pages用の `_headers` を生成し、以下のようなheadersを設定・検査している。

- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`
- `Content-Security-Policy`

### 8.3 Performance baseline

静的サイトのHTML/CSSについて、file-size budgetを設定し、生成物の肥大化を検出できるようにしている。

面接での説明例:

```text
大規模なperformance monitoringではありませんが、初期MVPとして、静的サイトの生成物が過度に肥大化していないかをfile-size budgetで検査しています。
```

## 9. Deployment Perspective

生成したquality reportとportfolio readiness reportは、静的HTMLとして `dist/site` に出力し、Cloudflare Pagesでproduction deployしている。

production deploymentは以下で確認できる。

```bash
PRODUCTION_URL="https://qa-sre-learning-mvp.pages.dev" bun run validate:deployment
```

deployment baselineでは、以下を確認する。

- index page が取得できること
- quality report page が取得できること
- portfolio readiness page が取得できること
- security headers がresponseに含まれること

面接での説明例:

```text
レポートをGitHub上のMarkdownに留めず、静的HTMLとして生成し、Cloudflare Pagesでproduction deployしています。
さらに、公開後のURLに対してdeployment baselineを実行し、ページ到達性とsecurity headersの反映を確認できるようにしています。
```

## 10. Failure and Improvement History

このプロジェクトでは、実装中に複数のGit / CI / branch protection関連の問題を経験し、それぞれ運用ルールとして改善した。

### 10.1 Divergent branches

VS Code GUIのSyncやpull操作により、localとremoteが分岐する問題を経験した。

対応:

- `scripts/git-sync-diagnose.sh` を作成
- ahead / behind を明示確認
- merge / rebase / reset を状況に応じて判断
- 作業開始時とpush前に同期診断を実行

### 10.2 Protected branch push rejection

main branchに直接pushしようとして、branch protectionにより拒否される状態を確認した。

対応:

- mainへの直接pushを避ける
- feature branchを作成してPR化
- required quality-gateを通してからmerge

### 10.3 Stale generated report

report生成後にcommit済みreportが古くなる問題を想定した。

対応:

- `report:check` を導入
- report再生成後のGit差分をCIで検出
- stale reportを防止

### 10.4 Cloudflare Pages deployment validation

Cloudflare Pagesでbuild成功後、production URLが正しく配信されているかを手動確認だけにしないようにした。

対応:

- `validate:deployment` を追加
- index / report pages / security headers を確認

## 11. Expected Interview Questions

### Q1. なぜ大規模なWebアプリではなく、このような小型MVPにしたのか。

A. 未経験ポートフォリオでは、規模よりも再現可能な品質管理の考え方を示すことを優先したためです。小さなデータを対象に、validation、negative fixtures、CI、branch protection、deployment baselineまで一貫して実装することで、QA/SREに必要な基礎を説明できるようにしました。

### Q2. QA観点で最も重視した点は何か。

A. 正常系だけでなく異常系を検証することです。invalid fixtureを用意し、不正なデータがschema validationやsource policy validationで検出されることを確認しました。また、acceptance criteriaを文書化し、何をもってMVP完了とするかを明確にしました。

### Q3. SRE観点で最も重視した点は何か。

A. localとCIで同じquality gateを再現できることです。`bun run check` に複数の検査を統合し、GitHub Actions上でも同じコマンドを実行しています。また、main branchをbranch protectionで保護し、quality-gateを通った変更だけをmergeする運用にしました。

### Q4. report freshness checkの目的は何か。

A. 生成物と元データ・生成ロジックの乖離を防ぐことです。dataやreport生成ロジックを変更したにもかかわらず、reportを再生成し忘れると、古い成果物が残ります。`report:check` により、その状態をCIで検出できます。

### Q5. Cloudflare Pagesを使った理由は何か。

A. 静的レポートサイトを軽量に公開でき、GitHub連携によるbuild / deployが容易だからです。また、Cloudflare Pages用の `_headers` によりsecurity headersを設定し、公開後にdeployment baselineで確認できる点が今回の目的に合っていました。

### Q6. 今後改善するなら何を追加するか。

A. Lighthouse CIの安定化、外部URL到達性check、source freshness check、簡易monitoring、GitHub Issuesによる改善loop、v0.1.1 releaseを検討します。現時点では、MVPとしての品質ゲートと公開導線を優先しました。

## 12. How to Present This Repository

面接では、以下の順番で見せる。

1. READMEのOverview
2. Live Site
3. GitHub Actions quality-gate
4. `reports/quality-report.md`
5. `reports/portfolio-readiness.md`
6. `docs/architecture.md`
7. `docs/acceptance-criteria.md`
8. branch protection / PR履歴
9. Cloudflare Pages production deployment
10. この `docs/interview-notes.md`

## 13. Roadmap

今後の拡張候補は以下である。

| Priority | Item | Purpose |
|---|---|---|
| High | README / GitHub profile連携 | 応募時の導線強化 |
| High | 職務経歴書への反映 | ポートフォリオ成果の説明 |
| Medium | Lighthouse CI安定化 | 実ブラウザ観点の品質確認 |
| Medium | external URL availability check | 参照sourceの到達性確認 |
| Medium | source freshness check | 学習sourceの古さ検出 |
| Medium | v0.1.1 release | 改善履歴の固定 |
| Low | lightweight monitoring | 公開サイトの継続確認 |
