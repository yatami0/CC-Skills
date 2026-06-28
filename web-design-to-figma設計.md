# web-design-to-figma スキル 設計書

`web-design-mock` / `web-design-distill` / `web-design-scout` に並ぶ**第4のスキル**
(完成モック HTML → Figma ネイティブノード)の設計判断と根拠を残す。運用には不要。実装の正は
`.claude/skills/web-design-to-figma/SKILL.md`(本書執筆時点では未作成 = フェーズ B で起こす)。

> 対になる文書: `web-design設計.md`(哲学 → モック)/ `web-design-distill設計.md`(モック → 哲学)/
> `web-design-scout設計.md`(実例 → ギャラリー+診断)。
> 本書はその語彙・作法(フェーズ間ゲート / `00-state.md` baton / progressive disclosure /
> **値を捏造しない** / 自己完結 HTML / 機械チェック / **完全責務分離**)を引き継ぐ前提で書く。重複は再掲しない。

> **本書は フェーズ A(PoC)を経て改訂されている。** `mock-v8c-hub.html`(user-account-admin)で
> Extract→Generate→検証を実走した。実走の根拠は `web-design-to-figma/user-account-admin/`
> (`figma-plan.json` / `mapping-log.md` / `render/*.png` / Figma file
> `tD9dF6fED3IVNQOfKSTqHa`)。各節の「PoC で確認」はその実測。確定した学びは §13。

---

## 1. 目的

既存3スキルは3つの入口を持つ ―「哲学 → モック」「モック → 哲学」「実例 → 診断」。
本スキルは**第4の入口**を足す:

> **モック → Figma。** 完成した自己完結 HTML モックを、編集可能な Figma ネイティブノード
> (auto-layout frame / text / Variables)へ**片道ポート**する。

解く痛みは具体的: **`web-design-mock` の §フェーズ4 が「Figma エクスポートは任意・スコープ外。
希望時は別の取り込み経路が要る」と穴を空けている。** その後続経路を埋めるのが本スキル。
HTML が納品物であることは変えず、**デザイナーが Figma 上で続きを編集したい**ときの橋を架ける。

入力は distill と同じ「完成モック」だが、**出力が別物(Figma file)**。重複ゼロで4本目に収まる(§2)。

---

## 2. 形態の判断 — 独立スキル + 完全な責務分離

scout で柱に据えた「**完全責務分離**」をそのまま継ぐ。

| 観点 | 判断 | 根拠 |
|---|---|---|
| スキル形態 | **独立スキル**(mock/distill/scout と兄弟) | 入力は同じでも出力(Figma)とループ(Extract→Generate)が別物。親を肥大化させない |
| 出力先 | **独立 `web-design-to-figma/<slug>/`** | `web-design-mock/` を汚さない。状態が混ざらない |
| スクリプト | **自前**(`extract.mjs` 等) | mock の `scripts/` に依存しない(パス結合を作らない) |
| 連携 | **手渡しのみ**(自動連携ゼロ) | mock を自動起動しない / mock が本スキルを発見しない。人がモックを指定して呼ぶ |
| Figma 規約 | **`figma-use` スキルに委譲** | Plugin API の作法は Figma 公式スキルが正。本スキルは再実装しない(§5) |

> distill は親ルーターに発見ステップを足した(接続を作った)。scout/本スキルは**接続を作らない**。
> 唯一の論理的接点は人間が「このモックを Figma に持っていく」と決めること。

---

## 3. 核心の課題と原則(設計の出発点)

### 原則1 — `use_figma` は HTML import ではない。"翻訳" であって "流し込み" でない
Figma MCP の `use_figma` は **Figma Plugin API の JavaScript を実行する口**で、
`figma.createFrame()` / `createAutoLayout()` / `createText()` / Variables を**プログラムで組み立てる**もの。
**「HTML を貼ると Figma になる」機構は存在しない。** よって本スキルの本体は
**HTML を解析して「Figma ノード生成スクリプト」へ翻訳する**こと。ここが全設計の出発点。

### 原則2 — 変換は2層に割れる。トークン層は高忠実、構造層は lossy
`web-design-mock` の出力規律(`validate.mjs` が「ハードコード色ゼロ・accent 1箇所・全参照 `var()`」を保証)
のおかげで、変換が綺麗に2層へ分かれる:

