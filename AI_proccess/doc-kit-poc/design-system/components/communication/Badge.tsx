import type { ReactNode } from "react";
import type { Tone } from "../types";

/** Communication: バッジ（状態の短い印）。tone は enum → token。 */
export function Badge({
  tone = "note",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span className="ds-badge" data-tone={tone}>
      {children}
    </span>
  );
}
