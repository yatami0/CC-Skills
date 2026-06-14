import { defineConfig } from "vitest/config";

// V-3: MSW モックだけで回す FE 結合テスト。
// 実行環境は node（ブラウザ不要）。生成 api-client の相対 fetch は
// setup.ts の origin 補完 shim で吸収する（DOM は不要なので jsdom は使わない）。
export default defineConfig({
  test: {
    environment: "node",
    include: ["services/**/test/**/*.test.ts"],
    setupFiles: ["services/master/web/test/setup.ts"],
  },
});
