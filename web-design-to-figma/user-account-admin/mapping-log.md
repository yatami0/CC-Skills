# mapping-log — user-account-admin / mock-v8c-hub.html → Figma

> 損失・近似・代替の台帳(設計書 §9)。PoC(フェーズ A)実走の記録。

- **Figma file**: https://www.figma.com/design/tD9dF6fED3IVNQOfKSTqHa
- **元モック**: `web-design-mock/user-account-admin/output/mock-v8c-hub.html`
- **抽出**: Playwright/puppeteer, viewport 1440、JS 描画後 DOM(`figma-plan.json` = 268 node / 94 var)
- **生成範囲(PoC)**: 全パターンを網羅する**代表サブツリー(~50 node)**。全 286 node の自動生成はフェーズ B。

## フォント代替(§7)
| 元(算出値) | Figma 在庫 | 写像 | 根拠 |
|---|---|---|---|
| `-apple-system / SF Pro Text` ほか | **無し**(Hiragino/Yu Gothic/Meiryo/SF いずれも不在) | **Noto Sans JP** | Figma に在庫あり・Latin+JP 両グリフ。Inter だと日本語が豆腐(□) |
| weight 600(headline) | Noto Sans JP に "Semi Bold" 無し | **Bold**(550–650 は Medium 優先) | 在庫 style に合わせ量子化 |

> CJK モックでは**フォント在庫チェック→代替が必須**。Latin 前提(Inter 等)に黙って落とすと全テキストが豆腐になる。

## トークン逆引きの曖昧さ(重要・§5 への反映事項)
同値トークンが複数あると「色 → トークン名」の逆引きが**任意の1つを選ぶ**(登録順)。実害:
| 要素 | 正しい参照 | 抽出器が誤選択した参照 | 同値 |
|---|---|---|---|
| `.sidebar` 背景 | `--sidebar-bg` | `--color-accent-hover` | `#003a63` |
| `.card` 背景 | `--color-surface` | `--color-bg` | `#FFFFFF` |

→ 生成時は**要素クラスの名前空間に一致するトークンを優先**(class `sidebar*` → `--sidebar-*`)。PoC では手で正参照に直した。フェーズ B の `extract.mjs` に**文脈優先の逆引き**を入れる(純粋な値一致では不可)。

## ラスタ/省略(§6 の「中/低」行・実挙動)
## アイコン(当初プレースホルダ → 実ベクタへ解決済み)
- `<svg>` アイコン(ロゴ/ナビ/検索)は当初 box プレースホルダにしたが、**`figma.createNodeFromSvg(outerHTML)`
  で実ベクタ化に置換済み**。`download_assets` 不要(SVG は HTML 内にある・あれは「読み」枠を食う)。
- 落とし穴と対処: `currentColor` は解決されない → 生成後に stroke/fill を Variable bind で上書き。
  インポータが線アイコンに塗りを足すことがある(user アイコンが塗り潰し四角に化けた)→
  **「stroke を持つ図形は塗りを消す」**で outline-only に正規化。サイズは `rescale`(resize は子を拡縮しない)。
- 結果: ナビ(ユーザー/盾/三本線)・検索アイコンが線アイコンとして正しく描画。

## ラスタ/省略(§6 の「中/低」行・実挙動)
| 対象 | 件数 | 扱い |
|---|---|---|
| `box-shadow`(search input / card) | 2 | 単発 DROP_SHADOW で近似(多重/inset は未対応) |
| 詳細スライドシート + scrim | 1組 | `transform: translateX(100%)` で画面外 → **抽出対象外(正しく除外)**。別アートボードに別途展開すべき(note) |
| `position: sticky`(thead/サイドバー masthead) | — | Figma に sticky 概念なし。静的配置に潰れる(想定どおり) |

## figma-use の天井に実地で当たった点
- **`resize()` は両軸を FIXED に固定する** → セル幅を `resize(w,1)` で決めた際に**高さも 1px に固定**し、テーブル全セルのテキストが縦に見切れた。修正: 幅確定後に counter 軸を `HUG` に戻す。→ 生成則「**hug させたい軸を resize で触らない**」。自動生成で最も出やすいバグ class。
- **286 node 一括は非現実的** → セクション単位(shell+sidebar / main / 修正)に**分割**して安定。フェーズ B の生成器は「プランを walk → セクション毎に scoped な use_figma を発行 → 各回 screenshot 検証」にする。

## 高忠実だった点(設計の勝ち筋の確認)
- **トークン層は決定論で高忠実**: 色は `setBoundVariableForPaint` で Variable bind し、元の見た目を正確に再現。`web-design-mock` の「ハードコード色ゼロ・全参照 `var()`」規律がそのまま効いた。
- **auto-layout 優先**(絶対座標でなく)で、実測幅を FIXED 列に与える方式がテーブルでも破綻せず整列した。
