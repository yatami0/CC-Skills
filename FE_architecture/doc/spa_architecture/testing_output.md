# テスト戦略ドキュメント
 
## テスト環境の全体像
 
| ツール | 役割 | 備考 |
|---|---|---|
| Vitest | テストランナー | globals モード（`vi`, `expect` を import なしで使用） |
| React Testing Library | コンポーネントテスト | `@testing-library/react`, `@testing-library/jest-dom` |
| MSW (Mock Service Worker) | API モック | テスト / Storybook / ローカル開発の3面で使用 |
| Storybook 9 | UI カタログ + インタラクションテスト | `@storybook/addon-vitest` でテスト統合 |
| reg-suit | ビジュアルリグレッションテスト | ap-sys で使用 |
| Playwright | ブラウザテスト | E2E テスト用 |
 
### テスト実行の構成
- ルートの `vitest.config.mts` で全プロジェクトを統合管理する
- 各サイト（ap-c, ap-c-sp, ap-sys, ap-delivery, ap-shared, packages/service）を独立した Vitest プロジェクトとして登録する
- `jsdom` 環境、CSS 有効、globals モード
## 責務分担マトリクス
 
| テスト種別 | 対象 | 責務 | テストしないもの |
|---|---|---|---|
| Unit（純粋関数） | utils, parsers, バリデーションスキーマ | 入出力の正当性 | — |
| Unit（hook） | カスタムフック（Action/State） | atom 更新の正当性、API 呼び出しの検証 | UI レンダリング |
| Unit（atom） | Jotai atom 単体 | 初期値、派生計算の正当性 | 副作用 |
| Component | UI コンポーネント | DOM 構造、表示テキスト、イベントハンドリング | API 通信 |
| Integration | 画面単位 | ページ全体のフロー、複数フックの連携 | E2E フロー |
| Visual Regression | Storybook stories | UI の見た目の変化検出 | ロジック |
| E2E | クリティカルフロー | ユーザーシナリオ全体 | 細かい分岐 |
 
### テスト対象から外すものの現場判断
- プレゼンテーションコンポーネントの単体テストは、Story で視覚確認する方針。ロジックを持たないため自動テストの費用対効果が低い
- API レスポンスの型検証は TypeScript の型チェックに委ねる
- CSS の詳細はビジュアルリグレッションテストでカバーする
## Jotai atom のテストパターン（詳細）
 
### パターン: useJotaiTestWrapper によるフックテスト
 
#### セットアップ
 
プロジェクト独自の `useJotaiTestWrapper` ヘルパーが次を提供する。
 
- `JotaiTestWrapper` は、テストごとに独立した Jotai ストア（`createStore()`）を生成し、`<Provider store={store}>` でラップするコンポーネント
- `preConditions` は、テスト前に atom へ初期値をセットする（モックデータの注入）
- `observeTargets` と `stateMockOf` は、指定した atom の値変更を `vi.fn()` で監視する

#### テストの書き方（擬似コード）
 
```
test("データ取得アクション実行後に一覧atomが更新される", async () => {
  // 1. テストラッパーを準備
  const { JotaiTestWrapper, stateMockOf } = useJotaiTestWrapper({
    observeTargets: [listAtom, loadingFlagAtom],
    preConditions: [
      { atom: userAtom, state: mockUserData },
      { atom: settingsAtom, state: mockSettings },
    ],
  })
 
  // 2. テスト対象のフックをレンダー
  const { result } = renderHook(() => useListAction(), {
    wrapper: JotaiTestWrapper,
  })
 
  // 3. アクション実行
  await act(async () => {
    await result.current.fetchList({ id: "test-id" })
  })
 
  // 4. atom の状態変化を検証
  expect(stateMockOf(listAtom)).toBeUpdatedWith(expectedListData)
  expect(stateMockOf(loadingFlagAtom)).toBeKeepDefault()
})
```
 
### カスタムマッチャー
 
