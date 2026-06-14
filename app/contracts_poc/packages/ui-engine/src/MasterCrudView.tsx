/**
 * メタ駆動 CRUD 画面(一覧＋登録/編集フォーム＋エラー表示)。
 *
 * V-5 の主役。**このコンポーネント 1 本**で、渡される meta を差し替えるだけで
 * 異なるマスタの画面が描画される(マスタ個別の画面コードを書かない・ADR-0003)。
 * API・状態管理には触れず、データとコールバックを props で受ける純粋な描画層に保つ
 * (API 呼び出しは消費側 features の hooks に集約する)。
 */
import { useState } from "react";

import { MasterList } from "./MasterList";
import { MetaForm } from "./MetaForm";
import type { AppError, FormValues, MasterUiMeta, RecordRow } from "./types";

interface MasterCrudViewProps {
  readonly meta: MasterUiMeta;
  readonly records: readonly RecordRow[];
  readonly loading?: boolean;
  readonly error?: AppError | null;
  readonly onCreate: (values: FormValues) => void | Promise<void>;
  readonly onUpdate: (
    record: RecordRow,
    values: FormValues,
  ) => void | Promise<void>;
  readonly onDelete?: (record: RecordRow) => void | Promise<void>;
}

export function MasterCrudView({
  meta,
  records,
  loading,
  error,
  onCreate,
  onUpdate,
  onDelete,
}: MasterCrudViewProps) {
  // 編集対象(null=新規登録)。これは画面ローカルの UI 状態なので useState で持つ。
  const [editing, setEditing] = useState<RecordRow | null>(null);

  const handleSubmit = async (values: FormValues) => {
    if (editing) {
      await onUpdate(editing, values);
      setEditing(null);
    } else {
      await onCreate(values);
    }
  };

  return (
    <section aria-label={`${meta.masterId}-crud`}>
      <h1>{meta.masterId} マスタ</h1>
      {error ? <div role="alert">{error.message}</div> : null}
      <MasterList
        meta={meta}
        records={records}
        loading={loading}
        onEdit={setEditing}
        onDelete={onDelete}
      />
      <h2>{editing ? `編集中: ${editing.id}` : "新規登録"}</h2>
      {/* key で編集対象が変わるたびにフォームを作り直し、defaultValues を反映する。 */}
      <MetaForm
        key={editing?.id ?? "new"}
        meta={meta}
        record={editing}
        onSubmit={handleSubmit}
        onCancel={() => setEditing(null)}
      />
    </section>
  );
}
