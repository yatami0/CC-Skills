# Ant Design 哲学リファレンス

`references/ant/ant.md` — Ant Design(v5)+ Ant Design Pro(ProLayout)に基づく
デザイン哲学の自己完結リファレンス。**原則 + 正確なトークン値 + レイアウト規約**を
このファイル内に閉じ込め、他哲学に値が漏れないようにする(親 SKILL.md / §3.1)。
構造は apple.md / carbon.md を踏襲(§8)。

> 一次情報: [Ant Design](https://ant.design/) /
> [Design Token / Customize Theme](https://ant.design/docs/react/customize-theme) /
> [Colors](https://ant.design/docs/spec/colors) /
> [@ant-design/colors palette](https://github.com/ant-design/ant-design-colors) /
> [Ant Design Pro / ProLayout](https://pro.ant.design/) /
> [Layout](https://ant.design/components/layout) /
> [Design Values](https://ant.design/docs/spec/values)

---

## 0. ルーター用メタ(画面タイプで選ぶ / §3.3)

| 項目 | 内容 |
|---|---|
| **得意な画面タイプ** | エンタープライズ **SaaS** 管理画面 / **ブランド色のサイダー付き**ダッシュボード / admin コンソール / CRUD 一覧 + 詳細ドロワー / 設定・運用ツール |
| **不得意な画面タイプ** | 感情訴求のマーケLP・ブランド表現重視のコンシューマページ → **Apple**。極限まで工業的・高密度でフラットな基幹系(影/角丸を嫌う現場)→ **Carbon** |
| **トーン** | 実務的だが親しみやすい。**カードと微細影で面を持ち上げ**、角丸 6px とブランド色で「製品感」を出す |
| **本物感の源** | **3面構成(ダーク/ブランドのサイダー → ライトグレーのキャンバス → 白カード)** / seed token `colorPrimary` 1 個でブランド染色 / 角丸 6–8px + `boxShadowTertiary` の控えめな影 / Tag の淡色 tint(`-1`/`-3`/`-6` 段)|

> **Carbon との違い(重要)**: どちらもエンタープライズ管理画面だが、Carbon は
> *工業的・直角・影なし・面は背景レイヤーの段差*。Ant は *SaaS 的・角丸・カードに微細影・
> ブランド色のサイダー*。「白カードがグレー地に浮く / 色付きサイダー」を求めるなら Ant。

---

## 1. 原則(Ant Design Values 由来)

Ant Design は4つの設計価値「**自然 / 確定性 / 意味 / 成長**」を掲げる。実務的には次へ落ちる。

- **確定性(Certainty)**: 同じ部品・同じトークン・同じ間隔を反復し、画面間の一貫性で迷いを消す。
  トークンは seed → map → alias の三層で機械生成され、`colorPrimary` 1 個でテーマ全体が決まる。
- **意味(Meaningfulness)**: 状態は専用の機能色(success/warning/error/info)+ ラベルで明示。
  色だけに頼らず Tag/Badge で意味を運ぶ。
- **自然(Natural)**: 角丸・微細な影・控えめなモーションで、無理のない奥行きと操作感を作る。
  影は**面の階層**(カード/ポップアップ)に限定し、ベタ塗りの濃い影は使わない。
- **成長(Growth)**: ProLayout のサイダー+ヘッダ+コンテンツの骨格で、機能追加にスケールする。

---

## 2. トークンの出所(provenance — 必読 / §3.2)

Ant は **機械可読なトークンを正式配布**(`theme` の seed/map/alias、`@ant-design/colors` のパレット)。
よって Carbon と同様 **ほぼ全て公式値をそのままコピー**でき、ブランド色は seed 1 個の差し替えで済む。

| トークン群 | 出所 | 扱い |
|---|---|---|
| **seed(primary/status/radius/font)** | 公式 Default Seed Token | 公式値をそのまま使用。`colorPrimary` のみブランド色へ差し替え可 |
| **カラーパレット(gray/blue/green/gold/red の段)** | 公式 `@ant-design/colors` | 公式値をそのまま使用(Tag tint は `-1`/`-3`/`-6`)|
| **map/alias(text/border/bg/shadow)** | 公式 Map・Alias Token | 公式値をそのまま使用 |
| **ダークサイダー** | antd 純正 `Layout.Sider` / `Menu` dark テーマ(+ 旧 Ant Pro) | 公式 dark 既定 `#001529` を使用。**現行 ProLayout 既定は淡色**なので、これは「濃色サイダー」採用時の値 |
| **スペーシング** | 公式(sizeUnit=4, sizeStep=4) | 4px 基調で導出 |
| **コントラスト** | 公式 a11y(WCAG AA) | 不可侵の下限 |

> **ブランド染色**: `colorPrimary` を差し替えると hover/active(`-5`/`-7` 相当)も連動させる。
> 本リファレンス既定は公式 `#1677ff`。例として AUX は `#005fa2`(hover 用に濃紺 `#003a63`)。

---

## 3. デザイントークン(`:root`)

親パイプラインはこのブロックを HTML の `:root` 先頭に出力する。以降 HTML は **全て `var(--…)`** で
参照する(§7)。`accent` 定義は 1 箇所のみ。token 名は Ant 語彙に寄せる。

```css
:root {
  /* ── フォント(公式 stack。CJK を補う) ──────────────────────────────────── */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
               "Helvetica Neue", Arial, "Noto Sans JP", "PingFang SC",
               "Hiragino Sans", "Yu Gothic", Meiryo, sans-serif;
  --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;

  /* ── アクセント = colorPrimary [公式 seed]。宣言はここ 1 箇所のみ ──────────
     ブランド色があればこの 1 個を差し替える(hover/active も連動)            */
  --color-accent:        #1677ff;   /* colorPrimary(blue-6)*/
  --color-accent-hover:  #4096ff;   /* blue-5 */
  --color-accent-active: #0958d9;   /* blue-7 */
  --color-on-accent:     #ffffff;
  --color-accent-bg:     #e6f4ff;   /* blue-1 — 選択面/淡い強調 */
  --color-accent-border: #91caff;   /* blue-3 */
  --link:                #1677ff;
  --focus:               #1677ff;

  /* ── 機能色(status)[公式 seed]。accent と競合させない ────────────────── */
  --color-success: #52c41a;  --color-success-bg: #f6ffed;  --color-success-border: #b7eb8f;
  --color-warning: #faad14;  --color-warning-bg: #fffbe6;  --color-warning-border: #ffe58f;
  --color-error:   #ff4d4f;  --color-error-bg:   #fff2f0;  --color-error-border:   #ffccc7;
  --color-info:    #1677ff;  --color-info-bg:    #e6f4ff;  --color-info-border:    #91caff;

  /* ── テキスト [公式 alias / 透明度ベース] ─────────────────────────────────── */
  --text-primary:    rgba(0,0,0,0.88);
  --text-secondary:  rgba(0,0,0,0.65);
  --text-tertiary:   rgba(0,0,0,0.45);
  --text-quaternary: rgba(0,0,0,0.25);   /* プレースホルダ/装飾のみ(本文に使わない) */
  --text-on-dark:    rgba(255,255,255,0.85);

  /* ── 罫線 / 背景(面)[公式 alias] ───────────────────────────────────────── */
  --border:           #d9d9d9;   /* colorBorder(gray-5) */
  --border-secondary: #f0f0f0;   /* colorBorderSecondary(gray-4) — 表の区切り */
  --bg-container:     #ffffff;   /* カード/テーブル面 */
  --bg-elevated:      #ffffff;   /* ポップアップ/ドロワー面 */
  --bg-layout:        #f5f5f5;   /* キャンバス(ページ地)colorBgLayout */
  --bg-canvas-pro:    #f0f2f5;   /* 旧 Ant Pro の定番キャンバス(任意で選択可) */
  --fill-quaternary:  rgba(0,0,0,0.02);  /* 行ホバー等の極薄面 */
  --fill-tertiary:    rgba(0,0,0,0.04);
  --fill-secondary:   rgba(0,0,0,0.06);

  /* ── グレースケール [公式 @ant-design/colors] ────────────────────────────── */
  --gray-1:#ffffff; --gray-2:#fafafa; --gray-3:#f5f5f5; --gray-4:#f0f0f0;
  --gray-5:#d9d9d9; --gray-6:#bfbfbf; --gray-7:#8c8c8c; --gray-8:#595959;
  --gray-9:#434343; --gray-10:#262626; --gray-11:#1f1f1f; --gray-12:#141414; --gray-13:#000000;

  /* ── ダークサイダー(antd 純正 Layout.Sider / Menu dark)[公式] ───────────────
     #001529 は antd 純正 Layout/Menu の dark 既定(+旧 Ant Pro)。現行 ProLayout
     の既定は淡色なので、これは「濃色サイダー」を採る場合の値。ブランド付きサイダー
     を使う場合は --sider-bg をブランド濃色へ差し替えてよい                          */
  --sider-bg:            #001529;            /* dark sider/header の既定 */
  --sider-fg:            rgba(255,255,255,0.65);
  --sider-fg-strong:     rgba(255,255,255,0.95);
  --sider-item-hover:    rgba(255,255,255,0.08);
  --sider-item-selected: var(--color-accent);  /* dark menu の選択はブランド色ベタ */
  --sider-border:        rgba(255,255,255,0.12);

  /* ── タイポ [公式]。base 14 / 行高 1.5714 ────────────────────────────────── */
  --text-sm: 12px; --text-base: 14px; --text-lg: 16px; --text-xl: 20px;
  --h1: 38px; --h2: 30px; --h3: 24px; --h4: 20px; --h5: 16px;
  --leading-base: 1.5714286;  --leading-lg: 1.5;  --leading-sm: 1.6666667;
  --weight-regular: 400; --weight-medium: 500; --weight-semibold: 600;

  /* ── スペーシング [導出: sizeUnit=4, sizeStep=4] ─────────────────────────── */
  --space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
  --space-5: 20px; --space-6: 24px; --space-7: 32px; --space-8: 40px;
  --space-9: 48px; --space-10: 64px;

  /* ── 角丸 [公式 seed/map] ────────────────────────────────────────────────── */
  --radius:    6px;   /* borderRadius(既定。ボタン/入力) */
  --radius-lg: 8px;   /* borderRadiusLG(カード/モーダル) */
  --radius-sm: 4px;   /* borderRadiusSM(Tag/小要素) */

  /* ── 影 [公式 map]。面の階層に限定 ───────────────────────────────────────── */
  --shadow-card:    0 1px 2px 0 rgba(0,0,0,0.05), 0 1px 6px -1px rgba(0,0,0,0.03),
                    0 2px 4px 0 rgba(0,0,0,0.03);                 /* boxShadowTertiary: カード(現行 5.x の深色化値。旧値は .03/.02/.02) */
  --shadow-overlay: 0 6px 16px 0 rgba(0,0,0,0.08), 0 3px 6px -4px rgba(0,0,0,0.12),
                    0 9px 28px 8px rgba(0,0,0,0.05);              /* boxShadow: ドロワー/メニュー/モーダル */

  /* ── コントロール高さ(密度)[公式]。既定 32(Apple 44 より高密度) ─────────── */
  --control-h:    32px;
  --control-h-lg: 40px;
  --control-h-sm: 24px;

  /* ── モーション [公式] ───────────────────────────────────────────────────── */
  --motion-fast: 0.1s; --motion-mid: 0.2s; --motion-slow: 0.3s;
  --ease-inout: cubic-bezier(0.645, 0.045, 0.355, 1);
  --ease-out:   cubic-bezier(0.215, 0.61, 0.355, 1);

  /* ── a11y [公式・不可侵] ─────────────────────────────────────────────────── */
  /* コントラスト 本文 4.5:1 / 非テキスト 3:1(WCAG AA)。--text-quaternary は本文に使わない */
  --target-min: 44px;   /* タッチ主体なら control を lg(40) 以上にし 44 を目安に */

  /* ── レイアウト [公式 Layout / ProLayout] ────────────────────────────────── */
  --sider-width: 256px;     /* ProLayout 既定は 208。管理一覧は 240–256 が読みやすい */
  --header-height: 56px;    /* ProLayout のヘッダは 56(antd 純正 Layout.Header は 64) */
  --container-max: 1600px;  /* xxl ブレークポイント */
}
```

> **ダークテーマ(任意)**: Ant は `theme.darkAlgorithm` を公式提供。追加する場合は
> `--bg-layout:#000000; --bg-container:#141414; --text-primary:rgba(255,255,255,0.85);
> --border:#424242;` 等に上書き。モック範囲では light 既定で可。

---

## 4. レイアウト規約

### 4.1 3面構成 ← Ant Design Pro の核心
- **サイダー(ダーク/ブランド)→ キャンバス(ライトグレー)→ カード(白)** の段で階層を作る。
  - サイダー = `--sider-bg`(`#001529` か **ブランド濃色**)。on-dark トークンで前景を白系に。
  - キャンバス = `--bg-layout`(`#f5f5f5`、または旧 Pro の `--bg-canvas-pro #f0f2f5`)。
  - コンテンツは **白カード**(`--bg-container` + `--radius-lg` + `--shadow-card`)に載せ、
    周囲に余白(`--space-6`〜`--space-7`)。カードが地に浮くことで面が分かれる。
- これにより「サイダー/地/カード」が一目で分離する(Carbon の段差や Apple の同地カードと対照)。

### 4.2 ProLayout 骨格 [公式]
- **サイダー**(`--sider-width`、固定): ブランド/ロゴ上、メニュー、アカウントは下部。
  dark menu の選択項目は `--sider-item-selected`(ブランド色ベタ)+ 白文字。
- **コンテンツ**: 任意のページヘッダ(パンくず/タイトル/アクション)→ 操作バー(検索/フィルタ)→
  カード内のテーブル → ページネーション。
- 詳細は **Drawer(右スライド)** か遷移。Drawer は `--bg-elevated` + `--shadow-overlay`。

### 4.3 コントロール密度 [公式]
| サイズ | 高さ | 用途 |
|---|---|---|
| sm | `--control-h-sm`(24px) | 高密度ツールバー/インライン |
| md | `--control-h`(32px) | **既定**。フォーム/検索/ボタン |
| lg | `--control-h-lg`(40px) | 主要操作/タッチ寄り |

> タッチ主体は lg(40)以上にし `--target-min`(44)を目安に。

### 4.4 タイポの使い分け
- ページタイトル = `--h3`/`--h4`、セクション見出し = `--h5`、本文/セル = `--text-base`(14)、
  補助 = `--text-sm`(12)。強調は weight 500–600(極太は使わない)。
- 数値/ID 列は `--font-mono` で桁を揃える。

### 4.5 コンポーネント規約(本物感の要)
- **Card**: 白面 `--radius-lg` + `--shadow-card`。罫線は使っても `--border-secondary` で薄く。
- **Table**: ヘッダ = `--gray-2`(`#fafafa`)地 + 下罫線 `--border-secondary`。行区切りは
  `--border-secondary`、行ホバー `--fill-quaternary`。ゼブラは使わない(罫線+ホバーで足りる)。
- **Tag(ステータス)**: 角丸 `--radius-sm`。淡色 tint = `*-bg` 背景 + `*-border` 枠 + 機能色テキスト。
  例: 有効=success、招待中=warning、無効=gray(`--gray-3` 背景 + `--text-secondary`)。
- **Pagination**: 右寄せ。現在ページは accent。件数/表示件数セレクタを左に。
- **Button**: primary = accent 塗り / default = 白地 + `--border`。角丸 `--radius`。
- **Drawer**: 右から `--shadow-overlay`。ヘッダに閉じる(×)。

### 4.6 グリッド / ブレークポイント [公式 24 列 grid]
| 区分 | 最小幅 | 用途 |
|---|---|---|
| xs | `<576px` | モバイル(サイダーはオフキャンバス) |
| sm | `≥576px` | 大型モバイル |
| md | `≥768px` | タブレット |
| lg | `≥992px` | デスクトップ(標準の管理画面) |
| xl | `≥1200px` | 広いダッシュボード |
| xxl | `≥1600px` | `--container-max` で頭打ち |

### 4.7 アクセシビリティ [公式・不可侵]
- コントラスト 本文 4.5:1 / 非テキスト 3:1(WCAG AA)。`--text-quaternary`/`--gray-6` 以下は本文に使わない。
- フォーカスは `--focus`(accent)を可視で必ず付ける。
- ダークサイダー上のテキストは `--sider-fg`(白 65%)以上のコントラストを確保(白 45% 未満を本文に使わない)。
- 既定 control 32px はタッチに小さい。タッチ画面では lg(40)へ。

---

## 5. look を決める数個の決定(保存後に報告 / §6)

1. アクセント = `colorPrimary`(既定 Blue `#1677ff`)。**ブランド色はこの 1 個を差し替え**。
2. 階層 = **3面(ダーク/ブランドのサイダー → ライトグレー地 → 白カード)**で表現している。
3. サイダー = ダーク(`#001529`)かブランド濃色か。選択項目はブランド色ベタ + 白文字。
4. 角丸 = 6px(操作)/ 8px(カード)。影は `boxShadowTertiary` の控えめなものを面にだけ。
5. 密度 = control 32px(既定)。高密度なら 24、タッチなら 40。

---

## 6. 範囲限定ハイブリッドの注意(§3.4)

- Ant をベースに、特定ゾーンだけ他哲学を借りるのは可。借用値は**専用の名前空間トークン**に
  閉じ込め、本節の Ant トークンを一切上書きしない。
- 代表例: ベース Ant のまま、**ブランド付きサイダー**を `--sider-bg` 差し替えで実現する
  (これは本リファレンス内の正規手段であり、ハイブリッドではない)。
- 哲学を丸ごと混ぜない(無個性化する)。借用は「ゾーン限定」。
