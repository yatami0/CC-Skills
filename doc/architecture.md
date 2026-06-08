# アーキテクチャ
 
## 1. 技術スタック
 
| カテゴリ | ライブラリ | バージョン | 役割 | 同カテゴリの代替候補 |
|---|---|---|---|---|
| フレームワーク | React | ^19.0.0 | UIフレームワーク | Vue, Svelte, Solid |
| ルーティング | react-router-dom | ^7.13.0 | SPA ルーティング | TanStack Router, Next.js App Router |
| 状態管理 | Jotai | ^2.10.3 | クライアント状態のアトミック管理 | Zustand, Redux Toolkit, Recoil |
| フォーム | React Hook Form | ^7.43.9 | フォーム状態管理・バリデーション | Formik, React Final Form |
| バリデーション | Zod | ^3.22.3 | スキーマバリデーション | Yup, Valibot, ArkType |
| フォームリゾルバ | @hookform/resolvers | ^3.10.0 | Zod ⇔ RHF ブリッジ | 手動バリデーション |
| スタイリング | Sass (CSS Modules) | ^1.58.1 | コンポーネントスコープCSS | Tailwind CSS, styled-components, vanilla-extract |
| パターンマッチ | ts-pattern | ^5.7.1 | 型安全な条件分岐 | switch文, if-else |
| 国際化 | i18next + react-i18next | ^22.5.1 / ^12.3.1 | 多言語対応 | FormatJS (react-intl), LinguiJS |
| 日付 | dayjs | ^1.11.7 | 日付処理 | date-fns, Luxon, Temporal API |
| チャート | Chart.js + react-chartjs-2 | ^4.2.1 / ^5.2.0 | データ可視化 | Recharts, Nivo, D3 |
| DnD | @dnd-kit | core ^6.3.1 | ドラッグ＆ドロップ | react-beautiful-dnd, react-dnd |
| ドロワー | vaul | 1.1.1 (パッチ適用) | モバイル向けハーフモーダル | Radix Dialog, Headless UI |
| ズーム | react-zoom-pan-pinch | ^3.7.0 | 画像ズーム・パン操作 | react-medium-image-zoom |
| 認証 | oidc-c-ts + react-oidc-context | ^2.2.4 / ^2.2.2 | OpenID Connect 認証 | Auth0 SDK, NextAuth |
| 暗号化 | crypto-js + jsrsasign | ^4.2.0 / ^11.0.0 | クライアント暗号・署名処理 | Web Crypto API |
| エラーバウンダリ | react-error-boundary | ^6.0.0 | React エラーバウンダリ | 自前実装 |
| ファイルアップロード | react-dropzone | 14.3.8 | ファイル選択・ドロップUI | 自前 input[type=file] |
| 並行制御 | p-limit | ^6.2.0 | 同時実行数の制限 | 自前 Semaphore |
| 監視 | @datadog/browser-rum | ^6.27.1 | Real User Monitoring | Sentry, New Relic |
| ビルドツール | Vite | ^7.2.2 | 開発サーバー・バンドラ | Webpack, Turbopack, Rspack |
| テスト | Vitest | ^4.0.18 | ユニット・統合テスト | Jest |
| テストUI | Testing Library (React) | ^16.0.1 | コンポーネントテスト | Enzyme (非推奨) |
| E2E | Playwright | ^1.56.1 | ブラウザ自動テスト | Cypress |
| VRT | reg-suit + storycap | ^0.14.5 / ^2.0.0 | ビジュアルリグレッションテスト | Chromatic, Percy |
| Storybook | Storybook | ^10.2.8 | コンポーネントカタログ・テスト | Ladle |
| API モック | MSW | ^2.10.4 | サービスワーカーによるAPIモック | miragejs |
| リンター | ESLint (Flat Config) | ^9.8.0 | コード品質チェック | Biome |
| フォーマッタ | Prettier | ^2.8.8 | コード整形 | Biome |
| スペルチェック | cspell | ^9.0.2 | スペルチェック | - |
| コード生成 | Hygen | ^6.2.11 | テンプレートベースのコード生成 | plop, scaffdog |
| Git Hooks | simple-git-hooks + lint-staged | ^2.11.1 / ^15.2.10 | コミット前のリント実行 | Husky + lint-staged |
| パッケージ管理 | pnpm (workspace) | 10.29.3 | モノレポ管理 | npm workspaces, Yarn, Turborepo |
| ランタイム | Node.js | 24.13.1 (Volta 固定) | JavaScript ランタイム | - |
| TypeScript | typescript | * (workspace) | 型安全な開発 | Flow (非推奨) |
 
