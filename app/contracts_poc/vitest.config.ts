import { defineConfig } from "vitest/config";

// V-3: MSW モックだけで回す FE 結合テスト。
// V-5: React 描画(render→DOM)結合を追加。.tsx テストは jsdom 環境(ファイル先頭の
//   `// @vitest-environment jsdom` で個別指定)、従来の経路結合(.ts)は node のまま。
// 生成 api-client の相対 fetch は setup.ts の origin 補完 shim で吸収する。
export default defineConfig({
  // React の自動 JSX ランタイムで .tsx をトランスパイルする(plugin-react を足さず esbuild で完結)。
  esbuild: { jsx: "automatic" },
  test: {
    environment: "node",
    include: ["services/**/test/**/*.test.{ts,tsx}"],
    setupFiles: ["services/master/web/test/setup.ts"],
  },
});
