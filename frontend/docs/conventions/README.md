# conventions — 補足の散文

機械強制ルール（lint / tsconfig / Tailwind）の本体は `@repo/eslint-config` /
`@repo/typescript-config` / `@repo/tailwind-config` に置く（設計 §4.3）。
ここには **lint で縛れない補足の散文のみ** を置く。

## queryKey / queryOptions

- queryKey は orval 生成物（`getXxxQueryOptions()` / `getXxxQueryKey()`）を唯一の源とする。
  手で queryKey を組み立てない。invalidate には `getXxxQueryKey()` を流用する。
- `page.tsx` の `prefetchQuery` と Client の `useQuery` には **同一の `getXxxQueryOptions()`** を渡す
  （二重フェッチを構造的に防ぐ。§3.3.1）。
- orval の `override.query.queryKey` は **有効化しない**（`getXxxQueryOptions` がフック形へ変わり
  server prefetch が壊れる。orval#1986 / §3.5）。

## read 用途の POST

- 検索・複雑な絞り込み body を取る「実質 read だが POST」は、`orval.config.ts` の per-operation
  override（`query: { useQuery: true, useMutation: false }`）で query 生成へ切り替え、GET と同一の
  prefetch → hydrate 経路に乗せる。
- 対象 operation の判定基準（operationId を `orval.config.ts` に列挙する等）はチームで合意して固定する。
