import type { Meta, StoryObj } from "@storybook/react-vite";
import { Heading } from "./Heading";

const meta = {
  title: "Components/Display/Heading",
  component: Heading,
  tags: ["autodocs"],
  argTypes: {
    level: { control: "inline-radio", options: [1, 2, 3] },
  },
  args: { level: 2, children: "見出しテキスト（content は children）" },
} satisfies Meta<typeof Heading>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Level2: Story = {};

/** mode を知らない。サイズは [data-mode="page"] × data-level で当たる。 */
export const AllLevels: Story = {
  render: () => (
    <>
      <Heading level={1}>Heading level 1</Heading>
      <Heading level={2}>Heading level 2</Heading>
      <Heading level={3}>Heading level 3</Heading>
    </>
  ),
};
