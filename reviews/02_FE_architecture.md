# FE_architecture レビュー

- レビュー対象: `c:\Users\yunag\git\sdd\FE_architecture` 配下の全 md / drawio
- レビュー実施日: 2026-06-22
- レビュー者観点: シニアフロントエンドアーキテクト
- 検証方針: 技術的主張は公式ドキュメント / 公式リポジトリで裏取りし、「検証できた事実」と「レビュー者の推測・意見」を区別する。

---

## ① 概要

このディレクトリには、**互いに前提が異なる3系統のアーキテクチャ設計**が混在している。これが最大の構造問題である。

| 系統 | 主なファイル | 想定スタック | サーバー状態 | ルーティング |
|---|---|---|---|---|
| (A) ADR + 現行 doc | `ADR/0001〜0005`, `doc/アーキテクチャ設計.md`, `doc/共通コンポーネント.md` | **Next.js App Router**（FE+BFF 同居・クライアントファースト） | **TanStack Query** | ファイルベース（`app/`） |
| (B) spa_architecture | `doc/spa_architecture/*.md`（7本） | **Vite + React SPA**（react-router v7・モノレポ+git submodule） | **なし**（Jotai atom に直接格納） | コード定義（`createBrowserRouter`） |
| (C) Archive | `doc/Archive/設計.md`, `設計判断.md`, `設計最新.md` | 旧: React 19 単体 SPA → 新: Next.js+TanStack（契約駆動・サービス分割モノレポ） | TanStack Query（設計最新） | ファイルベース（ADR-0013 で改訂） |

タスク説明に挙がっていた技術スタック（SPA / React / TanStack Query / Jotai / RHF / OpenAPI 駆動 / Storybook+MSW / Vitest / AI 支援開発規約）は、**いずれか1系統だけでは充足されない**。例えば「Jotai」と「state_boundaries.md」は (B) にしか登場せず、(B) は TanStack Query を採用していない。「TanStack Query / OpenAPI 駆動 / AI 規約」は (A)(C) のもの。つまり**タスクが想定するスタックは3系統の寄せ集めであり、設計書としてはまだ統合されていない**。

各系統は個々には質が高い。特に (A) の ADR 群は「コンテキスト→決定→トレードオフ」が一貫しており、(B) は実コードベースの観察記録として非常に密度が高い。問題は**どれが正で、どれが参考・旧版なのかが読者（および AI エージェント）に判別できない**点に集約される。

検証の結果、個別の技術的主張（QueryClient の server/browser ファクトリ、RHF の input/output 型分離、Next.js の CVE 対応版など）は**おおむね公式推奨と一致しており正確**だった。一方で**ツールチェーン選定（OpenAPI→Zod 生成ツール）には系統間の矛盾と、保守が止まったツールへの言及**がある。

---

## ② 良い点

1. **ADR 群（A）の論理が一貫している。** 「フロント1名 + AI 開発」という2制約から全 ADR を導出する構成（`ADR/README.md:17-22`）は明快で、各 ADR の「却下した代替案」セクションが意思決定の追跡可能性を担保している。

2. **TanStack Query / Jotai のサーバー状態 vs クライアント状態の境界定義が正しい。** 「サーバー状態はキャッシュであり、クライアント状態管理ライブラリで持つのはアンチパターン」（`ADR/0002.md:70`）は公式の立場と一致。`設計最新.md` の「『状態は全部 Jotai』は明確に縮小する」（§2-3）も正しい方向。

3. **QueryClient の server=毎リクエスト新規 / browser=singleton の指摘が正確。**（`doc/アーキテクチャ設計.md:176-187`、`設計最新.md` §6）。これは公式が明示する重大バグ回避パターンであり、検証で裏取りできた（④-1）。

4. **OpenAPI を SSOT とした「手書き型禁止 + drift 検出」の発想が AI 開発と整合的。**（`ADR/0003.md`）。「AI が手書きする型は嘘をつくが、スキーマ生成型は嘘をつかない」（`ADR/0003.md:13`）は spec-driven の核心を突いている。

