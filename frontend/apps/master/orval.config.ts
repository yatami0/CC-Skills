import { defineConfig } from 'orval';

/**
 * OpenAPI codegen パイプライン（設計 §3.5）。
 * 入力は specs 内の対応サービス仕様（自分のサービスのものを相対参照）。
 * orval に一本化し、1 本の OpenAPI から 型 / client / TanStack Query hooks / MSW を生成する。
 *
 * 固定事項:
 *  - httpClient: 'fetch'。実 fetch は手書き mutator（src/lib/api/mutator.ts）1 か所のみ。
 *  - override.query.queryKey は有効化しない。有効化すると getXxxQueryOptions がフック形へ
 *    変わり prefetchQuery / ensureQueryData（server prefetch）が壊れる（orval#1986 §3.3.1）。
 *  - read 用途の POST（searchUsers）は per-operation override で query 生成へ切り替え、
 *    GET と同一の prefetch → hydrate 経路に乗せる（§3.3.1）。
 */
export default defineConfig({
  master: {
    input: {
      target: '../../../specs/master/API定義/openapi.yaml',
    },
    output: {
      mode: 'tags-split',
      target: './src/generated/api',
      schemas: './src/generated/model',
      client: 'react-query',
      httpClient: 'fetch',
      // MSW handlers を契約と整合した形で生成（§3.6）。
      mock: true,
      clean: true,
      // 生成物は lint / フォーマット対象外（§3.5）。orval 側の prettier も無効。
      prettier: false,
      override: {
        // 実 fetch・base URL・認証注入を 1 か所に吸収する手書き mutator（§3.5）。
        mutator: {
          path: './src/lib/api/mutator.ts',
          name: 'customFetch',
        },
        query: {
          useQuery: true,
          signal: true,
          // queryKey override は有効化しない（§3.3.1 / §3.5）。
        },
        operations: {
          // read 用途の POST。mutation 生成を抑止し同名関数衝突を回避して query へ寄せる。
          searchUsers: {
            query: {
              useQuery: true,
              useMutation: false,
            },
          },
        },
      },
    },
  },
});
