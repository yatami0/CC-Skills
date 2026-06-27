# Material 3 哲学リファレンス

`references/material/material.md` — Google **Material Design 3(Material You)** に基づく
デザイン哲学の自己完結リファレンス。**原則 + 正確なトークン値 + レイアウト規約**を
このファイル内に閉じ込め、他哲学に値が漏れないようにする(親 SKILL.md / §3.1)。
構造は apple.md / carbon.md / ant.md を踏襲(§8)。

> 一次情報: [Material Design 3](https://m3.material.io/) /
> [Design tokens](https://m3.material.io/foundations/design-tokens/overview) /
> [Color system / roles](https://m3.material.io/styles/color/roles) /
> [Type scale](https://m3.material.io/styles/typography/type-scale-tokens) /
> [Shape](https://m3.material.io/styles/shape/corner-radius-scale) /
> [Elevation](https://m3.material.io/styles/elevation/overview) /
> [Accessibility](https://m3.material.io/foundations/accessible-design/overview)
>
> トークン値は公式 Material token database から生成される
> [`flutter/flutter` gen_defaults data](https://github.com/flutter/flutter/tree/master/dev/tools/gen_defaults/data)
> (`palette.json` / `color_light.json` / `text_style.json` / `shape.json` /
> `elevation.json`、version `6_1_0`)で裏取りした公式値。

---

## 0. ルーター用メタ(画面タイプで選ぶ / §3.3)

| 項目 | 内容 |
|---|---|
| **得意な画面タイプ** | Android/Web の**コンシューマ向けアプリUI** / 表現力重視のプロダクト / フォーム&リスト中心アプリ / PWA / Google エコシステム寄りの製品 |
| **不得意な画面タイプ** | 静謐・禁欲的な高級感のマーケLP → **Apple**。工業的・高密度・直角の基幹系 → **Carbon**。ブランド色サイダーの SaaS 管理画面 → **Ant**(M3 でも admin は組めるが、真価は表現的 consumer) |
| **トーン** | 表現的(expressive)・カラフル・タクタイル(触れる面)・モーション主導。**色がブランドから生成され主役になる** |
| **本物感の源** | **tonal palette(primary/secondary/tertiary + 各 container)で意味づけた色** / **surface-container の段**+**tonal elevation(影 + surface-tint)** / 大きめのシェイプスケール(pill ボタン)/ Roboto の type scale / state layer(hover 8% 等) |

> **Apple との違い(両方 consumer なので重要)**: Apple は*禁欲・余白主導・低彩度・blur 素材で控えめ*。
> Material は*表現的・ブランド色を生成して主役に・角丸大きめ・elevation+tint で持ち上げる*。
> 「静かな高級感」なら Apple、「カラフルで触れる楽しさ」なら Material。

---

## 1. 原則(Material 3 / Material You)

Material 3 のコアは「**Personal(個人化)/ Adaptive(適応)/ Expressive(表現的)**」。
トークン・レイアウト判断はすべてここから導く。

- **Dynamic Color / Tonal(色は生成される)**: 色は1つの**種色(seed)**(ブランド色やユーザーの壁紙)から
  **tonal palette** を生成し、**役割(role)トークン**(primary / secondary / tertiary と各 container、
  surface 群)に割り当てる。色を直に置かず「役割」で考える。→ これが Material 最大の独自性。
- **Surfaces & Tonal Elevation(面と奥行き)**: 階層は `surface-container-lowest…highest` の**段**と、
  **elevation**(影 + `surface-tint`(=primary)による色味のオーバーレイ)で表現。
  Carbon の「段だけ」とも Apple の「影を抑え素材で」とも異なる、**段 + 影 + 色味**の合わせ技。
- **Expressive / Tactile(表現的で触れる)**: 大きめの角丸シェイプ、はっきりした type scale、
  state layer(押下・hover の半透明レイヤー)、モーションで「触れる」感触を作る。
  Apple と違い**色は鮮やかでよい**(ブランド由来なら)。
- **Accessible by default**: role システムが `on-*`(前景)と地のコントラストを担保する設計。
  本文 4.5:1 / 非テキスト 3:1(WCAG)を下回らない。

---

## 2. トークンの出所(provenance — 必読 / §3.2)

Material は **機械可読な公式トークンを正式配布**(`md.ref.*` / `md.sys.*`、Material Theme Builder)。
よって Carbon / Ant 同様 **ほぼ全て公式値をそのままコピー**できる。

| トークン群 | 出所 | 扱い |
|---|---|---|
| **カラー role / baseline palette** | 公式 `md.sys.color.*` ← `md.ref.palette.*`(baseline) | 公式値をそのまま使用。ただし **baseline は紫のフォールバック**(下記 ⚠) |
| **タイポ(size/line/weight/tracking)** | 公式 `md.sys.typescale.*`(Roboto) | 公式値をそのまま使用 |
| **シェイプ(角丸スケール)** | 公式 `md.sys.shape.corner.*` | 公式値をそのまま使用 |
| **エレベーション(dp レベル + surface-tint)** | 公式 `md.sys.elevation.level0–5` | dp と tint は公式。**CSS の box-shadow は近似**(umbra+penumbra) |
| **state layer 不透明度** | 公式 state(hover 8% / focus・pressed 10% / dragged 16%) | 公式値をそのまま使用 |
| **スペーシング** | **導出**(M3 は 4dp グリッド基調。名前付き spacing 表は非中核) | 4dp 基調で導出と明記して使用 |
| **コントラスト** | 公式 a11y(WCAG) | 不可侵の下限 |

> ⚠ **baseline の紫は「種色が無いときのフォールバック」**。M3 の本来の流れは
> **ブランド種色 → tonal palette 生成 → role 割り当て**。`primary` の baseline `#6750A4` を
> そのまま使うのは Material の思想に反し、かつ親 §7 の AI slop tell(紫アクセント)に当たる。
> **`--color-accent` はブランド種色から起こす**こと(下記 §2.1)。baseline は出発点であって完成形ではない。

### 2.1 ブランド種色からの生成(推奨フロー / Dynamic Color)
1. ブランド色(なければ Material Theme Builder で種色)を1つ決める。
2. その種色の**トーン段**(40=primary / 90=primary-container / 30=on-primary-container 等、明度トーン)を作る。
   tonal palette を厳密に作れない場合でも、**accent はブランド色で固定**し container/on-* はトーン明暗で近似してよい。
3. `--color-accent`(=primary)を種色へ差し替え、`primary-container` 等を連動させる。
   secondary/tertiary はブランドの補助色、無ければ neutral 寄りでよい。
4. 生成後 `anti-slop.mjs` の T2 が紫を soft-warn したら、**「baseline ドリフトでなくブランド種色か」を確認**する
   (ブランドが実際に紫なら警告は無視してよい)。

---

## 3. デザイントークン(`:root`)

親パイプラインはこのブロックを HTML の `:root` 先頭に出力する。以降 HTML は **全て `var(--…)`** で
参照する(§7)。`accent` 定義は 1 箇所のみ(`--color-accent`)。token 名は M3 role 語彙に寄せる。

> 下記の color 値は **baseline(フォールバック)**。実運用では §2.1 に従い `--color-accent` を
> ブランド種色へ差し替え、primary 系 container/on-* を連動させる。

```css
:root {
  /* ── フォント(M3 は Roboto。CJK は Noto Sans JP へフォールバック) ──────────── */
  --font-sans: "Roboto", "Roboto Flex", system-ui, -apple-system,
               "Noto Sans JP", "Hiragino Kaku Gothic ProN", "Yu Gothic",
               Meiryo, sans-serif;
  --font-mono: "Roboto Mono", "SFMono-Regular", Menlo, Consolas, monospace;

  /* ── アクセント = primary role [baseline]。宣言はここ 1 箇所のみ ──────────────
     ⚠ baseline #6750A4 は紫のフォールバック。ブランド種色へ差し替える(§2.1)    */
  --color-accent:        #6750A4;   /* md.sys.color.primary(primary40)*/
  --color-on-accent:     #FFFFFF;   /* on-primary。accent 面上の前景 */

  /* ── カラー role: baseline light [公式 md.sys.color.*] ───────────────────────
     色は「役割」で持つ。primary/secondary/tertiary と各 container。            */
  --primary:                  var(--color-accent);
  --on-primary:               var(--color-on-accent);
  --primary-container:        #EADDFF;   /* primary90 */
  --on-primary-container:     #4F378B;   /* primary30 */

  --secondary:                #625B71;   /* secondary40 */
  --on-secondary:             #FFFFFF;
  --secondary-container:      #E8DEF8;   /* secondary90 */
  --on-secondary-container:   #4A4458;   /* secondary30 */

  --tertiary:                 #7D5260;   /* tertiary40 */
  --on-tertiary:              #FFFFFF;
  --tertiary-container:       #FFD8E4;   /* tertiary90 */
  --on-tertiary-container:    #633B48;   /* tertiary30 */

  /* 面(surface)とその上の前景 [公式] */
  --surface:                  #FEF7FF;   /* neutral98 */
  --on-surface:               #1D1B20;   /* neutral10 */
  --surface-variant:          #E7E0EC;   /* neutral-variant90 */
  --on-surface-variant:       #49454F;   /* neutral-variant30 */
  --background:               #FEF7FF;   /* neutral98 */
  --on-background:            #1D1B20;   /* neutral10 */

  /* surface-container の段 [公式]。階層はこの段 + elevation で作る */
  --surface-container-lowest:  #FFFFFF;  /* neutral100 */
  --surface-container-low:     #F7F2FA;  /* neutral96 */
  --surface-container:         #F3EDF7;  /* neutral94 */
  --surface-container-high:    #ECE6F0;  /* neutral92 */
  --surface-container-highest: #E6E0E9;  /* neutral90 */
  --surface-dim:               #DED8E1;  /* neutral87 */
  --surface-bright:            #FEF7FF;  /* neutral98 */
  --surface-tint:             var(--color-accent);  /* tonal elevation の色味(=primary)*/

  /* 罫線・反転 [公式] */
  --outline:                  #79747E;   /* neutral-variant50 — 罫線/区切り */
  --outline-variant:          #CAC4D0;   /* neutral-variant80 — 薄い区切り */
  --inverse-surface:          #322F35;   /* neutral20(snackbar 等)*/
  --inverse-on-surface:       #F5EFF7;   /* neutral95 */
  --inverse-primary:          #D0BCFF;   /* primary80 */
  --scrim:                    #000000;   /* モーダル背後の覆い */

  /* ステータス(error は公式 role。success/warning は support 拡張)──────────── */
  --color-error:              #B3261E;   /* md.sys.color.error(error40)*/
  --on-error:                 #FFFFFF;
  --error-container:          #F9DEDC;   /* error90 */
  --on-error-container:       #8C1D18;   /* error30 */
  --color-success:            #006C35;   /* 導出: green40(palette)*/
  --color-warning:            #9A4600;   /* 導出: orange40(palette)*/

  /* ── タイポ: 公式 type scale(Roboto) ───────────────────────────────────────
     形式: size / line-height / weight / letter-spacing(tracking)            */
  --weight-regular: 400;  --weight-medium: 500;

  --display-large:   57px; --leading-display-large:   64px; --tracking-display-large:  -0.25px;
  --display-medium:  45px; --leading-display-medium:  52px; --tracking-display-medium:  0;
  --display-small:   36px; --leading-display-small:   44px; --tracking-display-small:   0;
  --headline-large:  32px; --leading-headline-large:  40px; --tracking-headline-large:  0;
  --headline-medium: 28px; --leading-headline-medium: 36px; --tracking-headline-medium: 0;
  --headline-small:  24px; --leading-headline-small:  32px; --tracking-headline-small:  0;
  --title-large:     22px; --leading-title-large:     28px; --tracking-title-large:     0;
  --title-medium:    16px; --leading-title-medium:    24px; --tracking-title-medium:    0.15px; /* weight 500 */
  --title-small:     14px; --leading-title-small:     20px; --tracking-title-small:     0.1px;  /* weight 500 */
  --body-large:      16px; --leading-body-large:      24px; --tracking-body-large:      0.5px;
  --body-medium:     14px; --leading-body-medium:     20px; --tracking-body-medium:     0.25px;
  --body-small:      12px; --leading-body-small:      16px; --tracking-body-small:      0.4px;
  --label-large:     14px; --leading-label-large:     20px; --tracking-label-large:     0.1px;  /* weight 500 */
  --label-medium:    12px; --leading-label-medium:    16px; --tracking-label-medium:    0.5px;  /* weight 500 */
  --label-small:     11px; --leading-label-small:     16px; --tracking-label-small:     0.5px;  /* weight 500 */

  /* ── シェイプ(角丸スケール)[公式 md.sys.shape.corner.*] ─────────────────────
     M3 は角丸が大きめ。階層に応じて使い分ける(平坦化しない)                  */
  --radius-none:        0;
  --radius-xs:          4px;    /* extra-small — chip 等 */
  --radius-s:           8px;    /* small — テキストフィールド等 */
  --radius-m:           12px;   /* medium — 小カード */
  --radius-l:           16px;   /* large — カード/シート */
  --radius-xl:          28px;   /* extra-large — ダイアログ/大面 */
  --radius-full:        9999px; /* full — pill ボタン/FAB */

  /* ── エレベーション [公式 dp level0–5 + surface-tint。box-shadow は近似] ──────
     M3 の奥行き = 影 + surface への tonal overlay(surface-tint)。            */
  --elevation-0: none;
  --elevation-1: 0 1px 2px rgba(0,0,0,0.30), 0 1px 3px 1px rgba(0,0,0,0.15);  /* level1 (1dp) */
  --elevation-2: 0 1px 2px rgba(0,0,0,0.30), 0 2px 6px 2px rgba(0,0,0,0.15);  /* level2 (3dp) */
  --elevation-3: 0 1px 3px rgba(0,0,0,0.30), 0 4px 8px 3px rgba(0,0,0,0.15);  /* level3 (6dp) */
  --elevation-4: 0 2px 3px rgba(0,0,0,0.30), 0 6px 10px 4px rgba(0,0,0,0.15); /* level4 (8dp) */
  --elevation-5: 0 4px 4px rgba(0,0,0,0.30), 0 8px 12px 6px rgba(0,0,0,0.15); /* level5 (12dp) */

  /* ── state layer 不透明度 [公式] ─────────────────────────────────────────────
     on-* 色を半透明で重ね、hover/押下のフィードバックを作る                    */
  --state-hover:   0.08;
  --state-focus:   0.10;
  --state-pressed: 0.10;
  --state-dragged: 0.16;

  /* ── スペーシング [導出: 4dp グリッド基調] ──────────────────────────────────── */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;
  --space-9: 80px; --space-10: 96px;

  /* ── コントロール高さ(タッチ前提)[公式 a11y] ─────────────────────────────── */
  --control-h: 40px;   /* ボタン等の標準 */
  --touch-min: 48px;   /* 最小タッチターゲット 48dp(M3 の推奨)*/

  /* ── レイアウト ──────────────────────────────────────────────────────────── */
  --content-max:  1040px;  /* 読み物中心の最大幅(導出)*/
  --content-wide: 1440px;  /* ワイド/expanded(導出)*/
  --gutter: var(--space-4);
}
```

> **ダークテーマ(任意)**: M3 は dark の role も公式提供(`color_dark.json`)。追加する場合は
> `@media (prefers-color-scheme: dark)` で `--surface:#141218; --on-surface:#E6E0E9;
> --color-accent:#D0BCFF(primary80); --on-accent:#381E72(primary20);
> --surface-container:#211F26;` 等に上書き。モック範囲では light 既定で可。

---

## 4. レイアウト規約

### 4.1 ブレークポイント(M3 window size class)[公式]
M3 は px 固定でなく **window size class** で考える。Web では近似的に:

| size class | 幅 | 方針 |
|---|---|---|
| compact | `< 600px` | 1カラム。`--gutter` = 16px。ボトムナビ。モバイル基点 |
| medium  | `600–839px` | 1–2カラム。navigation rail(細い縦ナビ)も可 |
| expanded | `≥ 840px` | 複数カラム。navigation rail / drawer。`--content-max` で中央寄せ |

### 4.2 面(surface)と tonal elevation ← Material の核心
- 階層は **`surface-container-*` の段**(lowest=白 … highest=やや濃いトーン)で作り、
  **持ち上がる要素**(メニュー/ダイアログ/FAB)に `--elevation-1`〜`5` を足す。
- 影だけ・段だけに頼らず、**段 + 影 + surface-tint(色味)** の合わせ技が M3 らしさ。
  - カード = `--surface-container-low/high` + 必要なら `--elevation-1`。
  - ダイアログ/メニュー = `--surface-container-high` + `--elevation-3`、角丸 `--radius-xl`。
- 区切りは `--outline-variant`(薄)/`--outline`(強)。多用せず面の段を主役に。

### 4.3 シェイプ(角丸)を階層で使い分ける [公式]
- chip = `--radius-xs`、入力 = `--radius-s`、小カード = `--radius-m`、カード/シート = `--radius-l`、
  ダイアログ = `--radius-xl`、ボタン/FAB = `--radius-full`(pill)。
- **一律にしない**(平坦化は無個性化 / 親 §7・anti-slop T4)。M3 は角丸が大きめなのが個性。

### 4.4 タイポの使い分け [公式 type scale]
- ヒーロー/大見出し = `display-*`、画面・セクション見出し = `headline-*`/`title-large`、
  リスト項目・カード見出し = `title-medium/small`、本文 = `body-large/medium`、
  ボタン/タブ/チップのラベル = `label-large`(weight 500)、補助 = `body-small`/`label-small`。
- **label と title は weight 500**(medium)で字面を締める。display/headline/body は 400。
- letter-spacing(tracking)を各 role の値で必ず付ける(M3 の質感)。

### 4.5 主要コンポーネント規約(本物感の要)
- **Button**: filled = `--primary` 塗り + `--on-primary`、角丸 `--radius-full`、高さ `--control-h`。
  tonal = `--secondary-container` + `--on-secondary-container`。outlined = `--outline` 枠。text = 文字のみ。
- **FAB**: `--primary-container` + `--on-primary-container`、`--radius-l`、`--elevation-3`。
- **Card**: filled = `--surface-container-highest` / elevated = `--surface-container-low` + `--elevation-1` /
  outlined = `--surface` + `--outline-variant` 枠。角丸 `--radius-m`〜`--radius-l`。
- **App bar(top)**: `--surface`(スクロール時 `--surface-container` へ tonal 化)。タイトルは `title-large`。
- **Navigation**: compact=bottom bar、medium=rail、expanded=drawer。選択項目は
  `--secondary-container` のピル状ハイライト + `--on-secondary-container`。
- **Text field**: filled = `--surface-container-highest` 地 + 下線、または outlined = `--outline` 枠 +
  `--radius-s`。フォーカスは `--primary`。
- **Chip**: `--radius-s`(small)〜 `--radius-xs`、`--surface` + `--outline-variant`、選択時 `--secondary-container`。
- **state layer**: 操作要素は hover で前景色を `--state-hover`(8%)重ねる(押下 10%)。

### 4.6 アクセシビリティ [公式・不可侵]
- コントラスト 本文 4.5:1 / 大文字・非テキスト・UIコンポーネント 3:1(WCAG)。
  role の `on-*` と地の組み合わせは満たすよう設計されている。**自前で色を作るときは必ず実測**。
- タッチターゲット **48×48dp 以上**(`--touch-min`)。
- フォーカスは `--primary` を可視で必ず付ける。`--on-surface-variant` 未満を本文に使わない。

---

## 5. look を決める数個の決定(保存後に報告 / §6)

1. アクセント = primary role。**baseline は紫 `#6750A4`(フォールバック)。ブランド種色へ差し替え**(§2.1)。
2. 色 = primary / secondary / tertiary + 各 container の **role で意味づけ**(色を直書きしない)。
3. 階層 = **surface-container の段 + tonal elevation(影 + surface-tint の色味)**で表現している。
4. シェイプ = 角丸大きめ。ボタンは pill(`--radius-full`)、カード/ダイアログは `--radius-l/xl`。
5. タイポ = Roboto の type scale(display→headline→title→body→label、label/title は weight 500)。

---

## 6. 範囲限定ハイブリッドの注意(§3.4)

- Material をベースに、特定ゾーンだけ他哲学を借りるのは可。借用値は**専用の名前空間トークン**に
  閉じ込め、本節の Material role トークンを一切上書きしない。
- 例: ベース Material のまま、データ表ゾーンだけ Carbon 式の layer 段差を `--sb-*` で借りる。
- 哲学を丸ごと混ぜない(無個性化する)。借用は「ゾーン限定」。
