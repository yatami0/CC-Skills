import type { ReactNode } from "react";
import type { Tone } from "../types";

/** Communication: 注意書き。本文は children、tone は enum（アクセント色は token）。 */
export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: Tone;
  title?: ReactNode;
  children: ReactNode;
}) {
  return (
    <aside className="ds-callout" data-tone={tone}>
      {title && <p className="ds-callout-title">{title}</p>}
      {children}
    </aside>
  );
}
