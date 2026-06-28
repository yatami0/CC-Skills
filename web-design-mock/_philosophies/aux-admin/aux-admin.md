---
name: tmp-admin
provenance: empirical            # authoritative(Apple/Carbon)ではない。実測由来
kind: variant
extends: apple                   # base = references/apple/apple.md
derived_from: user-account-admin/output/mock-v6.html
validated_screens:               # D4 同型再現を実証できた画面タイプ
  - エンタープライズ管理画面(一覧)
  - データテーブル / 時系列ログ一覧
screen_scope:                    # D4 スコープ地図
  validated:
    - 管理画面ユーザー/アカウント一覧（基準）
    - 監査ログ一覧（同型・別コンテンツ。same-family 93）
  partial: []
  unfit:
    - マーケLP / コンシューマ向けヒーロー主導ページ（異型・weak 28。→ base の apple を使う）
status: approved                 # D4: 同型・不足ゼロ + ホリスティック same-family 達成
updated_at: 2026-06-27
---

# tmp-admin 哲学リファレンス(variant: extends apple)

Apple HIG の Deference/Depth を**エンタープライズ管理画面へ適応**させた派生哲学。
`mock-v6.html`(ユーザー管理一覧)から蒸留。**本ファイルは apple.md への "デルタ" のみ**を持つ。
同値の基盤(タイポ階調の素性 / スペーシング 8pt / 角丸スケール / 影スケール / Clarity の形状言語)は
`references/apple/apple.md` を参照(再掲しない)。最終生成時は `apple の :root` ← `本ファイルのデルタ`
の順でマージして `:root` を組む。

> 蒸留メモ: `distill/D1-measure.md`(計測)/ `distill/D2-principles.md`(原則)。

---

## 0. ルーター用メタ(画面タイプで選ぶ)

| 項目 | 内容 |
|---|---|
| **得意な画面タイプ** | エンタープライズ管理画面 / ユーザー・アカウント一覧 / データテーブル / 詳細スライドシート |
| **不得意な画面タイプ** | マーケ LP / コンシューマ向けヒーロー主導ページ(→ base の **apple** をそのまま使う) |
| **トーン** | 静謐・高密度・長時間利用に耐える落ち着き。装飾は最小、ブランドは面で出す |
| **本物感の源** | **3層の不透明な面**(navy chrome / gray canvas / white card)+ **chrome に寄せたブランド** + **抑制された weight 階調** + **非競合な状態 tint** |

> base(apple)が「LP・コンシューマ」を得意とするのに対し、本 variant は**逆の得意領域**(密な管理画面)。
> これが variant の存在意義。`validated_screens` は D4 で実証できた画面タイプのみ追記する。
>
> **境界(D4 実証)**: LP に転用すると weak(盲検 28)。原因は V3(largetitle〜title2 を省略=ヒーロー見出しが
> 作れない)と V2(accent を塗りに使わない=強い CTA が作れない)。**管理画面での強み=LP での弱み**。
> よって LP・ヒーロー主導ページは base の **apple** を使う(本 variant を無理に広げない)。

---

## 1. 原則(apple base へのデルタ)

base の **Clarity / Deference / Depth**(apple.md §1)を**継承**。本 variant はそれを管理画面へ
適応・追加する。各原則は `mock-v6` の実測で裏付け(`distill/D2-principles.md` 参照)。

- **V1. 奥行きは「不透明な3層の面」で作る(Depth の適応=変更)**
  base の Depth は素材(blur/vibrancy)。本 variant は **blur を使わず**、濃紺 chrome / グレー canvas /
  白 card の**3つの不透明な面の重なり**で階層を作る。浮く要素(詳細シート)だけ強い影。
- **V2. ブランドは chrome ゾーンで、accent は状態で(brand-via-chrome / 追加・非自明)**
  ブランドの「色」は accent の塗りでなく**濃紺サイドバーという面**で表現する。accent(ブランド青)は
  **フォーカス/状態の最小用途**に限定し、面を埋めない。← これを破ると「青ボタンだらけ」の別物になる。
- **V3. 強調は色でなく weight とサイズの抑制で(Deference の高密度適応)**
  ヒーロー級タイポ(largetitle/title1/title2)を使わない。強調は **weight 600⇔400 のコントラストと tint**。
