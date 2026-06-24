// @repo/eslint-config/next — Next.js アプリ向け flat config。
import next from '@next/eslint-plugin-next';
import react from 'eslint-plugin-react';
import { baseConfig } from './base.js';

/**
 * @type {import('eslint').Linter.Config[]}
 */
export const nextJsConfig = [
  ...baseConfig,
  {
    plugins: {
      '@next/next': next,
      react,
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
    settings: {
      react: { version: 'detect' },
    },
  },
];

export default nextJsConfig;
