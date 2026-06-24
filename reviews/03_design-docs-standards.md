# レビュー：design-docs/00_standards（設計標準とテンプレート群）

- レビュー対象：`c:\Users\yunag\git\sdd\design-docs`（README、`00_standards/` 一式、`adr/`、`siteA/B/C`、`プロンプト.md`）
- レビュー観点：3層構造の整合性・網羅性・実用性、テンプレ↔ガイドライン↔サイト構成の対応、命名/図規約の実行可能性、外部ベストプラクティスとの照合
- レビュー日：2026-06-22
- 制約：ドキュメントは変更していない（本レビューファイルの Write のみ）。

---

## ① 概要

本リポジトリは「基本設計書を一元管理する専用リポジトリ」として、**3層構造（標準／サイト／成果物）** を採用している。`design_architecture.md` を最上位の正本に置き、`document_guideline.md`（成果物カタログ）・`diagram_format.md`・`naming_convention.md`・`templates/`（5種）で具体化、各サイト（A/B/C）は標準フォルダ体系の空骨組みという構成。

全体として **設計思想は非常に明快で完成度が高い**。「2人以上の開発者が別々の実装をしてしまうか？」という単一の判断基準、二重管理の排除（正本の一元化）、層の混同を防ぐ繰り返しの注意喚起、各規約が「なぜ必要か（破綻ライン）」を添える書き方は、設計ガバナンス文書として模範的である。手本（フューチャー社規約）の明示や `〔要確認〕` で「想像で足さない」姿勢を貫いている点も高評価。

一方で、**標準体系の数値的な整合性に複数の破れ**がある（後述）。最も重大なのは、(1) `be-architecture.md` が実質空のままで「FE/BE縦割りでは分けない」と言いつつ第1層の片肺が欠落していること、(2) ADR が「専用リポジトリ」原則に反して `design-docs` の外（`FE_architecture/ADR/`）にあり、`fe-architecture.md` のリンクが repo 単独 clone で壊れること、(3) ADR 採番フォーマットが文書間で 3桁／4桁に食い違っていること、(4) `document_guideline.md` のカタログが「01〜10」を称しながら実際は **API設計書の番号が画面設計書とずれ、データモデル以降が全部1つズレている**（後述②③）。

重大度別件数：**Critical 2 / High 6 / Medium 7 / Low 4 / Info 3**

---

## ② 良い点（維持すべき強み）

1. **判断基準の単一化と一貫適用。** 「決まっていないと2人以上が別実装をするか？ Yes→標準、No→別の正本」という基準を全ファイル冒頭に置き、ブレずに適用している（`design_architecture.md:29-30`、`document_guideline.md:4`、`naming_convention.md:4`、`プロンプト.md:33-35`）。設計ガバナンス文書として理想的。
2. **層の明示と混同防止。** すべての標準ファイルが冒頭で「第1層・サイト非依存」を宣言し、サイト固有（サイトAのEAV/メタデータ駆動）を標準に混ぜないことを繰り返し警告している（`design_architecture.md:44-47`, `:72`、`document_guideline.md:21`）。最大の地雷を正しく特定して対処している。
3. **二重管理の排除と正本の所在明示。** 各成果物カタログに「書かないこと（正本の場所）」列を設け、Figma／型定義／Lint設定／`fe-architecture.md` へ参照を逃がしている（`document_guideline.md:17`, `:32`, `:46`）。SSOT の徹底。
4. **手本（出典）の明示と「無いものは発明しない」姿勢。** フューチャー社規約を手本に挙げ、手本に無いルールは `〔要確認〕` として残す（`diagram_format.md:6`, `:123-128`、`naming_convention.md:49`）。`fe-architecture.md` は各章を bulletproof-react / Next.js 公式 / ADR に紐づけ、誇張回避の注記まで入れている（`fe-architecture.md:9-20`, `:99`）。トレーサビリティが高い。
5. **テンプレートの実用性。** 5種いずれも冒頭コメントに「位置づけ・記入方法・準拠フォーマット・正本参照」を備え、`〔記入〕` プレースホルダで埋め方が自明（`screen-design.md:1-9`、`enum-design.md:1-6`）。複製してすぐ使える品質。
6. **Markdown の限界に対する現実的な例外規定。** 項目数が多い場合に Excel 等を許容し、採用時は README 明記を課す（`design_architecture.md:201-205`）。実務的で破綻しにくい。