| マッチャー | 検証内容 | 用途 |
|---|---|---|
| `toBeKeepDefault()` | atom がデフォルト値のまま更新されていない | 副作用が及ばないことの確認 |
| `toBeKeepPreState(expected)` | atom が前提条件の値のまま | preCondition で設定した値が変わっていないこと |
| `toBeUpdatedTimes(n)` | n 回更新された | 更新回数の検証 |
| `toBeUpdatedWith(v1, v2, ...)` | 指定された値の順序で更新された | 更新内容と順序の検証 |
| `toBeUpdatedWithIgnorePreCondition(...)` | 同上（前提条件セットを除外） | preCondition の初期セットを無視 |
 
### JotaiObserver の仕組み
- `useEffect` で atom の値変更を検知し、`onChange` モック関数を呼び出す
- 初回マウント時に必ず1回呼ばれるため、カスタムマッチャーは `calls.length - 1` で補正している
- テストごとに `createStore()` で新しいストアを生成するため、テスト間で状態が汚染されない
### 非同期 atom のテスト
- `loadable` でラップした atom は、`state === "hasData"` 時の `data` を検証する
- `act` と `waitFor` で非同期処理の完了を待つ
### atomFamily のテスト
- `preConditions` でパラメータ付き atom に初期値をセットする
- `observeTargets` にも同じパラメータ付き atom を指定する
## カスタムフックのテストパターン（詳細）
 
### renderHook の基本パターン
```
const { result } = renderHook(() => useTargetHook(), {
  wrapper: JotaiTestWrapper,  // Jotai Provider + Observer
})
 
// 返り値の検証
expect(result.current.someValue).toBe(expected)
 
// アクション実行
await act(async () => {
  await result.current.someAction()
})
```
 
### Provider ラッパーの構築
- Jotai Provider は `useJotaiTestWrapper` が自動で提供する
- 追加の Provider（AppStateProvider 等）が必要な場合は、`JotaiTestWrapper` の中に追加でラップする
### 依存フックのモック戦略
- `vi.mock` でモジュール全体をモックし、外部フック（ナビゲーション、API通信等）をモック化する
- `vi.mocked()` で型安全にモック関数を取得する。`const mockFn = vi.mocked(useMediaQuery)`
- `afterEach(() => mockFn.mockReset())` でテスト間のモックをリセットする
### vi.mock のパターン（擬似コード）
```
vi.mock("@core/hooks/useMediaQuery", async (importOriginal) => {
  const actual = await importOriginal<typeof import("...")>()
  return {
    ...actual,
    useMediaQuery: vi.fn(),  // 特定のエクスポートだけモック
  }
})
```
 
## コンポーネントテストの型
 
### クエリ優先順位
- `getByRole` を優先する（アクセシビリティ観点）
- `getByText` はラベルやボタンテキストの検証に使う
- `getByTestId` は最終手段
### アサート対象
- DOM の存在確認（`toBeInThapument()`）
- テキスト表示の検証（`toHaveTextContent()`）
- 属性の検証（`toBeDisabled()`, `toHaveAttribute()`）
- `@testing-library/jest-dom` のカスタムマッチャーを使う
### ユーザーイベント
- `@testing-library/user-event` の `userEvent` を使う
- `fireEvent` は低レベルイベントが必要な場合のみ
### 非同期 UI
- `findBy*` で要素の出現を待つ
- `waitFor` で条件が満たされるまでポーリングする
## API モック戦略（テスト観点）
 
### MSW セットアップ（テスト用）
```
// vitest.setup.ts
export const server = setupServer()
 
beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```
 
### ハンドラーのリセット戦略
- `afterEach(() => server.resetHandlers())` で各テスト後にハンドラーをリセットする
- テスト内で一時的にハンドラーを追加しても、次のテストに影響しない
### テスト内でのハンドラー差し替え
```
test("エラーケース", async () => {
  server.use(
    http.get("/api/endpoint", () => {
      return HttpResponse.json({ error: "..." }, { status: 500 })
    })
  )
  // テスト実行
})
```
 
### MSW vs vi.mock の使い分け
- MSW は API レイヤーのテストやインテグレーションテストに使う（実際の HTTP リクエストをインターセプトする）
- vi.mock は依存フックのモックやユーティリティ関数のモックに使う（モジュールレベルの差し替え）
- 原則として、API 通信は MSW、それ以外は vi.mock
### `onUnhandledRequest: "bypass"`
- 未定義のリクエストはエラーにせずスルーする設定
- テスト対象外の API 呼び出しを無視するための設計判断
## ファイル配置規約
 
