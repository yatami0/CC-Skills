import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sources } from "./Sources";

const meta = {
  title: "Components/Communication/Sources",
  component: Sources,
  tags: ["autodocs"],
  args: {
    title: "出典",
    items: [
      {
        tag: "P1",
        href: "https://tanstack.com",
        text: "TanStack 公式 — Start vs Next.js 比較",
        category: "設計思想",
      },
      {
        tag: "P2",
        href: "https://example.com",
        text: "比較記事サンプル",
        category: "設計思想",
      },
    ],
  },
} satisfies Meta<typeof Sources>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