- **V4. 状態色はブランドと非競合に、tint pill + ドットで(追加)**
  ステータスは System Colors を **薄い tint 面 + 色ドット + ラベル**で出し、ブランド accent と色域を分ける。
- **V5. on-dark ブランド面は範囲限定の名前空間に閉じ込める(追加)**
  濃紺ゾーンの前景/塗り/境界/選択色は **`--sidebar-*` 名前空間**に隔離し、apple base のラベル/区切り
  トークンを一切上書きしない(範囲限定ハイブリッド = apple.md §6 の徹底)。

---

## 2. トークンの出所(provenance — デルタ分のみ)

base 由来のトークンは apple.md §2 に従う。本 variant が**足した/変えた**トークンの出所:

| トークン群 | 出所 | 扱い |
|---|---|---|
| `--font-sans` 上書き(CJK 挿入) | **実測(mock由来)** = "Noto Sans JP" を base stack に挿入 | 日本語本文。ロケールで差替 |
| `--font-mono`(追加) | **推論**(導出: SF Mono 系) | 密データ等幅(§4.4) |
| accent 上書き(`--color-accent` 等) | **実測(mock由来)** = tmp ブランド青 | ブランド色。差し替え可(§5) |
| brand 補助(`--brand-navy/skyblue`) | **実測(mock由来)** | ブランド面・ハイライト |
| 状態 tint(`--fill-success/warning/neutral`) | **推論**(System Color × 低 α の tint 化) | 機能色。非競合 |
| on-dark(`--sidebar-*`) | **推論**(白 × 不透明度で on-dark 階調を構成) | ゾーン限定 |
| `--color-fill-strong` / `--row-hover` / `--scrim` / レイアウト幅 | **推論**(導出) | 補助 |

