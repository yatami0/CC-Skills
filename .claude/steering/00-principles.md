# 設計思想

## 出典(一次ソース)
- Anthropic Claude Code Best practices: https://code.claude.com/docs/en/best-practices
- React 公式 "You Might Not Need an Effect": https://react.dev/learn/you-might-not-need-an-effect
- Atomic Design (Brad Frost): https://atomicdesign.bradfrost.com/
- Colocation (Kent C. Dodds): https://kentcdodds.com/blog/colocation

## このプロジェクトを貫く設計思想
- モノレポ戦略。共通基盤を git submodule(`@core`)で分離し、pnpm workspace でアプリ群を束ねる。アプリ間の直接参照は ESLint で禁止し、共通化の昇格フローを仕組みで強制する。
- 状態管理の責務分離。グローバル状態は Jotai のアトミックモデルで持ち、読み取り専用 `useXxxState` と書き込み `useXxxAction` を分ける。UIは読み取りだけに依存させ、ロジック変更がUIへ波及するのを抑える。
- 不要な useEffect の排除。`react-you-might-not-need-an-effect` の全ルールを error にし、派生状態の計算/状態の連鎖更新/イベントハンドラ内処理を `useEffect` で書くことを禁じる(React 公式準拠)。
- 層で基準を分ける配置。粒度で整理するのはライブラリ層(`@core` = Atomic Design)、利用範囲で配置するのはアプリ層(ページコロケーション)。
- 並行制御とローディング/エラーの一元管理。`useSemaphoreCallback` で重複操作を防ぎ、`withAppLoading` でローディングを自動切替し、`ApiError` でエラーを構造化する。

## 開発の進め方の原則(Claude Code Best practices 準拠)
- 不確実なら実装せず質問する。スコープ拡大は提案にとどめ、勝手に実行しない。
- 検証手段のないものはマージしない。すべての変更にテスト/型/lint いずれかの合否シグナルを伴わせる(Give Claude a way to verify its work)。
- 探索→計画→実装→コミットを分ける。複数ファイルにまたがる箇所や不慣れな箇所は plan mode を使う(Explore first, then plan, then code)。
- 過剰設計を避ける。レビュー指摘の全消化を目的にしない。正しさと要件に効く指摘だけ対応する。

## やってはいけないこと
- 未承認の依存ライブラリ追加(依存はルート `package.json` に集約。各アプリの package.json はスクリプトのみ)
- API 型(`@core/external/api`)の暗黙変更
- アプリ間の直接 import
- スコープ外モジュールへの変更
- アプリ直下への `components/` `dialogs/` `hooks/` の新設
