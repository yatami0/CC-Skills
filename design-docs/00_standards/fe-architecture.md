# FE横断アーキテクチャ標準（fe-architecture）

> **位置づけ：第1層・標準（サイト非依存）。** FEの実装方式の横断ルール（レンダリング・状態管理・コンポーネント設計・品質ガードレール・命名 等）の**正本**。
> **意思決定の根拠は [ADR 0001〜0005](../../FE_architecture/ADR/README.md) が正**であり、本書はそれを横断標準として確定・集約したもの。ADR と食い違う場合は ADR を優先する。
> 他の標準（[document_guideline.md](./document_guideline.md) / [naming_convention.md](./naming_convention.md) 等）は本ファイルを**参照**し、FE実装方式を重複定義しない。

> **本書は骨子（スケルトン）である。** 各章の中身は、現状 `FE_architecture/doc/アーキテクチャ設計.md`（A系）に投影済みの内容を本書へ集約しながら確定する。各章の `状態` / `集約元` / `TODO` を埋めることで完成する。

---

## 0. 30秒サマリ

- 今回のFEは **Next.js（App Router）＋ クライアントファースト ＋ TanStack Query ＋ OpenAPI codegen ＋ Tailwind ＋ RHF/Zod**。フロント1名＋AI開発を、規約と機械ゲートで縛る。
- メンタルモデルは **「API を叩くクライアントアプリ」**。Server Actions を使わず、サーバー処理は BFF（Route Handler）に集約する。
- 正しさは散文レビューではなく **型・lint・テスト・codegen drift の機械ゲート**で落とす。
- 本書（第1層標準）が FE横断ルールの正本。サイト固有の構成（システム構成図・認証・外部連携）は第2層 `04_アーキテクチャ` に置き、本書を参照する。

> **状態タグの凡例：** ✅ 確定（集約のみ） ／ ⚠️ 部分確定・未決あり ／ ❌ 未記述（要起草）

---

## 1. スコープと前提

- **対象：** 全サイト共通のFE実装方式（サイト非依存）。当面の主対象は基幹システムのマスタデータ管理サイト（CRUD・4〜5画面）。
- **継承する決定（ADR・再決定しない）：** フレームワーク/レンダリング(0001)、データ取得(0002)、codegen(0003)、AI規約(0004)、テスト(0005)。詳細は [ADR README](../../FE_architecture/ADR/README.md)。
- **サイト非依存の線引き：** メタデータ駆動・EAV 等のサイト固有方式は本書に書かない（第2層に閉じる）。

### 1.1 ドキュメント系統の整理（重要）

| 系統 | 所在 | 位置づけ |
|---|---|---|
| **A. 今回の正** | `FE_architecture/doc/アーキテクチャ設計.md` ＋ `ADR 0001–0005` | 本書が集約する一次情報 |
| B. 補助 | `FE_architecture/doc/共通コンポーネント.md`、doc-kit materials | デザインシステム構想・図解。§9.2 で正系へ統合 |
| **C. 参考（別PJ分析）** | `FE_architecture/doc/spa_architecture/` | React+Jotai の**別スタック**。今回の正ではない＝**参考扱い**。良い記述は出典明記で移植 |
| **D. 廃止（旧版）** | `FE_architecture/doc/Archive/` | React SPA 前提の旧構想。**廃止**。本書では参照しない |

> **TODO：** C/D の各 README に「参考／廃止」を明示する。

---

## 2. レンダリング/フレームワーク方針  ✅

- Next.js（App Router）＋ クライアントファースト。RSC は主役にしない。FE/BFF を1つの Next.js に同居。
- **根拠：** ADR-0001 ／ **集約元：** アーキ設計 §0・§1・§6

## 3. ディレクトリ構成・コロケーション  ✅

- `app/` はルーティング定義のみ。実体は `features/{機能}/` にコロケーション。横断UIは `components/ui/`、横断ロジックは `lib/`、生成物は `generated/`。
- **集約元：** アーキ設計 §2

## 4. レイヤーと依存方向  ✅

