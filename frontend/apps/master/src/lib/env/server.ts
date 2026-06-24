import 'server-only';
import { z } from 'zod';

// 環境変数はサーバー側に閉じ、検証して読む（設計 §4.5）。
// 秘匿情報（backend URL・トークン）はブラウザに出さない。

const serverEnvSchema = z.object({
  // BFF が透過する backend のベース URL（ブラウザには出さない）。
  BACKEND_API_BASE_URL: z.string().url().default('http://127.0.0.1:8080'),
  // server 枝 prefetch が自分の BFF を叩く絶対 base（§3.5 A案）。
  INTERNAL_API_BASE_URL: z.string().url().default('http://127.0.0.1:3000/api'),
  // セッション cookie 名（認可設計＝後続で確定。暫定既定）。
  SESSION_COOKIE_NAME: z.string().default('sid'),
});

export const serverEnv = serverEnvSchema.parse(process.env);
export type ServerEnv = z.infer<typeof serverEnvSchema>;
