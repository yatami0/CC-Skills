---
shot: table-list
pattern: テーブル / リスト
provenance: referenced-secondary   # 実プロダクト・観察由来(値は推定)
captured_at: 2026-06-28
rubric: ../_rubrics/table.md
gallery: ./gallery.html
status: shot                        # C フェーズの試し打ち(本実装前の検証)
---

# 偵察台帳 — テーブル / リスト(試し打ち)

3 つの実プロダクトの作法を観察し、同じダミーデータ(支払い一覧)で描き分けた。
**値(px / hex)はすべて推定**。観察できた作法(罫線戦略 / 整列 / ステータス表現 / 密度)は出典で裏取り。

## ① Linear 作法 — borderless / dense / monochrome
- 観察: 極淡の横罫(ほぼ罫線なし) / compact 行高 / モノクロ基調 / ステータス=色ドット+ラベル /
  操作は hover で出現 / キーボード前提の静かな密。
- 出典:
  - Linear Docs — layout: https://linear.app/docs/board-layout
  - Setproduct "Data table UI design"(density 3モード): https://www.setproduct.com/blog/data-table-ui-design
- 推定したもの: 行高34px / 罫線色 / dot 色。**Linear はトークン非公開**。

## ② Stripe 作法 — 横罫のみ / airy / 右寄せ tabular / tint pill
- 観察: 横罫のみ(ゼブラ無し) / spacious 行高 / 数値右寄せ+等幅 / ヘッダ大文字キャップ+字間 /
  ステータス=淡色 tint ピル / 顧客名+email の二段セル。
- 出典:
  - Stripe Apps Table component: https://docs.stripe.com/stripe-apps/components/table
  - Matthew Ström "Design Better Data Tables"(横罫 > ゼブラ): https://medium.com/mission-log/design-better-data-tables-430a30a00d8c
  - Primer DataTable guidelines(数値右寄せ + tabular-nums を明文): https://primer.style/product/components/data-table/guidelines/
- 推定したもの: 行高52px / tint 各色 / 罫線濃度。

## ③ Notion 作法 — セル全枠グリッド / property chip / inline edit 感
- 観察: セルを薄グリッドで囲む / property 型アイコン付きヘッダ / 淡色 property tag /
  数値も左寄せのまま(Stripe との作法差) / セル内編集前提 / comfortable 行高。
- 出典:
  - Notion Help — Table view: https://www.notion.com/help/tables
  - Notion release(inline editing & drag-fill): https://www.notion.com/releases/2022-08-25
- 推定したもの: 行高40px / グリッド線色 / chip 各色。

## 横断で裏取りした「作法」(診断軸の根拠)
- 数値=右寄せ + `tabular-nums`: Primer DataTable guidelines(一次・明文)。
- 横罫 > ゼブラ / 罫線は地に溶かす: Matthew Ström, Pencil&Paper。
- 密度3モード(compact/comfortable/spacious): Setproduct。
- 20行/頁を起点: Primer。

## C-shot で確認できたこと(A/B フェーズへの学び)
1. **実プロダクトも一次ドキュメントも正確な px を出さない**(Primer / Setproduct で実証)。
   → `推定 estimated` ラベルは必須。スカウト設計の中核仮説が正しいと裏取りできた。
2. **診断は「観察できる作法」に絞れば成立する**(罫線/整列/密度/状態表現)。曖昧な推定値に頼らない。
3. 同一ダミーデータの描き分けは比較として機能する(中身が同じだと作法差だけが際立つ)。
4. 二次優先は実在感が強いが、**Primer 等の一次を「作法の裏取り」に併用**すると診断の根拠が固くなる。
   → 「二次でモック・一次で根拠」の役割分担が良さそう(A 設計書に反映)。
