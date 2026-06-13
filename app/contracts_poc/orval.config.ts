import { defineConfig } from "orval";

// 契約 → コードの一方向 codegen（コードから契約は生成しない）。
// 入力は redocly でバンドルした単一ファイル（跨ファイル $ref の解決を確実にするため）。
// 出力は packages/api-client/src/generated/ 配下のみ（手書き改変禁止）。
export default defineConfig({
  poc: {
    input: {
      target: "./contracts/.bundled/poc-master-api.bundled.yaml",
    },
    output: {
      mode: "single",
      target: "./packages/api-client/src/generated/poc.ts",
      schemas: "./packages/api-client/src/generated/model",
      client: "fetch",
      // MSW モック・zod は今回スコープ外。examples は契約に保持済みなので
      // mock: true / zod 出力に切り替えるだけで後付けできる。
      mock: false,
      clean: true,
    },
  },
});
