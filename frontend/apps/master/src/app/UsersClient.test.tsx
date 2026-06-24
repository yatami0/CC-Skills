import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { expect, test } from 'vitest';
import UsersClient from './UsersClient';

// 核となる疎通スモーク（設計 §3.6 / DoD）。
// mutator → TanStack Query → 生成 hook → UI のコードパスを MSW（node）越しに走らせる。
function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

test('mutator + 生成 hook + MSW で /api/users を取得して表示する', async () => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  render(<UsersClient />, { wrapper: wrapper(client) });

  // 最初は loading（isPending）。
  expect(screen.getByRole('status')).toBeInTheDocument();

  // MSW 生成 handler（*/users）が応答 → 一覧（list）が描画される。
  await waitFor(
    () => expect(screen.getByRole('list')).toBeInTheDocument(),
    { timeout: 5000 },
  );
});