5. **「規約は文章だけでは守られない、lint/型/CI と二重化する」という強制思想。**（`ADR/0004.md:71`、`doc/アーキテクチャ設計.md` §10、`設計最新.md` §6・§8）。AI 規約の実効性を機械ゲートに寄せる方針は妥当。

6. **RHF の input/output 型分離パターンが現行ベストプラクティスと一致。**（`rhf_patterns.md:13-25`）。`useForm<z.input, unknown, z.output>` は Zod v4 時代の型推論問題に対する公式推奨の回避策でもある（④-4で裏取り）。

7. **共通コンポーネントの3層（Tokens/Components/Patterns）+ 役割分類の提案が地に足がついている。**（`doc/共通コンポーネント.md`）。Atomic Design の粒度論争を避け、M3 の役割カテゴリに寄せる判断と「数値の再発明を Tokens で止める」着眼は AI 開発の実課題に即している。

8. **MSW を「テスト / Storybook / ローカル開発」の3面で共有する設計。**（`storybook_msw.md`）。現行の MSW v2 + msw-storybook-addon の API（`http`/`HttpResponse`、`setupServer`/`setupWorker`）を正しく使っている。

---

## ③ ドキュメント別の指摘

### ADR/README.md・ADR 全般

- **[High] ADR と spa_architecture が真っ向から矛盾しているのに相互参照がない。** `ADR/README.md` は「Next.js / BFF」を対象と宣言（`ADR/README.md:3,11`）するが、`spa_architecture/architecture.md` は「Vite SPA・react-router・Next.js Server Component 未採用」（`architecture.md:8,27`、`state_boundaries.md:19`）。どちらも "現行" に見える。**推奨**: README に「spa_architecture/ は別プロジェクト（既存実装）の調査記録であり本 ADR の対象外」等の位置づけを明記するか、`doc/Archive/` 同様にアーカイブ扱いへ移す。根拠なく併存すると AI が両方を "正" として混ぜたコードを生成する。

- **[Medium] ADR の連番に欠番・体系の二重化がある。** `ADR/` 配下は 0001〜0005。一方 `Archive/設計最新.md` は ADR-0001〜0017 を別体系で引用（`設計最新.md` §10、例: ADR-0013/0015/0017）。同じ「ADR-0002」が、`ADR/0002`＝TanStack Query、`設計最新.md` の ADR-0002＝「契約は design-first」と**番号衝突**している。**推奨**: ADR 番号空間を1つに統一し、Archive 側の ADR 参照は明示的に旧体系と注記する。

### ADR-0001（フレームワーク選定）

- **[Info/妥当]** 「BE が別系のため RSC の旨味が薄い→クライアントファースト」という論理（`0001.md:18-19`）は内部ツール/管理画面の文脈では妥当。Next.js を採用しつつ RSC をほぼ使わない選択への自己批判（`0001.md:43`）も誠実。

- **[Low] 「Next.js 公式が AGENTS.md を create-next-app で自動生成」という主張（`0001.md:21`、`0004.md:11`）の確度は要確認。** レビュー者が確認した範囲では、AGENTS.md は業界横断のオープン規約であり、create-next-app の AGENTS.md 自動生成は新しめの機能で、バージョン依存の可能性がある。**推奨**: 採用する Next.js バージョンで実際に生成されるか実機確認し、ADR にバージョンを併記。（※レビュー者は本項を一次ソースで確証できていない＝推測）

### ADR-0002（TanStack Query）

- **[妥当]** queryKey 規約（`0002.md:29-36`）と invalidate のマスタ単位粗粒度は CRUD 4〜5画面には適正。`enabled: !!masterType` の早撃ち防止（`doc/アーキテクチャ設計.md:141`）も正しい。
- **[Low] クライアント状態の手段に「必要なら Zustand」（`0002.md:70`）と書いてあるが、タスク前提と現行 doc では Jotai。** これは (A)(B) 不統一の一例。**推奨**: クライアント状態ライブラリを1つに決め（Jotai か Zustand）、ADR 化する。残論点表（`doc/アーキテクチャ設計.md:300`）でも未決のままなので、AI が都度発明するリスク。