| 層 | 素材 | Figma 側 | 忠実度 |
|---|---|---|---|
| **トークン層** | `:root` の `--…` | **Figma Variables**(コレクション/スコープ付き) | **高・ほぼ決定論** |
| **構造層** | DOM ツリー + 実測レイアウト(flex/grid/余白/タイポ) | auto-layout frame / text / rect、fill を Variable に bind | **中・lossy** |

普通の HTML→Figma 変換が最も苦労する「色やスペーシングの散らばり」を、このモックは
**設計時点で単一の真実に正規化済み**。`:root` → Variables はほぼ機械翻訳になる。**ここが本スキルの勝ち筋**。
→ 期待値設定を最初にユーザーへ明示する: **トークンは固く来る / 構造はズレうる**。

### 原則3 — 狙うのは「編集可能なネイティブ層」。ピクセル完全は狙わない
Figma の auto-layout は CSS のスーパーセットではない。grid / 複雑な flex-wrap / `::before` 装飾 /
background-image / gradient / backdrop-blur / box-shadow の重ねは1:1で落ちない。
ここで**画像化(ラスタ flatten)に逃げると "デザインファイル" でなくなる**(レイヤが編集できない)。
→ **目標は「多少ズレても編集できるネイティブ層」**。落ちない装飾は**省略して `note` に記録**し、
ユーザーが Figma 上で足す前提にする。**忠実度をでっち上げない**(scout の「値を捏造しない」と同根)。

### 原則4 — 実測値で作る。目分量で座標を発明しない
構造層のジオメトリは**ヘッドレスブラウザの実レンダリングから実測**する(§4)。
LLM が HTML を読んで座標を当て推量すると破綻する(レイアウトエンジンの再実装は不可能)。
**`getComputedStyle` + `getBoundingClientRect` が唯一の真実**。これも「捏造しない」の構造層版。

---

## 4. ループの形 — Extract → Generate の2ステージ・パイプライン

mock/distill は4フェーズのウォーターフォール。本スキルは**2ステージのパイプライン**(滝ではない)。
既存の「**決定論スクリプト + LLM判断 + 検証ゲート**」の作法に乗せる ―
**Stage 1 は決定論スクリプト、Stage 2 は `figma-use` 規約下の LLM 駆動**にきれいに割れる。

| # | ステージ | 主体 | 内容 | 成果物 |
|---|---|---|---|---|
| F1 | **スコープ** | 対話 | どのモック(`mock-vN.html`)/ 忠実度目標 / ブレークポイント(どの幅でレンダリングするか) | `00-figma-state.md` |
| F2 | **Extract(抽出)** | **決定論** `extract.mjs` | Playwright で実レンダリング → DOM を歩いて中間表現 `figma-plan.json` を吐く(§5) | `figma-plan.json` |
| F3 | **Variables 生成** | `use_figma` | `:root` → Figma Variable コレクション(scope 明示)。**検証ゲート**: `get_metadata` で件数/モード確認 | Figma 上のコレクション |
| F4 | **構造生成** | `use_figma` | `figma-plan.json` を walk し、frame スケルトン(placeholder)→ 中身を top-down で流す(≤10 ops/call)。fill/text色を Variable に bind | Figma 上のノード木 |
| F5 | **検証ゲート** | `use_figma` | `screenshot()` と HTML レンダリング画像を**突き合わせ**。ズレを `mapping-log.md` に記録 → ユーザー検証 | `mapping-log.md` |

- **F2 が決定論なのが要**(原則4)。静的パースだけだと計算後サイズが分からず破綻する。
  実レンダリングなら flex/折返し/余白が正確に取れる(html.to.design 等の業界手法と同じ)。
- **F3/F4 は `figma-use` 規約に従う**: インクリメンタル(≤10 ops/call)/ placeholder で top-down /
  毎回ノード ID を return / atomic エラー時は STOP。**これらは本スキルが再実装せず Figma 公式スキルへ委譲**(§2)。
- **F4 は Variable への bind が肝**。生色を置かず `setBoundVariableForPaint` でトークン参照にする
  (mock の「全参照 `var()`」を Figma 上でも維持 = トークン層の高忠実を捨てない)。