## 2. ディレクトリ構成
 
### 2.1 トップレベル構成（モノレポ）
 
```
root/
├── packages/              # git submodule で管理される共通基盤
│   └── service/           # 共通コンポーネント・ドメイン・API層（@core）
├── app-desktop/           # デスクトップ向けメインアプリ（@app）
├── app-mobile/            # モバイル(SP)向けアプリ（@app-sp）
├── app-admin/             # 管理者向けアプリ（@app-admin）
├── app-external/          # 外部公開向けアプリ（@app-ext）
├── shared/                # アプリ間共有コンポーネント（@shared）
├── patches/               # サードパーティライブラリのパッチ
└── scripts/               # ビルド・CI スクリプト
```
 
**パターン**: **pnpm workspace + git submodule によるモノレポ構成**。
- 5つのアプリケーションが1つのリポジトリに共存し、共通パッケージ(`packages/service`)は git submodule として別リポジトリで管理される。
- 各アプリは同一の依存関係（ルートの `package.json`）を共有し、各アプリの `package.json` にはスクリプト定義のみ存在する。依存関係のバージョンは一元管理される。
### 2.2 共通基盤パッケージ（`@core`）の内部構成
 
```
service/src/
├── components/            # UIコンポーネント群
│   ├── atoms/             #   最小単位（ボタン、入力、アイコン、ポータル）
│   ├── molecules/         #   atoms の組合せ（モーダル、ドロワー、フォーム部品）
│   ├── organisms/         #   複合UI（ヘッダー、サイドバー、リスト）
│   ├── templates/         #   ページ骨格（モーダルテンプレート）
│   └── pages/             #   共通ページ（存在するがほぼ空）
├── domain/                # ビジネスドメイン
│   ├── auth/              #   認証（OIDC）
│   ├── constants/         #   定数定義
│   └── types/             #   型定義（レスポンス型、ドメインモデル型）
├── external/              # 外部サービス連携
│   ├── api/               #   API スキーマ定義（型定義）
│   ├── rest/              #   REST API クライアント実装
│   ├── datadog/           #   監視サービス
│   └── storage/           #   ブラウザストレージ
├── hooks/                 # 共通カスタムフック
├── store/                 # 共通 Jotai Atom 定義
├── error/                 # エラーハンドリング基盤
├── lib/                   # ユーティリティ（ルーター、URL、パーサー）
├── i18n/                  # 国際化基盤
└── tests/                 # テスト共通設定
```
 
**パターン**: **Atomic Design ベースのコンポーネント分類**をUIコンポーネントライブラリとして適用。atoms → molecules → organisms → templates の階層で、下位から上位への一方向参照を原則とする。
 
### 2.3 アプリケーション層の内部構成（代表パターン）
 
#### デスクトップアプリ（初期設計）
 
```
app/src/
├── components/            # アプリ固有のUIコンポーネント
│   ├── _dropdowns/        #   ドロップダウンメニュー群
│   └── asides/            #   サイドパネル群
├── dialogs/               # モーダル・ダイアログ群
├── pages/                 # ページコンポーネント
│   └── XxxPage/
│       ├── XxxPage.tsx    #   ページ本体
│       ├── components/    #   ページ固有コンポーネント
│       └── hooks/         #   ページ固有フック
├── providers/             # React Context プロバイダ群
├── services/              # ビジネスロジックサービス（純関数）
├── store/                 # Jotai Atom 定義
│   ├── atom/              #   Atom 定義
│   └── hooks/             #   Atom アクセスフック
├── i18n/                  # 国際化リソース
├── settings/              # アプリ設定定数
├── styles/                # グローバルスタイル
└── Routes.tsx             # ルーティング定義（単一ファイル）
```
 
#### モバイルアプリ（後発・改善設計）
 
```
app-sp/src/
├── components/            # アプリ固有のUIコンポーネント（templates/organisms）
├── dialogs/               # モーダル・ドロワー・メニュー群
├── features/              # 横断的な機能モジュール（Feature-based）
│   ├── list/              #   リスト操作
│   ├── node/              #   ノード操作
│   ├── nodeAction/        #   ノードアクション
│   └── route/             #   ルーティングユーティリティ
├── pages/                 # ページコンポーネント
│   └── XxxPage/
│       ├── XxxPage.tsx    #   ページ本体
│       ├── components/    #   ページ固有コンポーネント
│       └── hooks/         #   ページ固有ビジネスロジックフック
├── routes/                # ルーティング定義
│   ├── components/        #   ルートガードコンポーネント
│   └── hooks/             #   ルーティングフック
├── store/                 # Jotai Atom 定義
├── utils/                 # ユーティリティ
└── styles/                # グローバルスタイル
```
 
