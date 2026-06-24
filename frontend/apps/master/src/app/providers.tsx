'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { clientEnv } from '@/lib/env/client';
import { getQueryClient } from '@/lib/query/get-query-client';

// 'use client' で QueryClientProvider を置き、ブラウザ singleton client を取得（設計 §3.3）。
// getQueryClient() を使い、useState 初期化での二重管理・suspend 時の client 破棄を避ける。
export default function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  // ローカル手動開発のみ: env フラグが有効なときだけ MSW browser worker を起動（§3.6）。
  // フラグが無効なら worker.start() を呼ばない（本番ビルドでモックは動かない）。
  useEffect(() => {
    if (clientEnv.NEXT_PUBLIC_API_MOCKING !== 'enabled') return;
    void import('@/mocks/browser').then(({ startWorker }) => startWorker());
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
