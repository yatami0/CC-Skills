/**
 * V-3: モックによる並行開発 — 経路結合テスト。
 *
 * 合格基準（親設計 §1 / V-3）:
 *   「BE 未完成の状態で、MSW モックだけで FE のテストが通る」。
 *
 * ※ 本 PoC はまだ React/Next を導入していないため、ここで結合するのは
 *   「契約→モック→生成 client→消費(app/features)」という**データ経路**であり、
 *   React レンダリング(render→DOM 断言)＝"画面"の結合は ui-engine 実装(V-5)の領域。
 *   よって本テストは「画面結合」ではなく**経路結合**として実装している。
 *
 * このテストは BE プロセスを一切起動しない。契約 examples から生成した MSW
 * ハンドラ（setup.ts の `getPoCMasterAPIMock()`）だけで、FE の実コード経路
 *   app/recordsRoute（ルーティング）
 *     → features/recordsView（オーケストレーション）
 *       → @poc/api-client（生成・唯一の経路）
 *         → fetch → MSW（契約 examples）
 * を一気通貫で動かし、画面が必要とする値が得られることを検証する。
 *
 * import するのは「FE の入口（app 層）」だけ。生 fetch も api-client も直接触らない
 * ＝ V-2 で固めた経路をそのまま結合テストで踏んでいる。
 */
import {
  getRecordRoute,
  getRecordsRoute,
} from "../src/app/recordsRoute";
import {
  bumpPrice,
  loadRecord,
} from "../src/features/masterRecords/recordsView";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "./setup";

describe("V-3 経路結合テスト（MSW モックのみ・BE 不要）", () => {
  it("一覧ルート: 契約 examples の2件が画面表示用の文字列に整形される", async () => {
    // app 層の入口を叩くだけ。内部で features → api-client → MSW と流れる。
    const summaries = await getRecordsRoute("price");

    // 期待値は契約 yaml の listRecords examples（Pen v1 / Note v3）に一致する。
    expect(summaries).toEqual([
      "Pen = 120 (since 2026-04-01, v1)",
      "Note = 80 (since 2026-04-01, v3)",
    ]);
  });

  it("1件ルート: 契約 examples の単一レコードが取得できる", async () => {
    const id = await getRecordRoute("price", "1");
    expect(id).toBe("1");

    // features 層を直接見ても、契約 example（getRecord one）と一致する。
    const rec = await loadRecord("price", "1");
    expect(rec).toEqual({
      id: "1",
      name: "Pen",
      unitPrice: 120,
      effectiveDate: "2026-04-01",
      version: 1,
    });
  });

  it("更新: 楽観排他 version を載せた PUT が契約 example の結果を返す", async () => {
    const current = await loadRecord("price", "1");
    expect(current).not.toBeNull();

    const updated = await bumpPrice("price", current!, 130);
    // 契約 yaml の updateRecord example（Pen 130 / v2）に一致。
    expect(updated).toEqual({
      id: "1",
      name: "Pen",
      unitPrice: 130,
      effectiveDate: "2026-04-01",
      version: 2,
    });
  });

  it("異常系: 404 を返すモックに差し替えると features は null に分岐する", async () => {
    // 契約の 404（ErrorResponse）を MSW ハンドラで再現し、status 分岐を検証する。
    // 生成ハンドラ（useExamples）は 2xx success のみ生成するため、エラー系は
    // 契約 example を載せた MSW ハンドラで上書きする（これも BE ではなくモック）。
    server.use(
      http.get("*/masters/:masterId/records/:id", () =>
        HttpResponse.json(
          {
            errorCode: "ERR-0001",
            message: "record not found",
            correlationId: "00000000-0000-0000-0000-000000000000",
          },
          { status: 404 },
        ),
      ),
    );

    const rec = await loadRecord("price", "999");
    expect(rec).toBeNull();
  });
});