### 2.4 分割方式の判定
 
**ハイブリッド方式（レイヤーベース × フィーチャーベース）**
 
- **レイヤーベース**: トップレベルは `components/`, `pages/`, `store/`, `services/` のようにレイヤーで分割。
- **フィーチャーベース**: `pages/XxxPage/` 配下は、ページごとに `components/` + `hooks/` をコロケーション（同置）。
- **進化の痕跡**: 初期設計のデスクトップアプリは `services/` にビジネスロジック純関数を配置。後発のモバイルアプリでは `features/` で横断機能をモジュール化し、ページ配下の `hooks/` にドメインロジックを集約する設計に進化。
### 2.5 コンポーネント配置ルール（パターン抽出）
 
| 配置場所 | 基準 | 具体例 |
|---|---|---|
| `@core/components/` | 全アプリで共通利用されるUIプリミティブ | ボタン、モーダル、レイアウト、フォーム部品 |
| `@shared/components/` | 一部のアプリ間で共有されるコンポーネント | ドメイン固有の共有コンポーネント |
| `app/components/` | 1つのアプリ内で複数ページから利用 | ドロップダウン、サイドパネル |
| `app/pages/XxxPage/components/` | 1つのページ内でのみ利用 | ページ固有リスト、ヘッダー |
 
**共通化の昇格基準**: 2つ以上のアプリから参照される場合 → `@shared` へ。全アプリ共通 → `@core` へ。ESLint の `import/no-restricted-paths` ルールで、アプリ間の直接参照を禁止し、共通化を強制している。
 
## 3. レイヤー設計
 
### 3.1 依存関係の方向（3層 + 横断基盤）
 
```
┌─────────────────────────────────────────────┐
│  Presentation Layer (UI)                     │
│  pages/ → components/ → @core/components/   │
├─────────────────────────────────────────────┤
│  Logic Layer (Hooks / Domain)                │
│  pages/hooks/ → features/ → @core/hooks/    │
│  store/atom/ → @core/store/                 │
├─────────────────────────────────────────────┤
│  Data Layer (API / External)                 │
│  @shared/external/rest/ → @core/external/   │
├─────────────────────────────────────────────┤
│  Cross-cutting (横断基盤)                     │
│  error/ │ i18n/ │ lib/ │ providers/          │
└─────────────────────────────────────────────┘
```
 
- **上位から下位への一方向依存**: UI → Logic → Data の方向にのみ依存。逆方向は禁止。
- **UI コンポーネントから直接 fetch している箇所はない**: API 呼び出しはすべてカスタムフック（`useXxxAction`）経由で行われる。
### 3.2 カスタムフックの責務パターン
 
このプロジェクトでは、カスタムフックを**明確な命名規則で責務分離**するパターンが確立されている。
 
| 命名パターン | 責務 | 層 |
|---|---|---|
| `useXxxState()` | Atom の**読み取り専用**ラッパー | 状態読み取り層 |
| `useXxxAction()` | API呼び出し + Atom 更新 + エラーハンドリング | ビジネスロジック層 |
| `useXxxDrawer()` / `useXxxModal()` | モーダル・ドロワーの開閉状態管理（排他制御付き） | UI制御層 |
| `useXxxRedirect()` | URLクエリパラメータに基づくリダイレクト処理 | ナビゲーション層 |
 
**State/Action 分離パターン**: 同じドメインに対して `useXxxState`（読み取り）と `useXxxAction`（書き込み）を分離するパターン。これにより、読み取りのみのコンポーネントが書き込みロジックに依存せず、再レンダリングの最適化が可能になる。
 
### 3.3 データ層の構造
 
```
@core/external/
├── api/           # API レスポンス・リクエストの型定義（自動生成 or 手動定義）
├── rest/          # REST API クライアント（fetch ラッパー）
└── ...
 
@shared/external/
└── rest/          # ドメイン固有の API クライアント
```
 
- API クライアントは**純粋な関数として定義**され、React フックに依存しない。
- フック側が API クライアントを呼び出す構造で、データ層とUI層の結合を最小化。
- レスポンスの型変換は `camelcase-keys` / `snakecase-keys` で自動化。
### 3.4 エラーハンドリングの一元化パターン
 
- `useErrorAction()` をベースに、各アプリが `useXxxErrorHandlingAction()` として特化版を定義。
- API エラーは型クラス（`ApiError`）で構造化され、エラーコード別に分岐処理。
- エラーページへの遷移、スナックバー表示、ログ送信を一元的に管理。
### 3.5 並行実行制御パターン
 
