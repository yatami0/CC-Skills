import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spacer } from "./Spacer";
import { Card } from "./Card";
import { Text } from "../display/Text";

const meta = {
  title: "Components/Layout/Spacer",
  component: Spacer,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["block", "stack", "region"] },
  },
  args: { size: "region" },
} satisfies Meta<typeof Spacer>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div>
      <Card>
        <Text>上のブロック</Text>
      </Card>
      <Spacer {...args} />
      <Card>
        <Text>token 分の余白を挟んだ下のブロック</Text>
      </Card>
    </div>
  ),
};
