import type { Space } from "../types";

const SIZE: Record<Space, string> = {
  block: "h-block",
  stack: "h-stack",
  region: "h-region",
};

/** Layout: 余白のみ（高さを token で確保）。 */
export function Spacer({ size = "stack" }: { size?: Space }) {
  return <div className={SIZE[size]} aria-hidden="true" />;
}