- `useSemaphoreCallback()`: ユーザー操作の重複実行を防止するセマフォ。ボタン連打やナビゲーション連打を安全にブロック。
- `useAtomActionCallback()`: Jotai の `useAtomCallback` をラップし、依存配列の安定性を保証するカスタムフック。
- `withAppLoading()`: ローディング状態の自動管理。API呼び出しを囲むだけでローディング表示・非表示を制御。
- `p-limit`: 並行リクエスト数を制限（例：ファイルアップロードの同時実行数制限）。
## 4. ルーティング
 
### 4.1 ルーティングの仕組み
 
**コード定義ベースのルーティング**（ファイルベースルーティングではない）。
 
- `react-router-dom` v7 の `createBrowserRouter` + `createRoutesFromElements` を使用。
- 各アプリが独自の `Routes.tsx` または `routes/route.tsx` でルート定義を持つ。
- パスプレフィックス（`base`）でアプリを分離: `/d`（デスクトップ）, `/ds`（管理）, `/ddv`（外部公開）。
### 4.2 レイアウトの共通化方法
 
**ネストルート + Provider ラッピングパターン**:
 
```
<AppRootProviders>          ← エラー・認証・スナックバー等のプロバイダ群
  <PrivateRoute>            ← 認証ガード + 初期データフェッチ + 共通レイアウト
    <BasicLayout>           ← サイドバー + メインコンテンツのレイアウト
      <Outlet />            ← 各ページがここにレンダリングされる
    </BasicLayout>
  </PrivateRoute>
</AppRootProviders>
```
 
- `PrivateRoute` が認証ガード、初期データフェッチ、共通レイアウトの3つの責務を担う。
- 未認証時はデータフェッチ完了まで `null` を返すことでローディング制御。
- 認証不要ルート（エラーページ）は `PrivateRoute` の外側に配置。
### 4.3 認証ガードの配置場所
 
- **ルートレベル**: `PrivateRoute` コンポーネント内で `useAuthContext()` を使用。
- **外部認証基盤**: OIDC (OpenID Connect) を使用。`oidc-c-ts` + `react-oidc-context` で抽象化。
- **認証ハンドラ**: `AuthRouteHandler` がトークンリフレッシュ、未認証リダイレクト、セッション管理を一元化。
- **初期化フロー**: 認証成功後、`useAtomActionCallback` で Jotai Atom に初期データ（ユーザー情報、ライセンス、テナント設定等）を一括セット。
### 4.4 モバイルアプリのルーティング特殊パターン
 
- `ts-pattern` の `match` を使った**URLパラメータベースの型安全なルート分岐**。
- ファイルIDの正規表現パターン（`/^f[0-9]+$/`）でリソース種別を判定し、異なるページコンポーネントへ振り分け。
## 5. ビルド・TypeScript 設計思想
 
### 5.1 TypeScript 設定
 
- **strict: true**: 厳格な型チェックを有効化。
- **moduleResolution: "bundler"**: 各アプリは bundler モード（Vite 最適化）。共通基盤は `"Node"` モード。
- **isolatedModules: true**: 型のみのインポートに制約を課し、ビルドの安全性を確保。
- **noEmit: true**: TypeScript はビルド時の型チェック用。Vite（esbuild/SWC）がトランスパイルを担当。
- **noErrorTruncation: true**: 全アプリで有効化。型エラーメッセージの省略を防ぎ、デバッグしやすくする。
### 5.2 パスエイリアスの設計
 
```
@core/*     → packages/service/src/*      # 全アプリ共通の基盤
@shared/*   → shared/src/*                # アプリ間共有
@app/*      → app/src/*                   # アプリ固有（自分自身）
```
 
- 各アプリは `@core` と `@shared` を共通参照し、自分自身を `@app`（例：`@ap`, `@ap-c-sp`）で参照。
- `tsconfig.json` の `paths` と `vite.config.ts` の `resolve.alias` で二重定義（型チェック用とビルド用の両方で解決する必要があるため）。
- **共通基盤の `tsconfig.json` を `extends` で継承**: 各アプリの tsconfig は共通基盤の設定を継承し、パスエイリアスとアプリ固有設定のみオーバーライド。
### 5.3 ESLint の設計思想
 
