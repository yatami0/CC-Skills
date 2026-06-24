// apps/master ESLint flat config。共有 @repo/eslint-config を import するだけで機械ゲートが効く（§3.7）。
import { nextJsConfig } from '@repo/eslint-config/next';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...nextJsConfig,
  {
    // fetch 直書き禁止の例外（§3.5 / §3.4）:
    //  - mutator（生成 client が通る唯一の実 fetch 点）
    //  - BFF proxy（backend へ透過する正規の outbound fetch 点）
    //  - テストセットアップ（jsdom/undici 整合のため globalThis.fetch を一時ラップする test 基盤）
    files: ['src/lib/api/mutator.ts', 'src/app/api/**/route.ts', 'src/test/**'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    // テスト・mock・story は文言ハードコードの制約を緩める。
    files: [
      '**/*.test.{ts,tsx}',
      '**/*.stories.{ts,tsx}',
      'src/mocks/**',
      'tests/**',
    ],
    rules: {
      'i18next/no-literal-string': 'off',
    },
  },
];
