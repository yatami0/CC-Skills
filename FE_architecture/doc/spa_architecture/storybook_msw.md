# Storybook設計 / MSW統合ドキュメント
 
## Storybookの利用目的
 
### このプロジェクトでの位置づけ
- UIカタログ: コンポーネントやページ、ダイアログの視覚的な一覧
- 開発時のサンドボックス: 画面単位で独立して開発や確認ができる環境
- インタラクションテストの基盤: Story をテストケースとして再利用する（Portable Stories）
- ビジュアルリグレッションテスト: reg-suit と連携する（ap-sys）
- テストコード生成: `storybook-addon-test-codegen` アドオン（ap-sys）
### Storybook のバージョン
- Storybook 9（`@storybook/react-vite`）
## 設定の思想
 
### main.ts の構成パターン
 
各サイトの `.storybook/main.ts` は以下の共通パターンを持つ:
 
1. stories 定義: `directory` と `titlePrefix` でサイトやパッケージ別にグルーピングする
2. addons: サイトごとに必要なアドオンを選択する
3. staticDirs: フォントや画像、スタイルの静的アセットを共通パスからマッピングする
4. viteFinal: プロジェクトの `vite.config.ts` をマージし、パスエイリアスを解決する
### サイト別の構成差異
 
| サイト | stories ソース | 主要アドオン | MSW 統合 |
|---|---|---|---|
| ap-sys | 自サイトのみ | addon-vitest, test-codegen, react-router | あり（msw-storybook-addon） |
| ap-c | 自サイト + packages | react-router | あり（msw-storybook-addon） |
| ap-shared | ap-c + ap-c-sp + ap-c-shared + packages | react-router | なし |
| ap-delivery | 自サイトのみ | — | あり（アプリ内MSW） |
 
### ap-shared Storybook の特殊性
- 4つのソース（ap-c, ap-c-sp, ap-c-shared, packages）の Story を統合表示する
- `titlePrefix` でソース別にグルーピングする（ap-c-PC-TB, ap-c-SP, PACKAGES 等）
- MSW は統合していない（Story レベルでのAPI モックは各サイト Storybook で確認する）
## Story ファイルの配置と命名
 
### 配置規約
- コンポーネントと同じディレクトリに配置する
- `<ComponentName>.stories.tsx` の命名にする
### 配置例
```
pages/NodePage/
├── NodePage.tsx
├── NodePage.stories.tsx    ← ここ
├── components/
└── hooks/
 
dialogs/FileDetail/
├── FileDetail.tsx
├── FileDetail.stories.tsx  ← ここ
├── components/
└── hooks/
 
components/apViewSwitchRadioGroup/
├── apViewSwitchRadioGroup.tsx
├── apViewSwitchRadioGroup.stories.tsx  ← ここ
└── styles.module.scss
```
 
### hygen テンプレートとの連携
- `pnpm -F <pkg> hygen:c` でコンポーネントを生成すると、`.stories.tsx` も自動生成される
- テンプレート: `_templates/components/with-prompt/component.stories.tsx.ejs.t`
## Story の書き方パターン
 
### パターン1: シンプルなプレゼンテーションコンポーネント
 
```typescript
import { Meta, StoryObj } from "@storybook/react-vite"
import { ComponentName } from "."
 
type T = typeof ComponentName
type Story = StoryObj<T>
 
export default {
  component: ComponentName,
} as Meta<T>
 
export const Default: Story = {}
export const WithProps: Story = {
  args: { variant: "primary", label: "テスト" },
}
```
 
### パターン2: レイアウト付きページコンポーネント
 
ページコンポーネントは、実際のアプリと同じレイアウト（サイドバー、ヘッダー等）で表示するため、`decorators` でラップする:
 
```typescript
export default {
  component: PageComponent,
  decorators: [
    (Story) => (
      <BasicLayout
        onDragOver={(e) => { e.dataTransfer.dropEffect = "none"; e.preventDefault() }}
        onDragEnter={(e) => { e.dataTransfer.dropEffect = "none"; e.preventDefault() }}
      >
        <LoadingOverlay />
        <BasicLayout.Aside>
          <Navigation />
        </BasicLayout.Aside>
        <Story />
      </BasicLayout>
    ),
  ],
  parameters: {
    reactRouter: reactRouterParameters({
      routing: { path: "/my" },
    }),
  },
} as Meta<T>
```
 