> **軽量フォールバック(Playwright が無い環境)**: F2 を諦め、LLM が HTML ソース + `get_screenshot`
> (HTML を撮った参照画像)を見て F4 を直接駆動する。**非決定論・低忠実**で、構造層がさらにブレる。
> 既定は Playwright 方式。フォールバックは「ブラウザ install 不可」のときの劣化動作として SKILL.md に明記。

---

## 5. 中間表現 `figma-plan.json`(本書の核 — 一番の発明)

Extract と Generate を**疎結合**にする一枚岩。これがあるおかげで、HTML 解析(決定論)と
Figma 生成(LLM)が互いを知らずに済む。スキーマ(草案・要・実地検証):

```jsonc
{
  "meta": { "source": "mock-v11-hub.html", "viewport": { "w": 1440, "h": 0 }, "font_map": {…} },
  "variables": [
    // :root から抽出。CSS 名 → Figma Variable 名 + 型 + 推奨 scope
    { "css": "--color-accent", "name": "color/accent", "type": "COLOR",
      "value": { "r": 0.10, "g": 0.46, "b": 0.96 }, "scopes": ["FRAME_FILL","TEXT_FILL"] },
    { "css": "--space-4", "name": "space/4", "type": "FLOAT", "value": 16, "scopes": ["GAP","WIDTH_HEIGHT"] }
  ],
  "tree": {
    // DOM を歩いた結果。各ノードは実測ジオメトリ + スタイル + tokenRef(逆引き)
    "role": "frame",                       // frame | text | image | vector | rect
    "layout": { "dir": "VERTICAL", "gap": 16, "pad": [24,24,24,24], "wrap": false },
    "geometry": { "x": 0, "y": 0, "w": 1440, "h": 900 },
    "style": { "fillRef": "--color-bg", "radius": 0, "stroke": null, "shadow": null, "opacity": 1 },
    "children": [
      { "role": "text", "geometry": {…},
        "text": { "chars": "アカウント管理", "fontRef": "--font-sans",
                  "size": 20, "weight": 600, "lineHeight": 28, "colorRef": "--color-text" } }
    ],
    "notes": ["::before の装飾円を省略(原則3)"]   // 落ちなかったものを正直に記録
  }
}
```

設計上の要点:
1. **`fillRef` は色名で持つ**(生 RGB でなく)。F4 がこれを見て `setBoundVariableForPaint` で bind する
   → トークン層の高忠実を JSON 越しに保つ。逆引き(computed の色 → `var()` 名)が Extract の腕の見せ所。
2. **`role` は CSS でなく Figma 語彙**。`display:flex` → `frame(VERTICAL/HORIZONTAL)`、`<img>`/background-image
   → `image`、`<svg>` → `vector`。**`vector` ノードは `svg` フィールドに outerHTML をそのまま持つ**
   (F4 が `createNodeFromSvg` に渡す = 実ベクタ化 / §13-9)。**写像規則の表は §6**。
3. **`notes[]` が "捏造しない" の担保**。落とした装飾・近似した値をここに列挙し、F5 で `mapping-log.md` へ流す。
4. **ジオメトリは持つが、F4 は原則 auto-layout を優先**(絶対座標は overlap/absolute のときの最後の手段)。
   `figma-use` のルール 12a「構造的に関係する子は auto-layout」に従う。

---

## 6. 構造層の写像規則(CSS → Figma)— lossy の地図

「何が落ちて何が落ちないか」を**事前に表で確定**しておく(F5 のズレ報告がブレないため)。
草案(要・実地検証):

