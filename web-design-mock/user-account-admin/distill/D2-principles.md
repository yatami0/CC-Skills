---
phase: D2-principles
status: in-review
updated_at: 2026-06-27
kind: variant
extends: apple
next_action: 検証ゲート — 各原則が D1 計測で裏付くか / モック自身が守っているか / 非自明な原則(brand-via-chrome 等)を取り逃していないかを点検。承認後 D3。
---
# D2 — 原則の言語化 (Articulate)

D1 デルタ計測より、これは**独立哲学ではなく `apple` の variant(派生)**。
よって原則は「**apple base の原則(Clarity / Deference / Depth)を継承** + この variant が
**足す/変える原則**のデルタ」で書く。base 原則は apple.md §1 を参照(再掲しない)。

各原則: `[inferred]` + **根拠(D1 観測)**。base からの関係を `継承 / 適応(変更) / 追加` で明示。

---

## V1. 奥行きは「不透明な3層の面」で作る(Depth の適応)
`[inferred]` 根拠: D1 §2.1(navy chrome / gray6 canvas / white card)・§2.4(shadow-1 微細のみ・
shadow-2 はシートだけ・blur 不使用 / `--blur-material` 未定義)。
- apple base の Depth は「素材(blur/vibrancy)+ 微細影」。本 variant は **blur を捨て**、
  **濃紺 chrome / グレー canvas / 白 card の3つの不透明な面の重なり**で階層を作る(**適応=変更**)。
- 濃い影で階層を作らない点は base 継承。浮く要素(詳細シート)だけ shadow-2。

## V2. ブランドは chrome ゾーンで、accent は状態で(brand-via-chrome / 追加・非自明)
`[inferred]` 根拠: D1 §2.5(accent #005fa2 は focus-visible アウトラインのみ・塗りCTA無し /
brand-navy は大アバター / サイドバー選択は skyblue)・§1.4–1.5・§1.12。
- **ブランドの「色」は accent の塗りでなく、濃紺サイドバーという面(chrome)で表現**する。
- accent(ブランド青)は**フォーカス/状態を示す最小用途**に限定し、面を埋めない。
- これは「ブランド色 = accent 塗り」という既定の思い込みに反する**非自明な規律**。
  これを外すと「青ボタンだらけ」の別物になり、本物感が消える(= D4 で必ず効くはずの原則)。

## V3. 強調は色でなく weight とサイズの抑制で(Deference の高密度適応)
`[inferred]` 根拠: D1 §2.3(largetitle〜title2 未使用 / 強調は weight 600⇔400 / th は weight 400)。
- 管理画面のためヒーロー級タイポ(largetitle/title1/title2)を**使わない**(**適応**)。
- 強調は**サイズの跳ね上げや色でなく weight コントラストと tint**で作る。Deference(コンテンツに譲る)を
  データ密度側へ寄せた形。

## V4. 状態色はブランドと非競合に、tint pill + ドットで(追加)
`[inferred]` 根拠: D1 §2.7(active/invited/disabled = tint面+色ドット+ラベル / ロール pill 中立・
管理者のみ fill-strong+weight600)・§1.11(fill-success/warning/neutral、danger tint 無し)。
- ステータスは **System Colors を tint(薄面)+ ドット**で出し、ブランド accent と色域を分ける。
- ロールは中立 pill を既定、強調は塗りでなく fill-strong + weight。

## V5. on-dark ブランド面は範囲限定の名前空間に閉じ込める(範囲限定ハイブリッドの徹底)
`[inferred]` 根拠: D1 §1.12(`--sidebar-*` on-dark トークン群)・§6(親の範囲限定ハイブリッド)。
- 濃紺ゾーンの前景/塗り/境界/選択色は **`--sidebar-*` 名前空間**に隔離し、Apple base の
  ラベル/区切りトークンを一切上書きしない。
- 「ブランド面」を足す手段は base 改変でなく**ゾーン限定の on-dark トークン追加**、という構造規律。

---

## 本物感の源(この variant の背骨の要約)
**3層の不透明な面 + chrome に寄せたブランド + 抑制された weight 階調 + 非競合な状態 tint**。
派手さを足すのでなく、Apple の Deference/Depth を**高密度管理画面へ適応**させた静かな本物感。

> base から変えていない所(タイポ階調の素性 / スペーシング 8pt / 角丸スケール / Clarity の形状言語=
> ラインアイコン+サークルアバター)は apple.md を参照。ここで再掲しない。

---

## D3 への引き渡し(variant として書く材料)
- `kind: variant` / `extends: apple`。§3 トークンは**デルタのみ**:
  - **上書き**: `--color-accent`(#005fa2)/ `--color-accent-hover`(#003a63)。
  - **追加**: `--brand-navy` / `--brand-skyblue` / `--color-accent-tint` / `--color-fill-strong` /
    `--fill-success|warning|neutral` / `--row-hover` / `--scrim` / `--sidebar-*` 群 /
    `--sidebar-width` / `--panel-width`。
  - **省略**(base にあるが本 variant は不使用): `caption2` / `label-quaternary` / `blur-material`。
    → D3 で「省略」を明記(使わない判断も哲学の一部)。
- §4 レイアウト規約に V1(3層)・V3(タイポ抑制)・V4(状態tint)・V5(on-dark名前空間)を落とす。
- §0 ルーター用メタ: 得意 = エンタープライズ管理画面/一覧・テーブル/詳細シート。
  apple base の「LP・コンシューマ」とは**逆の得意領域**(= variant の存在意義)。
