# リポジトリ レビュー総括（アプリ単位）

- 実施日: 2026-06-22
- 対象: `sdd` リポジトリ全体（node_modules / dist 等のビルド生成物を除く）
- 方法: アプリ単位に4分割し、各担当が公式ドキュメント・GitHub公式リポジトリ等の**権威ある情報源で技術的主張を検証**したうえでレビュー。
- 注記: ソース・設計書は一切変更していません。git commit もしていません（指示どおり）。

## レビュー単位（アプリ）と結果ファイル

| # | アプリ / レビュー単位 | 概要 | 結果ファイル |
|---|---|---|---|
| 01 | **doc-kit-poc** | React 19 / Vite 6 / Storybook 10 / Tailwind 4 の資料作成キット（実コード） | [01_doc-kit-poc.md](01_doc-kit-poc.md) |
| 02 | **FE_architecture** | FE横断アーキ設計書＋ADR（TanStack Query / Jotai / RHF / OpenAPI codegen） | [02_FE_architecture.md](02_FE_architecture.md) |
| 03 | **design-docs / 00_standards** | 設計標準・テンプレート・サイト骨組み（3層構造） | [03_design-docs-standards.md](03_design-docs-standards.md) |
| 04 | **DOC_architecture & SDDプロセス** | 設計書管理アーキ＋AI活用プロンプト群（Spec-Driven Development） | [04_DOC_architecture-and-SDD-process.md](04_DOC_architecture-and-SDD-process.md) |

## 重大度別 件数サマリ

| アプリ | Critical | High | Medium | Low | Info | 計 |
|---|---:|---:|---:|---:|---:|---:|
| 01 doc-kit-poc | 0 | 3 | 5 | 5 | 5 | 18 |
| 02 FE_architecture | 0 | 6 | 9 | 7 | 4 | 26 |
| 03 design-docs/standards | 2 | 6 | 7 | 4 | 3 | 22 |
| 04 DOC_architecture/SDD | 2 | 3 | 3 | 2 | 1 | 11 |
| **合計** | **4** | **18** | **24** | **18** | **13** | **77** |

## 最優先で対処すべき横断テーマ（TOP 5）

これらは複数アプリにまたがる、または Critical の根本原因です。

### 1.【Critical】設計の「正本（SSOT）」が確立していない
- **be-architecture.md が実質空（5行）** なのに、ガイドライン/テンプレートが多数参照 → 参照網が空振り（#03）。
- **FE設計が3系統併存して相互矛盾**: ADR+現行doc（Next.js+TanStack Query）／spa_architecture（Vite SPA+Jotai、TanStack未採用）／Archive（契約駆動Next.js）。フレームワーク・サーバ状態の扱い・ADR番号空間まで衝突し、AI実装時に系統が混ざる（#02）。
- **「プロンプト.md」がルートと design-docs に同名・別物で併存**し、ルート版は既に否定済みの旧方式。どれが現役か判断不能（#04）。
- → **対応**: 各レイヤで「正本1つ」を宣言し、旧版は `Archive/` 隔離＋ `DEPRECATED` 明示。be-architecture を最低限埋める。

### 2.【Critical】ADR が設計リポジトリの外にあり参照リンクが壊れる
- 「設計書専用リポジトリ」原則を掲げながら、ADR は `FE_architecture/ADR/` にあり `design-docs/adr/` は空。`fe-architecture.md` の相対リンク `../../FE_architecture/ADR/` は design-docs 単独 clone で破断（#03）。
- ADR採番も文書間で3桁/4桁が混在、本数も「6本」記載に対し実体5本（#02, #03）。
- → **対応**: ADR を `design-docs/adr/` に集約し採番規約（4桁）を統一。

### 3.【Critical】トレーサビリティの欠如（SDDの肝）
- OpenAPI契約のコード生成トレースは強いが、**画面仕様・業務ルール・区分値・メッセージなど「OpenAPIに乗らない仕様」**が、どの生成コード/テストに対応するか追えない（#04）。
- 成果物を**番号で参照しているのに「番号は意味を持たない」と宣言**する矛盾。サイトA現物では 07=メタデータ、08=API だが本文は「07_API設計書」と記述 → 番号参照すると必ず取り違える（#03）。
- → **対応**: 仕様にID体系を採番しコード/テストへ参照を残す。成果物参照は番号でなく名称へ統一。CIで未被覆IDを警告。

### 4.【High】OpenAPI コード生成ツールの方針不一致
- 系統間で **openapi-typescript+openapi-fetch+openapi-zod-client（保守停滞、最新リリース約1年前）** と **orval（活発に保守、Zod+TanStackフック生成）** が矛盾。実行時Zod検証の有無も未整理（#02）。
- → **対応**: 1ツールへ一本化（orval が有力候補）。決定を ADR 化。

### 5.【High】doc-kit-poc の実装とドキュメントの乖離・未使用依存
- README/設計mdは「YAML frontmatter + Zod 検証 + parts/NN-slug」を説明するが、実装は単一 `doc.tsx` + `defineWork()` のインラインTS。**zod / js-yaml は import ゼロ**（旧アーキの名残）。新規参画者が README どおりで動かない（#01）。
- `eslint-plugin-react-hooks` 未導入でフック依存ミスを機械検出できない（#01）。
- → **対応**: README を現実装に合わせて更新、未使用依存を削除、react-hooks ルール追加。

## 良い点（共通所見）
- **思想は現行のベストプラクティスと高水準で一致**: SSOT・契約駆動生成・機械ゲート・「人間=仕様／AI=実装」のレビュー境界を図で明示する設計思想は、GitHub Spec Kit / Kiro 等の SDD と整合（#04）。
- **個別の技術的主張は概ね正確**: QueryClient の server毎リクエスト/browser singleton、RHF の zod resolver、Next.js CVE-2025-29927 の修正版指定、MSW v2 + Storybook Portable Stories など、公式と一致（#02）。
- **doc-kit-poc に致命的脆弱性なし**: react-markdown は既定で href サニタイズ、`dangerouslySetInnerHTML`/`rehype-raw` 不使用、採用バージョンは全て現行安定（#01）。

## 全体所見
減点の中心は「**思想は良いが、それを運用に固定する仕組み（正本の一意化・トレーサビリティ・版管理・参照整合・ガバナンス）が未整備**」という一点に集約されます。Critical 4件はいずれも「正本不在／参照破断／トレース欠如」という同根の問題で、まず TOP1〜3 を片付けると残りの High の多くが連鎖的に解消します。

詳細・根拠（ファイル:行）・出典URLは各アプリの個別レビューファイルを参照してください。