| CSS | Figma | 忠実度 | 備考 |
|---|---|---|---|
| `display:flex; flex-direction` | auto-layout `dir` | 高 | gap/align/justify も写像可 |
| `gap` / `padding` / `margin` | itemSpacing / padding | 高 | Variable(`--space-*`)に bind |
| `display:grid` | auto-layout の入れ子で近似 | **中** | 真の grid は無い。行/列を frame で擬似 |
| `flex-wrap: wrap` | auto-layout wrap | 中 | Figma の wrap は挙動差あり。要検証 |
| `position:absolute` / overlap | 絶対座標 frame | 中 | auto-layout を諦め geometry で置く(最後の手段) |
| color / background(単色) | SOLID fill + Variable bind | **高** | tokenRef があるので決定論 |
| `border` | stroke | 高 | 幅/色を Variable に |
| `border-radius` | cornerRadius | 高 | `--radius-*` に bind |
| `box-shadow`(単発) | DROP_SHADOW effect | 中 | 多重シャドウ・inset は近似/一部省略 |
| `linear-gradient` | GRADIENT_LINEAR fill | 中 | 角度/stop を写像。radial/conic は近似 |
| `backdrop-filter: blur` | BACKGROUND_BLUR | **低** | Apple 系の素材感。完全再現は不可。`notes` 行き |
| **インライン `<svg>` アイコン** | **`createNodeFromSvg` で実ベクタ(編集可)** | **高** | PoC 実証(§13-9)。outerHTML をそのまま渡す。`download_assets` 不要(あれは「読み」枠を食う Figma→外の経路)。線アイコンは **stroke を Variable bind・塗りは消す** |
| `::before` / `::after` 装飾 | — | **低** | 疑似要素は DOM に無い → 省略 + `notes` |
| background-image / `<img>`(ラスタ) | image fill | 中 | 外部 src は要取り込み。CSS 合成は不可 |
| font-family(system/哲学フォント) | fontName(要フォント存在) | **要対策** | §7 フォント写像 |

> この表が「編集可能ネイティブ層」(原則3)の具体的な意味。**低の行は最初から諦め、`notes` で正直に申告**する。

---

## 7. フォント写像(専用の落とし穴)

モックは system font stack / 哲学固有フォント(Apple=SF, Carbon=IBM Plex, …)を使う。
**Figma 側に同フォントが無いと metrics がずれ、`figma-use` のルール8(フォント未ロードで書き込み不可)に直撃**。

- F2 で `font-family` の**算出値(実際に当たったフォント)**を取り、`meta.font_map` に積む。
- F3/F4 の前に **`listAvailableFontsAsync()` で Figma 側の在庫と突き合わせ**、写像表を作る:
  - 一致 → そのまま。
  - 無い(SF 等、Figma に通常無い)→ **近い代替へ写像**(SF→Inter 等)し、**`notes` と `mapping-log.md` に明記**。
    勝手に黙って差し替えない(捏造しない)。
- text 生成は `figma-use` の canonical recipe(font load → await → mutate → return ids)を厳守(委譲)。

---

## 8. 機械チェック(自前・軽量)

mock の `validate.mjs` は**借りない**(完全分離 / §2)。本スキルの不変条件は別物。
自前チェッカ `scripts/figma-lint.mjs`(B で実装)で見るのは:

1. **`figma-plan.json` の全 `fillRef`/`colorRef` が `variables[]` に存在するか**(ぶら下がりトークン参照 = 禁止)。
   → Figma 上で bind 切れにならない保証。mock の「全参照 `var()`」の Figma 版。
2. **`notes[]` が空でない木に対し `mapping-log.md` へ転記されているか**(落とした装飾の申告漏れ防止 = 正直さ)。
3. **フォント写像で「代替に落ちた」項目が全て log にあるか**(§7 の捏造防止)。
4. **生 RGB の直書きが tree に無いか**(`variables[]` に無い色を frame に置いていない = トークン層を壊していない)。

> mock=「トークン器の不変条件」、scout=「出典と正直さ」、本スキル=「**トークン参照の健全性 + 損失の申告**」。
> チェックの目的が違うから共有しない。これも責務分離の現れ。

---

## 9. 成果物スキーマと置き場所(完全分離 / §2)

```
<workspace>/
└── web-design-to-figma/                  # ← mock/distill/scout と別ベース
    └── <slug>/                            # 1ポート = 1フォルダ(元モックの slug を踏襲)
        ├── 00-figma-state.md              # 薄い baton(現ステージ/対象 mock-vN/忠実度目標/next-action)
        ├── figma-plan.json                # 中間表現(§5。Extract の成果・Generate の入力)
        ├── mapping-log.md                 # 損失・近似・フォント代替・Figma file URL の台帳
        └── (render/)                      # (任意)F2 が撮った HTML 参照画像 / F5 突き合わせ用
```

- Figma ファイル本体は**外部**(Figma クラウド)。ローカルの正は `figma-plan.json` + `mapping-log.md`。
  `mapping-log.md` の先頭に**生成した Figma file の URL** を記録し、再実行/追記の基点にする。
- `00-figma-state.md` は他スキル同様の薄い baton(front matter に `stage` / `target_mock` / `next_action`)。

---

