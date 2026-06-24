'use client';

import { useGetUsers } from '@/generated/api/users/users';
import { UsersView } from '@/components/ui/UsersView';

// ぜんぶ Client（設計 §3.3.1）。実装者はここだけ触る。
// page.tsx と同一の生成物（getGetUsersQueryOptions 経由の useGetUsers）を使い、
// queryKey/queryFn を生成物の共有で一致させる（二重フェッチ防止）。
export default function UsersClient() {
  const { data, isPending, isError } = useGetUsers({ page: 1, perPage: 20 });

  return (
    <UsersView
      users={data?.data.items ?? []}
      isLoading={isPending}
      isError={isError}
    />
  );
}
