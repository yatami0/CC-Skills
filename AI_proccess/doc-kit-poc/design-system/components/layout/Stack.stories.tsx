import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stack } from "./Stack";
import { Card } from "./Card";
import { Text } from "../display/Text";

const sample = (
  <>
    <Card>
      <Text>1つ目のブロック</Text>
    </Card>
    <Card>
      <Text>2つ目のブロック</Text>
    </Card>
    <Card>
      <Text>3つ目のブロック</Text>
    </Card>
  </>
);

const meta = {
  title: "Components/Layout/Stack",
  component: Stack,
  tags: ["autodocs"],
  argTypes: {
    gap: { control: "select", options: ["block", "stack", "region"] },
    align: { control: "select", options: ["start", "center", "end"] },
    children: { control: false },
  },
  args: { gap: "stack", children: sample },
} satisfies Meta<typeof Stack>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
