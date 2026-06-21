import type { Meta, StoryObj } from "@storybook/react-vite";
import { Columns } from "./Columns";
import { Card } from "./Card";
import { Text } from "../display/Text";

const twoCols = (
  <>
    <Card>
      <Text>左カラム</Text>
    </Card>
    <Card>
      <Text>右カラム</Text>
    </Card>
  </>
);

const meta = {
  title: "Components/Layout/Columns",
  component: Columns,
  tags: ["autodocs"],
  argTypes: {
    gap: { control: "select", options: ["block", "stack", "region"] },
    children: { control: false },
  },
  args: { gap: "region", children: twoCols },
} satisfies Meta<typeof Columns>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Equal: Story = {};

export const Ratio2to1: Story = {
  name: "Ratio [2,1]",
  args: {
    ratio: [2, 1],
    children: (
      <>
        <Card>
          <Text>広い方（2）</Text>
        </Card>
        <Card>
          <Text>狭い方（1）</Text>
        </Card>
      </>
    ),
  },
};