## 10. mock / distill / scout との接続 — 作らない(手渡しのみ / §2)

- 入力モックは**ユーザーが明示指定**(`web-design-mock/<slug>/output/mock-vN.html` を渡す)。本スキルが
  mock の発見ロジックを内蔵しない(mock の `list-projects.mjs` に依存しない)。
- 本スキルは mock を自動起動しない / mock が本スキルを発見しない。
- **片道**。Figma 側の手編集は HTML に戻らない(双方向同期ではない。Code Connect のような bind でもない)。
  再ポートは上書き再生成(マージ無し)。この非対称性を SKILL.md に明記。

> 「自動で繋がっていない」ことは欠陥でなく**設計判断**。将来 Figma→HTML の逆や差分同期が要れば、
> その時に明示の接続点を1つ足す(本書を改訂)。

---

## 11. 忠実度の天井(正直な限界 — 最初にユーザーへ明示する一覧)

1. **片道ポート**。ライブ同期ではない。再実行は上書き、マージ無し。
2. **構造層は必ず lossy**(§6 の「中/低」行)。grid・疑似要素・backdrop-blur・多重シャドウは近似/省略。
3. **トークン層は高忠実**(§2)。色/スペーシング/radius/タイポは Variable へ決定論で落ちる。
4. **フォント在庫に依存**(§7)。SF 等は代替写像になり見た目が動く。
5. **Playwright 依存**(F2)。ブラウザ install が要る。**Windows standalone 環境制約は過去に踏んだ領域** ―
   実地で詰まる可能性が高い(フォールバック §4 を用意する理由)。
6. **狙いは "続きを Figma で編集できる土台"**。ピクセル完全の納品物ではない(それは HTML が担う)。
7. **Figma MCP の「読み」レート制限**(PoC で実測 / `rate-limits-access.md`)。**Starter(無料)プランは
   MCP ツール 6回/月**。ただし制限は **`get_screenshot`/`get_metadata`/`get_design_context` 等の「読み」
   ツールのみ**で、**`use_figma`/`create_new_file`/`generate_figma_design` 等の「書き」は免除**。
   → 構築(書き)は無料でも回るが、**F5 検証の独立スクショは月6回が希少資源**。
   **回避策: 検証は `use_figma` 内の `await node.screenshot()`(書きの戻り値=読み枠を消費しない)に寄せる。**
   フェーズ B の生成器は独立 `get_screenshot` を多用せず、インライン screenshot を既定にする。

---

## 12. TODO(次に詰める)

### フェーズ A(PoC — 設計を実地で固める。机上で確定しない節を潰す)
- 既存の `mock-vN.html` を1枚選び(候補: `user-account-admin/output/mock-v11-hub.html`)、
  F2(Playwright 抽出)→ F3/F4(`use_figma` 生成)→ F5(突き合わせ)を**手動で一気通し**。
- 実地検証する未確定項目: §5 スキーマ / §6 写像表の「中/低」行の実挙動 / §7 フォント代替の見た目影響 /
  auto-layout vs 絶対座標の判断境界 / トークン逆引き(computed 色 → `var()` 名)の精度。
- PoC の学びを本書へ反映(scout の「C で確認」に倣い、各節へ実測の裏取りを書き足す)。

### フェーズ B(スキル本体)
- `.claude/skills/web-design-to-figma/SKILL.md`(ルーター + F1–F5 + 出力規律 + `figma-use` 委譲の明記)。
  - 生成則として §13-5「hug 軸を resize で触らない」/ §13-6「セクション分割生成」/ §14.2「無料優先」を明記する。
- `scripts/extract.mjs`(F2。Playwright で `figma-plan.json` を吐く・依存は最小化)。
  - **文脈優先の逆引き**(§13-3): 同値トークン衝突時、要素クラスの名前空間に一致する名を優先。
  - **vector ノードに `svg`(outerHTML)を載せる**(§13-9): F4 が `createNodeFromSvg` へ渡す。
  - PoC の `web-design-to-figma/_poc/extract.mjs` が叩き台(逆引きは値一致のみ・svg 未取得 = 要改良)。
