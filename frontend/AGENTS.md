# frontend — AI エージェント規約

本ファイルは frontend サブツリーの規約。Codex / Cursor / Copilot / Claude Code などが読む。
より近い `apps/<app>/AGENTS.md` があればそちらが勝つ（最も近いものが優先）。

## このリポジトリの土台（設計書 `設計.md` が正）

- pnpm workspace（root は `frontend/`）。モノレポツールは当面 Turborepo 不採用。タスク実行は
  `pnpm -r` / `pnpm --filter <app>`。
- 共有設定は `@repo/*` package に集約。`@repo/typescript-config` / `@repo/eslint-config` /
  `@repo/tailwind-config` を各 app が extends・import する。root に tsconfig は置かない。
- API は OpenAPI（`specs/<service>/API定義/openapi.yaml`）から **orval** で
  型 / client / TanStack Query hooks / MSW を生成する。生成物は `src/generated/`、**手書き禁止**。

## やること / やらないこと（線引き）

### データ取得は prefetch → hydrate が全画面の標準（§3.3.1）

- `'use client'` を書かない `page.tsx` は RSC。**`page.tsx` は薄い prefetch テンプレに限定**する。
  データ取得・更新・フィルタ・ソート・mutation のロジックは **全て `〇〇Client.tsx`（Client）に集約**する。
  実装者（AI 含む）が触るのは `〇〇Client.tsx` のみ。
- prefetch は `prefetchQuery(getXxxQueryOptions(...))` を使う。`page.tsx` の prefetch と
  Client の `useQuery` には **同一の生成物 `getXxxQueryOptions()`** を渡す（queryKey/queryFn の一致を
  生成物の共有で機械保証し、二重フェッチを防ぐ）。
- Client フックは `useQuery` を既定とする（`isPending` / `isError` で明示分岐）。

### 禁止事項（機械ゲートで強制。§3.7）

- `fetch` の直書き禁止。実 `fetch()` は `src/lib/api/mutator.ts` のみ。API は生成 client / hooks 経由。
- `src/generated/` の手書き禁止（再生成で上書きされる。CI が drift 検出）。
- Server Actions（`'use server'`）禁止。更新は BFF + 生成 mutation 経由。
- Tailwind 任意値（`w-[137px]`）禁止。色・余白は `@repo/tailwind-config` のトークンを使う。
- 文言ハードコード禁止（i18n キー経由。基盤では warn）。

### BFF / 認証（§3.4 / §3.5 / §4.5）

- ブラウザは same-origin の `/api` のみ叩く。backend の絶対 URL・トークンはブラウザに出さない。
- mutator は環境分岐（`typeof window`）。client 枝は `/api` + `credentials:'include'`、
  server 枝（RSC prefetch）は絶対 base + RSC 側 `cookies()` から取った cookie を per-call options で注入。
- backend 用トークン付与は BFF（`app/api/[...path]/route.ts`）の責務（唯一のトークン付与点）。

## コマンド

```bash
pnpm dev                 # 開発サーバ（master）
pnpm -r gen:api          # OpenAPI codegen（orval）
pnpm -r typecheck        # tsc --noEmit
pnpm -r lint             # ESLint（機械ゲート）
pnpm -r test             # Vitest
pnpm -r build            # next build
pnpm -r e2e              # Playwright（モック E2E）
```

機械強制ルールの本体は `@repo/eslint-config` / `@repo/typescript-config`。散文の補足は
`docs/conventions/`、人間向け手順は `CONTRIBUTING.md` を参照。
