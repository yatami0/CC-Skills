/**
 * メタ駆動の一覧テーブル。
 * カラムは meta.fields から、セルはレコードを項目名で引いて描画する。
 * マスタごとの一覧コンポーネントは作らない(ADR-0003)。
 */
import { match } from "ts-pattern";

import type { FieldType, MasterUiMeta, RecordRow } from "./types";

const formatCell = (value: unknown, type: FieldType): string =>
  match(type)
    .when(
      () => value === null || value === undefined,
      () => "",
    )
    .otherwise(() => String(value));

interface MasterListProps {
  readonly meta: MasterUiMeta;
  readonly records: readonly RecordRow[];
  readonly loading?: boolean;
  readonly onEdit?: (record: RecordRow) => void;
  readonly onDelete?: (record: RecordRow) => void | Promise<void>;
}

export function MasterList({
  meta,
  records,
  loading,
  onEdit,
  onDelete,
}: MasterListProps) {
  return (
    <table aria-label={`${meta.masterId}-list`}>
      <thead>
        <tr>
          {meta.fields.map((f) => (
            <th key={f.name}>{f.name}</th>
          ))}
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td colSpan={meta.fields.length + 1}>読み込み中…</td>
          </tr>
        ) : records.length === 0 ? (
          <tr>
            <td colSpan={meta.fields.length + 1}>データがありません</td>
          </tr>
        ) : (
          records.map((rec) => (
            <tr key={rec.id}>
              {meta.fields.map((f) => (
                <td key={f.name}>{formatCell(rec[f.name], f.type)}</td>
              ))}
              <td>
                {onEdit ? (
                  <button type="button" onClick={() => onEdit(rec)}>
                    編集
                  </button>
                ) : null}
                {onDelete ? (
                  <button type="button" onClick={() => void onDelete(rec)}>
                    削除
                  </button>
                ) : null}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
