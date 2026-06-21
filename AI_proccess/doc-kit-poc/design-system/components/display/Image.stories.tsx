import type { Meta, StoryObj } from "@storybook/react-vite";
import { Image } from "./Image";

/**
 * drawio 等から書き出した図（SVG/PNG）を埋め込む。座標・配線は外部ツールに委ね、
 * ここは「埋め込みと light/dark 切替」だけを担う。src=ライト, srcDark=ダーク。
 */
const meta = {
  title: "Components/Display/Image",
  component: Image,
  tags: ["autodocs"],
} satisfies Meta<typeof Image>;
export default meta;

type Story = StoryObj<typeof meta>;

// 自己完結のサンプル図（works を import せずカタログ単体で完結させる）。
const sample = (fill: string, stroke: string, ink: string, label: string) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="240" height="80" font-family="system-ui, sans-serif"><rect x="20" y="16" width="200" height="48" rx="10" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/><text x="120" y="45" text-anchor="middle" font-size="14" font-weight="600" fill="${ink}">${label}</text></svg>`,
  );

export const Basic: Story = {
  args: {
    src: sample("#e6f1fb", "#185fa5", "#0c447c", "diagram.svg"),
    alt: "サンプル図",
  },
};

/** src（ライト）と srcDark（ダーク）を渡すと data-theme で切り替わる。 */
export const LightDark: Story = {
  args: {
    src: sample("#e6f1fb", "#185fa5", "#0c447c", "light"),
    srcDark: sample("#0c447c", "#6fa8dc", "#ffffff", "dark"),
    alt: "テーマ追従するサンプル図",
  },
};
