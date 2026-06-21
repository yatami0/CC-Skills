import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: [
    // 部品カタログ（design-system）
    "../design-system/**/*.mdx",
    "../design-system/**/*.stories.@(ts|tsx)",
    // 作った資料のプレビュー（works/ を自動発見）
    "../works/**/*.stories.@(ts|tsx)",
  ],
  addons: ["@storybook/addon-a11y", "@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // 型エイリアス（Tone/Space/Align/HeadingLevel 等）から props 表を生成
  typescript: {
    reactDocgen: "react-docgen-typescript",
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
    },
  },
};

export default config;
