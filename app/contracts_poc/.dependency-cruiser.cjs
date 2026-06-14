/**
 * dependency-cruiser 設定 — V-2 越境検知のうち「レイヤ違反 / 経路逸脱」を担う機械ゲート。
 *
 * 守る依存方向(一方向):
 *     app(ルーティング) → features(オーケストレーション) → @poc/api-client(生成・唯一の経路)
 *
 * 違反するとCIが落ちる(severity: error)。tsConfig の paths で `@poc/api-client/*` を
 * 実ファイル(packages/api-client/src/*)へ解決してから判定する。
 */
module.exports = {
  forbidden: [
    {
      name: "no-http-client-libs",
      comment:
        "API は生成 api-client 経由のみ。http クライアントライブラリの直接 import を禁止(生fetch相当)。例外は api-client パッケージ内部だけ。",
      severity: "error",
      from: { pathNot: "^packages/api-client/" },
      to: {
        dependencyTypes: ["npm"],
        path: "^(axios|node-fetch|cross-fetch|ky|got|undici|superagent)$",
      },
    },
    {
      name: "app-must-go-through-features",
      comment:
        "app(ルーティング層)は features 経由でのみ API に到達する。api-client/generated を直接叩かない(経路を1本に固定)。",
      severity: "error",
      from: { path: "^services/master/web/src/app/" },
      to: { path: "^packages/api-client/" },
    },
    {
      name: "features-no-reverse-to-app",
      comment:
        "依存は app → features の一方向。features から app への逆流を禁止。",
      severity: "error",
      from: { path: "^services/master/web/src/features/" },
      to: { path: "^services/master/web/src/app/" },
    },
    {
      name: "api-client-stays-common",
      comment:
        "共通層 api-client は消費側(services/)へ依存してはならない(逆流禁止)。",
      severity: "error",
      from: { path: "^packages/api-client/" },
      to: { path: "^services/" },
    },
    {
      name: "generated-only-via-sanctioned-consumers",
      comment:
        "生成物 generated/ に触れてよいのは api-client 自身と features 層のみ。app などからの直接参照を禁止。",
      severity: "error",
      from: {
        pathNot:
          "^(packages/api-client/|services/master/web/src/features/)",
      },
      to: { path: "^packages/api-client/src/generated/" },
    },
    {
      name: "no-circular",
      comment: "循環依存を禁止(層の独立性を保つ)。",
      severity: "error",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    doNotFollow: { path: "node_modules" },
    enhancedResolveOptions: {
      conditionNames: ["import", "require", "default", "types"],
      extensions: [".ts", ".tsx", ".js", ".json"],
    },
  },
};
