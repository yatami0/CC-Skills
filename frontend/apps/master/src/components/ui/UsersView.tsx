import type { User } from '@/generated/model';

// アプリ固有の表示コンポーネント（設計 §2.2）。データ取得を持たない純粋な表示。
// 状態（loading / error / empty）を story として 1 回だけ定義し使い回す（§3.6）。
export interface UsersViewProps {
  users: User[];
  isLoading?: boolean;
  isError?: boolean;
}

export function UsersView({ users, isLoading, isError }: UsersViewProps) {
  if (isLoading) {
    return (
      <p role="status" className="text-brand-600">
        Loading…
      </p>
    );
  }
  if (isError) {
    return (
      <p role="alert" className="text-brand-700">
        Failed to load users
      </p>
    );
  }
  if (users.length === 0) {
    return <p className="text-surface-muted">No users</p>;
  }
  return (
    <ul className="flex flex-col gap-2">
      {users.map((user) => (
        <li key={user.id} className="rounded-card bg-surface-muted p-2">
          {user.name}
        </li>
      ))}
    </ul>
  );
}
