// @vitest-environment jsdom
/**
 * V-5: メタ定義駆動 UI — 画面結合テスト(render→DOM)。
 *
 * 合格基準(親設計 §1 / V-5):
 *   「マスタ個別の画面コードなしで、メタ定義の差し替えだけで 2 種類のマスタ画面が動く」。
 *
 * 本テストは **同一の `<MasterCrudPage>` 1 本**を masterId だけ替えて 2 回描画し、
 * 取得したメタ定義に従って異なるフォーム/一覧が DOM に現れることを断言する。
 * マスタ別のコンポーネントや分岐は一切書いていない(ADR-0003)。
 *
 * これは V-3 の「経路(データ)結合」を **画面(render→DOM)結合**へ昇格させたもの:
 *   app(MasterCrudPage) → features(useMasterCrudAction) → @poc/api-client → fetch → MSW
 * という実経路を踏み、戻り値が React で描画されたところまでを検証する。BE は起動しない。
 *
 * メタの源泉について:
 *   orval の useExamples モックは contract の **先頭 example のみ**生成するため、
 *   既定ハンドラが返すメタは常に `dept`(契約 example #1)。2 つ目の `price`(契約 example #2)は
 *   契約と同値のメタを MSW ハンドラ override で供給する(既存テストが 404 を override するのと同じ流儀)。
 *   画面コードは generated/ にも特定マスタにも依存しないため、メタの出所が替わっても不変。
 */
import "@testing-library/jest-dom/vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider, createStore } from "jotai";
import { HttpResponse, http } from "msw";
import { afterEach, describe, expect, it } from "vitest";

import { MasterCrudPage } from "../src/app/MasterCrudPage";
import { server } from "./setup";

afterEach(cleanup);

/** Atom 状態をテスト間で持ち越さないよう、毎回新しい Jotai store で描画する。 */
function renderPage(masterId: string) {
  const store = createStore();
  return render(
    <Provider store={store}>
      <MasterCrudPage masterId={masterId} />
    </Provider>,
  );
}

/** 契約 poc-master-api.yaml の getMasterMeta example #2(price)と同値。 */
const PRICE_META = {
  masterId: "price",
  fields: [
    { name: "name", type: "string", required: true },
    { name: "unitPrice", type: "number", required: true },
    { name: "effectiveDate", type: "date", required: false },
  ],
};

const usePriceMeta = () =>
  server.use(
    http.get("*/masters/:masterId/meta", () =>
      HttpResponse.json(PRICE_META, { status: 200 }),
    ),
  );

describe("V-5 メタ定義駆動 UI(同一画面コード・render→DOM)", () => {
  it("dept マスタ: 契約メタ(code/name)からフォーム入力と一覧カラムが描画される", async () => {
    renderPage("dept"); // 既定ハンドラ = 契約 example #1(dept)

    // メタ取得後に画面が現れる。
    expect(
      await screen.findByRole("heading", { name: "dept マスタ" }),
    ).toBeInTheDocument();

    // code はコード値プルダウン(select)として描画される。
    const code = screen.getByLabelText(/^code/);
    expect(code.tagName).toBe("SELECT");
    expect(
      within(code as HTMLSelectElement).getByRole("option", { name: "001" }),
    ).toBeInTheDocument();
    expect(
      within(code as HTMLSelectElement).getByRole("option", { name: "002" }),
    ).toBeInTheDocument();

    // name は text 入力。
    expect(screen.getByLabelText(/^name/)).toHaveAttribute("type", "text");

    // dept のメタに無い項目(unitPrice/effectiveDate)はフォームにも一覧にも現れない。
    expect(screen.queryByLabelText(/^unitPrice/)).toBeNull();
    const list = screen.getByRole("table", { name: "dept-list" });
    expect(within(list).getByRole("columnheader", { name: "code" })).toBeInTheDocument();
    expect(
      within(list).queryByRole("columnheader", { name: "unitPrice" }),
    ).toBeNull();
  });

  it("price マスタ: 同じページが別メタ(name/unitPrice/effectiveDate)で描画され、契約 examples の2件が一覧に出る", async () => {
    usePriceMeta();
    renderPage("price");

    expect(
      await screen.findByRole("heading", { name: "price マスタ" }),
    ).toBeInTheDocument();

    // unitPrice は number 入力、effectiveDate は date 入力(型→入力 UI がメタ駆動)。
    expect(screen.getByLabelText(/^unitPrice/)).toHaveAttribute("type", "number");
    expect(screen.getByLabelText(/^effectiveDate/)).toHaveAttribute("type", "date");

    // dept 固有だった code は price では現れない(同一コードがメタで切り替わる)。
    expect(screen.queryByLabelText(/^code/)).toBeNull();

    // 一覧は listRecords の契約 example(Pen v1 / Note v3)を描画する。
    const list = screen.getByRole("table", { name: "price-list" });
    expect(within(list).getByText("Pen")).toBeInTheDocument();
    expect(within(list).getByText("Note")).toBeInTheDocument();
    expect(within(list).getByText("120")).toBeInTheDocument();
  });

  it("price マスタ: 必須未入力で登録すると Zod バリデーションがインライン表示され送信されない", async () => {
    usePriceMeta();
    renderPage("price");
    await screen.findByRole("heading", { name: "price マスタ" });

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "登録" }));

    // メタの required から導出した Zod スキーマがフィールド直下にエラーを出す。
    expect(await screen.findByText("name は必須です")).toBeInTheDocument();
    expect(screen.getByText("unitPrice は必須です")).toBeInTheDocument();
    // 一覧は登録されず元の2件のまま(Eraser は出ない)。
    expect(screen.queryByText("Eraser")).toBeNull();
  });

  it("price マスタ: 登録すると契約 example の新規行(Eraser)が MSW 経由で一覧に追加される", async () => {
    usePriceMeta();
    renderPage("price");
    await screen.findByText("Pen");

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/^name/), "Marker");
    await user.type(screen.getByLabelText(/^unitPrice/), "99");
    fireEvent.change(screen.getByLabelText(/^effectiveDate/), {
      target: { value: "2026-04-01" },
    });
    await user.click(screen.getByRole("button", { name: "登録" }));

    // createRecord の契約 example(Eraser)が返り、一覧へ反映される(BE 不要)。
    expect(await screen.findByText("Eraser")).toBeInTheDocument();
  });
});