- UI → Logic → Data の一方向。UIから直 fetch 禁止。生成物の手書き禁止。
- **根拠：** ADR-0004 ／ **集約元：** アーキ設計 §3

## 5. 状態管理

### 5.1 サーバー状態（TanStack Query・queryKey）  ✅
- `useXxxState`=useQuery / `useXxxAction`=useMutation。queryKey はファクトリに集約、更新成功時はマスタ単位で `invalidateQueries`。取得モードA(クライアント)基本／B(SSRプリフェッチ)加算。QueryClient はサーバー毎回new・クライアントsingleton。
- **根拠：** ADR-0002 ／ **集約元：** アーキ設計 §4

### 5.2 クライアント状態の手段  ⚠️
- 既定はコンポーネント state。グローバルが必要になった時点で軽量手段を選定。
- **未決：** 軽量lib（素のstate / Zustand 等）の確定。**参考：** C系 `state_boundaries.md` / `jotai_patterns.md`（別スタックのため設計観点のみ流用）。
- **TODO：** 選定基準（atom化/state化の境界）を確定して記述。

### 5.3 URL状態の設計指針  ⚠️
- ブックマーク可能な座標（masterType / recordId / 検索クエリ / ページ）は `searchParams`・動的セグメントに載せる。
- **TODO：** 「URL=座標／永続=好み／メモリ=一時」の三層基準を明文化（C系 `state_boundaries.md` を出典に移植）。

## 6. Server/Client 境界  ✅

- `'use client'` は葉に押し下げる。**Server Actions / `'use server'` 禁止**（ESLint）。書き込みは mutation → BFF → BE に一本化。
- **根拠：** ADR-0001/0002/0004 ／ **集約元：** アーキ設計 §6

## 7. コード生成（OpenAPI）  ⚠️

- 型・APIクライアント・Zod を OpenAPI から自動生成。`src/generated/` に隔離・手書き禁止。CI で drift 検出。baseURL=`/api`。
- **未決：** codegenツールの確定（型/client/Zod）、ケース変換（生成時camelCase / 境界変換）。
- **根拠：** ADR-0003 ／ **集約元：** アーキ設計 §5・§11

## 8. UI層・スタイリング・デザインシステム

### 8.1 スタイリング（Tailwind）  ⚠️
- Tailwind に一本化。arbitrary value（`w-[137px]` 等）は原則禁止・ESLint 検出。状態（hover/focus/disabled/loading/empty/error）を網羅。
- **TODO：** トークン体系（§8.2）と接続したスタイリング運用詳細。
- **集約元：** アーキ設計 §7

### 8.2 デザインシステム/共通コンポーネント  ⚠️
- 3層で考える：① Tokens/Foundations（数値直書きを止める）② Components（役割9カテゴリでフラット分類）③ Patterns/Templates（組み合わせの定石）。Atomic Design の粒度分類は採らない。
- **未決：** 構想（B系 `共通コンポーネント.md`）の確定と、Tailwind/トークン実装との整合。
- **集約元：** `共通コンポーネント.md`（B系）→ 本節へ昇格。

### 8.3 フォーム（RHF + Zod）  ⚠️
- React Hook Form + Zod。Zod は更新APIのリクエスト型と整合（生成Zod or 生成型に合わせた手書き）。クライアントエラーはフィールド直下、サーバーエラーは画面レベル。
- **TODO：** スキーマ配置・型導出（`z.infer`）等の詳細パターン（C系 `rhf_patterns.md` を出典に移植）。
- **根拠：** ADR-0003/0004 ／ **集約元：** アーキ設計 §7

## 9. ルーティング・画面遷移・ガード  ❌

- **要起草：** App Router でのルート設計、画面遷移定義、認証ガードの配置（未認証時の挙動）、動的セグメントの振り分け。
- **参考：** C系 architecture §ルーティング（react-router 前提のため概念のみ）。

## 10. 認証・セッション・401/403 の FE 挙動  ⚠️