---

## ③ ファイル / テンプレート別の指摘

### be-architecture.md（5行・実質空）

- **[Critical] 第1層の片肺が欠落。** `design_architecture.md:15` は「FE用/BE用の縦割りでは分けない…横割りで分ける」と謳い、`:57` で be-architecture を「BEの横断アーキテクチャ標準（Java層の責務・API設計方針等）」の正本と位置づける。しかし本体は「別途整備（対象外）」のプレースホルダのみ（`be-architecture.md:4`）。`document_guideline.md:32`, `:53` や各テンプレート（`api-design.md:8`）が「BE実装方式は be-architecture.md を参照」と多数リンクしているため、**参照先が空＝ガイドラインの参照網が空振りする**。API設計書（07）は FE/BE 共有の正本にもかかわらず、BE側の設計方針（トランザクション境界・例外設計・レイヤ責務）が標準として存在しない。
  - 根拠：`be-architecture.md:1-6`、`design_architecture.md:15`, `:57`、`document_guideline.md:53`, `:71-76`、`api-design.md:8`
  - 推奨対応：PoC対象外であっても、最低限の章立てスケルトン（責務分離・API設計方針・例外/トランザクション・命名委譲）と `〔未記述〕` 状態タグを置き、fe-architecture.md と同じ「章立ての出典」表で arc42 §4/§8/§9 等の権威に紐づける。少なくとも「現状空であり参照しても情報が無い」旨を参照元へ注記する。

### design_architecture.md（最上位の正本）

- **[High] 成果物カタログの番号が本ファイル内ですら不整合。** §4 の標準フォルダ表は **01〜10**（`:138-149`：…07_API設計書, 08_データモデル, 09_区分値設計, 10_メッセージ定義）。ところが §3 のリポジトリツリー（`:106-118`）は **サイトAの番号**（07_メタデータ定義設計, 08_API設計書, 09_データモデル, 10_区分値設計, 11_メッセージ定義）。同一ファイル内で「API設計書=07」と「API設計書=08」が混在し、読者が標準番号を一意に取れない。
  - 根拠：`design_architecture.md:106-118`（サイトA番号）vs `:138-149`（標準01〜10）
  - 推奨対応：§3 ツリーは「サイトA例」と明記する（既に `★サイトA固有` 注記はあるが、番号体系全体がサイトA寄りである点が伝わらない）。あるいは §3 を標準番号で描き、サイトAのズレは siteA README だけに閉じる。
- **[High] 標準フォルダ体系（§4）と現物フォルダ・命名規約が「API設計書」と「07/08」で食い違う。** §4 は **07=API設計書, 08=データモデル**。しかし `naming_convention.md` のファイル名表は API を `api-{機能名}.md`、画面を `screen-*` と定義するが番号は持たない。現物 `siteA` は 08=API設計書（メタデータ定義を07に挿入したため）。**標準カタログ（document_guideline.md）が「07_API設計書」を採るのに対し、`design_architecture.md` §4 では「07_API設計書」だが「06_画面設計書」の次にいきなり API が来る一方、テンプレ命名・画面ID章は画面=06 で一致**。混乱の核は「データモデルとAPIの順序」が文書ごとに違うこと（下記④の対応表参照）。
  - 推奨対応：④の対応表で全文書の番号を1つに正規化し、各ファイルはそれを参照のみにする。
