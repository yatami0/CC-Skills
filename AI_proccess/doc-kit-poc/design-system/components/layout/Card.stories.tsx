import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";
import { Heading } from "../display/Heading";
import { Text } from "../display/Text";

const meta = {
  title: "Components/Layout/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["surface", "bordered"] },
    pad: { control: "select", options: ["block", "stack", "region"] },
    children: { control: false },
  },
  args: {
    variant: "surface",
    pad: "stack",
    children: (
      <>
        <Heading level={3}>カードの見出し</Heading>
        <Text tone="muted">面（surface）か枠線（bordered）の箱。余白は token。</Text>
      </>
    ),
  },
} satisfies Meta<typeof Card>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Surface: Story = {};
export const Bordered: Story = { args: { variant: "bordered" } };
