import type { Meta, StoryObj } from "@storybook/react-vite";
import { Figure } from "./Figure";

/** カタログ用のサンプル図（実際の固有図は works 側 Diagram.tsx に閉じる）。 */
function SampleDiagram() {
  return (
    <svg viewBox="0 0 320 120" role="img" aria-label="サンプル構成図">
      <g className="c-blue">
        <rect x="8" y="30" width="130" height="60" rx="8" strokeWidth="1" />
        <text className="th" x="73" y="58" textAnchor="middle">
          Client
        </text>
        <text className="ts" x="73" y="74" textAnchor="middle">
          UI 層
        </text>
      </g>
      <g className="c-teal">
        <rect x="182" y="30" width="130" height="60" rx="8" strokeWidth="1" />
        <text className="th" x="247" y="58" textAnchor="middle">
          Server
        </text>
        <text className="ts" x="247" y="74" textAnchor="middle">
          API 層
        </text>
      </g>
      <line x1="138" y1="60" x2="182" y2="60" className="arr" />
    </svg>
  );
}

const meta = {
  title: "Components/Display/Figure",
  component: Figure,
  tags: ["autodocs"],
  argTypes: { children: { control: false } },
  args: {
    caption: "図のキャプション（caption slot）。色は token ランプから。",
    children: <SampleDiagram />,
  },
} satisfies Meta<typeof Figure>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithExtra: Story = {
  args: { extra: "※ 補足（extra slot）。" },
};
