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
      // V-3: split で client(poc.ts) と mock(poc.msw.ts) をファイル分離する。
      //   - poc.ts     … 型付き fetch クライアント（msw を import しない＝本番経路は純粋）
      //   - poc.msw.ts … MSW ハンドラ（msw に依存。テスト/モック専用の入口）
      //   - model/     … 型は単一系統（poc.ts も poc.msw.ts も同じ ./model を import）
      // single 同梱だと本番 client が msw に依存してしまうため split を採用。
      // 別パッケージ(msw-mocks)化は orval が mock 単独生成不可で型を二重生成するため見送り
      //   （判断の詳細は doc/v-3/技術調査.md §1.5）。
      mode: "split",
      target: "./packages/api-client/src/generated/poc.ts",
      schemas: "./packages/api-client/src/generated/model",
      client: "fetch",
      // V-3: 契約の examples から MSW ハンドラを生成する。
      //   - type: "msw"        … setupServer/worker に渡せる http ハンドラ群を生成
      //   - useExamples: true  … レスポンス本文は faker 乱数ではなく契約の examples を使う
      //     （「examples を一次情報＝モック源泉にする」設計／親設計 §6.1・§4.4）
      mock: {
        type: "msw",
        useExamples: true,
        // 既定の擬似遅延(1秒/件)を無効化。結合テストを実時間で速く回す。
        delay: false,
      },
      clean: true,
    },
  },
});