> ブランド3色(#005fa2 / #003a63 / #009fe8)だけが固有の実測値。残りは Apple 系の規律からの導出。

---

## 3. デザイントークン(`:root` デルタ)

**本ブロックはデルタのみ。** 親パイプラインが apple.md §3 の `:root` を先に出力し、その後に以下で
**上書き/追加**する。`var(--…)` 参照は base と本デルタの和集合を指す。accent 宣言は1箇所(ここ)。

```css
/* ── 上書き(apple base の同名トークンを差し替え) ───────────────────────────── */
:root {
  /* font = base(apple)stack に CJK 本文 "Noto Sans JP" を挿入(実測。D4 不足#1) */
  --font-sans:
    -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
    "Helvetica Neue", "Noto Sans JP", "Hiragino Sans", "Hiragino Kaku Gothic ProN",
    "Yu Gothic", Meiryo, sans-serif;

  /* accent = tmp コーポレートブルー(base の systemBlue #007AFF を上書き)。宣言はここ1箇所 */
  --color-accent:        #005fa2;            /* tmp corporate blue(実測) */
  --color-accent-hover:  #003a63;            /* tmp navy / 押下で沈む(実測) */
  /* --color-on-accent は base と同値(#FFFFFF)→ 再掲しない */
}

/* ── 追加(apple base に無いトークン) ──────────────────────────────────────── */
:root {
  /* 等幅フォント(密データ用。D4 不足#2。導出: SF Mono 系) */
  --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  --color-accent-tint:   rgba(0,95,162,0.12);   /* accent の薄面(推論) */

  /* ブランド補助色(実測) */
  --brand-navy:    #003a63;
  --brand-skyblue: #009fe8;

  /* 塗りの強段(推論: secondarySystemFill .20 の上の段) */
  --color-fill-strong: rgba(120,120,128,0.32);

  /* 状態 tint(推論: System Color を低 α で面化。V4。danger は D4 で補完) */
  --fill-success: rgba(52,199,89,0.16);
  --fill-warning: rgba(255,149,0,0.16);
  --fill-danger:  rgba(255,59,48,0.16);
  --fill-neutral: rgba(120,120,128,0.14);
  --row-hover:    rgba(120,120,128,0.08);
  --scrim:        rgba(0,0,0,0.40);

  /* レイアウト幅(導出) */
  --sidebar-width: 264px;
  --panel-width:   460px;

  /* on-dark サイドバー(濃紺ゾーン限定の名前空間。V5。base を上書きしない) */
  --sidebar-bg:          #003a63;              /* = brand-navy */
  --sidebar-fg:          rgba(255,255,255,0.92);
  --sidebar-fg-dim:      rgba(255,255,255,0.60);
  --sidebar-fill:        rgba(255,255,255,0.10);
  --sidebar-fill-strong: rgba(255,255,255,0.16);
  --sidebar-border:      rgba(255,255,255,0.16);
  --sidebar-accent:      #009fe8;              /* = brand-skyblue(選択アイコン) */
}
```

### 3.省 — 省略(base にあるが本 variant は意図して使わない)
「使わない判断」も哲学の一部(V1/V3 の裏返し)。base マージ時に復活させない:

- **`--blur-material`**: 使わない。奥行きは素材でなく**3層の面**で作る(V1)。
- **`--text-largetitle/title1/title2`(及び leading/weight)**: 使わない。ヒーロー級見出しを置かない(V3)。
- **`--text-caption2` / `--color-label-quaternary`**: 不使用(高密度UIで段を増やさない)。

---

## 4. レイアウト規約(apple base へのデルタ)

base の グリッド/ブレークポイント(size class 近似)/ 余白リズム/ a11y(44px・4.5:1/3:1)は
apple.md §4 を**継承**。本 variant の追加・変更:

### 4.1 面構成 = 3層(V1)
- **濃紺サイドバー(chrome)** / **`--color-bg-secondary` キャンバス** / **`--color-surface` 白カード**。
- カードは余白で島化(メイン padding `--space-7`、要素間 gap `--space-6`)。カードは `--radius-l` + `--shadow-1`。
- 詳細はキャンバスに浮かせず**右スライドシート**(`--shadow-2` + `--radius-xl`)で出す。

### 4.2 サイドバー(on-dark / V5)
- 幅 `--sidebar-width`、`position: sticky`。前景/塗り/境界は **`--sidebar-*` のみ**で構成。
- nav-item は min-height `--touch-min`、選択は `--sidebar-fill-strong` + アイコンを `--sidebar-accent`。

### 4.3 タイポの使い分け(V3)
- 本文 `body`、テーブル本文 `subhead`、th/補助 `footnote`、氏名/検索 `callout`、シート見出し `title3`。
- **largetitle〜title2 を使わない**。強調は weight 600(`headline`)と tint。th は weight 400 で控えめ。

### 4.4 テーブル(高密度・罫線控えめ)
- セル padding `--space-4 --space-7`、行高 60px、区切りは `--color-separator`(細）。行 hover `--row-hover`。
- 行は `role="button"` でクリック→詳細シート(行アクション列を持たない)。
- **密データは等幅で(D4 由来)**: ID / IP / API キー / ハッシュ等の機械的識別子は `--font-mono`、
  桁を比べるタイムスタンプ・数値は `font-variant-numeric: tabular-nums`。羅列データの可読性を保つ。
  「得意=データテーブル」を名乗る以上、等幅/タブ揃えは哲学の必須要素(無いとジェネレータが捏造する)。

### 4.5 状態・ロール(V4)
- ステータス = `--fill-{success|warning|neutral}` の tint pill + 色ドット(`--color-{success|warning|gray}`)。
- ロール = 中立 pill(`--fill-neutral`)。管理者のみ `--color-fill-strong` + weight 600。
- **accent はフォーカスリングのみ**(`:focus-visible { outline: 2px solid var(--color-accent) }`)。塗りCTAに使わない(V2)。

---

## 5. look を決める数個の決定(保存後に報告)

1. ブランド = 濃紺の面(サイドバー)で表現。accent ブルー(`--color-accent` #005fa2)はフォーカス/状態のみ。
   別ブランドへは `--color-accent` / `--brand-navy` / `--brand-skyblue` の3値差し替えで移行できる。
2. 奥行き = 影でなく **navy / gray / white の3層**。浮くのは詳細シートだけ。
3. 強調 = 色でなく **weight と tint**(ヒーロー級タイポを使わない)。
4. 状態 = tint pill + ドットでブランドと色域を分離。

---

## 6. 範囲限定ハイブリッドの注意(apple.md §6 を継承)

- 本 variant の `--sidebar-*` は**濃紺ゾーン限定の名前空間**。apple base のラベル/区切り/背景トークンを
  一切上書きしない(V5)。
- さらに別ゾーンを借りる場合も専用名前空間に閉じ込め、base と本デルタの両トークンを壊さない。
