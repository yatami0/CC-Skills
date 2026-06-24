import { composeStories } from '@storybook/react';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import * as stories from './UsersView.stories';

// portable stories: story を単一ソースに、Vitest が import してテスト実行（設計 §3.6）。
const { Default, Loading, ErrorState, Empty } = composeStories(stories);

test('Default: ユーザー一覧を表示する', () => {
  render(<Default />);
  expect(screen.getByText('Alice')).toBeInTheDocument();
  expect(screen.getByText('Bob')).toBeInTheDocument();
});

test('Loading: ローディングを表示する', () => {
  render(<Loading />);
  expect(screen.getByRole('status')).toBeInTheDocument();
});

test('ErrorState: エラーを表示する', () => {
  render(<ErrorState />);
  expect(screen.getByRole('alert')).toBeInTheDocument();
});

test('Empty: 空表示する', () => {
  render(<Empty />);
  expect(screen.getByText('No users')).toBeInTheDocument();
});
