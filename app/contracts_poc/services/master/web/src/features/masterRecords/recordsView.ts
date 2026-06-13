/**
 * 消費コード（features 層）。
 *
 * このファイルは V-1（契約→codegen破壊検知）の「破壊が現れる場所」。
 * 生成された型 `MasterRecord` と client 関数を import し、契約由来の項目に
 * 静的型で依存する。契約 yaml の項目をリネーム/削除して再生成すると、
 * このファイルが `tsc --noEmit`（strict）でコンパイルエラーになり、ビルドが止まる。
 *
 * 重要: ここでは生 fetch を書かず、必ず生成 api-client 経由で API に触れる。
 * api-client が唯一の経路。
 */
import {
  listRecords,
  updateRecord,
  getRecord,
} from "@poc/api-client/generated/poc";
import type { MasterRecord } from "@poc/api-client/generated/model/masterRecord";

/**
 * (a) レスポンス項目への型依存。
 * `unitPrice` をリネーム/削除すると、生成 interface から消え、
 * `rec.unitPrice` が TS2339（Property does not exist）になる。
 */
export function summarize(rec: MasterRecord): string {
  const price: number = rec.unitPrice;
  const when: string = rec.effectiveDate;
  return `${rec.name} = ${price} (since ${when}, v${rec.version})`;
}

/**
 * (b) 一覧レスポンス形（RecordPage）への依存。
 * 200 で status ナローイングして data: RecordPage を取り出す。
 * `MasterRecord.name` が消えれば map 内でコンパイルエラー。
 */
export async function firstPageSummaries(masterId: string): Promise<string[]> {
  const res = await listRecords(masterId, { page: 1, size: 20 });
  if (res.status !== 200) {
    return [];
  }
  return res.data.items.map((r) => summarize(r));
}

/**
 * (c) 型付きリクエスト（UpdateRecordRequest）への依存＋楽観排他 version。
 * 契約から `version` を削除すると、ここの object literal が
 * 「存在しないプロパティ」または「必須プロパティ欠落」でコンパイルエラーになる。
 */
export async function bumpPrice(
  masterId: string,
  rec: MasterRecord,
  next: number,
): Promise<MasterRecord | null> {
  const res = await updateRecord(masterId, rec.id, {
    name: rec.name,
    unitPrice: next,
    effectiveDate: rec.effectiveDate,
    version: rec.version,
  });
  return res.status === 200 ? res.data : null;
}

/**
 * (d) 1件取得。404 を ErrorResponse 側として扱い、200 のみ MasterRecord を返す。
 */
export async function loadRecord(
  masterId: string,
  id: string,
): Promise<MasterRecord | null> {
  const res = await getRecord(masterId, id);
  return res.status === 200 ? res.data : null;
}
