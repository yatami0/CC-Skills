# Apple 哲学リファレンス

`references/apple/apple.md` — Apple Human Interface Guidelines (HIG) に基づく
デザイン哲学の自己完結リファレンス。**原則 + 正確なトークン値 + レイアウト規約**を
このファイル内に閉じ込め、他哲学に値が漏れないようにする(親 SKILL.md / §3.1)。

以降に哲学を追加する際は **このファイルの構造を踏襲**する(§7)。

> 一次情報: [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/) /
> [Foundations](https://developer.apple.com/design/human-interface-guidelines/foundations) /
> [Typography](https://developer.apple.com/design/human-interface-guidelines/typography) /
> [Color](https://developer.apple.com/design/human-interface-guidelines/color) /
> [Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility) /
> [Layout](https://developer.apple.com/design/human-interface-guidelines/layout)

---

## 0. ルーター用メタ(画面タイプで選ぶ / §3.3)

| 項目 | 内容 |
|---|---|
| **得意な画面タイプ** | マーケLP / プロダクト紹介ページ / コンシューマ向けアプリUI / オンボーディング / 設定画面 |
| **不得意な画面タイプ** | データ密度の高いエンタープライズ管理画面・大規模テーブル・密なダッシュボード → **Carbon** を選ぶ |
| **トーン** | 上質・静謐・余白主導・コンテンツ最優先(控えめなクローム) |
| **本物感の源** | 余白のリズム / Dynamic Type の階調 / 控えめな彩度のシステム色 / 影ではなく**素材(blur)と層**で奥行き |

> 注: Apple HIG は本来 **アプリUI 向け**の指針。「マーケLP=Apple」は本スキルの割当であり
> Apple 公式の用途宣言ではない(§3.3)。

---

## 1. 原則(Clarity / Deference / Depth)

Apple HIG のコアは 3 原則。トークン・レイアウト判断はすべてここから導く。

- **Clarity(明瞭さ)**: テキストは全サイズで可読、アイコンは精密、装飾は控えめ、機能が形を導く。
  → 余白を惜しまない / 十分なコントラスト / 1画面1焦点。
- **Deference(控えめ)**: UI はコンテンツに譲る。クロームを最小化し、コンテンツを主役に。
  → 装飾的な枠線・濃い影・原色のベタ塗りを避ける。半透明/ぼかしで階層を示す。
- **Depth(奥行き)**: リアルな層・動き・素材(materials)で階層と遷移を伝える。
  → 奥行きは**濃いドロップシャドウではなく**、半透明レイヤー・blur(vibrancy)・微細な影で表現。

---

## 2. トークンの出所(provenance — 必読 / §3.2)

Apple は **固定の数値トークン表(spacing scale 等)を公開していない**。よって本リファレンスの
トークンは出所が混在する。値を更新/検証する際はこの区分を必ず守る。

| トークン群 | 出所 | 扱い |
|---|---|---|
| **カラー** | 公式 **System Colors**(正確値あり) | 公式値をそのまま使用 |
| **タイポ(サイズ/行間/ウェイト)** | 公式 **Dynamic Type** iOS デフォルト(Large)仕様 | 公式値をそのまま使用 |
| **タッチターゲット / コントラスト** | 公式 a11y 規定(44pt, 4.5:1 / 3:1) | 公式値・**不可侵の下限** |
| **スペーシング** | **導出**(Apple は spacing scale 非公開。8pt 基調で構成) | 導出値と明記して使用 |
| **角丸 / 影** | **導出**(iOS の連続角丸・素材の近似。CSS で完全再現不可) | 近似値として使用 |
| **ブレークポイント** | **導出**(Apple は px 固定でなく size class) | size class の精神に沿った近似 |

> pt→px は本モックでは 1:1 で扱う(Body 17pt → 17px)。

---

## 3. デザイントークン(`:root`)

親パイプラインはこのブロックを HTML の `:root` 先頭に出力する。以降 HTML は **全て `var(--…)`** で
参照し、生の色/px 値を直書きしない(§6 出力ルール)。`accent` 定義は 1 箇所のみ。

```css
:root {
  /* ── フォント(公式 system font stack。SF を CJK へフォールバック) ───────────── */
  --font-sans:
    -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
    "Helvetica Neue", "Hiragino Sans", "Hiragino Kaku Gothic ProN",
    "Yu Gothic", Meiryo, sans-serif;

  /* ── タイポ: Dynamic Type iOS デフォルト(Large) [公式] ──────────────────────
     形式: size / line-height / weight                                          */
  --text-largetitle:  34px; --leading-largetitle: 41px; --weight-largetitle: 400;
  --text-title1:      28px; --leading-title1:     34px; --weight-title1:     400;
  --text-title2:      22px; --leading-title2:     28px; --weight-title2:     400;
  --text-title3:      20px; --leading-title3:     25px; --weight-title3:     400;
  --text-headline:    17px; --leading-headline:   22px; --weight-headline:   600;
  --text-body:        17px; --leading-body:       22px; --weight-body:       400;
  --text-callout:     16px; --leading-callout:    21px; --weight-callout:    400;
  --text-subhead:     15px; --leading-subhead:    20px; --weight-subhead:    400;
  --text-footnote:    13px; --leading-footnote:   18px; --weight-footnote:   400;
  --text-caption1:    12px; --leading-caption1:   16px; --weight-caption1:   400;
  --text-caption2:    11px; --leading-caption2:   13px; --weight-caption2:   400;

  /* ── カラー: System Colors / light [公式] ─────────────────────────────────── */
  /* 背景(面の階層) */
  --color-bg:            #FFFFFF;   /* systemBackground */
  --color-bg-secondary:  #F2F2F7;   /* secondarySystemBackground / systemGray6 */
  --color-bg-grouped:    #F2F2F7;   /* systemGroupedBackground */
  --color-surface:       #FFFFFF;   /* カード等の前面 */

  /* ラベル(テキスト)。secondary 以下は不透明度で表現 */
  --color-label:            rgba(0,0,0,1);          /* label */
  --color-label-secondary:  rgba(60,60,67,0.60);    /* secondaryLabel */
  --color-label-tertiary:   rgba(60,60,67,0.30);    /* tertiaryLabel */
  --color-label-quaternary: rgba(60,60,67,0.18);    /* quaternaryLabel */

  /* 区切り / 塗り */
  --color-separator:        rgba(60,60,67,0.29);    /* separator */
  --color-separator-opaque: #C6C6C8;               /* opaqueSeparator */
  --color-fill:             rgba(120,120,128,0.20); /* secondarySystemFill */

  /* アクセント(=systemBlue)。定義はここ 1 箇所のみ。全 CTA はこれを参照 */
  --color-accent:        #007AFF;   /* systemBlue */
  --color-accent-hover:  #0066D6;   /* 導出: アクセントの押下/ホバー */
  --color-on-accent:     #FFFFFF;   /* アクセント面上の前景 */

  /* ステータス(System Colors)。アクセントと競合させない(フェーズ3ゲート観点) */
  --color-success: #34C759;  /* systemGreen */
  --color-warning: #FF9500;  /* systemOrange */
  --color-danger:  #FF3B30;  /* systemRed */

  /* グレースケール(systemGray 1–6) */
  --color-gray:  #8E8E93; --color-gray2: #AEAEB2; --color-gray3: #C7C7CC;
  --color-gray4: #D1D1D6; --color-gray5: #E5E5EA; --color-gray6: #F2F2F7;

  /* ── スペーシング [導出: 8pt 基調] ───────────────────────────────────────── */
  --space-1: 2px;  --space-2: 4px;  --space-3: 8px;   --space-4: 12px;
  --space-5: 16px; --space-6: 20px; --space-7: 24px;  --space-8: 32px;
  --space-9: 40px; --space-10: 48px; --space-11: 64px; --space-12: 80px;

  /* ── 角丸 [導出: iOS 連続角丸の近似] ─────────────────────────────────────── */
  --radius-s: 8px;   /* 小コントロール */
  --radius-m: 12px;  /* ボタン/入力 */
  --radius-l: 18px;  /* カード */
  --radius-xl: 28px; /* シート/大面 */
  --radius-pill: 980px;

  /* ── 影 [導出: Apple は影を控えめに。奥行きは素材/層が主] ─────────────────── */
  --shadow-1: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-2: 0 8px 30px rgba(0,0,0,0.10);
  --blur-material: saturate(180%) blur(20px); /* vibrancy 近似(backdrop-filter 用) */

  /* ── a11y 下限 [公式・不可侵] ────────────────────────────────────────────── */
  --touch-min: 44px;   /* 最小タッチターゲット 44×44pt */

  /* ── レイアウト ──────────────────────────────────────────────────────────── */
  --content-max: 980px;   /* 読み物中心の最大幅(導出) */
  --content-wide: 1280px; /* ワイドセクション(導出) */
  --gutter: var(--space-5);
}
```

> **ダークモード**(任意): Apple は dark の System Colors も公式提供。追加する場合は
> `@media (prefers-color-scheme: dark)` で `--color-bg:#000000; --color-bg-secondary:#1C1C1E;
> --color-label:rgba(255,255,255,1); --color-accent:#0A84FF;` 等に上書きする。
> モック範囲では light 既定で可。

---

## 4. レイアウト規約

### 4.1 グリッド / ブレークポイント [導出: size class の精神]
Apple は px 固定でなく **size class(compact / regular)** で考える。Web では近似的に:

| 区分 | 幅 | 方針 |
|---|---|---|
| compact(モバイル) | `< 768px` | 1カラム。`--gutter` = 16px。モバイルファースト基点 |
| regular(タブレット) | `768–1023px` | 1–2カラム。余白を広げる |
| regular(デスクトップ) | `≥ 1024px` | コンテンツは `--content-max` で**中央寄せ・両端に余白**。全幅に広げない |

### 4.2 余白リズム(最重要の本物感)
- セクション間は**大きく**(デスクトップ `--space-11`〜`--space-12`、モバイル `--space-9`)。
- コンテンツは欲張らず、**余白でグルーピング**する(枠線より空白を優先 = Deference)。
- 行長は読みやすさ優先(本文ブロックは `--content-max` 内、概ね 60–75 字/行)。

### 4.3 タイポの使い分け
- ヒーロー見出し = `largetitle`〜`title1`、本文 = `body`、補足 = `subhead`/`footnote`。
- ウェイトは抑制的に(`headline` の 600 が基本の強調。極太は使わない)。
- **Dynamic Type 最小を下回らない**(本文を `footnote` 13px 未満に縮めない)。高齢者/読み物向け要件なら本文を `body` 17px 以上で固定。

### 4.4 奥行きの作り方(Depth)
- 濃いドロップシャドウで階層を作らない。**`--shadow-1`(微細)**を基本、浮く要素のみ `--shadow-2`。
- 重なり/ナビバー等は **`backdrop-filter: var(--blur-material)`** + 半透明背景で「素材」を表現。

### 4.5 アクセシビリティ [公式・不可侵]
- タッチターゲット **44×44px 以上**(`--touch-min`)。
- コントラスト **本文 4.5:1 / 大文字・非テキスト・コントロール 3:1 以上**。
  - 注意: `--color-label-tertiary`/`quaternary` や `--color-gray` 系は本文に使わない(低コントラスト)。プレースホルダ/装飾のみ。

---

## 5. look を決める数個の決定(保存後に報告 / §6)

モック保存後、ユーザーが舵を取れるよう以下を簡潔に伝える:
1. アクセント = systemBlue(`--color-accent`)。ブランド色があれば 1 箇所差し替え。
2. 階層 = 影でなく**余白 + 微細影 + 素材(blur)**で表現している。
3. 背景 = `--color-bg`(白)/ `--color-bg-secondary`(systemGray6)の 2 面構成。
4. タイポ = Dynamic Type 階調(largetitle→body→footnote)。

---

## 6. 範囲限定ハイブリッドの注意(§3.4)

- ベースは Apple のまま、特定ゾーン(例: データ表)だけ他哲学を借りるのは可。
- 借用値は**専用の名前空間トークン**(例 Carbon 借用なら `--sb-*`)に閉じ込め、
  本節の Apple トークンを一切上書きしない。
- 借用は「ゾーン限定」。哲学を丸ごと混ぜない(無個性化する)。
