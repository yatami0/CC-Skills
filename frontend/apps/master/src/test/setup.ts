import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '@/mocks/node';

// MSW node server をテスト全体で起動。未処理リクエストは契約漏れとして error（設計 §3.6）。
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });

  // jsdom は global AbortController を自前実装で上書きするため、TanStack Query が生成する
  // signal は jsdom の AbortSignal になり、node(undici) の Request 構築が instanceof チェックで
  // 弾く（"Expected signal to be an instance of AbortSignal"）。これは jsdom/undici の非互換で
  // 本番（実ブラウザ）では起きない。MSW が fetch を差し替えた後に最も外側で signal を外して整合させる
  // （orval の signal:true＝本番のキャンセルは維持）。
  const patched = globalThis.fetch;
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (init && 'signal' in init) {
      const { signal: _signal, ...rest } = init;
      return patched(input, rest);
    }
    return patched(input, init);
  }) as typeof fetch;
});
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());
