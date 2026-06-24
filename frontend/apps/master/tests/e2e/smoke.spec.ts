import { test, expect } from './fixtures';

// 基盤の疎通スモーク（設計 §3.6「基盤での扱い」/ DoD）。マスタ CRUD E2E は後続。

test('トップページがモック /api/users 経由でユーザー一覧を描画する', async ({ page }) => {
  await page.goto('/');
  // クライアントが /api/users を取得（@msw/playwright がブラウザ層で応答）→ list が出る。
  await expect(page.getByRole('list')).toBeVisible({ timeout: 15_000 });
});

test('ヘルスチェックが応答する', async ({ page }) => {
  const res = await page.request.get('/api/health');
  expect(res.ok()).toBeTruthy();
  expect(await res.json()).toMatchObject({ status: 'ok' });
});
