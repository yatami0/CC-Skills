import type { Meta, StoryObj } from "@storybook/react-vite";
import { Divider } from "./Divider";
import { Text } from "../display/Text";

const meta = {
  title: "Components/Layout/Divider",
  component: Divider,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["h", "v"] },
  },
} satisfies Meta<typeof Divider>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  args: { orientation: "h" },
  render: (args) => (
    <div>
      <Text>上のブロック</Text>
      <Divider {...args} />
      <Text>下のブロック</Text>
    </div>
  ),
};

export const Vertical: Story = {
  args: { orientation: "v" },
  render: (args) => (
    <div className="flex items-center" style={{ height: "4rem" }}>
      <Text>左</Text>
      <Divider {...args} />
      <Text>右</Text>
    </div>
  ),
};
