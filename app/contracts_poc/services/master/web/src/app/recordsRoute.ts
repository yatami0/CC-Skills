/**
 * app 層 — Next.js のルーティング / BFF 入口の代役。
 *
 * このファイルは V-2(越境・改変の機械検知)の「正しい配置」側のサンプル。
 * 役割は features を呼び出して結果を返すだけの薄い層に保つ。守るべき境界:
 *
 *  - 生 fetch / XHR を書かない（ESLint: no-restricted-globals / -syntax で禁止）
 *  - api-client / generated を直接叩かない（dependency-cruiser で禁止。必ず features 経由）
 *  - 依存方向は app → features の一方向（features から app への逆流も禁止）
 *
 * API への経路は features → @poc/api-client の 1 本だけ。app はそこへ直接ショートカットしない。
 */
import {
  firstPageSummaries,
  loadRecord,
} from "../features/masterRecords/recordsView";

/** 一覧ルート: features に委譲するだけ。 */
export async function getRecordsRoute(masterId: string): Promise<string[]> {
  return firstPageSummaries(masterId);
}

/** 1件ルート: features に委譲し、表示に必要な形へ整形するだけ。 */
export async function getRecordRoute(
  masterId: string,
  id: string,
): Promise<string | null> {
  const rec = await loadRecord(masterId, id);
  return rec ? rec.id : null;
}
