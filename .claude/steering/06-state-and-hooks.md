# 状態管理とフックの規約

このプロジェクトで特に外せない規約。Jotai による状態管理と、カスタムフックの責務分離を定める。

## 出典
- Jotai 公式: https://jotai.org/(本プロジェクト採用 `^2.10.3`)
- React 公式 "You Might Not Need an Effect": https://react.dev/learn/you-might-not-need-an-effect

## 状態管理(Jotai)
- グローバル状態は Jotai Atom で持つ。状態はすべて `store/`(`@app/store/` または `@core/store/`)で定義する。
- ページ配下に store を置かない。状態定義はグローバルに集約する。
- 読み取りと書き込みのフックを分離する(下記)。

## カスタムフックの責務(命名で責務を表す)
| 命名パターン | 責務 | 層 |
| --- | --- | --- |
| `useXxxState()` | Atom の読み取り専用ラッパー | 状態読み取り |
| `useXxxAction()` | API呼び出し + Atom 更新 + エラーハンドリング | ビジネスロジック |
| `useXxxDrawer()` / `useXxxModal()` | モーダル/ドロワーの開閉(排他制御付き) | UI制御 |
| `useXxxRedirect()` | URLクエリに基づくリダイレクト | ナビゲーション |

- 読み取りだけのコンポーネントは `useXxxState` のみに依存させ、書き込みロジックへ依存させない(不要な再レンダリングを抑える)。
- ページのドメインロジックは `pages/XxxPage/hooks/` に集約する。`XxxPage.tsx` 本体はフックを呼んで結果を並べるだけ。

## API と状態のルール(再掲。厳守する)
- API 呼び出しは hooks 内のみ。ページ/コンポーネントから直接 fetch しない。
- API クライアントは純粋関数(React 非依存)。これを `useXxxAction` が呼び出す(`02-api-contract.md`)。

## 並行実行制御 / ローディング / エラー(一元化パターン)
- `useSemaphoreCallback()` … ユーザー操作の重複実行を防ぐセマフォ。連打や連続ナビゲーションを安全にブロックする。
- `useAtomActionCallback()` … Jotai `useAtomCallback` をラップし依存配列の安定性を保証する。
- `withAppLoading()` … API 呼び出しを囲むだけでローディング表示を自動切替する。
- `p-limit` … 並行リクエスト数を制限する(例: ファイルアップロードの同時実行数)。
- エラーは `ApiError` で構造化し、`useErrorAction` / `useXxxErrorHandlingAction` に一元化する。

## useEffect の禁止(機械強制あり)
- 派生状態の計算 / 状態の連鎖更新 / イベント処理を `useEffect` で書かない。
- これらは `react-you-might-not-need-an-effect`(全ルール error)で検知される(`05-enforcement.md`)。
- 派生値はレンダー中に計算する。副作用はイベントハンドラへ。最終手段としてのみ `useEffect` を使う。

## フォーム
- React Hook Form + Zod(`@hookform/resolvers`)。バリデーションは Zod に統一する(`02-api-contract.md`)。
