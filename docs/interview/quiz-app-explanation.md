# クイズアプリ技術説明メモ

## 1. 位置づけ

このドキュメントは、`qa-sre-learning-mvp` のクイズアプリ部分について、面接・コードレビュー・ポートフォリオ説明時に使う技術説明を整理するものです。

本クイズアプリは、外部機関の公式問題、過去問、実問再現、認定試験対策を目的としたものではない。
本リポジトリ自体のREADME、docs、reports、source code、CI/CD構成を題材として、ポートフォリオ成果物の設計意図、技術スタック、品質保証メカニズムを理解するための内製クイズです。

現在のクイズは16問で構成され、以下の領域を扱う。

- プロジェクト概要
- データ品質パイプライン
- schema validation / taxonomy validation
- policy validation
- 品質ゲートとCI
- React / ViteクイズUI
- Cloudflare Pagesデプロイ
- ドキュメントと説明設計
- Git運用

---

## 2. 30秒説明

このプロジェクトは、単なるReactクイズアプリではなく、QA/SRE志望者向けに、データ品質管理、検証自動化、E2E、CI/CD、デプロイまでを小さく統合したポートフォリオMVPです。

`data/raw/quiz-questions.json` をクイズデータの正本として管理し、schema validation、taxonomy validation、policy validation、fixture responsibility validationで品質を確認する。検証済みデータからUI用の `public/study-it/quiz_data.json` と `reports/quiz-quality-report.md` を生成し、生成物の更新漏れも品質ゲートで検出する。

UIはReact / Viteで実装し、Playwright E2EとGitHub Actionsで主要導線を検証する。Cloudflare Pagesではデプロイ用buildに責務を限定し、完全な品質確認はGitHub Actions側で実行する。

---

## 3. 1分説明

このプロジェクトでは、クイズアプリを題材にして、QA/SREで重要になる「再現可能な品質保証の流れ」を小さく実装している。

重視したのは、画面だけを作ることではなく、以下を一連のパイプラインとして接続することです。

```text
raw quiz data
  -> schema validation
  -> taxonomy validation
  -> policy validation
  -> fixture responsibility validation
  -> quiz quality report
  -> public quiz data
  -> React / Vite UI
  -> Playwright E2E
  -> GitHub Actions quality gate
  -> Cloudflare Pages deployment
```

この構成により、問題データの構造不備、分類不整合、公開方針違反、生成物の更新漏れ、UI回帰を段階的に検出できる。

---

## 4. 5分説明

### 4.1 背景

このプロジェクトでは、学習用クイズアプリを題材にして、QA/SRE職で必要になる検証設計、CI/CD、デプロイ、ドキュメント化を実装した。

当初のクイズは外部技術学習や試験対策に寄りやすい構成だったが、現在はコンセプトを変更し、ポートフォリオ理解用の内製クイズとして再設計している。

この変更により、クイズ問題は外部公式問題や過去問の再現ではなく、本リポジトリの設計・品質ゲート・デプロイ構成を理解するための教材として位置づけている。

---

### 4.2 データ品質管理

クイズデータは `data/raw/quiz-questions.json` を正本として管理している。

raw dataには、画面表示に使う情報だけでなく、内部品質管理のためのmetadataも含めている。

主な項目を以下に示します。

| 項目               | 役割                                                 |
| ------------------ | ---------------------------------------------------- |
| `question`         | 問題文                                               |
| `options`          | 4択の選択肢                                          |
| `answer`           | 正答                                                 |
| `explanation`      | 解説                                                 |
| `track`            | 大まかな出題領域                                     |
| `category`         | taxonomy上の主分類                                   |
| `sub_category`     | 中分類                                               |
| `sub_sub_category` | 小分類                                               |
| `source`           | 根拠となるrepo内部path                               |
| `legal`            | 外部公式問題再現や丸写しでないことを確認するmetadata |
| `review`           | production用データとしてreview済みかを示すmetadata   |
| `tags`             | 検索・分類補助用metadata                             |

このraw dataに対して、Zodによるschema validation、taxonomy validation、policy validationを実行している。

---

### 4.3 schema validation

schema validationでは、クイズデータがJSONデータとして成立しているかを確認する。

確認対象は、必須項目、型、選択肢数、正答キー、source、legal、review、tagsなどです。

関連ファイル:

