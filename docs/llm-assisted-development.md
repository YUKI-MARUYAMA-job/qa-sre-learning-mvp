# LLM活用による開発方針

[docs/llm-assisted-development.md](/docs/llm-assisted-development.md)

## 1. 目的

この文書は、`qa-sre-learning-mvp` を制作する際に、LLMをどのように活用したかを説明するものです。

本リポジトリでは、ChatGPT Plus上で利用したGPT-5.5系の高性能LLMを、要件整理、設計比較、コード草案作成、トラブルシューティング、ドキュメント改稿に利用しました。
一方で、最終的な採用判断、差分確認、コマンド実行、テスト通過確認、公開可否判断は、開発者本人が行っています。

この文書の目的は、LLM利用を隠すことではありません。
むしろ、LLMを使った開発であっても、どの範囲をLLMに支援させ、どの範囲を検証可能な仕組みと本人の判断で担保したかを明示することです。

---

## 2. 利用したLLM環境

本プロジェクトでは、主に以下の環境を開発支援に利用しました。

| 項目               | 内容                                                                             |
| ------------------ | -------------------------------------------------------------------------------- |
| 利用環境           | ChatGPT Plus                                                                     |
| 主な利用モデル     | GPT-5.5系モデル                                                                  |
| 主な用途           | 要件整理、設計支援、実装案作成、テスト観点整理、トラブルシューティング、文書改稿 |
| 利用しなかった用途 | 秘密情報の投入、非公開の就活戦略のrepo反映、テストなしのAI生成コードcommit       |

本プロジェクトでは、LLMの出力を、差分確認、コマンド実行、テスト、品質ゲート、公開安全性チェックの対象にしました。

---

## 3. 基本方針

本プロジェクトでは、LLMを以下を支援するために使いました。

- 要件整理
- 設計案の比較
- コード草案の作成
- テスト観点の洗い出し
- エラーログの切り分け
- ドキュメント改稿
- commit messageやrelease noteの推敲
- 面接時に説明しやすい構成への整理

一方で、LLMの出力はそのまま採用しませんでした。

- 実行して確認する
- 差分を読む
- テストを通す
- 品質ゲートを通す
- 公開安全性を確認する
- 現在の仕様と矛盾しないか確認する
- 自分の言葉で説明できるか確認する

この方針により、LLMを使いながらも、最終成果物の責任を開発者本人が持てる状態を目指しました。

---

## 4. LLMを利用した主な領域

### 4.1 要件定義とスコープ整理

本プロジェクトでは、QA/SRE志望のポートフォリオとして何を示すべきかを、LLMとの対話を通じて整理しました。

特に、以下の方針を明確化しました。

- 大規模な本番サービスではなく、小型MVPとして品質パイプラインを示すこと
- 単なるReactクイズアプリではなく、data validation、E2E、CI/CD、deploymentを統合すること
- localとCIで同じ品質ゲートを再現できること
- README、docs、reportsにより説明可能性を担保すること
- 公開リポジトリとして不適切な情報を含めないこと

LLMは、要件の分解や文書構成の提案に利用しました。
最終的なスコープ判断は、開発者本人が行いました。

---

### 4.2 クイズ問題コンセプトの転換

当初のクイズ問題は、外部技術学習や外部機関試験対策に寄った構成を含んでいました。

その後、公開ポートフォリオとしての説明可能性、第三者教材への依存回避、公式問題再現リスクの低減を考慮し、本リポジトリ自体の技術スタック、品質ゲート、データ検証、E2E、デプロイ構成を理解するための内製クイズへ転換しました。

この転換では、LLMを以下に利用しました。

- 旧コンセプトのリスク整理
- 新taxonomyの構成案作成
- quiz dataの再構成案作成
- policy validationの観点整理
- docs、README、release noteの表現調整
- commit履歴を踏まえた経緯説明の整理

ただし、転換後の実装が妥当かどうかは、実際のcommit履歴、validation、test、report、public JSON、E2Eの通過結果により確認しました。

---

### 4.3 データ検証設計

