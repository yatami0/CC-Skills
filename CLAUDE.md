# <プロジェクト名> フロントエンド

React 19 + TypeScript のモノレポ。pnpm workspace でアプリ群を束ね、共通基盤 `@core`(`packages/service`)は git submodule。
バックエンドは外部APIとして提供される。本リポジトリはその型インターフェースを `@core/external/api` に定義して消費するだけで、API仕様自体は持たない。

## アプリ構成
- `@app`(`app/`) … メインアプリ。デスクトップ/モバイルを単一コードで統合(レスポンシブ)
- `@app-admin`(`app-admin/`) … 管理者向け
- `@app-ext`(`app-external/`) … 外部公開向け
- `@shared`(`shared/`) … アプリ間共有
- `@core`(`packages/service/`) … 全アプリ共通基盤(submodule)

## 作業前に必ず守ること
- 変更前に該当する steering を読む(下記)
- スコープ外のモジュールに触れない。触れる必要が出たら手を止めて報告する(`@.claude/steering/01-architecture.md`)
- アプリ間を直接 import しない。共有化は `@shared` / `@core` へ昇格させる(`import/no-restricted-paths` で強制)
- API の型(`@core/external/api`)を勝手に変えない。BE仕様が一次情報(`@.claude/steering/02-api-contract.md`)
- 一連の変更後は型チェック/lint/テストを必ず通す(`@.claude/steering/05-enforcement.md`)
- 実装前に plan mode で手順を出す。スコープが一文で書ける小変更だけ plan を省略してよい

## このリポジトリ固有のルール(詳細は steering)
- 状態は Jotai。読み取り `useXxxState` と書き込み `useXxxAction` を分ける(`@.claude/steering/06-state-and-hooks.md`)
- `useEffect` で派生状態/連鎖更新/イベント処理を書かない(`react-you-might-not-need-an-effect` 全ルール error)
- API 呼び出しは hooks 内のみ。ページ/コンポーネントから直接 fetch しない
- アプリ直下に `components/` `dialogs/` `hooks/` を置かない。すべて `pages/XxxPage/` 配下へ

## Steering
- 設計思想 → @.claude/steering/00-principles.md
- 構造の地図 → @.claude/steering/01-architecture.md
- API契約(型) → @.claude/steering/02-api-contract.md
- React 絶対ルール → @.claude/steering/03-react-rules.md
- TypeScript 規約 → @.claude/steering/04-typescript.md
- 強制ゲート → @.claude/steering/05-enforcement.md
- 状態管理とフック規約 → @.claude/steering/06-state-and-hooks.md

## コマンド
- 型チェック: `<記入: 例 pnpm typecheck>`(`tsc --noEmit`, strict)
- lint: `<記入: 例 pnpm lint>`(ESLint Flat Config v9)
- テスト: `<記入: 例 pnpm test>`(Vitest。全体ではなく単体を優先)
- E2E: `<記入: 例 pnpm e2e>`(Playwright)