- `scripts/figma-lint.mjs`(§8 の自前チェッカ)。テキスト node の見切れ検査(width>0 ∧ height≥fontSize)を追加(§13-5)。
- `scripts/list-ports.mjs`(再開発見。mock の `list-projects.mjs` を範に取る)。
- Playwright 不在時のフォールバック動作(§4)を SKILL.md に明記。
- 著作権/アセット: 外部 src のラスタ画像取り込みの扱い(モックは元々ダミーなので低リスクだが一応明記)。

---

## 13. フェーズ A(PoC)で確定した学び

`mock-v8c-hub.html`(Apple HIG 派生・tmp ブランド / 管理画面一覧)で一気通しした実測。

1. **「実レンダリング必須」はコンテンツ存在レベルで効く(原則4 の強化)**。このモックは JS 駆動で、
   `<thead>`/`<tbody>` は HTML ソース上**空**。テーブル 14 行は実行時に JS が生成する。静的パースなら
   **表が丸ごと消える**。Playwright 描画後 DOM を歩いて初めて中身が取れた(268 node を抽出)。

2. **トークン層は決定論で高忠実(設計の勝ち筋の実証)**。41 色 + 40 数値を `:root` から抽出し、
   `setBoundVariableForPaint` で Variable bind。元の見た目を正確に再現。`web-design-mock` の
   「ハードコード色ゼロ・全参照 `var()`」規律がそのまま Figma 側の bind 健全性に化けた。

