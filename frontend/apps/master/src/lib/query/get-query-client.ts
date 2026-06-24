import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from '@tanstack/react-query';
import { GC, STALE } from './cache';

// TanStack Query 公式 Advanced Server Rendering ガイダンスに準拠（設計 §3.3）。
// server で QueryClient を使い回すとリクエスト間・ユーザー間でデータが混ざるため固定する。

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 必須: グローバル staleTime > 0（§3.3）。ハイドレーション直後の即 refetch を防ぐ。
        staleTime: STALE.DEFAULT,
        gcTime: GC.DEFAULT,
      },
      dehydrate: {
        // prefetch 中（pending）の query も dehydrate し、サーバーで開始した取得を
        // クライアントへ引き継ぐ（公式 Advanced SSR）。
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
      },
    },
  });
}

let browserClient: QueryClient | undefined;

/**
 * server: リクエスト毎に新規（公式 example の isServer ファクトリ方式）。
 * browser: singleton。getQueryClient() でブラウザ client を取得し二重管理を避ける（§3.3）。
 */
export function getQueryClient(): QueryClient {
  if (isServer) {
    return makeQueryClient();
  }
  if (!browserClient) {
    browserClient = makeQueryClient();
  }
  return browserClient;
}
