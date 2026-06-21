import type { Meta, StoryObj } from "@storybook/react-vite";
import { Section } from "./Section";
import { Text } from "../../components/display/Text";

const meta = {
  title: "Templates/page/Section",
  component: Section,
  tags: ["autodocs"],
  args: {
    id: "paradigm",
    num: "02",
    heading: "なぜクライアント寄り構成か（設計思想）",
    sources: [
      { tag: "P1", href: "https://tanstack.com", text: "Start vs Next.js 比較" },
    ],
  },
} satisfies Meta<typeof Section>;
export default meta;

type Story = StoryObj<typeof meta>;

/** 番号付き見出し + 本文 + 出典。本文 prose は body（ReactNode）で受ける。 */
export const TextOnly: Story = {
  args: {
    body: <Text>本文 prose。構造データ（表・出典）は別 props で渡す。</Text>,
  },
};

/** 構造ブロックは props（有無で描き分け）。比較表は table で渡す。 */
export const WithCompareTable: Story = {
  args: {
    body: <Text>クライアント寄り構成を選ぶ理由を比較で示す。</Text>,
    table: {
      columns: ["観点", "サーバーF", "クライアントF（本構成）"],
      rows: [
        ["データ取得", "Server Component", "Client + TanStack Query"],
        ["採否", "✕", "◯"],
      ],
      highlightColumn: 2,
    },
  },
};