3. **逆引きの曖昧さ(新発見・§5 へ反映)**。同値トークンが複数あると「色 → トークン名」の逆引きが
   任意の1つを選ぶ。実害: `--sidebar-bg`(#003a63)が `--color-accent-hover` に、`--color-surface`
   (#FFF)が `--color-bg` に化けた(両者同値)。→ **要素クラスの名前空間に一致するトークンを優先**する
   文脈優先の逆引きが要る(純粋な値一致では不可)。`extract.mjs` の TODO 化。

4. **CJK フォント写像は必須・成立(§7 の実証)**。モックは SF Pro / system stack。Figma 在庫に
   Hiragino/Yu Gothic/Meiryo/SF は**無く**、Inter だと日本語が豆腐(□)。**Noto Sans JP** が在庫に
   あり Latin+JP 両対応なので全テキストをそこへ写像。weight 600 は "Semi Bold" 不在のため Bold へ量子化。
   → CJK モックは「在庫チェック→代替→log 記録」を**ゲート**にする。

5. **`resize()` は両軸を FIXED 化する(figma-use の天井に実地で当たった)**。セル幅確定の
   `resize(w,1)` が**高さも 1px に固定**し、テーブル全セルが縦に見切れた。修正は幅確定後に
   counter 軸を `HUG` へ戻すこと。→ 生成則「**hug させたい軸を resize で触らない**」。自動生成で
   最も出やすいバグ class。`figma-lint.mjs` で「テキスト node の width>0 かつ height≥fontSize」を見る案。

6. **286 node 一括は非現実的 → セクション分割が正(F4 の確定)**。PoC は shell+sidebar / main / 修正の
   3 呼び出しで安定。フェーズ B の生成器は「プランを walk → **セクション単位で scoped な use_figma を発行**
   → 各回 screenshot 検証」にする(一枚岩スクリプトにしない)。`figma-use` の ≤10-ops 漸進原則は実在。

7. **lossy は §6 の予測どおり(一部は予測を上回る = §13-9)**。`box-shadow` 2 → 単発 DROP_SHADOW 近似、
   `transform` で画面外の詳細シート + scrim は**正しく除外**(別アートボード化が筋)。
   grid / backdrop-blur はこのモックには無く未検証(別モックで要確認)。

8. **auto-layout 優先は実用(rule 12a の確認)**。絶対座標でなく、実測幅を FIXED 列に与える方式で
   テーブルも整列。構造層は lossy だが「**編集可能ネイティブ層**」として実用水準に達した(原則3 の目標を満たす)。

9. **インライン SVG アイコンは「持ってくるだけ」で実ベクタ化できる(当初予測の上方修正)**。`<svg>` の
   outerHTML を **`figma.createNodeFromSvg()`** に渡すと編集可能なベクタになる(プレースホルダ box は不要)。
   `download_assets` は使わない ― あれは Figma から外へ「読む」経路で**読み枠を消費**するうえ、ここでは
   SVG は既に HTML 内にある。落とし穴2つ:
   - **`currentColor` は解決されない** → 生成後に stroke/fill を**ターゲット色(Variable bind)へ上書き**する。
   - **インポータが線アイコンに塗りを足すことがある**(PoC: user アイコンが塗り潰し水色四角に化けた)。
     → **「stroke を持つ図形は塗りを消す」**規則で線アイコンを outline-only に正規化。
   - サイズは `node.rescale(target / node.width)`(`resize` は子をスケールしないため不可)。
   → §6 の `<svg>` 行を「低(placeholder)」から「**高(実ベクタ)**」へ格上げ。`extract.mjs` は vector に
   `svg`(outerHTML)を載せる(§5-2)。

> 未検証で残った節(別モックで要確認): CSS grid の auto-layout 近似 / `flex-wrap` / gradient /
> backdrop-blur の実挙動。LP 系(Apple/Material)モックは装飾が多く lossy 率が上がる見込み。

---

## 14. プラン別の能力と精度 ― 無料(Starter)優先で設計する

### 14.1 基本方針: コア移植は無料で完結させる
**移植の質(生成ノードの忠実度)はプランに依存しない**。構築は全て `use_figma`(書き)で無料でも無制限。
プランで差が出るのは「**検証の帯域**」「**テーマのモード化**」「**共有ライブラリ連携**」の3つ ―
いずれも出力そのものでなく周辺。だから**無料を一級市民として設計**し、paid は加点に留める。

### 14.2 無料優先の生成則(SKILL.md に明記)
Starter は「読み」ツールが **6回/月**(§11-7)。これを溶かさない:
- **R1 構築は全部「書き」**。`use_figma`/`createNodeFromSvg`/Variables/`create_new_file` は免除 ⇒ 無料で全量生成。
- **R2 F5 検証は use_figma 内 `await node.screenshot()`** を既定(書きの戻り=**読み枠ゼロ**)。独立 `get_screenshot`
  は原則使わない(PoC では最初それで3回溶かし、以降インラインに統一して読み消費を止めた)。
- **R3 視覚突き合わせの一次基準は Playwright のローカルスクショ**(F2 で撮る・完全無料・Figma reads 不要)。
- **R4 構造検証も use_figma 内**で `findAll`/`return`(`get_metadata`/`get_design_context` を使わない=読み回避)。
- **R5 Variables は単一モード前提**で設計(無料で安全。多モード=テーマは §14.3 の paid 機能)。
- **R6 アイコンは `createNodeFromSvg`**(書き)で実ベクタ化。`download_assets`(読み)に逃げない(§13-9)。
> これで「無料でも、1モックを丸ごと生成し検証も実質無制限」になる。読み6回/月は**緊急用の予備**に温存。

### 14.3 paid で「できること」と「精度が上がる所」
| 軸 | 無料(Starter) | paid(Pro/Org/Ent) | 効き |
|---|---|---|---|
| **移植の忠実度(生成物そのもの)** | 同じ | 同じ | **差なし**。書き API は共通。ここを誤解しない |
| **検証の帯域(読み)** | 6回/月 | 200〜600回/日(§11-7) | **大**。`get_screenshot`/`get_design_context` の**反復 diff ループ**が回り、ズレ検出力↑=*届く*精度↑ |
| **Variable モード(テーマ)** | 単一モード前提(※要確認) | 多モード | light/dark・密度などモック側テーマを**モードで保持**。無料は単一テーマに畳む |
| **共有コンポーネントライブラリ** | 個人 draft のみ | Org/Ent で publish & `search_design_system` | モックの定石 UI を**実在の共有部品へ写像** ⇒ 構造忠実度・再利用性↑(別途設計) |
| **Dev Mode / Code Connect** | × | Dev/Full seat | 採寸・コード化・コード↔デザイン bind(片道ポートの先) |

> ※ Variable のモード数や publish 可否は Figma の**製品仕様**(時期で変わる)。rate-limit のように
> ドキュメントで確証が取れた行以外は **「要確認」**を付す(値を捏造しない)。本書で確証済みは §11-7 の rate-limit のみ。

### 14.4 結論
無料で「1モック → 編集可能な Figma 画面 + Variables + 実ベクタアイコン」まで**完結**する。
paid が買うのは**出力の質ではなく、検証の速さ・テーマのモード化・共有部品連携**。
SKILL.md は無料パスを既定にし、paid 機能は「あれば加点」の任意ステップとして分離する。
