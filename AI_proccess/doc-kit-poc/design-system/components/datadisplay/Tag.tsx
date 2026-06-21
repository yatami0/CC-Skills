import type { ReactNode } from "react";
import type { Tone } from "../types";

/** DataDisplay: 短ラベル（[P1] 等）。tone は enum → token。 */
export function Tag({
  tone = "note",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <span className="ds-tag" data-tone={tone}>
      {children}
    </span>
  );
}
