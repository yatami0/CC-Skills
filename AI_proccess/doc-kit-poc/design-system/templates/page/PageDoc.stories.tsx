import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { PageDoc } from "./PageDoc";
import { Section } from "./Section";
import { Text } from "../../components/display/Text";

const meta = {
  title: "Templates/page/PageDoc",
  component: PageDoc,
  parameters: { layout: "fullscreen" },
  args: {
    eyebrow: "アーキテクチャ解説",
    title: "Next.js + TanStack Query のクライアント寄り構成",
    lead: "container template の全景。ヘッダ + 2カラム（本文 / Toc）+ フッタ。",
    footer: "footer slot",
    theme: "light",
    onToggleTheme: fn(),
    onJump: fn(),
    tocItems: [
      { id: "paradigm", num: "02", heading: "設計思想" },
      { id: "dataflow", num: "03", heading: "実行時データフロー" },
    ],
    activeId: "paradigm",
    children: null,
  },
} satisfies Meta<typeof PageDoc>;
export default meta;

type Story = StoryObj<typeof meta>;

/** 状態（toc / theme）は runtime から props で受ける（template は stateless）。 */
export const FullPage: Story = {
  render: (args) => (
    <PageDoc {...args}>
      <Section id="paradigm" num="02" heading="設計思想" body={<Text>本文セクション1。</Text>} />
      <Section id="dataflow" num="03" heading="実行時データフロー" body={<Text>本文セクション2。</Text>} />
    </PageDoc>
  ),
};