- **[Medium] §5.5 メッセージのレベル定義が文書間で不一致。** ここは「E / W / F（Fatal）等」（`:199`）。`document_guideline.md:94` も「E/W/F」。しかし `message-def.md` テンプレ例の識別子は `MSG-E-001`、`design_architecture.md:199` のレベル説明には「I（Info）」が無い。Fatal を独立レベルにする是非（HTTPステータス列と重複しないか）も未整理。
  - 推奨対応：レベルの値集合を区分値（enum）として正式定義し、`09_区分値設計` の正本ルールに従わせる（メッセージレベル自体が区分値である）。
- **[Medium] §7 ADR の配置と現実が矛盾。** §7 は「設計判断は `adr/` に記録する」「命名 `ADR-{NNN}-…`」（`:227-229`）。だが実体の FE ADR は `FE_architecture/ADR/`（design-docs リポジトリ外）にあり、`design-docs/adr/` は README のみの空（`adr/README.md:8` も「既存FE関連ADRは `FE_architecture/ADR/` にある」と自認）。**「専用リポジトリで一元管理（SSOT）」（`:83-85`）の原則に最も近い ADR が、その専用リポジトリの外に置かれている。**
  - 推奨対応：ADR を `design-docs/adr/` に移設（または symlink/コピー方針を ADR で明文化）。少なくとも「FE ADR の正本は別リポジトリにある」例外を §7 と adr/README に明記。
- **[Low] §5.1 と diagram_format.md の二重定義。** 図のツール表が `design_architecture.md:162-166` と `diagram_format.md:11-16` でほぼ同内容で重複。`diagram_format.md` は「正本は §5.1、本ファイルが具体化」と言うが、表そのものを再掲しており、SSOT原則からは「§5.1 は方針のみ、表は diagram_format に一本化」が望ましい。

### fe-architecture.md

- **[Critical] ADR への相対リンクが design-docs リポジトリ外を指し、単独 clone で破綻。** `fe-architecture.md:4` は `[ADR 0001〜0005](../../FE_architecture/ADR/README.md)` を「正」と宣言。design-docs を独立した「専用リポジトリ」として clone すると `../../FE_architecture/` は存在せず、**正たる根拠への全リンクが切れる**。fe-architecture は ADR を最上位の根拠に据えているため影響大。
  - 根拠：`fe-architecture.md:4`、`:18`、各章の「出典：ADR-000x」、`design_architecture.md:83`（専用リポジトリ分離の宣言）
  - 推奨対応：ADR を design-docs 内へ取り込む（③の design_architecture §7 と同根）。取り込めない場合は「本標準は FE_architecture リポジトリの ADR に依存する」ことを依存関係として明記し、相対リンクではなく安定参照（リポジトリ名＋パス）にする。
- **[High] 文書内の自己申告ステータスが「未完成」を示す。** §15 残論点に未決8件（ケース変換、staleTime/gcTime、401/403 UI、AGENTS.md 未作成、ADR追記要、等）が残り、§7/§8.2/§11/§13 が ⚠️（部分・未決）（`fe-architecture.md:117`, `:136`, `:170`, `:187`, `:205-220`）。第1層の「正本」として全サイトに強制するには未決が多い。
  - 推奨対応：未決項目は「決定するまでサイトに強制しない」ことを明記、または暫定既定値を置く。完成の定義（`:220`）は妥当なので、それを満たすまでの扱いを README に明示。
- **[High] ADR 採番フォーマットが他文書と非整合（3桁 vs 4桁）。** 本ファイルは `ADR-0001`（4桁、`:4`, `:50` 等）。一方 `naming_convention.md:31` と `design_architecture.md:229` の規約は `ADR-{NNN}`（3桁、例 `ADR-001`）。現物 FE ADR は `0001-…`（4桁）。**規約（3桁）と実体・fe-architecture（4桁）が矛盾**。
  - 根拠：`fe-architecture.md:4`、`naming_convention.md:31`、`design_architecture.md:229`、`FE_architecture/ADR/`（4桁ファイル）
  - 推奨対応：4桁（`NNNN`）に統一して naming_convention と design_architecture を修正（実体が4桁のため）。