| ファイル                                 | 説明                           |
| ---------------------------------------- | ------------------------------ |
| `src/schemas/quiz-question.schema.ts`    | クイズ問題のZod schema定義     |
| `src/schemas/subject-taxonomy.schema.ts` | taxonomyのZod schema定義       |
| `src/cli/validate-quiz-data.ts`          | クイズデータ検証CLI            |
| `data/raw/quiz-questions.json`           | 検証対象となるクイズ正本データ |


検証コマンド:

```bash
bun run validate:quiz
```

---

### 4.4 taxonomy validation

taxonomy validationでは、クイズ問題の分類が `data/raw/subject-taxonomy.json` と整合しているかを確認する。

現在の主なcategoryを以下に示します。

```text
project_overview
data_quality_pipeline
schema_taxonomy_validation
policy_validation
quality_gate_ci
frontend_quiz_ui
deployment_cloudflare_pages
documentation_workflow
git_workflow
```

この検証により、存在しないcategory、sub_category、sub_sub_category、ID prefixの不整合を検出できる。

関連ファイル:

| ファイル                                    | 説明                        |
| ------------------------------------------- | --------------------------- |
| `data/raw/subject-taxonomy.json`            | taxonomyの正本              |
| `src/application/validate-quiz-taxonomy.ts` | taxonomy validationの実装   |
| `tests/validate-quiz-taxonomy.test.ts`      | taxonomy validationのテスト |


---

### 4.5 policy validation

policy validationでは、schemaやtaxonomyだけでは検出できない、公開ポートフォリオとしての安全性と運用方針を確認する。

主な検証観点を以下に示します。

- sourceがrepo内部pathであること
- publisherが `qa-sre-learning-mvp` であること
- 問題内容が本ポートフォリオの範囲に収まっていること
- production用クイズデータがreview済みであること
- 外部公式問題の再現ではないこと
- 第三者資料の丸写しではないこと
- 公式認定・提携・後援などを示唆しないこと
- token、password、private key等、機密情報を示唆する文字列を含まないこと

関連ファイル:

| ファイル                                           | 説明                                  |
| -------------------------------------------------- | ------------------------------------- |
| `src/application/validate-quiz-policy.ts`          | policy validationの中心ロジック       |
| `src/cli/validate-quiz-policy.ts`                  | policy validationのCLI入口            |
| `tests/validate-quiz-policy.test.ts`               | policy validationのテスト             |
| `data/fixtures/policy-invalid-quiz-questions.json` | policy違反を意図的に含む異常系fixture |


検証コマンド:

```bash
bun run validate:quiz-policy
```

この検証は法的助言の代替ではなく、公開前の安全確認と品質保証のためのガードです。

---

### 4.6 fixture responsibility validation

異常系fixtureは、どの検証層で失敗すべきかを分けて管理している。

| Fixture                              | 期待される挙動                                                    |
| ------------------------------------ | ----------------------------------------------------------------- |
| `invalid-quiz-schema.json`           | schema validationで失敗する                                       |
| `invalid-quiz-taxonomy.json`         | schema validationは通過し、taxonomy validationで失敗する          |
| `policy-invalid-quiz-questions.json` | schema / taxonomy validationは通過し、policy validationで失敗する |


これにより、検証層の責務が混ざっていないことを確認できる。

検証コマンド:

```bash
bun run validate:quiz-fixtures
```

---

### 4.7 public data boundary

公開UIでは、raw dataを直接使わない。

`data/raw/quiz-questions.json` から `public/study-it/quiz_data.json` を生成し、UI実行に必要な情報だけを公開する。

| データ                           | 役割                       |
| -------------------------------- | -------------------------- |
| `data/raw/quiz-questions.json`   | 内部用の正本データ         |
| `public/study-it/quiz_data.json` | UIが読み込む公開用データ   |
| `reports/quiz-quality-report.md` | クイズデータの品質レポート |


`legal` と `review` は内部品質管理用metadataであり、public JSONには含めない。

生成コマンド:

```bash
bun run prepare:public-quiz-data
```

鮮度確認:

```bash
bun run prepare:public-quiz-data:check
```

---

### 4.8 クイズ品質レポート

クイズデータから `reports/quiz-quality-report.md` を生成する。

このレポートでは、以下を確認できる。

- 総問題数
- taxonomy issue count
- policy issue count
- track distribution
- category distribution
- difficulty distribution
- source publisher distribution
- review status distribution
- legal flag summary
- taxonomy coverage

