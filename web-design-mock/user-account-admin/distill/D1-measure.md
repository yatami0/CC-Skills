---
phase: D1-measure
status: in-review
updated_at: 2026-06-27
next_action: 検証ゲート — 逐語抽出に推論が混入していないか / 各観測に出典(行)が付いているかを点検。承認後 D2。
---
# D1 — 計測 (Capture)

ソース: `output/mock-v6.html`(行番号は同ファイル)。**本フェーズは事実のみ。推論は D2。**
計測対象は「`:root` の逐語」と「その実使用」。値の改変・補完は一切しない。

---

## 1. `:root` 逐語抽出(地の真実 / L14–103)

> そのままコピー。1トークンも変えない。グルーピングはソースのコメントに従う。

### 1.1 フォント(L15–18)
```
--font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
  "Helvetica Neue", "Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN",
  "Yu Gothic", Meiryo, sans-serif;
```
- 観測: Apple system stack に **CJK フォント(Noto Sans JP / Hiragino / Yu Gothic / Meiryo)を挿入**(L17)。

### 1.2 タイポ: Dynamic Type iOS Large(L20–30)
```
largetitle 34/41/400  title1 28/34/400  title2 22/28/400  title3 20/25/400
headline 17/22/600     body 17/22/400    callout 16/21/400  subhead 15/20/400
footnote 13/18/400     caption1 12/16/400
```
- 観測: 親 apple.md の Dynamic Type 表と**同値**。ただし `caption2`(11px)は**未定義**(apple.md にはある)。

### 1.3 カラー: System Colors / light(L32–63)
```
背景:   --color-bg #FFFFFF / --color-bg-secondary #F2F2F7 / --color-surface #FFFFFF
ラベル: --color-label rgba(0,0,0,1) / -secondary rgba(60,60,67,.60) / -tertiary rgba(60,60,67,.30)
区切り: --color-separator rgba(60,60,67,.29) / -opaque #C6C6C8
塗り:   --color-fill rgba(120,120,128,.20) / --color-fill-strong rgba(120,120,128,.32)
```
- 観測: 背景・ラベル・区切りは apple.md と**同値**。ただし apple.md の `label-quaternary` は無い。`fill-strong`(.32)は本モックで**追加**(apple.md は secondarySystemFill .20 のみ)。