- **[Medium] 内部参照系統（A系/B系/C系/D系）が design-docs に存在しない。** §1.1（`:34-41`）が「A系 `アーキテクチャ設計.md`」「B系 `共通コンポーネント.md`」「C系 `spa_architecture/`」「D系 `Archive/`」を参照するが、これらは design-docs 内に無く、新規参画者が辿れない。第1層標準としては内部作業ログ的記述が混入している。
  - 推奨対応：A〜D系の所在（別リポジトリ/フォルダ）を1箇所で定義し、未整備のものは `〔要確認〕`／TODO（`:42` の TODO は既存）として扱う。標準の正本からは作業系統の記述を付録へ分離するのが望ましい。
- **[Info] 出典の質が高い。** 各章が外部権威＋ADRに紐づき、誇張回避の注記（`:99` Jotai/Vitest）まである。維持推奨。

### document_guideline.md（成果物カタログ）

- **[High] カタログの番号がサイトA実体・naming・テンプレ命名と段ずれ。** 見出しは「成果物カタログ（標準体系 01〜10）」（`:25`）で、06=画面設計書, 07=API設計書, 08=データモデル, 09=区分値設計, 10=メッセージ定義（`:64-97`）。これは `design_architecture.md` §4（`:145-149`）とは一致する。**しかし現物 siteA は 06画面/08API/09データ/10区分値/11メッセージ**（07にメタデータ挿入）。カタログは「サイト固有成果物は番号を挿入してよい／番号ずれは許容」と言う（`:114-115`）が、**読者が「07」と書かれた成果物を探すと、サイトでは07がメタデータ定義になっていて API ではない**。番号で参照すると必ず取り違える。
  - 根拠：`document_guideline.md:64-97`（07=API…）vs `siteA_master-data/README.md:14-19`（07=メタデータ, 08=API…）
  - 推奨対応：カタログ・テンプレ・本文は **番号で成果物を参照しない**（番号は並び順にすぎないと naming_convention.md:11 で宣言済み）。成果物は名称（「API設計書」）で参照し、`07_メッセージ定義` のような番号併記をやめる。番号併記が必要なら「サイトにより番号は変動しうる」を各参照箇所に付す。
- **[Medium] §2 見出し「01〜10」だが §4 標準は実質10種でも、データモデルとAPIの順序が一般的設計フローと逆。** カタログは 06画面→07API→08データモデル。通常は データモデル（ERD）→API→画面 か、画面→API→データの一貫順が望ましい。API（07）がデータモデル（08）より前に来る根拠が無い。
  - 推奨対応：順序の根拠を1行添えるか、データモデル→API→画面の依存順に整える（強制ではないが実用上の指摘）。

### diagram_format.md

- **[Low] テーマ `toy` の指定が手本準拠か出典不明。** PlantUML `!theme toy` を必須化（`:24`）。フューチャー手本が `toy` を指定しているかは本文から辿れず、`〔要確認〕`扱いでもよい。`toy` は PlantUML 既定テーマの一つだが、可読性・印刷適性で他テーマ（`plain` 等）が選ばれることもある。
  - 推奨対応：`toy` 採用の出典（手本の該当箇所）を1行付す。なければ `〔要確認〕`。
- **[Info] Mermaid と PlantUML の併用基準が明快。** 「1成果物内で記法を混在させない」（`:77`）は実務的で良い。

### naming_convention.md

- **[Medium] API設計書ファイル名と OpenAPI の関係が未定義。** `api-{機能名}.md`（`:28`）は定義されるが、`07_API設計書` に置く `openapi.yaml`（`design_architecture.md:146`, `:172`）のファイル名・分割方針（単一 vs tags-split）が命名規約に無い。fe-architecture §7 は `mode: 'tags-split'` を推奨するが、これはコード生成側。設計書側の openapi.yaml の置き方が未規定。
  - 推奨対応：`openapi.yaml`（固定名）を ファイル名規約表に追加。複数ファイル分割可否を1行規定。
