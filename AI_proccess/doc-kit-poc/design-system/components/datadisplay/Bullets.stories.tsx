import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bullets } from "./Bullets";

const meta = {
  title: "Components/DataDisplay/Bullets",
  component: Bullets,
  tags: ["autodocs"],
  argTypes: {
    marker: { control: "inline-radio", options: ["disc", "none"] },
  },
  args: {
    marker: "disc",
    items: [
      "配列 data props で受ける（children に書かない）",
      "content は原稿.md 側にあり、部品は汎用のまま",
      "marker は disc / none の enum",
    ],
  },
} satisfies Meta<typeof Bullets>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Disc: Story = {};
export const NoMarker: Story = { args: { marker: "none" } };
