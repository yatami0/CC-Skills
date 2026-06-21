import type { ReactNode } from "react";
import type { Row } from "../types";

/** DataDisplay: 汎用表。columns / rows をデータで受ける（中身を JSX 直書きしない）。 */
export function Table({
  columns,
  rows,
  caption,
}: {
  columns: string[];
  rows: Row[];
  caption?: ReactNode;
}) {
  return (
    <div className="ds-table">
      <table>
        {caption && <caption className="ds-table-caption">{caption}</caption>}
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
