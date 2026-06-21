import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "./Text";

const meta = {
  title: "Components/Display/Text",
  component: Text,
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "inline-radio", options: ["default", "muted"] },
  },
  args: {
    tone: "default",
    children: "本文テキスト。tone は default / muted の enum のみ。",
  },
} satisfies Meta<typeof Text>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Muted: Story = { args: { tone: "muted" } };