### ADR-0003（OpenAPI 駆動）

- **[High] 推奨ツールが系統間で矛盾し、かつ片方は保守が停滞している。** ADR-0003 と `doc/アーキテクチャ設計.md` §5 は **openapi-typescript + openapi-fetch + openapi-zod-client** を挙げる（`0003.md:21-25`、`アーキテクチャ設計.md:199-204`）。一方 `Archive/設計最新.md` は **orval**（`useQuery`/`useMutation` まで生成）を「採用実績あり」とする（§4.3・§10 末尾）。両者は生成物の形（薄い fetch ラッパ vs hooks まで生成）が根本的に異なり、ディレクトリ規約・lint 規約に波及する。さらに **openapi-zod-client は最新リリースが約1年前で保守停滞**（④-3）。**推奨**: orval（Zod 生成 + TanStack hooks 生成に対応・活発に保守）への一本化を第一候補として再評価。少なくとも「openapi-fetch は実行時 Zod 検証を生成しない」点（④-3）を明記し、Zod 生成の担い手を確定させる。ADR-0003 の「縮退運用（Zod 手書き）」（`0003.md:55`）は妥当な保険。

- **[Medium] ケース変換（snake_case⇔camelCase）が全系統で未決のまま放置。**（`0003.md`補足なし、`アーキテクチャ設計.md:207`「実装着手時に確定」、`設計最新.md` §4.2「残論点」）。これは生成ツール選定と密結合（orval なら生成時変換、openapi-fetch なら境界で `camelcase-keys`）。**推奨**: ツール確定とセットで早期に決める。AI に毎回判断させてはいけない典型。

### ADR-0004（AI 規約）

- **[妥当]** ESLint による fetch 直書き禁止 / `'use server'` 禁止 / generated import 固定（`0004.md:53`）は機械強制として現実的。
- **[Medium] 機械ゲートの大半が「可能な範囲で」「レビューで」に留まり、具体ルール名が曖昧。**（`0004.md:53` の `no-restricted-syntax` で Server Actions を落とす方法など）。`'use server'` を `no-restricted-syntax` で確実に検出できるかは AST 形によって難しい場合がある。**推奨**: 主要禁止項目について、実際に効く lint ルール（プラグイン名・対象パターン）を PoC で確定し conventions に転記する。「努力目標」と「機械が落とす」を明確に分離（`設計最新.md` §2-8 の思想に倣う）。

### ADR-0005（テスト戦略）

- **[妥当]** Vitest+RTL / Playwright の二層、E2E は本番ビルドに対して実行・意味ベースロケータ（`0005.md:26-28`）はいずれも現行定石。
- **[Medium] spa_architecture のテスト戦略（VRT / Portable Stories / Jotai 専用マッチャー）と二層構成が断絶している。** `testing_output.md` は reg-suit による VRT・`@storybook/addon-vitest` の Portable Stories・`useJotaiTestWrapper` を中核に据える。一方 ADR-0005 は「VRT は当面追わない」（`0005.md:34`）。**推奨**: (A) を正とするなら spa_architecture のテスト記述は「別実装の参考」と明示。両立させるなら ADR-0005 に VRT の採否判断を追記。
- **[Low] 「Jest は Vitest に移行済み・新規非推奨」（`0005.md:13`）は言い過ぎ。** Jest は現役で保守されており「2026 時点の Next.js コミュニティの定石が Vitest 寄り」という表現に留めるのが正確。（レビュー者の意見）

### doc/アーキテクチャ設計.md（系統 A の中核・最も完成度が高い）

