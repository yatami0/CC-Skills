import type { Meta, StoryObj } from "@storybook/react-vite";
import { Table } from "./Table";

const meta = {
  title: "Components/DataDisplay/Table",
  component: Table,
  tags: ["autodocs"],
  args: {
    columns: ["層", "役割", "技術"],
    rows: [
      ["UI", "表示", "React"],
      ["状態", "取得・更新", "TanStack Query"],
      ["API", "型付き呼び出し", "OpenAPI 生成"],
    ],
    caption: "汎用表（columns / rows をデータで受ける）",
  },
} satisfies Meta<typeof Table>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
