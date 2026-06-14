// ESLint Flat Config (v9) — V-2 越境検知のうち「生fetch直書き禁止」を担う機械ゲート。
//
// 役割分担:
//   - ESLint           … 生 fetch / XHR / http クライアント直 import を構文レベルで禁止
//   - dependency-cruiser … レイヤ依存方向・generated 直参照などモジュール境界を禁止
//   - codegen:check    … generated/ の手書き改変を検知（V-1 から継続）
//
// 対象は消費側(services/master/web)のみ。生成 api-client(packages/api-client)は
// 唯一 fetch を持ってよい正規の経路なので、ここでは対象外（下の files で限定）。
import tseslint from "typescript-eslint";

const NO_RAW_HTTP = "生fetch直書き禁止。API は生成 api-client(@poc/api-client) 経由のみ(V-2)。";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "packages/api-client/src/generated/**", // 生成物は対象外(codegen:check が守る)
      "contracts/.bundled/**",
    ],
  },
  {
    files: ["services/master/web/src/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      // グローバル fetch / XHR への参照を禁止
      "no-restricted-globals": [
        "error",
        { name: "fetch", message: NO_RAW_HTTP },
        { name: "XMLHttpRequest", message: NO_RAW_HTTP },
      ],
      // 構文レベルでも fetch 呼び出し / new XHR / new WebSocket を禁止(グローバル解決に依存しない保険)
      "no-restricted-syntax": [
        "error",
        { selector: "CallExpression[callee.name='fetch']", message: NO_RAW_HTTP },
        {
          selector: "NewExpression[callee.name='XMLHttpRequest']",
          message: NO_RAW_HTTP,
        },
        {
          selector: "NewExpression[callee.name='WebSocket']",
          message: "生 WebSocket 禁止。通信経路は生成クライアント経由に統一(V-2)。",
        },
      ],
      // http クライアントライブラリの直接 import を禁止
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "axios", message: NO_RAW_HTTP },
            { name: "node-fetch", message: NO_RAW_HTTP },
            { name: "cross-fetch", message: NO_RAW_HTTP },
            { name: "ky", message: NO_RAW_HTTP },
            { name: "got", message: NO_RAW_HTTP },
            { name: "undici", message: NO_RAW_HTTP },
            { name: "superagent", message: NO_RAW_HTTP },
          ],
        },
      ],
    },
  },
];
