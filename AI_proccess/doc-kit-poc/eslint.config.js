import js from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * ガードレール（分離を機械で守る）:
 *  1. design-system → works の import 禁止（works→design-system の一方向のみ）。
 *  2. works は design-system の公開 API（index バレル）経由のみ。
 *  3. Tailwind 任意値（p-[24px] / bg-[#fff]）と生 px/hex の禁止 → token 経由のみ。
 */
export default tseslint.config(
  { ignores: ["dist", "node_modules"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // ③ 任意値・生値の禁止（全 ts/tsx 共通）
    files: ["**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\[[^\\]]*(px|rem|em|#[0-9a-fA-F]{3,})/]",
          message:
            "Tailwind 任意値（[24px] / [#fff] 等）は禁止です。@theme のトークン由来ユーティリティを使ってください。",
        },
      ],
    },
  },
  {
    // ① design-system は works（成果物の内容）を一切 import できない
    files: ["design-system/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/works/**", "**/works"],
              message:
                "design-system は works（成果物の内容）を import できません（一方向依存）。",
            },
          ],
        },
      ],
    },
  },
  {
    // ② works は design-system の内部実装ではなく公開 API（index）経由で使う
    files: ["works/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "**/design-system/components/*",
                "**/design-system/runtime/*",
                "**/design-system/templates/*",
                "**/design-system/tokens/*",
              ],
              message:
                "works は design-system の公開 API（design-system/index.ts）からのみ import してください。",
            },
          ],
        },
      ],
    },
  },
);
