# TypeScript 規約

## 出典(一次ソース)
- TypeScript 公式 tsconfig `strict`: https://www.typescriptlang.org/tsconfig#strict
- 型は静的でコンパイル時のみ(公式ハンドブック)

## tsconfig 設定(本プロジェクトの実設定)
- `strict: true` … 厳格な型チェックでコンパイル時にエラーを捕捉する。
- `moduleResolution` … 各アプリは `"bundler"`(Vite 最適化)、共通基盤 `@core` は `"Node"`。
- `isolatedModules: true` … 型のみインポートに制約を課しビルド安全性を確保。
- `noEmit: true` … 型チェック専用。トランスパイルは Vite(esbuild/SWC)。
- `noErrorTruncation: true` … 型エラーメッセージの省略を防ぐ(全アプリ)。
- 共通基盤の tsconfig を `extends` で継承し、各アプリは paths とアプリ固有設定だけ上書きする。

## 型の書き方
- `any` を避ける。不明型は union / generics / 最小の具体型で受ける。
- props / state は明示的に型(interface または type)を与える。
- API レスポンスは具体型で受ける(`02-api-contract.md`)。Zod スキーマからは `z.infer` で型導出。
- 型のみの import は `import type` を使う(`isolatedModules` 前提)。

## 命名と import の規約(ESLint で強制。出典: 本プロジェクト ESLint Flat Config)
- 命名規約は `@typescript-eslint/naming-convention` で変数 / 関数 / クラス / interface / enum を縛る。
- import 順は `import/order` で `internal → relative → builtin → external`、アルファベット順。

## カスタムフックの命名規則(責務を名前で表す。詳細は 06)
- `useXxxState()` は読み取り専用、`useXxxAction()` は書き込みとAPIとエラー、`useXxxDrawer()` と `useXxxModal()` はUI制御、`useXxxRedirect()` はナビゲーション。

## 強制
- `tsc --noEmit`(strict)を型チェックとしてコミット前 / CI で走らせる(`05-enforcement.md`)。
- 機械化できる規約は @typescript-eslint に寄せ、本ファイルには意図だけ残す。