本プロジェクトでは、クイズデータと学習データを構造化し、検証可能な形にしました。

LLMは、以下の設計整理に利用しました。

- Zod schema validation
- taxonomy validation
- policy validation
- fixture responsibility validation
- source policy validation
- generated artifact freshness check
- public data projection

出力結果は、以下の検証コマンドを用意し、localとCIで確認できる状態にしました。

```bash id="w7zay4"
bun run validate:data
bun run validate:policy
bun run validate:quiz
bun run validate:quiz-policy
bun run validate:quiz-fixtures
bun run quiz:report:check
bun run prepare:public-quiz-data:check
```

---

### 4.4 コード作成と修正

LLMは、TypeScript、Bun CLI、Zod schema、validation logic、test、Playwright E2Eなどの草案作成に利用しました。

実装時には、以下を確認しました。

- TypeScriptの型検査が通ること
- Bun unit testが通ること
- validation commandが期待通り動作すること
- generated reportが最新であること
- public quiz dataがraw dataと同期していること
- client buildが成功すること
- Playwright E2Eが通ること

最終的には、以下の統合品質ゲートにより確認しました。

```bash id="r8n52x"
CI=1 bun run check
```

---

### 4.5 トラブルシューティング

LLMは、エラーログやコマンド実行結果の分析にも利用しました。

主なトラブルシューティング例は以下です。

| 領域                   | 問題                                                                                   | 対応                                                      |
| ---------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| E2E selector           | `getByText(/Question/i)` が問題文中の文字列にも一致し、strict mode violationが発生した | roleやtest idを使った安定したselectorへ変更               |
| quiz policy validation | 外部試験問題ではないという説明文までpolicy違反として誤検出する可能性があった           | 検査対象とpolicy claimの扱いを整理                        |
| generated artifacts    | raw data更新後にreportやpublic JSONが古くなる可能性があった                            | freshness checkを品質ゲートに追加                         |
| Lighthouse CI          | 当初は `dist/site` のみを測定していた                                                  | 主成果物である `dist/app` 向け測定を補助検査として追加    |
| docs整合性             | 古い13問構成や外部学習寄り説明が残る可能性があった                                     | README、architecture、validation docs、release noteを更新 |

これらは、LLMの回答を採用して終わりではなく、実際のコマンド実行と差分確認を通じて修正しました。

---

## 5. 開発者本人が担保したこと

LLMを利用した一方で、以下は開発者本人が担保しました。

- どの機能をMVPに含めるかの判断
- どの文書を公開し、どの情報をprivateに分けるかの判断
- 旧コンセプトから新コンセプトへ転換する判断
- 実行ログに基づく成否確認
- `git diff` による変更確認
- `git status` によるcommit対象確認
- generated artifactをcommit対象にするかの判断
- `.lighthouseci/` や `dist/` をcommitしない判断
- `CI=1 bun run check` の実行確認
- Cloudflare Pages向けbuild責務の整理
- README、docs、reportsの最終表現確認

LLMは提案や草稿の作成に用い、最終的な設計判断と提出判断は、開発者本人が行いました。

---

## 6. 品質保証の仕組み

本プロジェクトでは、以下の品質保証の仕組みを用意しました。

| 観点         | 仕組み                                                                      |
| ------------ | --------------------------------------------------------------------------- |
| 型安全性     | TypeScript typecheck / client typecheck                                     |
| 単体検証     | Bun unit tests                                                              |
| データ構造   | Zod schema validation                                                       |
| 分類整合性   | taxonomy validation                                                         |
| 公開方針     | policy validation                                                           |
| 異常系       | invalid fixtures / fixture responsibility validation                        |
| 生成物同期   | report freshness check / public quiz data freshness check                   |
| UI動作       | Playwright E2E smoke test                                                   |
| 依存関係     | `bun.lock` / `bun install --frozen-lockfile` / dependency policy validation |
| 公開安全性   | public repository safety check                                              |
| 静的品質     | security baseline / performance baseline                                    |
| ブラウザ観測 | Lighthouse CI warn-only                                                     |
| CI/CD        | GitHub Actions quality gate                                                 |
| デプロイ     | Cloudflare Pages build                                                      |