生成コマンド:

```bash
bun run quiz:report
```

鮮度確認:

```bash
bun run quiz:report:check
```

`quiz:report:check` により、クイズデータを変更したにもかかわらずレポートを更新していない状態を検出できる。

---

### 4.9 Frontend and E2E

UIはReact / Viteで実装している。

Playwright E2E smoke testでは、以下の主要導線を確認する。

- アプリが読み込まれる
- 問題が表示される
- 選択肢をクリックできる
- 正誤フィードバックが表示される
- 次の問題へ進める
- 結果画面が表示される
- カテゴリ別スコアが表示される
- もう一度解くことで初期状態へ戻れる

関連ファイル:

| ファイル                | 説明                       |
| ----------------------- | -------------------------- |
| `src/client/`           | React / ViteによるクイズUI |
| `e2e/quiz-smoke.e2e.ts` | Playwright E2E smoke test  |
| `playwright.config.ts`  | E2E実行設定                |


検証コマンド:

```bash
bun run client:typecheck
bun run client:build
bun run test:e2e
```

---

### 4.10 CI/CD

GitHub Actionsでは、完全品質ゲートとして `CI=1 bun run check` を実行する。

品質ゲートには、型検査、unit test、各種validation、生成物鮮度確認、public safety check、client build、security / performance baseline、Playwright E2Eが含まれる。

一方で、Cloudflare Pagesでは `bun run pages:build` を実行し、デプロイ用buildに責務を限定している。

この責務分離により、以下を明確にしている。

| 領域             | 責務                          |
| ---------------- | ----------------------------- |
| GitHub Actions   | 完全品質ゲートを実行する      |
| Cloudflare Pages | 静的アプリをbuildして公開する |


関連ファイル:

| ファイル                                | 説明                                    |
| --------------------------------------- | --------------------------------------- |
| `.github/workflows/quality-gate.yml`    | GitHub Actions品質ゲート                |
| `package.json`                          | `check`、`pages:build` などのscript定義 |
| `site/static/_headers`                  | 静的サイト向けsecurity headers          |
| `src/cli/check-security-baseline.ts`    | security baseline検査                   |
| `src/cli/check-performance-baseline.ts` | performance baseline検査                |


---

## 5. QA観点で説明する場合

QA観点では、単に正常系のアプリ操作を確認するだけではなく、検証層を分けて異常系を扱っている点を説明する。

説明例:

```text
QA観点では、schema validation、taxonomy validation、policy validationを分離し、それぞれの検証層に対して異常系fixtureを用意しました。

schema違反、taxonomy違反、policy違反が、それぞれ想定した層で失敗することを確認しています。

また、Playwright E2Eにより、実際のユーザー操作に近い形で、問題表示、回答、フィードバック、結果画面、再実行の主要フローを検証しています。
```

強調できる点:

- 正常系だけでなく異常系fixtureを用意した
- 検証層ごとに責務を分離した
- 生成物の更新漏れをfreshness checkで検出する
- UI回帰をPlaywright E2Eで検出する
- 曖昧なselectorに依存しないE2Eへ改善した

---

## 6. SRE観点で説明する場合

SRE観点では、localとCIで同じ品質ゲートを再現できる点、デプロイ責務を分離している点を説明する。

説明例:

```text
SRE観点では、localとGitHub Actionsで同じ品質ゲートを実行できることを重視しました。

`CI=1 bun run check` に、型検査、テスト、validation、生成物鮮度確認、公開安全性チェック、client build、security / performance baseline、Playwright E2Eを統合しています。

Cloudflare Pagesではデプロイ用buildに責務を限定し、完全な品質保証はGitHub Actions側で実行する設計にしています。
```

強調できる点:

- `bun install --frozen-lockfile` による依存関係の再現性
- localとCIで同じ品質ゲートを実行できる
- public repository safety checkを導入している
- security / performance baselineを定義している
- GitHub ActionsとCloudflare Pagesの責務を分離している
- main branchを常に展示可能状態に保つ方針である

---

## 7. 技術的に深掘りされた場合

### 7.1 なぜraw dataとpublic dataを分けたのか

raw dataには、UIに表示しない内部管理情報を含める必要があるためである。

たとえば、`legal` や `review` は公開前の検証に必要だが、UI実行には不要です。
そのため、raw dataを正本として保持し、検証済みデータからpublic JSONを生成する構成にした。

