import { z } from 'zod';

// クライアントに出してよい env のみ（NEXT_PUBLIC_*）。設計 §4.5。
// Next は NEXT_PUBLIC_* をビルド時にインライン化するため、明示的に参照する。

const clientEnvSchema = z.object({
  // ローカル手動開発でブラウザ MSW worker を起動するかのゲート（§3.6）。
  NEXT_PUBLIC_API_MOCKING: z.enum(['enabled', 'disabled']).default('disabled'),
});

export const clientEnv = clientEnvSchema.parse({
  NEXT_PUBLIC_API_MOCKING: process.env.NEXT_PUBLIC_API_MOCKING,
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
