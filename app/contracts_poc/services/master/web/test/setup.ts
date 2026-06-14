/**
 * V-3 結合テストのハーネス（MSW セットアップ）。
 *
 * 役割: 「BE プロセスを一切起動せず」に、契約から生成した MSW ハンドラだけで
 * FE の実コード経路（app → features → 生成 api-client → fetch）を成立させる。
 *
 * ポイント:
 *  - ハンドラは手書きしない。契約 examples から orval が生成した
 *    `getPoCMasterAPIMock()` をそのまま使う（= モックの源泉は契約）。
 *  - `onUnhandledRequest: "error"` … モックにない通信が来たら即エラー。
 *    「実は本物の BE を叩いていた」を機械的に排除する（V-3 の肝）。
 *  - fetch の origin 補完 … 生成クライアントは相対 URL（例 `/masters/dept/meta`）で
 *    fetch する。ブラウザなら document origin で解決されるが、Node 実行の
 *    結合テストには origin が無い。ブラウザ相当の origin だけを補う薄い shim を
 *    MSW の上に被せる（テスト専用ハーネス。本番コードや生成物には一切触れない）。
 */
import { getPoCMasterAPIMock } from "@poc/api-client/generated/poc.msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll } from "vitest";

export const server = setupServer(...getPoCMasterAPIMock());

/** ブラウザの document origin を補うテスト専用 base。値自体は何でもよい（`*` パターンが一致する）。 */
const ORIGIN = "http://localhost";

beforeAll(() => {
  // MSW が globalThis.fetch を差し替える。
  server.listen({ onUnhandledRequest: "error" });

  // MSW 差し替え後の fetch に「相対 URL を絶対化してから渡す」薄い層を被せる。
  const patched = globalThis.fetch;
  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const url =
      typeof input === "string" && input.startsWith("/")
        ? ORIGIN + input
        : input;
    return patched(url as RequestInfo | URL, init);
  }) as typeof fetch;
});

afterEach(() => server.resetHandlers());
afterAll(() => server.close());