この分離により、内部品質管理と公開データ最小化を両立できる。

---

### 7.2 なぜpolicy validationをschema validationと分けたのか

schema validationは、データ構造が成立しているかを確認する。
一方、policy validationは、公開リポジトリとして扱ってよい内容か、project scopeから外れていないか、公式問題再現と誤認されないかを確認する。

この2つは責務が異なるため、分離している。

---

### 7.3 なぜ外部URLではなくrepo内部pathをsourceにしたのか

今回のクイズは外部試験問題対策ではなく、本リポジトリ自体を理解するための内製クイズです。
そのため、sourceは外部URLではなく、README、docs、reports、src、e2e、package.jsonなどのrepo内部pathを参照する設計にした。

この方針により、第三者教材の再配布や公式問題再現リスクを下げつつ、問題の根拠をリポジトリ内で追跡できる。

---

### 7.4 なぜ生成物をcommit対象にしているのか

`reports/quiz-quality-report.md` と `public/study-it/quiz_data.json` は生成物だが、品質ゲートで鮮度確認するためcommit対象にしている。

`quiz:report:check` と `prepare:public-quiz-data:check` は、再生成後にGit差分が出ないことを確認する。
これにより、raw dataだけ更新され、レポートやpublic JSONが古いまま残る状態を検出できる。

---

### 7.5 なぜCloudflare Pagesで完全品質ゲートを実行しないのか

Cloudflare Pagesは、静的アプリのbuildと配信に責務を限定した方が安定するためです。

完全品質ゲートにはPlaywright E2Eなど、ブラウザ実行やCI環境依存の処理が含まれる。
そのため、品質保証はGitHub Actionsで行い、Cloudflare Pagesでは `pages:build` に絞る構成にしている。

---

## 8. 学んだこと

この実装を通じて、単にReactクイズアプリを作るだけではなく、データ品質、検証設計、E2E、CI/CD、デプロイ、公開安全性までを小さく一周させる実装を経験した。

