# Carbon 哲学リファレンス

`references/carbon/carbon.md` — IBM Carbon Design System に基づくデザイン哲学の
自己完結リファレンス。**原則 + 正確なトークン値 + レイアウト規約**をこのファイル内に
閉じ込め、他哲学に値が漏れないようにする(親 SKILL.md / §3.1)。構造は apple.md を踏襲(§7)。

> 一次情報: [Carbon Design System](https://carbondesignsystem.com/) /
> [Color tokens](https://carbondesignsystem.com/elements/color/tokens/) /
> [Color usage(layering)](https://carbondesignsystem.com/elements/color/usage/) /
> [Spacing](https://carbondesignsystem.com/elements/spacing/overview/) /
> [2x Grid](https://carbondesignsystem.com/elements/2x-grid/overview/) /
> [Type](https://carbondesignsystem.com/elements/typography/overview/) /
> [Tile(影なし)](https://carbondesignsystem.com/components/tile/usage/)

---

## 0. ルーター用メタ(画面タイプで選ぶ / §3.3)

| 項目 | 内容 |
|---|---|
| **得意な画面タイプ** | エンタープライズ管理画面 / ダッシュボード / 大規模データテーブル / 密なフォーム / 業務アプリ / 設定・管理コンソール |
| **不得意な画面タイプ** | 感情訴求のマーケLP・ブランド表現重視のコンシューマページ → **Apple** を選ぶ |
| **トーン** | 合理的・効率的・中立・情報密度高・一貫性最優先 |
| **本物感の源** | **離散的な背景レイヤー(White↔Gray10)で面の階層**を作る / 8px の 2x Grid / IBM Plex の type トークン / 影は浮く要素のみ |

---

## 1. 原則(IBM Design Language 由来)

Carbon は IBM Design Language を実装したシステム。トークン・レイアウト判断はここから導く。

- **構造による明瞭さ**: 2x Grid を背骨に、情報を整列・反復させて密度の高い画面でも読み解ける。
- **面(plane)で階層を作る**: 階層は**濃い影ではなく、離散的な背景レイヤートークン**(`layer-01/02/03`)で
  表現。light テーマでは White↔Gray10 を交互に重ねる。影は modal/menu/toast 等の**真に浮く要素のみ**。
- **効率と一貫性**: 同じ部品・同じ間隔・同じ挙動を反復。装飾より機能。データ作業の速度を最優先。
- **包摂(アクセシブル)**: 既定で WCAG 2.1 AA 準拠。トークン自体がコントラストを満たすよう設計。

---

## 2. トークンの出所(provenance — 必読 / §3.2)

Carbon は **機械可読な公式トークンを正式配布**(`@carbon/themes`, `@carbon/styles`)。
よって Apple と異なり **ほぼ全て公式値をそのままコピー**できる。これが Carbon を選ぶ強み。

| トークン群 | 出所 | 扱い |
|---|---|---|
| **カラー / レイヤー** | 公式 color tokens(White テーマ) | 公式値をそのまま使用 |
| **タイポ(サイズ/行間/ウェイト)** | 公式 type tokens(IBM Plex) | 公式値をそのまま使用 |
| **スペーシング** | 公式 spacing tokens(`$spacing-01`〜`13`) | 公式値をそのまま使用 |
| **グリッド / ブレークポイント** | 公式 2x Grid | 公式値をそのまま使用 |
| **コントラスト** | 公式 a11y(WCAG 2.1 AA) | 不可侵の下限 |
| **角丸** | 導出(Carbon は基本 0。控えめに使う場合のみ) | 既定 0、近似値は明記 |

---

## 3. デザイントークン(`:root`)

親パイプラインはこのブロックを HTML の `:root` 先頭に出力する。以降 HTML は **全て `var(--…)`** で
参照する(§6)。`accent` 定義は 1 箇所のみ。token 名は Carbon 語彙に従う(各哲学の語彙は自分の
ファイルに閉じ込める。不変なのは「全 var() / accent 1 箇所」という出力ルールであって名前ではない)。

```css
:root {
  /* ── フォント(IBM Plex。CJK は Plex Sans JP へフォールバック) ─────────────── */
  --font-sans: "IBM Plex Sans", "IBM Plex Sans JP", "Helvetica Neue",
               "Hiragino Kaku Gothic ProN", "Yu Gothic", Meiryo, Arial, sans-serif;
  --font-mono: "IBM Plex Mono", "SFMono-Regular", Menlo, Consolas, monospace;

  /* ── カラー: 背景レイヤー [公式 White テーマ] ───────────────────────────────
     階層の核。面の重なりは影でなくこの layer の段差で作る                        */
  --background:     #ffffff;   /* ページ最背面 */
  --layer-01:       #f4f4f4;   /* Gray 10 — 背面の上の第1面 */
  --layer-02:       #ffffff;   /* 第1面の上の第2面(交互に戻る) */
  --layer-03:       #f4f4f4;   /* 第3面 */
  --layer-accent-01:#e0e0e0;   /* Gray 20 — 面上のアクセント区画 */
  --field-01:       #f4f4f4;   /* 入力欄(背景=white 時) */
  --field-02:       #ffffff;   /* 入力欄(背景=layer-01 時) */

  /* テキスト [公式] */
  --text-primary:     #161616;            /* Gray 100 */
  --text-secondary:   #525252;            /* Gray 70 */
  --text-helper:      #6f6f6f;            /* Gray 60 */
  --text-placeholder: #a8a8a8;            /* Gray 40 */
  --text-on-color:    #ffffff;            /* 濃色面上の前景 */
  --text-disabled:    rgba(22,22,22,0.25);

  /* 罫線 [公式] */
  --border-subtle:      #e0e0e0;  /* Gray 20 */
  --border-strong:      #8d8d8d;  /* Gray 50 */
  --border-interactive: #0f62fe;  /* Blue 60 */

  /* アクセント(=interactive / Blue 60)。定義はここ 1 箇所のみ */
  --color-accent:        #0f62fe;  /* $interactive / button-primary */
  --color-accent-hover:  #0353e9;
  --color-accent-active: #002d9c;
  --color-on-accent:     #ffffff;
  --link-primary:        #0f62fe;
  --focus:               #0f62fe;

  /* ステータス(support tokens)。アクセントと競合させない(フェーズ3ゲート観点) */
  --color-danger:  #da1e28;  /* support-error */
  --color-success: #24a148;  /* support-success */
  --color-warning: #f1c21b;  /* support-warning */
  --color-info:    #0043ce;  /* support-info */

  /* グレースケール(Gray 10–100) [公式] */
  --gray-10: #f4f4f4; --gray-20: #e0e0e0; --gray-30: #c6c6c6; --gray-40: #a8a8a8;
  --gray-50: #8d8d8d; --gray-60: #6f6f6f; --gray-70: #525252; --gray-80: #393939;
  --gray-90: #262626; --gray-100:#161616;

  /* ── タイポ: 公式 type tokens(productive set) ───────────────────────────────
     形式: size / line-height / weight                                          */
  --text-caption-01:  12px; --leading-caption-01:  16px; --weight-caption-01:  400;
  --text-label-01:    12px; --leading-label-01:    16px; --weight-label-01:    400;
  --text-helper-01:   12px; --leading-helper-01:   16px; --weight-helper-01:   400;
  --text-body-01:     14px; --leading-body-01:     20px; --weight-body-01:     400;
  --text-body-02:     16px; --leading-body-02:     24px; --weight-body-02:     400;
  --text-heading-01:  14px; --leading-heading-01:  20px; --weight-heading-01:  600;
  --text-heading-02:  16px; --leading-heading-02:  24px; --weight-heading-02:  600;
  --text-heading-03:  20px; --leading-heading-03:  28px; --weight-heading-03:  400;
  --text-heading-04:  28px; --leading-heading-04:  36px; --weight-heading-04:  400;
  --text-heading-05:  32px; --leading-heading-05:  40px; --weight-heading-05:  400;
  --text-heading-06:  42px; --leading-heading-06:  50px; --weight-heading-06:  300;
  --text-heading-07:  54px; --leading-heading-07:  64px; --weight-heading-07:  300;

  /* ── スペーシング: 公式 spacing tokens(8px mini-unit 基調) ─────────────────── */
  --spacing-01: 2px;  --spacing-02: 4px;  --spacing-03: 8px;  --spacing-04: 12px;
  --spacing-05: 16px; --spacing-06: 24px; --spacing-07: 32px; --spacing-08: 40px;
  --spacing-09: 48px; --spacing-10: 64px; --spacing-11: 80px; --spacing-12: 96px;
  --spacing-13: 160px;

  /* ── 角丸 [導出: Carbon は基本 0。直角がデフォルト] ───────────────────────── */
  --radius-0: 0;     /* 既定。Carbon らしさは直角 */
  --radius-s: 4px;   /* どうしても丸める場合のみ(control 等) */

  /* ── 影 [公式方針: 面の階層には使わない。浮く要素のみ] ────────────────────── */
  --shadow-overlay: 0 2px 6px rgba(0,0,0,0.20);  /* menu/popover/modal のみ */
  /* タイル/カードに影を足さない(公式: tile は drop shadow を持たない) */

  /* ── a11y [公式・不可侵] ─────────────────────────────────────────────────── */
  /* コントラスト: 本文 4.5:1 / 大文字・非テキスト 3:1(WCAG 2.1 AA) */
  --target-min: 44px; /* 推奨タッチ最小(WCAG 2.5.5)。既定の control 高は下記 4.3 */

  /* ── グリッド / レイアウト [公式 2x Grid] ────────────────────────────────── */
  --grid-columns: 16;
  --grid-gutter: 32px;     /* 列間(wide) */
  --grid-margin: 16px;     /* 端マージン(sm)。lg 以上で広がる */
  --container-max: 1584px; /* max ブレークポイント */
}
```

> **ダークテーマ**(任意): Carbon は g90 / g100 を公式提供。追加する場合は
> `@media (prefers-color-scheme: dark)` で g100 系に上書き(`--background:#161616;
> --layer-01:#262626; --layer-02:#393939; --text-primary:#f4f4f4;
> --color-accent:#4589ff;`)。モック範囲では White 既定で可。

---

## 4. レイアウト規約

### 4.1 2x Grid / ブレークポイント [公式]
基本単位は **8px の mini-unit**。16 列・列間 32px。

| 区分 | 最小幅 | 列数 | 用途 |
|---|---|---|---|
| sm  | `320px`  | 4  | モバイル(基点) |
| md  | `672px`  | 8  | タブレット |
| lg  | `1056px` | 16 | デスクトップ(標準の管理画面) |
| xlg | `1312px` | 16 | 広いダッシュボード |
| max | `1584px` | 16 | `--container-max` で頭打ち |

### 4.2 面(plane)で階層を作る ← Carbon の核心
- 影で浮かせず、**背景レイヤートークンの段差**で階層を表現する。
  - ページ = `--background`(白) → その上のパネル = `--layer-01`(Gray10) →
    さらにネストした区画 = `--layer-02`(白に戻る) → `--layer-03`(Gray10)。**交互に往復**。
- 入力欄は乗っている面に応じて `--field-01`(白面上) / `--field-02`(Gray10面上)を選ぶ。
- 罫線は `--border-subtle`(区切り)/`--border-strong`(強い境界)。多用せず面の段差を主役に。
- **タイル/カードに影を足さない**(公式)。区切りは layer と border で。

### 4.3 コントロール高さ(密度) [公式]
データ作業の密度に合わせて高さを選ぶ。既定は md(40px)。

| サイズ | 高さ | 用途 |
|---|---|---|
| sm | 32px | 高密度テーブル/ツールバー |
| md | 40px | 既定 |
| lg | 48px | 余裕のあるフォーム |
| xl | 64px | ヒーロー的な主要操作 |

> タッチ主体の画面では `--target-min`(44px)を下回らないよう md/lg を選ぶ。

### 4.4 タイポの使い分け
- 画面タイトル = `heading-04`〜`heading-05`、セクション見出し = `heading-03`、
  本文 = `body-01`(密) / `body-02`(読み物)、表ヘッダ/ラベル = `heading-01`/`label-01`。
- 数値・コード列は `--font-mono`(IBM Plex Mono)で桁を揃える。
- 大見出しの `heading-06/07`(weight 300)は表紙/空状態など限定的に。

### 4.5 アクセシビリティ [公式・不可侵]
- コントラスト **本文 4.5:1 / 大文字・非テキスト・UIコンポーネント 3:1 以上**(WCAG 2.1 AA)。
  - `--text-placeholder`(Gray40)/`--gray-30` 以下は本文に使わない(プレースホルダ/装飾のみ)。
- フォーカスリングは `--focus`(Blue60)を可視で必ず付ける。
- タッチ標的は `--target-min` 44px を目安(WCAG 2.5.5)。

---

## 5. look を決める数個の決定(保存後に報告 / §6)

1. アクセント = Blue 60(`--color-accent`)。ブランド色があれば 1 箇所差し替え。
2. 階層 = **影でなく背景レイヤー(White↔Gray10)の段差**で表現している。
3. 密度 = control 高さ(sm/md/lg)で調整可能。既定 md(40px)。
4. タイポ = IBM Plex の productive type トークン(heading-03/04 + body-01)。

---

## 6. 範囲限定ハイブリッドの注意(§3.4)

- Carbon をベースに、特定ゾーンだけ他哲学を借りるのは可。逆に **Apple ベースの画面で
  データ表ゾーンだけ Carbon 式の layer 階層を借りる**のが代表例(設計 §3.4)。
- 借用値は**専用の名前空間トークン**(例 `--sb-*`)に閉じ込め、本節の Carbon トークンを
  一切上書きしない。借用は「ゾーン限定」。哲学を丸ごと混ぜない(無個性化する)。