- **[妥当・良]** §4.5 QueryClient ファクトリ、§6 Server/Client 境界、§9 エラーハンドリング、§10 機械ゲート表は実装に落とせる粒度。
- **[Medium] §9 i18n が「多言語は基本不要」（`アーキテクチャ設計.md:266`）だが、spa_architecture では i18next + react-i18next を本採用（`architecture.md:15`）。** タスク観点の i18n をどう扱うかが系統で割れる。**推奨**: 対象が内部管理画面なら「文言外出し（カタログ）はするが多言語化はしない」を確定文として残す（現行 doc の方向で良い）。ただし将来 @app-ext 等で多言語が要るなら設計が変わる点を残論点に明記。
- **[Low] §2 のディレクトリ規約（`features/master/` 単一セットでマスタを捌く）と、Archive のメタ定義駆動 UI（ADR-0003: マスタ別フォルダ禁止）の関係が未整理。** §7 発展的アプローチで「定義駆動 UI は不採用」（`アーキテクチャ設計.md:238`）としているのは一貫だが、Archive 側は ui-engine で実証済み（`設計最新.md` V-5）。系統間で結論が逆。**推奨**: 現行は「不採用」で確定として明記。

### doc/共通コンポーネント.md

- **[Low] 冒頭で参照する `../FE知見共有会.md` が存在しない（リンク切れ）。**（`共通コンポーネント.md:3`）。`Archive/設計最新.md` も同ファイルを一次ソースとして多数参照するが実体なし。**推奨**: 参照を Archive へ退避するか、該当ファイルを復元。
- **[Info]** 「※こっから妄想」「たぶんそううまくいかない」（`共通コンポーネント.md:26,61`）等のメモ書きが残る。正式設計書に昇格させるなら確度のラベリングを整える。良い意味で確度を区別している点は評価。

### doc/spa_architecture/*（系統 B・既存実装の観察記録として優秀）

- **[High] サーバー状態を Jotai atom に直接格納する設計（`state_boundaries.md:13,27-35`、`jotai_patterns.md`）は、(A) の TanStack Query 方針と正面衝突。** `state_boundaries.md` 自身が「キャッシュ戦略がなく重複フェッチが起きうる」「リフェッチ管理が各フックに分散」「楽観的更新が複雑化」とトレードオフを自己申告している（`state_boundaries.md:231-235`）。これは公式・コミュニティが TanStack Query 系で解く問題そのもの。**推奨**: この文書を「移行元（as-is）」と明確にラベルし、移行先（to-be＝TanStack Query）への対応表を1枚作る。`jotai-tanstack-query`（atomWithQuery / atomWithMutation）という公式統合の選択肢も検討余地として記載（④-2）。
- **[Medium] `architecture.md` の技術スタック表はバージョン固定の "現状スナップショット" であり、設計（to-be）ではない。** Storybook ^10.2.8 / Vitest ^4 / Vite ^7 / React 19 / Zod ^3.22 など具体版が並ぶ（`architecture.md:5-40`）。これは調査資料としては価値が高いが、新規構築の設計書として読むと「Zod 3 前提」等が古びる。**推奨**: 「観察された既存構成」と見出しで明示。
- **[妥当]** `jotai_patterns.md` の atom 種別使い分け・命名・atomWithReset クリーンアップ・atomFamily の等価関数注意（`jotai_patterns.md:139-141`）は Jotai 公式の作法に沿っており、Jotai を使う限りにおいて良質。
- **[妥当]** `rhf_patterns.md` は input/output 型分離・superRefine 重複チェック・FormProvider 分割・二重送信防止など、RHF の実戦パターンを正確に記述（④-4で裏取り）。
- **[Low] `testing_output.md:137` に `toBeInThapument()` というタイポ（`toBeInTheDocument` の誤記）。** 軽微だが AI がコピーすると壊れる。
- **[Medium] `api_client_migration.md` は新方式でも `RequestBody = Record<string, any>` を採用（`api_client_migration.md:144,171`）。** 「any からの脱却」を謳いつつ any が残る。OpenAPI 生成型を使う (A) の方針とは別物（手書きクライアントの移行記録）。**推奨**: この文書は (A) の「生成クライアント」とは無関係である旨を明記。系統 A に取り込むなら不要。