### パターン3: MSW ハンドラー付き Story
 
Story レベルで API レスポンスをモックする（ap-sys, ap-c で使用）:
 
```typescript
export const WithData: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/v1/resource", () => {
          return HttpResponse.json({ items: [...mockData] })
        }),
      ],
    },
  },
}
 
export const ErrorState: Story = {
  parameters: {
    msw: {
      handlers: [
        http.get("/api/v1/resource", () => {
          return HttpResponse.json({ error: "..." }, { status: 500 })
        }),
      ],
    },
  },
}
```
 
## Jotai 統合
 
### preview.tsx の Provider 構成
 
全サイトの `preview.tsx` で共通のパターン:
 
```typescript
decorators: [
  (Story) => (
    <Provider>                          {/* Jotai Provider */}
      <AppStateProvider                 {/* アプリ状態のContext Provider */}
        user={mockUserInfo}
        licenses={mockLicenses}
        tenant={mockTenantHeader}
      >
        <TooltipPortalProvider>
          <SnackbarProvider>
            <PortalTripleProvider>
              <PortalDoubleProvider>
                <PortalProvider>
                  <Story />
                </PortalProvider>
              </PortalDoubleProvider>
            </PortalTripleProvider>
          </SnackbarProvider>
        </TooltipPortalProvider>
      </AppStateProvider>
    </Provider>
  ),
  withRouter,                           {/* React Router */}
],
```
 
### 設計のポイント
- Jotai Provider: Storybook の各 Story が独立した Jotai ストアを持つ（`<Provider>` でラップする）
- モックデータ: `as unknown as T` で型キャストし、最小限のモックデータを注入する
- Portal 階層の再現: 実アプリと同じ Portal 階層を decorators で再現し、モーダルの表示をテストできるようにする
- Router: `storybook-addon-remix-react-router` でルーティングをシミュレートする
### Story 単位での atom 初期値
- 現時点では Story レベルでの atom 初期値のカスタマイズは限定的
- 必要な場合は decorator で `useHydrateAtoms` を使うか、MSW でデータを返して自然な flow で atom を更新させる
## MSW の統合設計
 
### 3つの利用面
 
| 利用面 | セットアップ | ハンドラー管理 |
|---|---|---|
| テスト（Vitest） | `setupServer()` in vitest.setup.ts | テスト内で `server.use()` |
| Storybook | `msw-storybook-addon` の `initialize()` + `mswLoader` | Story の `parameters.msw.handlers` |
| ローカル開発 | `setupWorker()` in msw/browser.ts | msw/index.ts に集約 |
 
### テスト用 MSW セットアップ
 
```typescript
// vitest.setup.ts
import { setupServer } from "msw/node"
 
export const server = setupServer()
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```
 
- `onUnhandledRequest: "bypass"`: 未定義のリクエストはスルーする（テスト対象外の API を無視する）
- `afterEach` でハンドラーをリセットする（テスト間の状態汚染を防止する）
### Storybook 用 MSW セットアップ
 
```typescript
// preview.tsx
import { initialize, mswLoader } from "msw-storybook-addon"
 
const preview: Preview = {
  beforeAll: () => {
    initialize({
      quiet: true,  // デバッグログ抑制
      onUnhandledRequest: (request, print) => {
        // 静的アセットは無視、それ以外は警告
        const isStaticAsset = /\.(ttf|woff|svg|png|...)$/i.test(url.pathname)
        if (!isStaticAsset) print.warning()
      },
    })
  },
  loaders: [mswLoader],
}
```
 
### ローカル開発用 MSW セットアップ（ap-delivery）
 
```typescript
// msw/setup.ts
export const enableMSW = async (isDevMode: boolean) => {
  if (!isDevMode) return
  const mock = await import("@ap-delivery/msw/browser")
  await mock.startWorker()
}
 
// msw/browser.ts
import { handlers } from "./index"
import { setupWorker } from "msw/browser"
export const worker = setupWorker(...handlers)
 
// msw/index.ts — ハンドラーを集約
export const handlers = [
  ...PostAccessCodeHandlers,
  ...GetDeliveryInformationHandlers,
  ...
]
```
 
### ハンドラーの配置規約（ローカル開発用）
 
