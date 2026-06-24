import { ApiError } from '@/lib/error';

/**
 * 唯一の実 fetch 点（設計 §3.5）。生成 client・hooks はすべてここを通る。
 * 環境差（server / client の base・認証）を 1 か所に吸収する。
 *
 * fetch 直書き禁止（§3.7）の例外はこのファイルのみ（eslint override 済み）。
 * next/headers はここで読まない（orval codegen を壊す既知問題 §3.5）。認証値は
 * RSC 側で cookies() から解決し、per-call options（request.headers）で注入する。
 */
const isServerRuntime = typeof window === 'undefined';

function resolveBaseUrl(): string {
  if (isServerRuntime) {
    // server 枝: 絶対 base（自分の BFF /api を指す）。§3.5 A案。
    return process.env.INTERNAL_API_BASE_URL ?? 'http://127.0.0.1:3000/api';
  }
  // client 枝: same-origin の /api。backend の絶対 URL・トークンはブラウザに出さない（§4.5）。
  // window.location.origin で絶対化する（相対 '/api' は node/test の fetch が解決できないため）。
  return `${window.location.origin}/api`;
}

export const customFetch = async <T>(
  url: string,
  options: RequestInit = {},
): Promise<T> => {
  const requestUrl = `${resolveBaseUrl()}${url}`;

  const headers = new Headers(options.headers);
  const { body } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  // multipart / binary は Content-Type 非固定で FormData を透過（§3.5）。
  if (!isFormData && body != null && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  const response = await fetch(requestUrl, {
    ...options,
    headers,
    // client: session cookie を自動送出。
    // server: 自動送出は効かないため per-call options（request.headers.cookie）で明示注入（§3.5）。
    credentials: isServerRuntime ? 'omit' : 'include',
  });

  if (!response.ok) {
    // 非 2xx は ApiError へ変換して throw（TanStack Query が捕捉）§3.5。
    throw await ApiError.fromResponse(response);
  }

  // orval の fetch client は mutator が { data, status, headers } を返す前提。
  const text = response.status === 204 ? '' : await response.text();
  const data = text ? JSON.parse(text) : undefined;

  return {
    data,
    status: response.status,
    headers: response.headers,
  } as T;
};

export default customFetch;