### doc/Archive/*（旧版・系統 C）

- **[妥当（アーカイブ運用として正しい）]** Archive 配下である点は明示されており、運用としては正しい。ただし内容の確度差が大きい。
- **[High] `設計最新.md` が参照する文書群が軒並み存在しない。** 10-FE.md / 20-BE.md / 30-BFF.md / nextアーキテクチャ検討.md / FE知見共有会.md / UI開発の考え方.md / FE配信_認証.md / `.claude/steering/*` など（`設計最新.md` 冒頭・各§出典）。Archive として読む分には許容だが、`設計最新.md` は内容的に最も新しく（Next.js+TanStack+契約駆動+認証境界まで網羅）、**実は現行 doc/アーキテクチャ設計.md より射程が広い**。**推奨**: 認証境界（cookie→Redis→Bearer、`設計最新.md` §5.2）・エラー6コード統一（§5.3）・契約駆動 codegen（§4）など、現行 doc に欠けている良質な決定を (A) へ昇格させることを検討。Archive に死蔵するのは惜しい。
- **[Medium] `設計判断.md` は「RSC + TanStack Query のハイブリッド」を結論とする（`設計判断.md:17`）が、ADR-0001/0002 は「RSC を主役にしない・クライアント取得が基本」へ方針転換済み。** 旧結論が Archive に残るのは正しいが、両者が逆向きである点に注意（RSC で initialData 供給するか否か）。現行は「モード B（HydrationBoundary）は要件化した画面のみ」（`アーキテクチャ設計.md:172`）で、設計判断.md の「初回は RSC で initialData」より TanStack 寄り。整合済みと見てよいが、用語として `initialData` バケツリレーを否定（`アーキテクチャ設計.md:174`）した点は設計判断.md と相違。

### drawio（概要把握のみ）

- **[Info]** `ai-human-review-boundary.drawio`（人間/AI/自動チェックの役割分担）と `ai-utilization-from-design-docs.drawio`（設計書 SSOT 起点の AI 活用）はいずれも XML として妥当で、ADR-0004 の AI 規約・機械ゲート思想と整合する図。内容は系統 A/C の方針と一致しており矛盾は見られない。

---

## ④ 横断的な整合性 / 最新性の検証結果（出典 URL 付き）

### ④-1. QueryClient の server=毎リクエスト / browser=singleton（検証: 正しい ✅）

`doc/アーキテクチャ設計.md:176-187` と `設計最新.md` §6 の主張は公式の SSR ガイドと一致。公式は「サーバーではリクエストごとに新しい QueryClient を、ブラウザでは singleton を作る」「ブラウザ側で `useState` 初期化を使う際は suspense 境界に注意」「prefetch しても `staleTime: 0` 既定だとマウント直後に再フェッチして二重リクエストになるため staleTime を上げる」と明記。設計書はこの3点をすべて押さえている。
- 出典: https://tanstack.com/query/v5/docs/framework/react/guides/ssr
- 出典: https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr

### ④-2. Jotai と TanStack Query の併用（検証: 設計の方向は妥当・公式統合あり ✅）

「サーバー状態=TanStack Query / クライアント状態=Jotai」（設計最新.md §7）は妥当な分担。なお両者を密に統合したい場合は公式拡張 `jotai-tanstack-query`（`atomWithQuery` / `atomWithMutation`）が存在する。逆に spa_architecture の「サーバー状態も Jotai atom に手動格納」は、公式 Jotai ドキュメントも Query 連携を別途案内しているとおり、キャッシュ/再検証を自前実装する負担を伴う（`state_boundaries.md` 自身が認めるトレードオフと一致）。
- 出典: https://jotai.org/docs/extensions/query
- 出典: https://github.com/jotaijs/jotai-tanstack-query

### ④-3. OpenAPI→型/クライアント/Zod 生成ツール（検証: 矛盾あり・1ツール保守停滞 ⚠️）