- **Flat Config 形式**: ESLint v9 の新しい設定形式を採用。共通基盤が `eslint.config.js` を定義し、各アプリがそれを import して拡張。
- **`react-you-might-not-need-an-effect`**: 不要な `useEffect` の使用を機械的に検出する ESLint プラグイン。8つのルールすべてを `error` で有効化し、派生状態の計算や状態の連鎖更新を防止。
- **`exhaustive-deps` のカスタムフック対応**: `useSemaphoreCallback`, `useAtomActionCallback` 等の独自フックも依存配列チェックの対象に追加。
- **`import/no-restricted-paths`**: アプリ間の直接参照を禁止するESLintルール。例えばデスクトップアプリからモバイルアプリのコードを参照するとエラー。共通モジュールへの移動を強制。
- **`import/order`**: import 文の並び順を `internal → relative → builtin → external` の順でアルファベット順に統一。
- **命名規約の統一**: `@typescript-eslint/naming-convention` で変数・関数・クラス・インターフェース・列挙型の命名規約を強制。
### 5.4 ビルド設定
 
- **Vite のモードベースビルド**: `--mode loc`, `--mode dev`, `--mode prd` でビルドモードを切り替え。環境変数ファイル（`.env.loc`, `.env.dev`, `.env.prd`）による設定切り替え。
- **MSW の本番除外**: カスタム Vite プラグイン `removeMSW` で、本番ビルド時に `mockServiceWorker.js` を自動削除。
- **API プロキシ**: 開発サーバーで `server.proxy` により、API パス（`/d/api`, `/auth/v1` 等）をバックエンドにプロキシ。
- **Volta によるNode.jsバージョン固定**: `volta.node` でチーム全体のNode.jsバージョンを統一。
### 5.5 テスト設定
 
- **Vitest の workspace プロジェクト機能**: ルートの `vitest.config.mts` で全アプリのテストを `projects` として一元管理。各アプリの `vite.config.ts` をそのまま拡張してテスト設定を定義。
- **jsdom 環境**: 全アプリで `environment: "jsdom"` を使用し、ブラウザAPIをシミュレート。
- **globals: true**: `vi`, `expect`, `describe`, `it` 等をインポート不要で使用可能に。
- **VRT（Visual Regression Testing）**: Storybook + storycap でスナップショットを取得し、reg-suit で差分検出。Slack通知連携。
## 6. 設計思想のまとめ
 
このプロジェクトを貫いている設計思想は以下の5点に集約される。
 
1. **「共通基盤を git submodule で分離し、pnpm workspace でアプリ群を束ねる」モノレポ戦略**。複数のユーザー向けアプリ（デスクトップ/モバイル/管理/外部）が同一リポジトリに共存しつつ、UIコンポーネントライブラリや認証基盤は別リポジトリで独立管理される。ESLint ルールでアプリ間の直接参照を禁止し、共通化の昇格フローを制度的に強制している。
2. **「Jotai Atom + State/Action カスタムフック」による状態管理の責務分離**。グローバル状態は Jotai のアトミックモデルで管理し、`useXxxState`（読み取り専用）と `useXxxAction`（API呼び出し + 書き込み）に分離するパターンを全アプリで統一。これにより、UIコンポーネントは状態読み取りのみに依存し、ビジネスロジックの変更がUI層に波及しにくい構造を実現している。
3. **「不要な useEffect を排除する」React の正道を機械的に強制する仕組み**。`react-you-might-not-need-an-effect` ESLint プラグインの全ルールを error レベルで有効化し、派生状態の計算、状態の連鎖更新、イベントハンドラ内での処理を `useEffect` で書くことを禁止。React 公式ドキュメントの "You Might Not Need an Effect" 思想をチーム全体で徹底している。
4. **「ページコロケーション + 横断 features」のハイブリッド分割**。ページ固有のコンポーネントとフックはページディレクトリ内にコロケーション（同置）し、複数ページから参照されるロジックは `features/` や `@shared`, `@core` に段階的に昇格する。「近くに置く、遠くは共有する」という実用的な配置原則。
5. **「並行実行制御とローディングの一元化」による堅牢なUX**。Semaphore パターン（`useSemaphoreCallback`）で重複操作を防止し、`withAppLoading` でローディング状態を自動管理。API エラーは型クラス（`ApiError`）で構造化し、エラーコード別のハンドリングを一箇所に集約。ユーザー操作の安全性とエラー復帰の予測可能性を設計レベルで担保している。
 ーション（同置）し、複数ページから参照されるロジックは `features/` や `@shared`, `@core` に段階的に昇格する。「近くに置く、遠くは共有する」という実用的な配置原則。
5. **「並行実行制御とローディングの一元化」による堅牢なUX**。Semaphore パターン（`useSemaphoreCallback`）で重複操作を防止し、`withAppLoading` でローディング状態を自動管理。API エラーは型クラス（`ApiError`）で構造化し、エラーコード別のハンドリングを一箇所に集約。ユーザー操作の安全性とエラー復帰の予測可能性を設計レベルで担保している。
 