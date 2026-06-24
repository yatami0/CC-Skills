import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// テストランナーは Vitest、描画は RTL、jsdom を明示（設計 §3.6）。
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // 生成物・E2E は対象外。
    exclude: ['node_modules', '.next', 'tests/e2e', 'src/generated'],
    css: false,
  },
});