### 1.4 アクセント = ブランド上書き(L46–50)※宣言1箇所
```
--color-accent       #005fa2   /* AUX corporate blue */
--color-accent-hover #003a63   /* AUX navy(押下で沈む) */
--color-on-accent    #FFFFFF
--color-accent-tint  rgba(0,95,162,0.12)
```
- 観測: accent は **systemBlue(#007AFF)ではなくブランド青 #005fa2**(apple.md からの意図的な差し替え)。hover は navy。

### 1.5 ブランド補助色(L52–54)
```
--brand-navy    #003a63   /* 主色・ブランドマーク */
--brand-skyblue #009fe8   /* 明るいハイライト(任意) */
```

### 1.6 ステータス / グレースケール(L56–63)
```
success #34C759  warning #FF9500  danger #FF3B30          (Apple System Colors と同値)
gray #8E8E93 gray2 #AEAEB2 gray3 #C7C7CC gray4 #D1D1D6 gray5 #E5E5EA gray6 #F2F2F7
```
- 観測: danger は定義のみ。**本文中で danger の使用は見当たらない**(§2.5 参照)。

### 1.7 スペーシング(8pt 基調 / L65–68)
```
1:2  2:4  3:8  4:12  5:16  6:20  7:24  8:32  9:40  10:48  11:64  12:80
```
- 観測: apple.md と**同値・同数**(12 段)。

### 1.8 角丸(L70–75)
```
s:8  m:12  l:18  xl:28  pill:980
```
- 観測: apple.md と**同値**。

### 1.9 影(L77–79)
```
--shadow-1 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)
--shadow-2 0 8px 30px rgba(0,0,0,.10)
```
- 観測: apple.md と**同値**。`--blur-material`(apple.md にある)は**未定義**(本モックは blur 不使用)。

### 1.10 a11y / レイアウト(L81–86)
```
--touch-min 44px
--sidebar-width 264px   --panel-width 460px
```

### 1.11 名前空間トークン(Apple 派生の補助 / L88–93)
```
--scrim        rgba(0,0,0,.40)
--fill-success rgba(52,199,89,.16)   --fill-warning rgba(255,149,0,.16)
--fill-neutral rgba(120,120,128,.14) --row-hover    rgba(120,120,128,.08)
```
- 観測: ステータス**tint**(薄い面)を success/warning/neutral で定義。danger tint は**無い**。

### 1.12 サイドバー on-dark トークン(濃紺ゾーン限定 / L95–102)
```
--sidebar-bg          #003a63 (= brand-navy)
--sidebar-fg          rgba(255,255,255,.92)   --sidebar-fg-dim rgba(255,255,255,.60)
--sidebar-fill        rgba(255,255,255,.10)   --sidebar-fill-strong rgba(255,255,255,.16)
--sidebar-border      rgba(255,255,255,.16)
--sidebar-accent      #009fe8 (= brand-skyblue)
```
- 観測: **範囲限定ハイブリッド**(親 §6)。濃紺面の上で on-dark の前景/塗り/境界を白の不透明度で構成。サイドバー選択アイコンだけ skyblue。

---

## 2. 実使用の棚卸し(どのトークンがどこで効いているか)

### 2.1 色の3層構造(本物感の中心と見られる)
- **濃紺サイドバー**(`--sidebar-bg #003a63`, L125)/ **グレー地キャンバス**(`--color-bg-secondary`, L113,211)/ **白カード**(`--color-surface`, L257)の**3層**。
- カードは余白で島化(`.main` padding `--space-7`, gap `--space-6`, L212–213)。

### 2.2 余白リズム
- メイン: padding `--space-7`(24px, L212)、要素間 gap `--space-6`(20px, L213)。
- テーブルセル: padding `--space-4 --space-7`(12/24px, L272,279)、行高 `60px`(L283)。
- サイドバー nav-item: min-height `--touch-min`(44px, L163)、padding `--space-2 --space-4`(L164)。

### 2.3 タイポ階調(実際に使われた段だけ)
| 用途 | トークン | 出典 |
|---|---|---|
| 本文/基準 | body 17 | L110 |
| 氏名・検索・nav | callout 16 | L168,245,301 |
| テーブル本文・ページネーション | subhead 15 | L265,348 |
| th・補助ラベル・footnote | footnote 13 | L269,312,324 |
| シート見出し・大アバター | title3 20 | L429,432 |
| 強調 weight | headline 600 | L179,301,315 |
- 観測: **largetitle / title1 / title2 は未使用**(大ヒーロー無し=管理画面)。強調は色とサイズより **weight 600 と weight 400 のコントラスト**で作る(th は weight-body=400, L270)。

### 2.4 奥行きの作り方
- `--shadow-1`(微細)= 検索入力(L242)・一覧カード(L259)のみ。
- `--shadow-2`(浮き)= **詳細シートだけ**(L396)。
- 観測: 濃いドロップシャドウ無し。奥行きは**3層の面 + 微細影**。blur(素材)は**不使用**(`--blur-material` 未定義)。

### 2.5 accent 規律(重要 — 控えめ)
- `--color-accent #005fa2` の使用箇所は **focus-visible のアウトラインのみ**(検索 L249 / 行 L288 / seg L376 / シート閉 L421)。
- **塗りの主 CTA は本モックに無い**(「ユーザー追加」ボタンは v6 に未配置)。
- `--brand-navy` は大アバター背景(L426)。サイドバー選択アイコンは `--sidebar-accent` skyblue(L181)。
- 観測: accent は「面を埋める色」でなく**フォーカス/状態を示す色**として最小使用。ブランドの「色」はもっぱら**濃紺の面(chrome)**で表現。

### 2.6 角丸の階層運用(平坦化していない)
- pill(アバター/ロール/ステータス/ドット, L193,293,309,323,328)/ m=12(nav-item L166, 検索 L240, select L357, seg L357)/ l=18(カード L258)/ xl=28(シート L394–395)/ s=8(ブランドマーク L146, seg button L369)。
- 観測: 半径は**階層に応じて4段**使い分け。

### 2.7 ステータス表現
- **tint pill + 色ドット + ラベル**(L318–334)。active=success tint+緑ドット / invited=warning tint+橙ドット / disabled=neutral tint+グレードット。
- ロール pill は中立(`--fill-neutral`)、管理者のみ `--color-fill-strong` + weight 600(L315)。

### 2.8 形状言語(Clarity の一貫性)
- アイコンは**ラインアイコン**(stroke 1.7–1.8, L468 他)。人物は**サークルアバター**(radius-pill, L193,293)。req(01)の「形状言語の一貫性」と一致。

---

## 3. 計測サマリ(D2 への引き渡し材料 / ここでは解釈しない)

- 親 apple.md と**同値の基盤**: タイポ(Dynamic Type)/ スペーシング / 角丸 / 影 / 背景・ラベル・区切り。
- 本モック**固有の差分**(= 蒸留で哲学にすべき候補):
  1. accent をブランド青へ差し替え + brand-navy/skyblue 補助。
  2. 濃紺サイドバーの **on-dark 名前空間トークン**(範囲限定ハイブリッド)。
  3. **色の3層構造**(navy chrome / gray canvas / white card)。
  4. ステータス **tint pill + ドット**、ロール pill の中立/強調2段。
  5. `fill-strong` 追加・`caption2`/`label-quaternary`/`blur-material` 省略(=高密度管理画面向けの取捨)。
  6. タイポは **largetitle〜title2 不使用**・weight コントラスト主体(ヒーロー無しの管理画面適応)。
- **未確定の問い(D2/D3 で判断)**: これは「Apple そのもの」か、「Apple 派生の管理画面哲学(aux-admin)」か。
  差分2〜4・6 は apple.md に無い構造で、**再利用可能な独立哲学**になり得る。
