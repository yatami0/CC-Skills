import type { Decorator, Preview } from "@storybook/react-vite";

// design-system の token / 構造スタイル（実装と同じ読み込み順）
import "../design-system/tokens/tokens.css";
import "../design-system/components/components.css";

/**
 * テーマ切替: トークンは :root[data-theme] で上書きしているため、
 * story ラッパではなく <html> に data-theme を付ける（実装の useTheme と同経路）。
 * さらに data-mode="page" を供給して Heading 等のサイズ規則を有効化する。
 *
 * ※ ds-prose は付けない（本文 markdown 専用スタイルが部品 story に漏れて見え方が崩れるため）。
 *   部品は本文カラム幅（--container-measure）で見せ、実アプリと同じ寸法感にする。
 *   layout:"fullscreen"（PageDoc 等の器テンプレ）は幅制約しない。
 */
const withTheme: Decorator = (Story, ctx) => {
  const theme = (ctx.globals.theme as "light" | "dark") ?? "light";
  document.documentElement.dataset.theme = theme;
  const full = ctx.parameters.layout === "fullscreen";
  return (
    <div
      data-mode="page"
      style={
        full ? undefined : { maxWidth: "var(--container-measure)", margin: "0 auto" }
      }
    >
      <Story />
    </div>
  );
};

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: "カラーテーマ（実装と同じ data-theme 駆動）",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "contrast",
        items: [
          { value: "light", title: "Light", icon: "sun" },
          { value: "dark", title: "Dark", icon: "moon" },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: "padded",
    controls: { expanded: true },
    a11y: { test: "error" },
  },
};

export default preview;
