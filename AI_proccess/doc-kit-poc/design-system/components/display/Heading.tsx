import type { ReactNode } from "react";
import type { HeadingLevel } from "../types";

/**
 * Display: 見出し。mode を知らない。
 * サイズは CSS が [data-mode] × data-level で当てる（部品は分岐しない）。
 */
export function Heading({
  level,
  children,
}: {
  level: HeadingLevel;
  children: ReactNode;
}) {
  const Tag = `h${level}` as "h1" | "h2" | "h3";
  return (
    <Tag className="ds-heading" data-level={level}>
      {children}
    </Tag>
  );
}
