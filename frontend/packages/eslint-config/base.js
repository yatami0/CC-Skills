// @repo/eslint-config — 共有 ESLint flat config（設計 §3.2 / §3.7）。
// 機械ゲートをここに内包し、各アプリは import するだけで全ルールが効く。
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import i18next from 'eslint-plugin-i18next';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

// Tailwind 任意値（w-[137px] / bg-[#fff] / text-[14px]）を表すパターン。
// className 文字列・cn/clsx/cva 等の引数内でこの形を禁止する（§3.7）。
const TW_ARBITRARY = /-\[[^\]]+\]/;

/**
 * 機械ゲート（設計 §3.7）。全アプリへ一括適用する共通ルール。
 * @type {import('eslint').Linter.Config[]}
 */
export const baseConfig = tseslint.config(
  {
    // 生成物は lint / フォーマット対象外（経路は no-restricted-imports で固定 §3.5）。
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/next-env.d.ts',
      '**/coverage/**',
      '**/storybook-static/**',
      '**/src/generated/**',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      'react-hooks': reactHooks,
      i18next,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // --- Rules of Hooks・依存配列の網羅 ---
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // --- fetch 直書き禁止（mutator のみ例外 §3.5）---
      // window.fetch / globalThis.fetch 経由も含め確実に塞ぐ。
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='fetch']",
          message:
            'fetch の直書きは禁止です。API 呼び出しは生成 client / hooks 経由（実 fetch は src/lib/api の mutator のみ §3.5）。',
        },
        {
          selector:
            "MemberExpression[object.name=/^(window|globalThis)$/][property.name='fetch']",
          message:
            'window.fetch / globalThis.fetch も禁止です。mutator 経由で呼んでください（§3.5）。',
        },
        // --- Server Actions 禁止（'use server'）§3.7 ---
        {
          selector: "ExpressionStatement > Literal[value='use server']",
          message:
            "Server Actions（'use server'）は禁止です。データ更新は BFF + 生成 mutation 経由で行ってください（§3.7）。",
        },
        // --- Tailwind 任意値（w-[137px]）禁止 §3.7 ---
        // eslint-plugin-tailwindcss は v4 CSS-first + pnpm で設定解決が壊れるため、
        // config 不要の構文ベースで同等の禁止を実現する（DoD で発火確認済み）。
        {
          selector: `JSXAttribute[name.name='className'] Literal[value=${TW_ARBITRARY}]`,
          message:
            'Tailwind 任意値（例: w-[137px]）は禁止です。色・余白は @repo/tailwind-config のトークンを使ってください（§3.7）。',
        },
        {
          selector: `JSXAttribute[name.name='className'] TemplateElement[value.raw=${TW_ARBITRARY}]`,
          message:
            'Tailwind 任意値（例: w-[137px]）は禁止です。@repo/tailwind-config のトークンを使ってください（§3.7）。',
        },
        {
          selector: `CallExpression[callee.name=/^(cn|clsx|cva|classnames|tw)$/] Literal[value=${TW_ARBITRARY}]`,
          message:
            'Tailwind 任意値（例: w-[137px]）は禁止です。@repo/tailwind-config のトークンを使ってください（§3.7）。',
        },
      ],

      // --- src/generated/ 経路固定・手書き禁止 §3.5 ---
      // API アクセスは生成 client / hooks 経由に固定する。mutator（唯一の実 fetch 点）を
      // feature コードから直接叩くのを禁止し、「fetch は mutator 1 か所」の経路を守る。
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/lib/api/mutator', '@/lib/api/mutator'],
              message:
                'mutator を直接 import しないでください。API 呼び出しは src/generated の生成 client / hooks 経由です（§3.5）。',
            },
          ],
        },
      ],

      // _ 始まりの未使用変数（意図的な破棄）は許可する。
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // --- 文言ハードコード禁止 §3.7（基盤では warn から開始してよい）---
      'i18next/no-literal-string': 'warn',
    },
  },
  // generated への import 制限は mutator・テストでは緩める必要は無い。
  // mutator の fetch 例外はアプリ側 eslint.config.js の override で付与する。
  prettier,
);

export default baseConfig;
