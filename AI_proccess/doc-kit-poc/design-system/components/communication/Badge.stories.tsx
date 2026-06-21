import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Communication/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "inline-radio", options: ["note", "info", "warn"] },
  },
  args: { tone: "info", children: "NEW" },
} satisfies Meta<typeof Badge>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Note: Story = { args: { tone: "note" } };
export const Info: Story = {};
export const Warn: Story = { args: { tone: "warn" } };
