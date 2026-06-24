import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E（設計 §3.6）。
 *  - 本番相当ビルド（next build → next start）に対して実行。next dev は使わない。
 *  - 基盤時点はモック E2E（hermetic）。MSW を @msw/playwright でテスト層から注入する
 *    （アプリのビルドにモックを焼き込まない）。BFF proxy は通らない（ブラウザ横取り §3.6）。
 *  - 撮影はしない（機能リグレッションのみ）。ビジュアル回帰は採否未確定。
 */
const PORT = 3100;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
    screenshot: 'off',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // 本番相当ビルドに対して実行。NEXT_PUBLIC_API_MOCKING はブラウザ worker 用なので
    // ここでは立てない（E2E は @msw/playwright がテスト層から注入する）。
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: `http://127.0.0.1:${PORT}/api/health`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // server 枝 prefetch は自分の BFF（同一オリジン /api）を指す（§3.5 A案）。
      INTERNAL_API_BASE_URL: `http://127.0.0.1:${PORT}/api`,
      NEXT_PUBLIC_API_MOCKING: 'disabled',
    },
  },
});
