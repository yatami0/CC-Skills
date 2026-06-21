import type { ReactNode } from "react";

/** Display: 見出し上の小ラベル（アクセント色・全角小）。 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="ds-eyebrow text-page-eyebrow text-accent">{children}</p>;
}
