import type { ReactNode } from "react";
import type { Align, Space } from "../types";

const GAP: Record<Space, string> = {
  block: "gap-block",
  stack: "gap-stack",
  region: "gap-region",
};
const ALIGN: Record<Align, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
};

/** Layout: 縦リズム。gap は用途名の enum（token）でのみ受ける。 */
export function Stack({
  gap = "stack",
  align,
  children,
}: {
  gap?: Space;
  align?: Align;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col ${GAP[gap]} ${align ? ALIGN[align] : ""}`}>
      {children}
    </div>
  );
}
