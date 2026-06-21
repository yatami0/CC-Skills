import type { CSSProperties, ReactNode } from "react";
import type { Space } from "../types";

const GAP: Record<Space, string> = {
  block: "gap-block",
  stack: "gap-stack",
  region: "gap-region",
};

/**
 * Layout: 横分割。ratio={[2,1]} 等で fr 比を指定（px は使わない）。
 * 既定は等幅。
 */
export function Columns({
  gap = "region",
  ratio,
  children,
}: {
  gap?: Space;
  ratio?: number[];
  children: ReactNode;
}) {
  const style: CSSProperties | undefined = ratio
    ? { gridTemplateColumns: ratio.map((r) => `${r}fr`).join(" ") }
    : undefined;
  return (
    <div
      className={`grid ${GAP[gap]} ${ratio ? "" : "auto-cols-fr grid-flow-col"}`}
      style={style}
    >
      {children}
    </div>
  );
}
