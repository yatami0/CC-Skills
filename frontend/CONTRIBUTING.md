# Contributing — frontend

人間向けの開発手順・PR ルール（エージェント向け規約は `AGENTS.md`）。

## セットアップ

```bash
# node / pnpm は mise.toml で固定（cd で自動切替）。
mise install        # 任意（mise 利用時）
pnpm install
pnpm -r gen:api     # OpenAPI から生成物を作る（初回必須）
pnpm dev            # http://localhost:3000
```

## ディレクトリ

- `apps/master` … マスタ管理サイト（現状唯一の app）。
- `packages/*` … 共有設定・ライブラリ（`@repo/*`）。
- API 契約は frontend 内ではなく `<repo-root>/specs/<service>/API定義/openapi.yaml`。

## 開発の基本（詳細は設計書 `設計.md`）

- 画面は **prefetch → hydrate**。`page.tsx` は薄テンプレ、ロジックは `〇〇Client.tsx`。
- API 呼び出しは生成 client / hooks 経由。`fetch` 直書き・`src/generated/` 手書きは禁止。
- スタイルは Tailwind v4 トークン（`@repo/tailwind-config`）。任意値は使わない。

## PR 前チェック（CI と同じゲート）

```bash
pnpm -r gen:api && git diff --exit-code   # codegen drift が無いこと
pnpm -r typecheck
pnpm -r lint
pnpm -r test
pnpm -r build
pnpm -r e2e                                # 初回は playwright install が必要
```

1 つでも落ちるとマージ不可。CI（`.github/workflows/frontend.yml`）が最終関門。

## ブラウザ MSW（手動モック開発）

```bash
pnpm --filter master msw:init             # public/mockServiceWorker.js を生成（初回）
NEXT_PUBLIC_API_MOCKING=enabled pnpm dev  # ブラウザ worker でモック起動
```
