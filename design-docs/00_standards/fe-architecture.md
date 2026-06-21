# FE横断アーキテクチャ標準（fe-architecture）

> **位置づけ：第1層・標準（サイト非依存）。** FEの実装方式の横断ルールの**正本**。
> **意思決定の根拠は [ADR 0001〜0005](../../FE_architecture/ADR/README.md) が正**。ADR と食い違う場合は ADR を優先する。
> 他の標準（[document_guideline.md](./document_guideline.md) / [naming_convention.md](./naming_convention.md)）は本ファイルを**参照**し、FE実装方式を重複定義しない。

---

## 0. 章立ての出典（なぜこの章なのか）

本書の章立ては**経験則ではなく、権威ある外部リファレンスと本リポジトリのADRに基づく**。各章は最低1つの権威ソースに紐づく。

| 出典 | 内容 | 役割 |
|---|---|---|
| **bulletproof-react**（[docs/](https://github.com/alan2207/bulletproof-react/tree/master/docs)、Reactアーキの事実上標準） | `application-overview / project-structure / components-and-styling / api-layer / state-management / testing / error-handling / security / performance / project-standards / deployment` の12構成 | **章立ての骨格** |
| **Next.js 公式**（[Project Structure](https://nextjs.org/docs/app/getting-started/project-structure)・[AI Agents](https://nextjs.org/docs/app/guides/ai-agents)・[Deploying](https://nextjs.org/docs/app/getting-started/deploying)） | App Router の file conventions、AGENTS.md/CLAUDE.md 自動生成、配信構成 | **Next.js固有章の根拠** |
| **本リポジトリ ADR 0001–0005** | 当案件の技術決定 | **各章の中身の正** |

> bulletproof-react に独立章が無い領域（ルーティング・アクセシビリティ）は独立章にしない。ルーティングは §3（Next.js file conventions）に統合、アクセシビリティは §8.1/§12 の小項目で扱う。

> **状態タグ：** ✅ 確定 ／ ⚠️ 部分・未決あり ／ ❌ 未記述

---

## 1. 概要とスコープ（application-overview）  ✅

- **対象：** 全サイト共通のFE実装方式（サイト非依存）。当面の主対象は基幹システムのマスタデータ管理サイト（CRUD・4〜5画面）。フロント1名＋AIコーディング主体。
- **継承する決定（ADR・再決定しない）：** FW/レンダリング(0001)・データ取得(0002)・codegen(0003)・AI規約(0004)・テスト(0005)。
- **メンタルモデル：** 「API を叩くクライアントアプリ」。OpenAPI から生成した型・client を土台に、サーバー状態は TanStack Query に預け、正しさは型・lint・テスト・codegen drift の機械ゲートで落とす。
- **出典：** bulletproof-react `application-overview` ／ ADR README

### 1.1 ドキュメント系統の整理

| 系統 | 所在 | 位置づけ |
|---|---|---|
| **A. 今回の正** | A系 `アーキテクチャ設計.md` ＋ `ADR 0001–0005` | 本書が集約する一次情報 |
| B. 補助 | `共通コンポーネント.md`、doc-kit materials | §8.2 で正系へ統合 |
| **C. 参考（別PJ分析）** | `spa_architecture/`（React+Jotai・**別スタック**） | 参考扱い。良い記述は出典明記で移植 |
| **D. 廃止（旧版）** | `Archive/`（React SPA 前提の旧構想） | 廃止。参照しない |

> **TODO：** C/D の各 README に「参考／廃止」を明示する。

---

## 2. レンダリング/フレームワーク方針  ✅

- **Next.js（App Router）＋ クライアントファースト。** RSC は主役にしない。FE/BFF を1つの Next.js アプリに同居させ、BFF は Route Handler（`app/api/**/route.ts`）で実装する。
- ブラウザは BE の URL もトークンも知らない。`useQuery`/`useMutation` は同一オリジン `/api`（BFF）だけを叩く。
- RSC を新規に持ち込む場合は ADR を追加してからにする（勝手に増やさない）。
- **出典：** Next.js公式（Server/Client Components）／**ADR-0001** ／ **集約元：** A系 §0・§1・§6

## 3. プロジェクト構成・ルーティング・コロケーション  ✅

```
src/
├─ app/                        # App Router＝ルーティング定義のみ（ロジックを書かない）
│  ├─ layout.tsx               # 骨格。providers を呼ぶだけ
│  ├─ providers.tsx            # 'use client'：QueryClientProvider
│  ├─ api/[...path]/route.ts   # BFF キャッチオール proxy（認証付与・整形）
│  └─ masters/[masterType]/[recordId]/  # 一覧/詳細・更新（動的セグメント1セット）
├─ features/                   # ★機能単位で凝集（Colocation）。components/ hooks/ types/
├─ components/ui/              # 横断 UI 部品（自前デザインシステム・§8）
├─ lib/                        # 横断ユーティリティ（error / i18n / 整形）
└─ generated/                  # ★OpenAPI 生成物。手で編集しない
```

- **`app/` はルーティング定義のみ**。page/layout/loading/error/route の file conventions で骨格を組み、実体は持たない。
- **実体は `features/{機能}/` にコロケーション**。横断共通UIは `components/ui/`、横断ロジックは `lib/`。機能固有のものは `features/` から出さない。
- **マスタ別フォルダを作らない**。マスタは `app/masters/[masterType]` の動的セグメント1セットで捌く。
- **ルーティングは独立章にせず本章に含める**（Next.js では file conventions が構成の一部）。
- **出典：** bulletproof-react `project-structure` ／ Next.js公式（Project Structure / File Conventions）／ **集約元：** A系 §2

## 4. レイヤーと依存方向  ✅

```
UI（components/ui・features 内の葉） → Logic（useXxxState/useXxxAction） → Data（generated client → BFF → BE）
```

- 依存は **UI → Logic → Data の一方向**。逆流禁止。
- **UI から直接 `fetch` しない**。読み取りは `useXxxState`、書き込みは `useXxxAction` を必ず経由（ESLint で強制）。
- **生成物（`src/generated/`）の手書き改変禁止**（再生成で上書き）。import 経路も lint で固定。
- **出典：** bulletproof-react `project-structure`（unidirectional）／ ADR-0004 ／ **集約元：** A系 §3

## 5. 状態管理（state-management）

bulletproof-react の5分類（Component / Application / Server Cache / Form / URL）に従い、状態は**それを必要とする場所にできるだけ近づけて局所化**する。最初からすべてをグローバル化しない。
- **出典：** bulletproof-react `state-management`

### 5.1 サーバー状態（TanStack Query・queryKey）  ✅
- `useXxxState`=`useQuery` ラッパー（読み取り）、`useXxxAction`=`useMutation`＋`invalidateQueries`（書き込み＋無効化＋エラー）。画面固有フックは feature の `hooks/` に置く。
- queryKey は文字列直書きを禁止し**ファクトリに集約**。更新成功時は**マスタ単位でまとめて無効化**（`invalidateQueries({ queryKey: keys.all(masterType) })`）。
- 取得モード：**A＝クライアント取得（葉で `useQuery`、初回スケルトン）を基本**。B＝SSRプリフェッチは初回表示性能が要件化した画面のみ加算。BはTanStack公式どおり Server Component で `prefetchQuery`→`dehydrate`→Client `HydrationBoundary`（`initialData` のバケツリレーにしない）。
- **QueryClient はサーバー毎回 new・クライアント singleton**（サーバーで使い回すとリクエスト間でキャッシュが混ざりデータ漏洩）。サーバー側は `cache()` でリクエスト毎に生成。
- **出典：** TanStack Query 公式（[overview](https://github.com/TanStack/query/blob/main/docs/framework/react/overview.md) / [advanced-ssr](https://github.com/TanStack/query/blob/main/docs/framework/react/guides/advanced-ssr.md)）／ **ADR-0002** ／ **集約元：** A系 §4

### 5.2 クライアント状態の手段  ✅
- **既定はコンポーネント state（必要に応じて Context）。** CRUD 4〜5画面ではサーバー状態を TanStack Query、フォーム状態を RHF が吸収するため、残るグローバル状態はトースト/モーダル程度に限定され、Context で足りる。
- グローバル共有が実証された時点で初めて**軽量lib（Zustand）を1つだけ昇格導入**する（Jotai/Redux はこの規模では過剰）。
- **出典：** bulletproof-react `state-management`（局所化原則）／ ADR-0002 却下案（「必要時のみ コンポーネント state / 必要なら Zustand」）

### 5.3 URL状態  ✅
- URLに載せるのは**「ブックマーク・共有・リロードで復元したい座標」**に限る：`masterType`・`recordId`（動的セグメント）、検索クエリ/フィルタ/ソート/ページ（`searchParams`）。
- **データ実体は載せない**（TanStack Query のキャッシュが持つ。サーバー状態は「リモート永続・古くなりうるキャッシュ」だから）。
- 基準は **「URL=座標 ／ 永続=好み ／ メモリ=一時（モーダル開閉・入力途中）」**で固定。
- **出典：** bulletproof-react `state-management` ／ TanStack Query overview

## 6. Server/Client 境界・BFF  ✅

- `'use client'` は葉に押し下げる。`layout.tsx`/`page.tsx` は Server のまま、`providers.tsx`（QueryClient）と `features/**` は Client。
- **Server Actions / `'use server'` 禁止**（ESLint）。書き込みは TanStack mutation → BFF（Route Handler）→ BE に一本化。BFF が既に書き込み経路で、Server Actions を足すと経路と認証が二重化するため。
- BFF が認証トークン付与・ヘッダ整形・APIアグリゲーションを担う。
- **出典：** Next.js公式（Route Handlers）／ ADR-0001/0002/0004 ／ **集約元：** A系 §6

## 7. API レイヤー（OpenAPI codegen）  ⚠️

- API クライアントは**事前設定済みの単一インスタンスを再利用**し、リクエストは別ファイルに定義・コロケーションして TanStack Query hook から呼ぶ（bulletproof-react `api-layer`）。
- 型・APIクライアント・Zod は **OpenAPI から生成**し `src/generated/` に隔離・手書き禁止。baseURL=`/api`。CI で「再生成結果==コミット済み」を検証（drift 検出）。
- **codegen ツール（2026-06 時点の保守状況実測に基づく推奨）：本命=orval**（型＋TanStack Query hook＋Zod を1ツールで生成・保守活発）。生成物の透明性を最優先する場合のみ **openapi-typescript + openapi-fetch（型＋fetch）＋ Zod別手段**。**openapi-zod-client は約1.4年更新停止のため非推奨**（ADR-0003 の例示から差し替え）。最終確定は実装着手時（ADR-0003が自ら確定を実装時に委ねている）。
- **未決：** ケース変換（生成時camelCase / 境界変換）。ドメイン型 camelCase のみ確定。
- **出典：** bulletproof-react `api-layer` ／ **ADR-0003** ／ GitHub実測（orval-labs/orval・openapi-ts/openapi-typescript・astahmer/openapi-zod-client）／ **集約元：** A系 §5・§11

## 8. コンポーネント・スタイリング・デザインシステム（components-and-styling）

bulletproof-react の原則：使う場所の近くにコロケート、ネスト描画関数を持つ巨大コンポーネントを避ける、props を絞る、共通部品はライブラリへ抽出。
- **出典：** bulletproof-react `components-and-styling`

### 8.1 スタイリング（Tailwind）  ✅
- スタイリングは **Tailwind CSS v4 に一本化**。色・余白・タイポ・radius・shadow は `@theme` で**集中定義**しユーティリティを生成させる（公式: theme 変数はユーティリティクラスを生む）。デフォルトスケールは `--color-*: initial;` 等で無効化し「定義したトークンのユーティリティだけが存在する」状態を作る。
- **注意：** Tailwind 自体は arbitrary value を禁止しない（公式はトークン参照 `calc(var(--radius-xl)-1px)` を推奨）。**arbitrary値（`w-[137px]`）の禁止はチーム規約として ESLint で上乗せ**する。
- 状態（hover/focus/disabled/loading/empty/error）を網羅。**a11y は本節の小項目**（セマンティックHTML・role/label）。
- **出典：** [Tailwind v4 theme](https://tailwindcss.com/docs/theme) ／ bulletproof-react `components-and-styling` ／ **集約元：** A系 §7

### 8.2 デザインシステム/共通コンポーネント  ⚠️
- **デザイントークンは primitive→semantic→component の3層**で設計する。階層は **Material Design 3**（reference/system/component の3クラス）が明示し、**W3C Design Tokens 仕様**がトークン参照（エイリアス・多段参照）として裏付ける。Tailwind `@theme` 上で primitive=生値、semantic=primitive参照として実装。
- 実装方式は **shadcn/ui 方式**（headless primitive＋Tailwind、ソースを自リポジトリにコピーして所有）を採用。ソース所有は AI がコンポーネントを読み改変・生成できる利点に直結し、フロント1名＋AI主体に最適。土台の headless primitive（Radix 等）は依存として更新を受けるハイブリッド。
- コンポーネント分類は**役割ベース**（B系 `共通コンポーネント.md` の9カテゴリ）。M3 の component token 階層と整合。Atomic Design の粒度分類は採らない。
- **未決：** トークン命名のCSS変数規約への翻訳、9カテゴリの確定（B系を昇格）。
- **出典：** [M3 design tokens](https://m3.material.io/foundations/design-tokens/overview) ／ [W3C Design Tokens](https://www.designtokens.org/TR/drafts/format/) ／ [shadcn/ui](https://ui.shadcn.com/docs) ／ B系 `共通コンポーネント.md`

### 8.3 フォーム（RHF + Zod）  ✅
- **React Hook Form + Zod + `@hookform/resolvers` の `zodResolver`** を標準とする。Zod スキーマは画面/機能ごとに**別ファイル**で管理し、`z.infer<typeof schema>` でフォーム型を一元導出（型の二重管理を排除）。
- 同一スキーマをフォーム検証と更新APIのリクエスト型整合に使う（生成Zod or 生成型に合わせた手書き）。クライアントエラーはフィールド直下、サーバーエラーは画面レベル（§9）。
- **出典：** [RHF resolvers 公式](https://github.com/react-hook-form/resolvers)（zodResolver サポート）。※bulletproof-react はサンプルコードで採用するが docs に forms 章は無いため権威は RHF 公式に置く。**集約元：** A系 §7

### 8.4 Storybook の採否  ✅
- **初期は不採用。** Storybook の主価値（コンポーネント隔離開発・カタログ化）は中〜大規模で効くが、CRUD 4〜5画面・1名＋AI ではセットアップ/保守コストが上回る。代替としてアプリ内サンドボックスページで代用。
- 再評価の閾値：デザインシステムがコンポーネント10〜15個超、または複数人体制になった時点。
- **注記：** 公式・bulletproof-react とも Storybook を肯定するが**小規模での要否基準は示していない**。本判断は権威の推奨ではなくコスト便益判断。
- **出典：** [Storybook docs](https://storybook.js.org/docs) ／ bulletproof-react `components-and-styling`

## 9. エラーハンドリング・横断（error-handling）  ✅

- 共通 `ErrorResponse` を `ApiError` で構造化し、**TanStack の `onError`/QueryCache をインターセプターとして一元ハンドリング**（通知トースト・未認可ログアウト・トークンリフレッシュ）。土台は `lib/error`。
- 個別エラー画面は作らず、**`app/error.tsx`（全体）＋主要画面セグメントの error boundary** で受ける（bulletproof-react「アプリ全体に単一でなく領域ごとに複数の boundary」）。
- **エラートラッキングは自前実装せず専用サービス（Sentry 等）＋source map アップロード**で発生箇所を特定（監視=§11 と役割分担）。
- 401/403 は onError 一元ハンドラ内で扱い §10 と結線。
- **文言（小項目）：** 文言外出し（メッセージカタログ＋ESLint `no-literal-string`）。正本は設計書 `10_メッセージ定義`。
- **出典：** bulletproof-react `error-handling` ／ **集約元：** A系 §9

## 10. セキュリティ（security）  ✅

- **トークン保管：** localStorage は XSS リスク。**HttpOnly Cookie で BFF(Route Handler) が保持**し、トークン/IdPシークレットはブラウザに出さない（bulletproof-react が最善とする方針の上位互換）。
- **認可：** bulletproof-react は RBAC/PBAC を FE で扱う例を示すが、**本構成は BE(Spring Boot)/BFF を認可判定の正本**とし、**FE は認可ロジックを書かない**。UI上の出し分け（メニュー/ボタン）は **UX目的のみでセキュリティ境界ではない**。
- **XSS/入力：** 表示前にユーザー入力をサニタイズ。`dangerouslySetInnerHTML` は原則禁止（ESLint 検出）、必要時のみ DOMPurify 等。**OWASP client-side top 10 を参照基準**とする。
- **出典：** bulletproof-react `security`（Auth/Authorization/XSS/Input Sanitization）／ **集約元：** A系 §9

## 11. パフォーマンス・監視（performance）  ⚠️

- Next.js 既定のルート単位 code splitting を基本とし、**過剰分割は避ける**（bulletproof-react「excessive splitting は逆効果」）。追加の `next/dynamic` は**重い葉（リッチエディタ/チャート/モーダル）に限定**。
- データ先読みは TanStack の `queryClient.prefetchQuery` を**取得モードB（SSRプリフェッチ）の実装手段**とする。`staleTime`/`gcTime` は**定数集約**（直書きしない）。
- 画像は lazy/WEBP/`srcset` を自動充足する **`next/image` を既定採用**。Tailwind は bulletproof-react 推奨の「ビルド時CSS生成（zero-runtime）」方向に合致。
- **監視：** Web Vitals（Lighthouse/PageSpeed）を基準とする。**RUM（Datadog 等）は bulletproof-react に裏付けが無い上乗せ方針**として、製品選定は社内決定で別記。相関IDは BE 発番を透過。
- **未決：** `staleTime`/`gcTime` 具体値、モードB導入画面の基準。
- **出典：** bulletproof-react `performance` ／ **集約元：** A系 §4.4・§9・§11

## 12. テスト戦略（testing）  ✅

- 単体/コンポーネント：**Vitest + React Testing Library（jsdom）**（ロジック・Zod・フォーム挙動・一覧のフィルタ/ソート）。E2E：**Playwright（本番ビルド）**（一覧→詳細→更新→反映のハッピーパス）。
- ロケータは `getByRole`/`getByLabel` 等の意味ベースを優先（a11y と接続・§8.1）。
- APIモック：単体は生成 client をモック、E2E は Playwright のリクエスト傍受。**モックのレスポンス型は生成型に整合**させ契約のズレを型で検出。
- 当面追わない：ビジュアルリグレッション・CSS厳密検証・網羅率の数値目標。ライブラリ責務（`isPending` 遷移・`staleTime`）はテストしない。
- **出典：** bulletproof-react `testing` ／ **ADR-0005** ／ **集約元：** A系 §8

## 13. プロジェクト標準・機械ゲート（project-standards）  ⚠️

- **標準化対象：** ESLint / Prettier / TypeScript(strict) / git hooks（pre-commit で lint・型・format） / 絶対import（`baseUrl`+`paths`） / kebab-case 命名（ESLint 強制）。
- **機械ゲート：** codegen drift（再生成して `git diff --exit-code`）／ `tsc --noEmit`（strict）／ ESLint（直fetch禁止・generated固定・`'use server'`禁止・arbitrary値禁止・`no-literal-string`・hooks）／ Vitest・Playwright を CI ゲート化（通過しない PR はマージ不可）。
- **規約の置き場：** `AGENTS.md`（`CLAUDE.md` から `@` インポート。Next.js 公式が create-next-app で自動生成）に ADR-0004 骨子を明文化。`docs/conventions/` に粒度テンプレ。**未作成。**
- **出典：** bulletproof-react `project-standards` ／ Next.js公式（[AI Agents](https://nextjs.org/docs/app/guides/ai-agents)）／ **ADR-0004** ／ **集約元：** A系 §2・§10

## 14. デプロイ（deployment）  ✅

- bulletproof-react は「アプリと資産は CDN 越しに配信せよ」とのみ示す薄い章のため、本体は Next.js 公式に従う。
- FE/BFF 同居かつ Route Handler を使うため **Static export 不可**。**Docker + `output: 'standalone'` を既定配信形態**とする（公式が Docker ベストプラクティスとして名指し。`.next/standalone` が必要ファイルのみトレースしイメージ最小化、`server.js` で起動）。
- 成果物は `.next/standalone`。`public`・`.next/static` は **CDN 配信前提**（非CDN時のみ手動コピー）。
- **環境変数：** `NEXT_PUBLIC_*` は**ビルド時にバンドルへインライン化**される（＝環境別に再ビルドが必要）。**秘匿値・環境別エンドポイントを `NEXT_PUBLIC_` に入れない**。BFF→BE のURLやシークレットは非プレフィックスのサーバー変数として実行時に読み「単一イメージを複数環境へ昇格」する（§10 と直結）。
- 個別の Dockerfile/CI/CD/ホスティング選定は**第2層 `02_環境構築` の担当**。本章は配信形態・成果物・環境変数の横断方針のみ。
- **出典：** bulletproof-react `deployment` ／ Next.js公式（[Deploying](https://nextjs.org/docs/app/getting-started/deploying)・[output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)・[Self-hosting](https://nextjs.org/docs/app/guides/self-hosting)）

---

## 15. 残論点（未決一覧）

| 残論点 | 状態 | 関連章 |
|---|---|---|
| codegen ツールの最終確定 | 本命=orval。最終確定は実装着手時（ADR-0003） | §7 |
| ケース変換（生成時camelCase / 境界変換） | 未決。ドメイン型camelCaseのみ確定 | §7 |
| デザインシステムの確定（トークン命名翻訳・9カテゴリ） | 構想→確定。B系を昇格 | §8.2 |
| 401/403 の UI 挙動 | 残論点 | §10 |
| `staleTime`/`gcTime` 具体値・モードB導入基準 | 未決。定数集約 | §5.1・§11 |
| 楽観的更新を入れる画面 | UX要件が出てから | §5.1 |
| 定義駆動UIの採用 | 不採用。必要化したらADR追加 | §8.2 |
| AGENTS.md / docs/conventions の作成 | 未作成 | §13 |

> **確定済み（旧・残論点から解消）：** クライアント状態の手段（§5.2）／URL状態の基準（§5.3）／Storybook 採否（§8.4）。
> **完成の定義：** 全章 ✅ かつ §15 が解消した時点で、本書が A系（`アーキテクチャ設計.md`）を吸収した FE横断標準の正本として独立する。