- `openapi-typescript` + `openapi-fetch` は**コンパイル時の型安全のみで実行時 Zod 検証は生成しない**。実行時検証には別途 Zod 等が必要、というのが現行の共通理解。→ ADR-0003 が Zod を別ツールで補う構成にしているのは正しいが、その別ツール選定が問題。
- `openapi-zod-client`（ADR-0003 / アーキテクチャ設計.md §5 の例）は **最新リリースが約1年前で保守が停滞**。生成物も zodios 前提で重め。
- `orval` は **Zod スキーマ生成 + TanStack Query hooks 生成の両方に対応し活発に保守**。`Archive/設計最新.md` が orval を採るのはこの点で現行ベストプラクティスに近い。
- レビュー結論（推奨）: orval への一本化を第一候補として再評価。少なくとも系統間でツールを統一し、openapi-zod-client への依存は避ける。
- 出典: https://orval.dev/docs/guides/zod/
- 出典: https://www.npmjs.com/package/openapi-zod-client （最終公開時期）
- 出典: https://github.com/astahmer/openapi-zod-client

### ④-4. React Hook Form + Zod resolver の型パターン（検証: 正しい・現行推奨 ✅）

`rhf_patterns.md:13-25` の `useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>`（transform 使用時に入力型/出力型を分離）は、公式リポジトリ/コミュニティが Zod v4 の型推論問題に対しても推奨する現行パターン。`@hookform/resolvers` の `zodResolver`、フィールド直下インライン表示、`superRefine` での相関/重複バリデーションも現行作法。
- 出典: https://github.com/react-hook-form/resolvers
- 出典: https://react-hook-form.com/docs/useform
- 出典: https://github.com/orgs/react-hook-form/discussions/13205

### ④-5. MSW + Storybook + Vitest（検証: API は現行・バージョンは一部要追従 ⚠️）

`storybook_msw.md` / `testing_output.md` の MSW v2 系 API（`http`/`HttpResponse`、`setupServer`/`setupWorker`、`msw-storybook-addon` の `initialize`/`mswLoader`、`onUnhandledRequest`）は現行の正しい使い方。Portable Stories（`setProjectAnnotations` + `@storybook/addon-vitest`）も現行 Storybook の推奨テスト統合。バージョン（Storybook ^10 / Vitest ^4）は spa_architecture のスナップショットであり、ADR-0005 側（系統 A）には具体版の記載がないので、採用版を ADR/conventions に固定すべき。
- 出典: https://mswjs.io/docs/integrations/browser
- 出典: https://tanstack.com/query/v5/docs/community-resources （周辺エコシステム）

### ④-6. Next.js のバージョン下限（検証: 正しい ✅）

`Archive/設計最新.md` の「CVE-2025-29927 回避で最低 15.2.3」（§9）は正確。当該 CVE（middleware 認可バイパス、CVSS 9.1）の 15.x 系修正版は **15.2.3**。Server Actions を使わず BFF Route Handler に寄せる方針（ADR-0001/0006相当）は、middleware に認可を依存させない点でこの種のリスク低減にも整合的。なお現行 doc/アーキテクチャ設計.md（系統 A）には Next.js バージョン下限の記載がないため追記が望ましい。
- 出典: https://github.com/advisories/GHSA-f82v-jwr5-mffw
- 出典: https://nvd.nist.gov/vuln/detail/CVE-2025-29927

### ④-7. 抜け漏れの横断チェック