### テストファイル
- フック隣接で `hooks/useXxxAction.test.tsx` に置く（フックと同じディレクトリ）
- コンポーネント隣接で `ComponentName.test.tsx` に置く（コンポーネントと同じディレクトリ）
- `__tests__/` ディレクトリは使っていない
### 命名規約
- `<対象名>.test.tsx`（React コンポーネント/フック）
- `<対象名>.test.ts`（純粋関数）
- Vitest の include パターン: `src/**/*.{test,spec}.?(c|m)[jt]s?(x)`
### テストユーティリティの配置
- `packages/service/src/tests/` に集約する
- `useJotaiTestWrapper.tsx` は Jotai テストラッパー
- `config/vitest.setup.ts` はグローバルセットアップ
- `config/vitest.jotai.customMatcher.ts` はカスタムマッチャー
- `jotaiMockMatchMedia.ts`, `jotaiMockResizeObserver.ts` はブラウザ API モック
## カバレッジの考え方
 
### 目標値
- プロジェクトとして明示的なカバレッジ目標値は設定していない（推測）
- カバレッジレポートの設定は vitest.config に含めていない
### カバレッジを追っていない領域
- プレゼンテーションコンポーネントは Storybook とビジュアルリグレッションで代替する
- スタイルは CSS Modules のテストを不要と判断した
- 一部レガシーコードは `/* c8 ignore */` コメントで明示的に除外する
## CI 運用
 
### テスト実行タイミング
- GitHub Actions で PR 時に実行する
- サイトごとに独立したワークフロー（deploy-xxx-xxx.yml が多数存在する）
- `pnpm -F <パッケージ名> test` で個別実行する
### pre-push フック
- `scripts/prepush.ts` でカスタムチェックを実行する
- lint とテストの組み合わせ（推測）
### Storybook テスト統合
- ap-sys では `setProjectAnnotations` で Storybook の設定をテストに適用する
- Portable Stories パターンで Story をテストとして実行できる
## 弱点補強メモ
 
### ロジックテストで押さえるべき原則
 
- atom の状態遷移をテストする。UI ではなく atom が期待通りに更新されるかに焦点を当てる。`useJotaiTestWrapper` とカスタムマッチャーで宣言的に書ける
- preConditions で前提条件を明示する。テスト対象外の atom にモック値を注入し、テスト対象のアクションだけを検証する
- observeTargets で副作用の範囲を確認する。更新されるべき atom だけでなく、更新されてはいけない atom も監視して `toBeKeepDefault` で検証する
- act と waitFor で非同期を制御する。Jotai の atom 更新は同期的だが、API 呼び出しを含むアクションは非同期なので、必ず `act` で包む
- テストごとにストアを独立させる。`createStore()` で毎回新しいストアを生成し、テスト間で状態が汚染されるのを防ぐ
### Jotai テストでよくハマるポイント
 
- JotaiObserver の初回呼び出しに注意する。`useEffect` の都合上、初回に1回呼ばれる。カスタムマッチャーはこれを考慮して `calls.length - 1` で補正している
- atomFamily の等価関数に注意する。テストでも本番と同じパラメータで atom を参照しないと、別インスタンスが生成される
- RESET の型制約に注意する。`atomWithReset` で定義していない atom に `RESET` を送ると型エラーになる
- 非同期 action のテストに注意する。`useAtomCallback` 内の async 処理は `act(async () => { await ... })` で包む必要がある
### 次プロジェクトで真似したい設計
 
- `useJotaiTestWrapper` パターン。createStore と Provider と Observer を共通化するヘルパーは、Jotai を使うどのプロジェクトでも再利用できる
- カスタムマッチャー。`toBeUpdatedWith` のような宣言的な検証で、テストが読みやすくなる
- MSW の3面共有。テスト / Storybook / ローカル開発でハンドラーを共有する設計で、モック管理のコストを減らせる
- Storybook テスト統合。Portable Stories で Story をそのままテストに使える仕組みで、テスト資産の二重管理を防ぐ