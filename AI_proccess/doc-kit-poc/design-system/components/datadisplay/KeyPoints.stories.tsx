import type { Meta, StoryObj } from "@storybook/react-vite";
import { KeyPoints } from "./KeyPoints";

const meta = {
  title: "Components/DataDisplay/KeyPoints",
  component: KeyPoints,
  tags: ["autodocs"],
  args: {
    items: [
      "核心メッセージを番号丸つきで強調する",
      "中身は配列 data props",
      "番号は CSS counter で自動採番",
    ],
  },
} satisfies Meta<typeof KeyPoints>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
