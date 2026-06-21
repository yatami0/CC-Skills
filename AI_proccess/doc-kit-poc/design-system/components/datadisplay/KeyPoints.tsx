import type { ReactNode } from "react";

/** DataDisplay: 核心メッセージ（番号丸つきリスト）。中身は配列 data props。 */
export function KeyPoints({ items }: { items: ReactNode[] }) {
  return (
    <ol className="ds-key-points">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ol>
  );
}