- FE は**認可を書かない**。トークン/IdPシークレットは BFF に閉じる。401/403 は再ログイン誘導・編集中データ保護で扱う。認証周りの変更は人間主導。
- **未決：** 401/403 の具体UX（§残論点）。
- **集約元：** アーキ設計 §9

## 11. エラーハンドリング横断  ✅

- 共通 `ErrorResponse` を `ApiError` で構造化し、TanStack `onError` で一元ハンドリング。個別エラー画面は作らず `error.tsx` で受ける。土台は `lib/error`。
- **集約元：** アーキ設計 §9

## 12. i18n・文言カタログ  ⚠️

- 文言外出し（メッセージカタログ ＋ ESLint `no-literal-string`）。多言語は基本不要。メッセージの正本は設計書の `10_メッセージ定義`。
- **TODO：** FE側カタログの構造・キー命名・設計書との対応を明文化。
- **集約元：** アーキ設計 §9

## 13. アクセシビリティ  ❌

- **要起草：** 最低ラインの方針（セマンティックHTML、ロケータ可能なrole/label、フォーカス管理）。テストのロケータ方針（§15 `getByRole`）と接続。

## 14. パフォーマンス・監視  ⚠️

- FE は RUM（Datadog 等）、相関IDは BE 発番を透過。
- **TODO：** 取得モードB（SSRプリフェッチ）導入基準、`staleTime`/`gcTime` の定数集約。
- **集約元：** アーキ設計 §4.4・§9・§11

## 15. テスト戦略  ✅（一部要判断）

- 単体/コンポーネント：Vitest + RTL（jsdom）。E2E：Playwright（本番ビルド）。ロケータは意味ベース優先。APIモックは生成型に整合。
- **要判断：** Storybook / VRT の採否（C系は採用、A系は未言及）。本案件規模での要否を決める。
- **根拠：** ADR-0005 ／ **集約元：** アーキ設計 §8

## 16. 機械ゲート・ガードレール  ✅

- codegen drift / `tsc --noEmit` / ESLint（直fetch禁止・generated固定・`'use server'`禁止・arbitrary値禁止・`no-literal-string`・hooks）／ Vitest・Playwright を CI ゲート化。
- **根拠：** ADR-0004 ／ **集約元：** アーキ設計 §10

## 17. 規約の実体（AGENTS.md / docs/conventions）  ❌

- **要作成：** `AGENTS.md`（`CLAUDE.md` から `@` インポート）に ADR-0004 の骨子を明文化。`docs/conventions/` に命名・粒度テンプレを置く。
- **根拠：** ADR-0004 ／ **集約元：** アーキ設計 §2・§10

## 18. 環境構築・ビルド設定  ❌

- **要起草：** Next.js のセットアップ、env モード分け、codegen 実行手順、開発サーバの BFF/プロキシ。サイト個別手順は第2層 `02_環境構築` に置き、横断方式のみ本書。

---

## 19. 残論点（未決一覧）

| 残論点 | 状態 | 関連章 |
|---|---|---|
| codegen ツールの確定（型/client/Zod） | 実装着手時に確定。原則は不変 | §7 |
| ケース変換（生成時camelCase / 境界変換） | 未決。ドメイン型camelCaseのみ確定 | §7 |
| クライアント状態の手段 | 未決。必要時に軽量手段を選定 | §5.2 |
| デザインシステムの確定（3層・Tailwind整合） | 構想段階。B系を昇格して確定 | §8.2 |
| Storybook / VRT の採否 | 未判断（C系は採用） | §15 |
| 401/403 の UI 挙動 | 残論点 | §10 |
| `staleTime`/`gcTime` 具体値・モードB導入基準 | 未決。定数集約 | §5.1・§14 |
| 楽観的更新を入れる画面 | UX要件が出てから画面単位 | §5.1 |
| 定義駆動UIの採用 | 不採用。必要化したらADR追加 | §8.2 |

> **完成の定義：** 全章の状態タグが ✅ になり、§19 が空になった時点で、本書が `アーキテクチャ設計.md`（A系）を吸収した FE横断標準の正本として独立する。
