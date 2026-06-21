import type { Meta, StoryObj } from "@storybook/react-vite";
import { SourceIndex } from "./SourceIndex";

const meta = {
  title: "Components/Communication/SourceIndex",
  component: SourceIndex,
  tags: ["autodocs"],
  args: {
    title: "引用ソース一覧",
    groups: [
      {
        category: "設計思想（パラダイム）",
        entries: [
          { tag: "P1", href: "https://tanstack.com", text: "Start vs Next.js 比較" },
          { tag: "P2", href: "https://example.com", text: "比較記事サンプル" },
        ],
      },
      {
        category: "データフロー / TanStack Query",
        entries: [
          { tag: "D1", href: "https://example.com/d1", text: "Mastering CRUD" },
          { tag: "D2", href: "https://example.com/d2", text: "Complete Guide" },
        ],
      },
    ],
  },
} satisfies Meta<typeof SourceIndex>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
