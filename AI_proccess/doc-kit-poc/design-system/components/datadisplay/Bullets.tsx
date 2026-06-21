import type { ReactNode } from "react";

/** DataDisplay: 箇条書き。中身は配列 data props（children に書かない）。 */
export function Bullets({
  items,
  marker = "disc",
}: {
  items: ReactNode[];
  marker?: "disc" | "none";
}) {
  return (
    <ul className="ds-bullets" data-marker={marker}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
