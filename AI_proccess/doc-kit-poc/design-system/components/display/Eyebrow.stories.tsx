import type { Meta, StoryObj } from "@storybook/react-vite";
import { Eyebrow } from "./Eyebrow";

const meta = {
  title: "Components/Display/Eyebrow",
  component: Eyebrow,
  tags: ["autodocs"],
  args: { children: "アーキテクチャ解説" },
} satisfies Meta<typeof Eyebrow>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
