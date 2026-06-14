/**
 * app 層 — メタ駆動 CRUD ページ。
 *
 * V-5 の消費側エントリ。**このページ 1 本**で全マスタに対応する。masterId を
 * 差し替えるだけで別マスタの画面になる(マスタ個別の画面コードを書かない・ADR-0003)。
 *
 * 役割は「hooks を組み立ててエンジンに渡す」だけの薄い層に保つ:
 *  - 読み取りは useMasterCrudState(State フック)
 *  - 書き込み/ロードは useMasterCrudAction(Action フック)
 *  - 描画は @poc/ui-engine の MasterCrudView(API 非依存の純粋な描画層)
 * app は api-client を直接叩かない(必ず features 経由・V-2)。
 */
import { MasterCrudView } from "@poc/ui-engine";
import { useEffect } from "react";

import { useMasterCrudAction } from "../features/masterRecords/hooks/useMasterCrudAction";
import { useMasterCrudState } from "../features/masterRecords/hooks/useMasterCrudState";

interface MasterCrudPageProps {
  readonly masterId: string;
}

export function MasterCrudPage({ masterId }: MasterCrudPageProps) {
  const { meta, records, loading, error } = useMasterCrudState();
  const { load, create, update, remove } = useMasterCrudAction(masterId);

  // 初期ロード: 外部システム(API)との同期は useEffect の正当な用途。
  // 派生状態の計算でも連鎖更新でもないため react-you-might-not-need-an-effect には該当しない。
  useEffect(() => {
    void load();
  }, [load]);

  if (!meta) {
    return <p>読み込み中…</p>;
  }

  return (
    <MasterCrudView
      meta={meta}
      records={records}
      loading={loading}
      error={error}
      onCreate={create}
      onUpdate={update}
      onDelete={remove}
    />
  );
}
