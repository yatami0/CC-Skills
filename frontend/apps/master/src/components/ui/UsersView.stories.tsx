import type { Meta, StoryObj } from '@storybook/react';
import type { User } from '@/generated/model';
import { UsersView } from './UsersView';

const sampleUsers: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com' },
  { id: '2', name: 'Bob', email: 'bob@example.com' },
];

const meta = {
  title: 'ui/UsersView',
  component: UsersView,
} satisfies Meta<typeof UsersView>;

export default meta;
type Story = StoryObj<typeof meta>;

// 状態を story として 1 回だけ書き、Vitest（portable stories）・Storybook で使い回す（§3.6）。
export const Default: Story = {
  args: { users: sampleUsers },
};

export const Loading: Story = {
  args: { users: [], isLoading: true },
};

export const ErrorState: Story = {
  args: { users: [], isError: true },
};

export const Empty: Story = {
  args: { users: [] },
};