API パスと1対1対応するディレクトリ構造:
```
msw/
├── d/api/v1/
│   ├── externalDeliveries/
│   │   ├── [externalId]/
│   │   │   ├── accessCodeEmail/sendAccessCodeEmail.ts
│   │   │   └── accessCodes/postAccessCode.ts
│   │   └── ...
├── g/api/v1/
│   └── webFrontErrorsByAccessCode/
├── browser.ts     ← setupWorker
├── index.ts       ← ハンドラー集約
└── setup.ts       ← 有効化関数
```
 
## インタラクションテスト戦略
 
### Portable Stories パターン（ap-sys）
 
ap-sys では `@storybook/addon-vitest` を使い、Story をそのままテストケースとして実行できる:
 
```typescript
// vitest.setup.ts
import projectAnnotations from "../../.storybook/preview"
import { setProjectAnnotations } from "@storybook/react-vite"
 
const { loaders, beforeAll, ...restProjectAnnotations } = projectAnnotations
setProjectAnnotations([restProjectAnnotations])
```
 
- Story の decorators, parameters がテストにも適用される
- MSW ハンドラーも Story 定義のものがテストで使われる
### テストコード生成
- `storybook-addon-test-codegen` アドオン（ap-sys）でテストコードの雛形を自動生成する
## ビジュアルリグレッションテスト
 
### reg-suit（ap-sys）
- Storybook のスクリーンショットをベースにビジュアル差分を検出する
- CI で自動実行する（PR 単位）
- 意図的な変更は承認フローで管理する
## ドキュメント機能
 
### Story as Documentation
- Story 自体がコンポーネントの使用例ドキュメントとして機能する
- `args` で props のバリエーションを示す
- `decorators` でコンテキスト（レイアウト、Provider）を示す
### ビューポート設定
- `INITIAL_VIEWPORTS` で端末ごとのビューポートを確認できる
- レスポンシブデザインの検証に使う
### 背景色設定
- サービスの基本背景色（`var(--c-primary-bg)`）をデフォルトに設定する
- 実際のアプリに近い見た目で確認する
## 原則とアンチパターンまとめ
 
### 原則
 
- Story はコンポーネントと同居する: 配置を分離しない。hygen で自動生成される構造に従う
- decorators で実環境を再現する: Provider 階層、レイアウト、Router を decorators で再現し、コンポーネントが動作する最小限の環境を構築する
- MSW は3面で共有設計にする: テスト / Storybook / ローカル開発でハンドラーを共有し、モック管理の一元化を目指す
- Jotai Provider を必ずラップする: Story ごとに独立したストアを持たせ、Story 間の状態汚染を防ぐ
- 静的アセットのリクエストは無視する: MSW の `onUnhandledRequest` でフォントや画像等の静的アセットリクエストを除外し、警告ノイズを減らす
### アンチパターン
 
- Story で実 API を呼ぶ: 外部依存を持つ Story は不安定になる。MSW でモックすること
- `as unknown as T` の多用: モックデータの型キャストは preview.tsx の共通設定のみに限定する。各 Story でキャストを乱用しない
- decorators の深いネスト: Provider が多すぎる場合は共通の `AppProviderDecorator` にまとめることを検討する
- Story 内でのビジネスロジック: Story はUI表示に集中し、複雑なロジックを書かない
- テスト用 MSW サーバーの共有: テストでは `setupServer()` を毎回の setup で生成し、テスト間の独立性を保つ
## 別プロジェクトに持ち込める考え方
 
### MSW の3面活用設計
テスト（Node.js）、Storybook（ブラウザ）、ローカル開発（ブラウザ）の3つの面で MSW ハンドラーを共有する設計は、モック管理のコストを大きく削減する。ハンドラーを API パスと1対1で対応させるディレクトリ構造も汎用的に使える。
 
### preview.tsx での Provider 一括設定
全 Story に共通する Provider（状態管理、ルーティング、i18n、Portal 等）を preview.tsx の decorators に集約する。個別の Story で Provider を書かない規約にする。
 
### Portable Stories によるテスト再利用
`setProjectAnnotations` で Storybook の設定をテストに持ち込み、Story をそのままテストケースとして活用する。テスト資産の二重管理を解消できる。
 
### 静的アセットの除外フィルター
MSW の `onUnhandledRequest` でフォントや画像のリクエストを正規表現でフィルターする。このパターンがないと、大量の警告ログで肝心の問題が埋もれる。
