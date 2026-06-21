import type { ReactNode } from "react";
import type { Row } from "../types";

/**
 * DataDisplay: 比較表。中身を JSX で書かせず columns / rows をデータで受ける。
 * highlightColumn で本構成の列などを強調（値は token の CSS が当てる）。
 */
export function CompareTable({
  columns,
  rows,
  highlightColumn,
  caption,
}: {
  columns: string[];
  rows: Row[];
  highlightColumn?: number;
  caption?: ReactNode;
}) {
  const isHot = (i: number) => i === highlightColumn;
  return (
    <div className="ds-table ds-compare">
      <table>
        {caption && <caption className="ds-table-caption">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} scope="col" data-hot={isHot(i) || undefined}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) =>
                c === 0 ? (
                  <th key={c} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={c} data-hot={isHot(c) || undefined}>
                    {cell}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