これらにより、LLM出力の正しさをプログラムによって検査可能な形にしています。

---

## 7. 必須品質ゲートと補助検査

本プロジェクトの必須品質ゲートは以下です。

```bash id="6cabxi"
CI=1 bun run check
```

この品質ゲートには、型検査、unit test、validation、generated artifact freshness check、public safety check、client build、security / performance baseline、Playwright E2Eが含まれます。

一方、Lighthouse CIはwarn-onlyの補助検査として扱います。

```bash id="k4ant1"
bun run lighthouse:app:check
```

Lighthouse scoreはCI環境の揺らぎを受けるため、現時点ではmerge blockには使いません。
ただし、主成果物であるクイズアプリ本体のperformance、accessibility、best practices、SEOを観測するための改善候補として利用します。

---

## 8. LLM利用に関する線引き

本プロジェクトでは、LLM利用の線引きを以下のように考えています。

| 項目                                 | 扱い |
| ------------------------------------ | ---- |
| LLMに草案を出させる                  | 許容 |
| LLMに設計比較をさせる                | 許容 |
| LLMにエラーログを分析させる          | 許容 |
| LLMの出力をレビューせずcommitする    | 不可 |
| テストせずにAI生成コードを採用する   | 不可 |
| 自分が説明できないコードをcommitする | 不可 |
| 秘密情報や個人情報をLLMに入力する    | 不可 |

レビュー、テスト、説明可能性、復旧可能性を重視しています。

---

## 9. 本プロジェクトでの具体例

本プロジェクトでは、LLMを利用しながら、以下のように実装を進めました。

| 開発対象            | LLMの利用                                                 | 検証方法                                 |
| ------------------- | --------------------------------------------------------- | ---------------------------------------- |
| クイズデータ        | 問題構成、taxonomy、policy観点の整理                      | `bun run validate:quiz`                  |
| policy validation   | 公開方針と禁止表現の整理                                  | `bun run validate:quiz-policy`           |
| fixtures            | 異常系データの責務分離案                                  | `bun run validate:quiz-fixtures`         |
| public JSON生成     | raw dataからpublic dataへの変換方針                       | `bun run prepare:public-quiz-data:check` |
| quiz quality report | 集計項目と鮮度確認の整理                                  | `bun run quiz:report:check`              |
| React / Vite UI     | UI構成とbuild設定の整理                                   | `bun run client:build`                   |
| E2E                 | 主要導線とselector設計の整理                              | `bun run test:e2e`                       |
| Lighthouse CI       | `dist/site` と `dist/app` の測定方針整理                  | `bun run lighthouse:app:check`           |
| docs                | README、architecture、release note、interview notesの改稿 | `git diff` と公開安全性確認              |

---

## 10. 制約

現在の制約は以下です。

- LLMとの全対話ログを公開しているわけではありません。
- LLM出力と手作業修正の比率を厳密に計測しているわけではありません。
- LLMが提案したすべての案を採用したわけではありません。
- 採用した実装についても、最終的な正しさは品質ゲートとレビューで確認しています。
- 本文書は、開発プロセスの透明性を高めるための説明であり、完全な監査ログではありません。

---

## 11. まとめ

本プロジェクトでは、ChatGPT Plus上で利用したGPT-5.5系の高性能LLMを、要件整理、設計比較、コード草案、トラブルシューティング、ドキュメント整理に利用しました。
一方で、最終的な採用判断、差分確認、実行確認、テスト通過確認、公開安全性確認は、開発者本人が行いました。

本ポートフォリオで重視した事項を下記に示します。

- 何を作ったのか説明できること
- どの品質ゲートで確認したのか説明できること
- 壊れたときに気づけること
- 修正できること
- 必要に応じて戻せること
- 公開リポジトリとして不適切な情報を含めないこと

この方針により、LLMを活用しながらも、QA/SRE志向のポートフォリオとして説明可能で、検証可能な成果物を目指しました。
