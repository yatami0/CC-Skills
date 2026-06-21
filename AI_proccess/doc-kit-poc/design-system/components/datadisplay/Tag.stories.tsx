import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "./Tag";

const meta = {
  title: "Components/DataDisplay/Tag",
  component: Tag,
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "inline-radio", options: ["note", "info", "warn"] },
  },
  args: { tone: "note", children: "P1" },
} satisfies Meta<typeof Tag>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Note: Story = {};
export const Info: Story = { args: { tone: "info" } };
export const Warn: Story = { args: { tone: "warn" } };