| 学習・実装項目                  | 関連技術スタック                                           | 本ポートフォリオでの機能                                                                                                    | トラブルシューティング事項                                                                                       | 学んだこと                                                                                                     |
| ------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Data validation design          | TypeScript / Zod / Bun CLI                                 | `data/raw/quiz-questions.json` や `data/raw/learning-items.json` を正本データとして扱い、CLIで検証する                      | JSON構造、必須項目、文字列長、選択肢数、metadataの不足を検出する必要があった                                     | UI実装前にデータ品質を検証することで、表示時の不具合を上流で防げること                                         |
| Schema validation               | Zod / TypeScript                                           | クイズ問題の `id`、`track`、`category`、`options`、`answer`、`source`、`legal`、`review` を構造検証する                     | `source.url` を外部URL前提にすると、repo内部pathをsourceにする新仕様と衝突した                                   | schemaは「正しい形」を固定する一方、コンセプト変更に応じて柔軟に見直す必要があること                           |
| Taxonomy validation             | TypeScript / JSON taxonomy                                 | `data/raw/subject-taxonomy.json` を分類体系の正本とし、問題ごとの `category`、`sub_category`、`sub_sub_category` を検証する | 旧カテゴリから新カテゴリへ移行した際、ID prefixや分類名の整合を取り直す必要があった                              | 分類体系をデータとして管理すると、表記揺れや分類漏れを自動検出できること                                       |
| Policy validation               | TypeScript / custom validation logic                       | 外部公式問題の再現、公式性誤認、review漏れ、secret-like text、repo外sourceを検出する                                        | 「外部試験問題ではない」という説明文までpolicy違反として誤検出しないよう、検査対象を整理する必要があった         | schemaでは検出できない公開方針・安全性・運用ルールをpolicy validationとして分離する重要性                      |
| Fixture responsibility          | Bun test / JSON fixtures                                   | schema-invalid、taxonomy-invalid、policy-invalidのfixtureを分け、想定した検証層で失敗することを確認する                     | policy-invalid fixtureがpublic safety checkと衝突しないよう、fixtureの責務とscan対象を整理する必要があった       | 異常系fixtureは「失敗すればよい」ではなく、どの層で失敗すべきかを明確にする必要があること                      |
| Report freshness check          | Bun CLI / Git diff                                         | `reports/quiz-quality-report.md` や `reports/quality-report.md` を再生成し、Git差分が出ないことを確認する                   | raw data更新後にレポート未更新だと `git diff --exit-code` で失敗した                                             | 生成物をcommit対象にする場合、freshness checkで更新漏れを検出できること                                        |
| Public data projection          | TypeScript / Bun CLI / JSON                                | raw quiz dataから `public/study-it/quiz_data.json` を生成し、UIに必要な項目だけを公開する                                   | `legal` や `review` など内部metadataをpublic JSONに含めないよう変換処理を調整した                                | 内部管理用データと公開用データを分離することで、品質管理と公開データ最小化を両立できること                     |
| React / Vite build              | React / Vite / TypeScript                                  | 生成済みpublic JSONを読み込み、4択クイズ、フィードバック、結果画面を表示する                                                | public JSON schema変更後にclient側の型やbuildとの整合を確認する必要があった                                      | frontendは単独で完結せず、データ生成・schema・runtime validationと連動すること                                 |
| Playwright E2E                  | Playwright / Vite preview                                  | クイズ表示、回答、正誤フィードバック、結果画面、再実行をブラウザ上で検証する                                                | `getByText(/Question/i)` が問題文中の `quiz-questions.json` にも一致し、strict mode violationが発生した          | E2Eでは文言の部分一致に依存せず、roleやtest idを使った安定したselector設計が重要ですこと                       |
| E2E selector design             | Playwright locator / ARIA role                             | heading、button、status、test idを使い、UIの主要状態を検証する                                                              | 問題文やファイル名に偶然一致する曖昧なselectorを避ける必要があった                                               | E2Eは「画面に文字があるか」ではなく、「ユーザー操作上の意味を持つ要素があるか」を検証すべきだと学んだ          |
| GitHub Actions quality gate     | GitHub Actions / Bun / CI                                  | PRやmain pushで `CI=1 bun run check` を実行し、localと同じ品質ゲートを再現する                                              | localでは通るがCIで落ちる可能性を考え、lockfile、生成物差分、Playwright実行条件を意識する必要があった            | localとCIで同じコマンドを実行できる設計が、再現性の高い品質保証につながること                                  |
| Cloudflare Pages deployment     | Cloudflare Pages / Vite / Bun                              | `bun run pages:build` で `dist/app` を生成し、静的クイズアプリとして公開する                                                | Cloudflare Pages側で完全品質ゲートを実行するのではなく、デプロイ用buildに責務を限定する判断が必要だった          | 品質保証はGitHub Actions、静的配信はCloudflare Pagesという責務分離が運用を安定させること                       |
| Dependency reproducibility      | Bun / bun.lock / frozen install                            | `bun.lock` と `bun install --frozen-lockfile` により依存関係を再現する                                                      | `"latest"` 指定やlockfile不整合がCI再現性を損なう可能性があった                                                  | 依存関係の固定は、CI/CDとチーム開発の前提となること                                                            |
| Public repository safety check  | Shell script / package scripts                             | `.env`、秘密鍵、証明書、不要なbundle、secret-like stringsなどを検出する                                                     | 異常系fixtureやtest用文字列と、本当に公開すべきでない情報の扱いを分ける必要があった                              | 公開リポジトリでは、実装コードだけでなく、commit対象全体を安全性の検査対象にする必要があること                 |
| Security / performance baseline | Static headers / Bun CLI                                   | `_headers` やfile-size budgetを検査し、静的成果物の最低基準を確認する                                                       | 本格監視ではなく、MVP段階で扱える軽量なbaselineに範囲を絞る必要があった                                          | 最初から完全な監視を作るのではなく、小さなbaselineから品質指標を導入できること                                 |
| CI/CD troubleshooting           | Bun / Git / GitHub Actions / Playwright / Cloudflare Pages | typecheck、unit test、validation、生成物check、build、E2E、deployを連結して検証する                                         | stale generated files、E2E selector衝突、schema変更、public data未同期など、複数層の問題を切り分ける必要があった | 失敗ログを工程ごとに読み分けることで、アプリ不具合、データ不整合、生成物未更新、テスト設計不備を区別できること |


この実装を通じて、QA/SRE志望のポートフォリオでは、単に機能を作るだけでなく、変更を迅速かつ安全に確認できる仕組みを設計・実装・説明できることが重要であると学びました。
