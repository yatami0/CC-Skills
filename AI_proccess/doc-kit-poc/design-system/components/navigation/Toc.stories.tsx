import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { Toc } from "./Toc";

const meta = {
  title: "Components/Navigation/Toc",
  component: Toc,
  tags: ["autodocs"],
  args: {
    items: [
      { id: "paradigm", num: "02", heading: "なぜクライアント寄り構成か" },
      { id: "dataflow", num: "03", heading: "実行時データフロー" },
      { id: "generation", num: "04", heading: "OpenAPI 駆動の自動生成" },
      { id: "sources", num: "05", heading: "引用ソース一覧" },
    ],
    activeId: "dataflow",
    onJump: fn(),
  },
  argTypes: {
    activeId: {
      control: "select",
      options: ["paradigm", "dataflow", "generation", "sources"],
    },
  },
} satisfies Meta<typeof Toc>;
export default meta;

type Story = StoryObj<typeof meta>;

/** 状態は基盤から props で受ける（stateless）。現在地は aria-current="location"。 */
export const Default: Story = {};