- **[Low] ADR 採番が3桁で実体4桁と矛盾（再掲）。** `:31` `ADR-{NNN}` / `ADR-001-…`。実体・fe-architecture は4桁。④参照。

### templates/ 5種

- **[Medium] テンプレ5種＝成果物10種で、カタログのテンプレ列と過不足がある。** カタログは screen-list / screen-design / api-design / enum-design / message-def の5つにテンプレを割当て、01〜05・08（データモデル）・07相当は「—」（テンプレ無し）（`document_guideline.md:33`, `:82` 等）。**データモデル（ERD・テーブル定義）にテンプレが無いのは妥当性が薄い**：テーブル定義表は全サイトで形が共通化しやすく、「2人が別実装」リスクが高い領域。「テーブル定義表はサイトで定義」（`:82`）は標準の判断基準（共通なら標準化）に照らすと緩い。
  - 根拠：`document_guideline.md:82`、`design_architecture.md:147`
  - 推奨対応：最小限の `table-def.md`（論理名/物理名/型/PK/FK/NOT NULL/デフォルト/コメント）テンプレ追加を検討。ERD は §5.1 図に委譲で可。
- **[Medium] api-design.md テンプレの由来表ヘッダが英語、他は日本語混在。** `api-design.md:37-39` は `Parameter | Description | Settings | Note`（手本フューチャー準拠の英語ヘッダ）。一方 enum/message/screen は日本語ヘッダ。手本準拠の意図は理解できるが、規約として「由来表のみ英語ヘッダ」とどこにも明記が無い。
  - 推奨対応：`design_architecture.md:176` の由来表ヘッダが英語である旨を一言規定（手本準拠と明記）すれば整合する。
- **[Low] screen-design.md にメッセージ識別子参照はあるが、メッセージ→画面の逆参照手段が未定義。** `screen-design.md:41` は「エラーメッセージ識別子」列で `10_メッセージ定義` を参照（正しい方向）。これは良い設計だが、message-def 側に「使用箇所」を持たないため、未使用メッセージの検出ができない。標準としては許容範囲（正本一方向参照は正しい）だが、運用注記があると親切。
- **[Info] screen-list の描画方式「fe-architecture の方式名に合わせる（独自に増やさない）」（`:19`）は二重管理回避として的確。**

### siteA/B/C・README

- **[Low] siteA README の番号と design_architecture.md §4 が API/データで段ズレ（既知・許容方針だが参照事故源）。** `siteA_master-data/README.md:14-19`（07メタデータ/08API/…/11メッセージ）。許容と明記済み（`:21`）だが、③のとおり「番号で参照しない」運用に倒さないと事故が起きる。
- **[Info] siteB/C が空骨組み＋リネーム指示で運用意図が明確（`siteB_xxx/README.md:4`）。良い。**

### adr/README.md

- **[High] design-docs/adr が空で、設計書標準側の判断 ADR が1本も無い。** README は「設計書標準側の判断ADRは本フォルダに追加する」と言う（`adr/README.md:8`）が0本。`design_architecture.md:230-231` と `fe-architecture.md:219` は「本セッションの決定（service-common.md 廃止、Jotai採用、orval確定、第1層にFE/BE標準新設）を ADR に記録する」と TODO 化しているが未作成。**「なぜこの3層構造か」を説明する最重要 ADR が欠けている。**
  - 推奨対応：少なくとも「ADR-0001: 設計書3層構造とリポジトリ分離」「ADR-0002: 第1層に FE/BE 横断標準を新設し service-common を廃止」を起票。
- **[Info] プロンプト.md:18 は「ADR 6本」と記すが実体は5本（0001〜0005）。** 数の不一致。記録の正確性のため修正推奨（Info）。

---

## ④ 標準体系の整合性検証（テンプレ↔ガイドライン↔サイト構成 対応表）

