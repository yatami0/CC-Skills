import type { NextRequest } from 'next/server';
import { serverEnv } from '@/lib/env/server';

/**
 * BFF キャッチオール proxy（骨格・設計 §3.4 / §3.5）。
 * /api/* を受け、認証トークン付与とヘッダ整形を行って Spring Boot へ透過する。
 * 基盤時点は素通し proxy とトークン付与の差し込み口まで（aggregation・整形は後続）。
 *
 * ブラウザは backend の URL もトークンも知らない。秘匿情報はサーバー側に閉じる（§4.5）。
 */

// 常に動的（毎リクエスト proxy する）。
export const dynamic = 'force-dynamic';

// proxy で落とすべき hop-by-hop ヘッダ。
const HOP_BY_HOP = ['connection', 'keep-alive', 'transfer-encoding', 'upgrade', 'host'];

async function proxy(req: NextRequest, path: string[]): Promise<Response> {
  const target = `${serverEnv.BACKEND_API_BASE_URL}/${path.join('/')}${req.nextUrl.search}`;

  const headers = new Headers(req.headers);
  for (const h of HOP_BY_HOP) headers.delete(h);

  // TODO(認可設計・指摘C): session cookie（serverEnv.SESSION_COOKIE_NAME）を解決し、
  //   redis 等からセッションを引いて backend 用トークンを Authorization に付与する。
  //   BFF が唯一のトークン付与点（§4.5）。現状は素通し。
  // TODO(指摘B): multipart / binary 透過。下の duplex ストリーミングで body は透過するが、
  //   Content-Type 固定・サイズ上限・タイムアウト等の方針は後続で詰める。

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  const init: RequestInit & { duplex?: 'half' } = {
    method: req.method,
    headers,
    body: hasBody ? req.body : undefined,
    duplex: hasBody ? 'half' : undefined,
    redirect: 'manual',
  };

  const res = await fetch(target, init);

  const resHeaders = new Headers(res.headers);
  resHeaders.delete('content-encoding');
  resHeaders.delete('transfer-encoding');

  return new Response(res.body, { status: res.status, headers: resHeaders });
}

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(req: NextRequest, ctx: Ctx): Promise<Response> {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
