import type { Meta, StoryObj } from "@storybook/react-vite";
import { CompareTable } from "./CompareTable";

const meta = {
  title: "Components/DataDisplay/CompareTable",
  component: CompareTable,
  tags: ["autodocs"],
  argTypes: {
    highlightColumn: { control: { type: "number", min: 0, max: 2 } },
  },
  args: {
    columns: ["観点", "サーバーF（RSC）", "クライアントF（本構成）"],
    rows: [
      ["データ取得", "Server Component", "Client + TanStack Query"],
      ["向く対象", "SEO 中心サイト", "CRUD / 内部ツール"],
      ["本構成での採否", "✕", "◯"],
    ],
    highlightColumn: 2,
    caption: "比較表（中身を JSX 直書きせず columns / rows で受ける）",
  },
} satisfies Meta<typeof CompareTable>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const NoHighlight: Story = { args: { highlightColumn: undefined } };