### 4.1 成果物・番号・テンプレ・正本の対応

| 成果物 | design_architecture §4 番号 | document_guideline 番号 | siteA 実番号 | テンプレ | 命名（naming） | フォーマット正本 | 状態 |
|---|---|---|---|---|---|---|---|
| キャッチアップ | 01 | 01 | 01 | — | — | 自由記述 | OK |
| 環境構築 | 02 | 02 | 02 | — | — | 自由記述 | OK |
| 開発規約 | 03 | 03 | 03 | — | — | 自由記述 | OK |
| アーキテクチャ（サイト固有） | 04 | 04 | 04 | — | — | §5.1 / diagram_format | OK（be 参照先が空：Critical） |
| UI設計（Figma参照） | 05 | 05 | 05 | — | — | 参照リンク | OK |
| 画面設計書 | 06 | 06 | 06 | screen-list / screen-design | `screen-*` | §5.3 | OK |
| メタデータ定義（サイトA固有） | —（標準外） | —（載せない） | **07** | — | — | — | サイトAのみ・OK |
| API設計書 | **07** | **07** | **08** | api-design | `api-*` / `openapi.yaml`未規定 | §5.2 | **番号段ズレ（High）** |
| データモデル | **08** | **08** | **09** | **無し** | 未規定 | §5.1 | **段ズレ＋テンプレ欠（Medium×2）** |
| 区分値設計 | **09** | **09** | **10** | enum-design | `enum-*` | §5.4 | **番号段ズレ（High）** |
| メッセージ定義 | **10** | **10** | **11** | message-def | `message-def.md`固定 | §5.5 | **番号段ズレ（High）** |

**読み取れる構造的問題：**
- **(a) 番号で参照する限り、サイトAでは API以降が常に+1ズレる。** カタログ・本文が「07_API設計書」と書く一方、サイトA現物の07はメタデータ定義。`naming_convention.md:11` が「番号は意味を持たず並び順だけ」と宣言しているのに、カタログ見出し・各所が番号で成果物を指している（`document_guideline.md:25`, `:64-97`）。**宣言（番号≠意味）と運用（番号で参照）が矛盾。** → 名称参照へ統一すれば一挙に解消。
- **(b) データモデルにテンプレが無い。** 標準の判断基準（共通なら標準化）に照らすと、テーブル定義表は標準化候補。
- **(c) be-architecture が空のため、04アーキテクチャ・07API設計書の「BE方針参照」が空振り。**

### 4.2 規約間のクロス整合

| 項目 | 文書A | 文書B | 一致? |
|---|---|---|---|
| ADR採番桁数 | naming `ADR-{NNN}`（3桁）/design_arch §7（3桁） | fe-architecture `ADR-0001`（4桁）/実体4桁 | **不一致（High）** |
| ADR配置 | design_arch §7「adr/」 | 実体 `FE_architecture/ADR/`（repo外）/adr空 | **不一致（Critical/High）** |
| ADR本数 | プロンプト.md「6本」 | 実体5本（0001-0005） | **不一致（Info）** |
| 図ツール表 | design_arch §5.1 | diagram_format §1 | 内容一致だが重複定義（Low） |
| メッセージレベル | design_arch §5.5「E/W/F等」 | document_guideline「E/W/F」 | 一致（ただし区分値化されず・Medium） |
| FEコード命名 | naming §4「fe-arch §9 へ委譲」 | fe-architecture §13 | 一致（委譲が明確・Good） |

---

## ⑤ 外部ベストプラクティスとの照合（出典URL付き）

### 5.1 ADR（Architecture Decision Record）

