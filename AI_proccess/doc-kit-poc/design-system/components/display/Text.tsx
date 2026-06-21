import type { ReactNode } from "react";

/** Display: 本文テキスト。tone は default / muted の enum のみ。 */
export function Text({
  tone = "default",
  children,
}: {
  tone?: "default" | "muted";
  children: ReactNode;
}) {
  return (
    <p className={`text-page-body ${tone === "muted" ? "text-fg-muted" : "text-fg"}`}>
      {children}
    </p>
  );
}