| 関心事 | 系統A(現行) | 系統C(Archive) | 評価 |
|---|---|---|---|
| 認証/認可 | §9で「FE は認可を書かない」程度（`アーキテクチャ設計.md:264`） | §5.2 で cookie→Redis→Bearer の境界まで詳述 | **A は薄い。C の認証境界設計を A に取り込むべき [High]** |
| エラーハンドリング | §9・`lib/error`+`onError` | §5.3 で 6コード統一・相関ID透過 | A は方針のみ。具体化は C が上 |
| i18n | 「多言語不要」 | 同左（@app-ext 将来要確認） | 系統間で一致。妥当 |
| パフォーマンス | モードB（HydrationBoundary）任意 | 同左+キャッシュ三層は残論点 | 妥当（過剰最適化を避ける姿勢は良い） |
| 401/403 UI 挙動 | 残論点（`アーキテクチャ設計.md:297`） | 残論点（§5.3） | **両系統で未決のまま。早期確定推奨 [Medium]** |
| 監視 | RUM（`アーキテクチャ設計.md:267`） | Datadog RUM 具体（§7） | 妥当 |

---

## ⑤ 総評と次アクション

### 総評

個々の設計判断とパターン記述の品質は高く、検証した技術的主張（QueryClient ファクトリ、RHF 型分離、Next.js CVE 対応版、MSW/Storybook の API）は**公式推奨とほぼ一致**している。AI 開発を機械ゲートで縛る思想も一貫しており、方向性は信頼できる。

最大の弱点は**設計の "正本" が一意に定まっていない**こと。ADR(A) / spa_architecture(B) / Archive(C) の3系統が、サーバー状態の扱い（TanStack Query vs Jotai 直格納）・フレームワーク（Next.js vs Vite SPA）・ツールチェーン（openapi-typescript系 vs orval）・ADR 番号空間まで矛盾したまま併存している。この状態で AI に実装させると、3系統を混ぜた一貫性のないコードが生まれるリスクが高い。これは AI 規約（ADR-0004）が最も避けたかった「判断の分岐」そのものである。

### 次アクション（優先度順）

1. **[最優先] 正本の宣言。** 「系統 A（ADR + doc/アーキテクチャ設計.md）が唯一の to-be 設計」と README で宣言し、(B) spa_architecture を「既存別実装の as-is 調査記録（参考）」、(C) Archive を「旧版」と各ディレクトリ冒頭に1行で明記する。AI 向けには AGENTS.md/CLAUDE.md に「spa_architecture と Archive を設計の根拠にしない」と書く。

2. **[High] Archive(C) の良質な決定を A へ昇格。** 特に (a) 認証境界（cookie→Redis→Bearer・BFF Token Handler）、(b) エラー6コード統一+相関ID、(c) 契約駆動 codegen + drift 検出の具体は、現行 doc に欠けている。`設計最新.md` から A へ移植する。

3. **[High] ツールチェーンの確定。** OpenAPI→型/client/Zod 生成を orval 第一候補で再評価し1つに決める。openapi-zod-client（保守停滞）への言及を除く。ケース変換方針もこれとセットで確定（残論点から外す）。

4. **[Medium] ADR 番号空間の一本化。** 既存 0001〜0005 と Archive の 0001〜0017 を統合採番し直し、番号衝突を解消。

5. **[Medium] クライアント状態ライブラリの確定。** Jotai か Zustand のどちらか（タスク前提とアーキテクチャ設計.md の整合上 Jotai が有力）を ADR 化し、必要なら `jotai-tanstack-query` 併用方針も記す。

6. **[Medium] 残論点の期限付き解消。** 401/403 UI 挙動・staleTime/gcTime 具体値・Next.js バージョン下限（最低 15.2.3）・lint ルールの実効性 PoC を、実装着手前に潰す。

7. **[Low] リンク切れ修正。** `共通コンポーネント.md` の `../FE知見共有会.md`、`設計最新.md` の参照群を復元または Archive 内へ退避。`testing_output.md` の `toBeInThapument` タイポ修正。

### 指摘件数サマリ（重大度別）

| 重大度 | 件数 |
|---|---|
| Critical | 0 |
| High | 6 |
| Medium | 9 |
| Low | 7 |
| Info | 4 |

> 注: Critical 0 は「個別の技術的主張に致命的誤りは見つからなかった」ことを意味する。ただし High に挙げた「3系統の併存による正本不在」は、放置すれば実装段階で Critical 級の手戻りを誘発しうる構造リスクである。