- **現状：** 命名規約のみ存在し中身が空。FE ADR は別リポジトリ。標準側 ADR は0本。
- **推奨（Nygard 定番フォーマット）：** ADR は最低 **Title / Status / Context / Decision / Consequences** の5節を持つ。Status は **proposed / accepted / rejected / deprecated / superseded** を使う。決定を覆す時は新 ADR を起票し旧 ADR を `Superseded by` に更新する（既存 FE ADR README はこの運用を正しく踏襲している＝良い）。
  - 取り込むべき点：(1) `design-docs/adr/` に標準テンプレ（5節）を1ファイル置く、(2) 「なぜ3層構造か」を最初の ADR にする、(3) Status の語彙を naming_convention で固定する。
  - 出典：[ADR organization (adr.github.io)](https://adr.github.io/) ／ [Michael Nygard テンプレート (joelparkerhenderson/architecture-decision-record)](https://github.com/joelparkerhenderson/architecture-decision-record)
- **[High→改善] design-docs/adr に標準テンプレ（Nygard 5節）と最初の構造 ADR を追加。**

### 5.2 アーキテクチャ文書の章立て（arc42）

- **現状：** be-architecture が空、サイトの `04_アーキテクチャ` は中身未定。fe-architecture は bulletproof-react ベースで FE 実装方式に特化。
- **推奨（arc42 12 セクション）：** Introduction & Goals / Constraints / Context & Scope / Solution Strategy / Building Block View / Runtime View / Deployment View / **Crosscutting Concepts** / **Architecture Decisions** / Quality Requirements / Risks & Technical Debt / **Glossary**。
  - 取り込むべき点：(1) be-architecture と各サイト `04_アーキテクチャ` の章立てに arc42 の「Context & Scope（システム境界・外部I/F）」「Deployment View」「Risks & Technical Debt」を採用すると、現状サイト固有として挙げている「システム構成図・認証・外部連携」（`document_guideline.md:52`）を体系的に網羅できる。(2) 「Glossary（用語集）」は arc42 §12 に対応し、現状 `01_キャッチアップ` の用語集と接続する。(3) ADR は arc42 §9 に正式に位置づけられており、ADR 不在の現状は arc42 観点でも弱点。
  - 出典：[arc42 Template Overview](https://arc42.org/overview) ／ [arc42 Documentation](https://docs.arc42.org/home/)

### 5.3 構成図の記法（C4モデル）

- **現状：** 図ツールは PlantUML/Mermaid/draw.io を規定（記法＝how）。だが「どの抽象度の図を描くか（what）」の指針が無い。`04_アーキテクチャ` は「システム構成図」とのみ。
- **推奨（C4）：** **Context → Container → Component → Code** の4階層で抽象度を分けて描く。notation/tooling 非依存なので PlantUML（C4-PlantUML）や Mermaid（C4 図対応）でそのまま実装でき、現行の図ツール規約と両立する。
  - 取り込むべき点：`diagram_format.md` か `04_アーキテクチャ` のガイドに「システム構成図は C4 の Context / Container レベルを基本とする」と一言加えると、サイトごとに粒度がバラつくのを防げる（＝標準の判断基準「2人が別の図を描く」を満たす）。
  - 出典：[The C4 model (c4model.com)](https://c4model.com/)

### 5.4 ドキュメント分類（Diátaxis）

- **現状：** 01キャッチアップ（説明）・02環境構築（手順）・各設計書（リファレンス）が混在するが、種別の意識は無い。
- **推奨（Diátaxis）：** ドキュメントを **Tutorials / How-to Guides / Reference / Explanation** の4種に分け、混ぜない。本リポジトリに当てると：01キャッチアップ＝Explanation、02環境構築＝How-to/Tutorial、設計書群＝Reference。
  - 取り込むべき点：必須ではないが、「設計書（Reference）に手順や背景説明を混ぜない」という Diátaxis の規律は、本標準の「見た目は書かない／正本は1つ」の思想と整合し、各成果物の純度を保つ補強になる。
  - 出典：[Diátaxis framework (diataxis.fr)](https://diataxis.fr/)

### 5.5 API 設計（OpenAPI）

- **現状：** API は `openapi.yaml` を正本とし重複省略・由来表を規定（`design_architecture.md:171-178`）＝方向性は正しい。
- **推奨（OpenAPI）：** OpenAPI 仕様を正本に据えるのはベストプラクティスに合致。改善余地は、(1) **OpenAPI のバージョン（3.0/3.1）を標準で固定**していない、(2) `openapi.yaml` のファイル名・分割（tags 単位）・lint（Spectral 等）の規約が無い点。FE 側は orval（`fe-architecture.md:120`）で生成、BE は Spring Boot から提供（FE ADR README）なので、**契約の単一正本が design-docs の openapi.yaml なのか BE 生成物なのかが未確定**（drift リスク）。
  - 取り込むべき点：「OpenAPI 3.x のどれを使うか」「openapi.yaml の正本所在（design-docs か BE 生成か）」「lint ツール」を naming/document_guideline に1行ずつ追加。
  - 出典：[OpenAPI Specification (spec.openapis.org)](https://spec.openapis.org/oas/latest.html)

---

## ⑥ 総評と次アクション

**総評：** 設計思想・文章品質・トレーサビリティは極めて高水準で、3層構造のコンセプト自体は破綻していない。問題は **コンセプトと「現物・他文書の数値/配置」の同期ズレ** に集中している。とくに「番号で成果物を参照しているのに番号は意味を持たないと宣言している」矛盾と、「専用リポジトリ原則を掲げつつ ADR が repo 外」という2点は、放置すると新規参画者・AI が確実に取り違える。be-architecture の空白は PoC 範囲として理解できるが、参照網が空振りする影響は明記すべき。

**次アクション（優先順）：**

1. **[Critical]** ADR を `design-docs/adr/` に取り込む（または依存関係を明文化）。`fe-architecture.md:4` の repo 外相対リンクを安定参照へ。→ §3 design_arch、adr/README、fe-architecture を整合。
2. **[Critical]** be-architecture に最小章立てスケルトン＋`〔未記述〕`タグを置き、参照元（document_guideline・api-design テンプレ）に「現状空」を注記。
3. **[High]** **成果物は番号でなく名称で参照する**運用に統一（document_guideline 見出し「01〜10」と本文の番号参照を名称参照へ）。これで siteA の段ズレ事故が一掃される。
4. **[High]** ADR 採番を4桁（`ADR-NNNN`）に統一（naming §2・design_arch §7 を実体に合わせる）。Status 語彙（accepted/superseded 等）を Nygard 準拠で固定。
5. **[High]** 標準側 ADR を最低2本起票：「3層構造とリポジトリ分離」「第1層に FE/BE 横断標準を新設し service-common 廃止」（design_arch §7・fe-architecture §15 の TODO を解消）。
6. **[Medium]** データモデルに `table-def.md` テンプレ追加を検討。OpenAPI のバージョン・正本所在・lint を1行ずつ規定。メッセージレベルを区分値として正式化。
7. **[Low/Info]** §5.1 と diagram_format の図表重複を解消（方針は §5.1、表は diagram_format に一本化）。PlantUML `toy` の出典明記。プロンプト.md「ADR 6本」→5本に修正。C4・arc42・Diátaxis の観点を `04_アーキテクチャ`／`diagram_format` ガイドに軽く反映。

**出典一覧：**
- [ADR organization (adr.github.io)](https://adr.github.io/)
- [Architecture Decision Records / Nygard template (GitHub: joelparkerhenderson)](https://github.com/joelparkerhenderson/architecture-decision-record)
- [arc42 Template Overview](https://arc42.org/overview) ／ [arc42 Documentation](https://docs.arc42.org/home/)
- [The C4 model for visualising software architecture](https://c4model.com/)
- [Diátaxis documentation framework](https://diataxis.fr/)
- [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
- 手本（本リポジトリが採用）：[フューチャー「Markdown設計ドキュメント規約」](https://future-architect.github.io/arch-guidelines/documents/forMarkdown/markdown_design_document.html)
