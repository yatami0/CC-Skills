import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "./Link";

const meta = {
  title: "Components/Action/Link",
  component: Link,
  tags: ["autodocs"],
  args: {
    href: "https://example.com",
    external: true,
    children: "リンクテキスト（href はポインタ）",
  },
} satisfies Meta<typeof Link>;
export default meta;

type Story = StoryObj<typeof meta>;

export const External: Story = {};
export const Internal: Story = {
  args: { href: "#section", external: false, children: "ページ内リンク" },
};
