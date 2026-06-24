import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { cookies } from 'next/headers';
import { getGetUsersQueryOptions } from '@/generated/api/users/users';
import UsersClient from './UsersClient';
import { getQueryClient } from '@/lib/query/get-query-client';

// RSC。薄い prefetch テンプレの定型（設計 §3.3.1）。実装者は基本ここを触らない。
// server 枝の prefetch は A 案: RSC 側で cookies() から取った cookie を per-call options で
// 注入し、mutator → BFF（/api）へ転送する（§3.5）。
export const dynamic = 'force-dynamic';

export default async function Page() {
  const queryClient = getQueryClient();
  const cookie = (await cookies()).toString();

  // prefetchQuery は queryFn をサーバーで走らせる。エラーは内部で握られ throw しない
  // （backend 未提供でもページは落ちず、クライアントが再取得する）。
  await queryClient.prefetchQuery(
    getGetUsersQueryOptions(
      { page: 1, perPage: 20 },
      { request: { headers: { cookie } } },
    ),
  );

  return (
    <main className="p-4">
      <HydrationBoundary state={dehydrate(queryClient)}>
        <UsersClient />
      </HydrationBoundary>
    </main>
  );
}
