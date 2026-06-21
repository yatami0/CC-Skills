import type { ReactNode } from "react";
import type { Space } from "../types";

const PAD: Record<Space, string> = {
  block: "p-block",
  stack: "p-stack",
  region: "p-region",
};

/** Layout: 面（surface）または枠線つきの箱。 */
export function Card({
  variant = "surface",
  pad = "stack",
  children,
}: {
  variant?: "surface" | "bordered";
  pad?: Space;
  children: ReactNode;
}) {
  const skin =
    variant === "bordered"
      ? "border border-border"
      : "bg-surface border border-border";
  return (
    <div className={`${skin} ${PAD[pad]} rounded-card`}>{children}</div>
  );
}
