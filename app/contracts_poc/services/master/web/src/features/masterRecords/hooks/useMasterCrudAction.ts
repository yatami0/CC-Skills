/**
 * 書き込みフック(useXxxAction)。API 呼び出し＋Atom 更新＋エラーハンドリングを担う。
 *
 *  - API は生成 api-client 経由のみ(生 fetch を書かない・V-2)。features は唯一の経路。
 *  - useStore() で Atom を読み書きする(useAtomCallback 相当)。コールバックは安定参照で
 *    再レンダリングを起こさない(06-state-and-hooks のアクション層の責務)。
 *  - サーバエラー(契約 ErrorResponse)は AppError へ正規化して errorAtom に集約する。
 */
import {
  createRecord,
  deleteRecord,
  getMasterMeta,
  listRecords,
  updateRecord,
} from "@poc/api-client/generated/poc";
import type { FormValues, RecordRow } from "@poc/ui-engine";
import { useStore } from "jotai";
import { useCallback } from "react";

import {
  masterErrorAtom,
  masterLoadingAtom,
  masterMetaAtom,
  masterRecordsAtom,
} from "../../../store/masterStore";
import {
  toAppError,
  toCreateRequest,
  toRow,
  toUiMeta,
  toUpdateRequest,
} from "../mappers";

export function useMasterCrudAction(masterId: string) {
  const store = useStore();

  /** 初期ロード: メタ定義 → 一覧 の順に取得して Atom に格納する。 */
  const load = useCallback(async () => {
    store.set(masterLoadingAtom, true);
    store.set(masterErrorAtom, null);
    try {
      const metaRes = await getMasterMeta(masterId);
      if (metaRes.status !== 200) {
        store.set(masterErrorAtom, toAppError(metaRes.data));
        return;
      }
      store.set(masterMetaAtom, toUiMeta(metaRes.data));

      const listRes = await listRecords(masterId, { page: 1, size: 20 });
      if (listRes.status === 200) {
        store.set(masterRecordsAtom, listRes.data.items.map(toRow));
      } else {
        store.set(masterErrorAtom, toAppError(listRes.data));
      }
    } finally {
      store.set(masterLoadingAtom, false);
    }
  }, [store, masterId]);

  /** 登録: 201 のサーバ採番結果(id/version)を一覧へ反映する。 */
  const create = useCallback(
    async (values: FormValues) => {
      store.set(masterErrorAtom, null);
      const res = await createRecord(masterId, toCreateRequest(values));
      if (res.status === 201) {
        store.set(masterRecordsAtom, (prev) => [...prev, toRow(res.data)]);
      } else {
        store.set(masterErrorAtom, toAppError(res.data));
      }
    },
    [store, masterId],
  );

  /** 更新: 楽観排他 version を載せ、200 の結果で該当行を差し替える。 */
  const update = useCallback(
    async (record: RecordRow, values: FormValues) => {
      store.set(masterErrorAtom, null);
      const res = await updateRecord(
        masterId,
        record.id,
        toUpdateRequest(values, record),
      );
      if (res.status === 200) {
        const updated = toRow(res.data);
        store.set(masterRecordsAtom, (prev) =>
          prev.map((r) => (r.id === updated.id ? updated : r)),
        );
      } else {
        store.set(masterErrorAtom, toAppError(res.data));
      }
    },
    [store, masterId],
  );

  /** 削除: 204 で該当行を一覧から除く。 */
  const remove = useCallback(
    async (record: RecordRow) => {
      store.set(masterErrorAtom, null);
      const res = await deleteRecord(masterId, record.id);
      if (res.status === 204) {
        store.set(masterRecordsAtom, (prev) =>
          prev.filter((r) => r.id !== record.id),
        );
      } else {
        store.set(masterErrorAtom, toAppError(res.data));
      }
    },
    [store, masterId],
  );

  return { load, create, update, remove };
}
