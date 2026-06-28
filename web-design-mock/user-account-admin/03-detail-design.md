---
phase: detail-design
status: in-review
updated_at: 2026-06-28
next_action: 2軸を並行検討中(機能=hub/switcher・スタイル=フラットv8a/カードv8c)。00-state.md「検討マトリクス」の4案(mock-v8a-hub / v8a-switcher / v8c-hub / v8c-switcher)を評価し、軸を絞ったら確定→検証ゲート→フェーズ4。反復ログは末尾「デザイン反復ログ」、各判断の根拠は「リサーチ出典」節を参照。
---
# フェーズ3 — 詳細設計(トークン確定 + 反復ログ)

> 哲学・要件・画面骨格は 01 / 02 を参照(再掲しない)。
> 哲学の変遷: v1=Carbon → v2=Apple(ユーザー指定)→ **v3 で Carbon に再回帰**(業務システムの密度を優先)。
> v3 のトークンは Carbon 子リファレンス(`references/carbon/carbon.md` §3)。アイコンは v2 の角丸ライン SVG + サークルアバターの一貫性を踏襲。

## v3 構造変更(ユーザー指定 2026-06-27)
- **トップヘッダー廃止**(意味を持たないため)。**サイドバーを起点**にし、ブランド名とアカウントをサイドバーへ集約。
- レイアウト = **サイドバー | メインコンテンツ**。メインコンテンツ = **ヘッダー(検索のみ)+ 一覧 + ページネーション**。
- **ロール/ステータス フィルタを削除**。ヘッダーは検索ボックスのみ。
- 密度は Carbon(行 48px・control sm/md)で v1 相当に戻す。

## トークン決定(`:root` の単一の真実 / Apple)
- **アクセント**: systemBlue `--color-accent: #007AFF`(宣言は 1 箇所)。選択中ナビ・リンク・フォーカスに限定。
- **面の階層(Depth)**: 影でなく **2面構成 + 余白 + 微細影 + 素材(blur)**。
  アプリ地=`--color-bg-secondary`(systemGray6) / コンテンツカード=`--color-surface`(白, `--radius-l` + `--shadow-1`)。
- **トップバー**: 半透明白 + `backdrop-filter: var(--blur-material)`(vibrancy 近似)。濃いクロームにしない(Deference)。
- **タイポ**: Dynamic Type。氏名=headline(17/600)、本文・セル=body/subhead、補足=footnote(13)、列ラベル=footnote(secondary)。
- **ステータス(System Colors / accent と非競合)**:
  - 有効 = systemGreen / 招待中 = systemOrange / 無効 = systemGray(中立)。
  - **色のみ依存しない**: 淡いtint pill + 色ドット + 日本語ラベル(ラベル文字は `--color-label` で可読性確保)。
- **ロール表示**: 中立 fill pill(`--color-fill`)。管理者はやや強い fill、一般は淡色。accent は使わない。
- **形状言語の統一(Clarity)**: ナビアイコン=角丸ライン SVG(stroke=currentColor)/ 人物=サークルアバター。
  → v1 の「四角い箱 vs 丸アバター」不整合を解消。
- **コントロール**: 検索/フィルタ=丸み(`--radius-m`)+ `--color-fill` 地。行高は余裕を持たせる(~64px)。タッチ標的 44px 厳守。

### 追加した名前空間トークン(Apple 派生の補助 / 本体トークンは非改変)
- `--scrim`: 詳細シート背面(`rgba(0,0,0,0.4)`)。
- `--nav-bg`: トップバー半透明地(`rgba(255,255,255,0.8)`)。
- `--fill-success` / `--fill-warning` / `--fill-neutral`: ステータス pill の淡い tint(System Colors の半透明)。
- `--row-hover`: 行ホバー(`--color-gray6` 流用)。

## レイアウト適用(02 の骨格 → 実寸 / Apple)
- サイドバー幅 260px。macOS サイドバー式: 選択中項目=accent-tint の角丸ハイライト + accent ラベル/アイコン(左バーは使わない)。
- コンテンツ最大幅は広め(`--content-wide` 近辺)で両端に余白。先頭はツールバー(見出し・追加ボタンは無し=02 確定)。
- 一覧: 罫線を抑え inset セパレータ + 余白で行を分ける。行末に chevron(クリックで詳細を示唆)。行クリックで右シート。
- 詳細: 右スライドシート(白、左角丸、`--shadow-2`)+ スクリム。閲覧主体。Esc/×/背面で閉じる。

## デザイン反復ログ
| ver | 変更内容 | 理由 |
|---|---|---|
| v1 | 初版(IBM Carbon)。Shell header + サイドナビ + 検索/フィルタ + 5列テーブル + ページネーション + 右詳細パネル。 | 02 骨格を Carbon で実体化 |
| v2 | **哲学を Apple HIG に変更**。2面+カード+余白で再構成、半透明トップバー、角丸ライン SVG アイコンで形状統一、tint pill ステータス、行末 chevron、右スライドシート。 | ユーザー指定(Apple)+ v1 のアイコン形状不整合を解消 |
| v3 | **Carbon に再回帰 + 構造変更**。トップヘッダー廃止、サイドバー起点(ブランド+アカウント集約)、メイン=検索のみのヘッダー+一覧、ロール/ステータス フィルタ削除。密度を v1 相当に。アイコンは角丸ライン+サークルを維持。 | 業務システムは密度優先(ユーザー判断)。無意味なヘッダーを排し導線を単純化 |
| v4 | **v3 構成のまま哲学を Apple HIG に**。サイドバー=systemGray6 + 角丸ハイライト選択、メイン=白面 full-bleed、検索は**ヘッダー右端寄せ**(丸み pill)、一覧は inset セパレータ + tint pill ステータス + chevron。フィルタ無し継続。 | ユーザー指定: v3 レイアウト + Apple の質感。検索の位置を右端に変更 |
| v5 | **tmp Mobility ブランド適用 + 余白付与**。accent を tmp コーポレートブルー(#005fa2)へ、brand mark を濃紺(#003a63)へ。メインを systemGray6 のキャンバス化し、一覧+ページネーションを**白の角丸カード**に収め周囲に余白(System Settings 風)。検索はカード上のヘッダーに右寄せのまま。 | ユーザー指定: 窮屈さ解消(一覧周りに余白)+ tmp-mobility.co.jp のブランドトークンに整合 |
| v6 | **サイドバーを濃紺(#003a63)に**。「濃紺サイドバー / グレー地 / 白カード」の3層で階層を明確化。サイドバー内は on-dark トークン(白系テキスト・選択は白16%面 + skyblue アイコン)。メイン側は v5 のまま。 | ユーザー指摘: v5 はサイドバーとメイン地が同じグレーで境界が弱く見にくい。Apple 純正は同地+カードで分けるが、企業向けはテーマ色サイドバーが定石 → 範囲限定ブランド上書き |
| v7 | **「2層分離」レイアウトへ再構成**(SaaS 一次情報リサーチに基づく)。①ページヘッダー帯=タイトル「ユーザー一覧」(h1, title2)を**カード外・グレーキャンバス上**に(=ページ識別)。②白カード最上段=**検索のみのツールバー**(=リストへの操作)を表に内属させ下にヘアライン。件数表示を削除。表示件数 select(左下)を削除。`.app` を `height:100vh; overflow:hidden`+`.main`に `min-height:0` でカードを画面内固定(表のみ内部スクロール・ページネーション下端固定)。検索は `--color-fill` 地。**列見出し行の背景を `--thead-bg:#FAFAFA`(極薄オフホワイト)に**(当初 systemGray6 で敷いたら**キャンバスと同色で被る**指摘→修正)。ラベルは weight600 + letter-spacing で「ヘッダーらしさ」を書体側に持たせ、下ヘアラインで分離。sticky のため不透明 solid。 | ユーザー指摘: v7初版(タイトル+検索を同一カード内ツールバーに同居)に違和感。SaaS 定石を一次情報で精査 — **Shopify Polaris / Atlassian PageHeader / Carbon / Ant Pro が一致して「page-level(タイトル/全体操作)と index-level(検索/フィルタ)を2層に分離」**。Polaris原則 "top of the page=title / top of the index=filter"。タイトルと検索を1枚に潰すのが違和感の正体だった。出典は下記「v7 リサーチ」 |

### v7 リサーチ出典(SaaS ヘッダー+一覧の定石 / 一次情報)
- 定石A(2層分離・最有力): **page header 帯(タイトル+全体操作)を上、検索/フィルタは表に内属するツールバー**。Shopify Polaris(Resource index / IndexFilters)・IBM Carbon(DataTable + TableToolbar)・Atlassian(PageHeader + DynamicTable)・Ant Pro(ProTable)が採用。
- 定石B(リーン full-bleed): 最小ヘッダー帯 + カード無し full-bleed リスト + ヘアライン区切り。Linear / GitHub Primer / Stripe Dashboard。
- 白一枚問題の回避策(全社共通): ツールバー/フィルタ行を **必ず別の帯**にする(下ヘアライン or 微トーン差 or カードエッジ)。グレーキャンバス上では**カードを保持**しないと内容が地と接して融合する。
- 本モックの選択: 定石A(2層)+ Apple HIG の抑制(ヘアライン/余白で分け、濃い帯や影を足さない)。キャンバス→ページヘッダー→白カードの3面が各々エッジを持つ。
- URL: atlassian.design/components/page-header ・ polaris-react.shopify.com/patterns/resource-index-layout ・ carbondesignsystem.com/components/data-table/usage ・ procomponents.ant.design/components/table ・ primer.style/product/.../layout ・ linear.app/now/how-we-redesigned-the-linear-ui ・ docs.stripe.com/dashboard/basics

| v8 (分岐) | **ヘッダー+検索の定石を3案、実 HTML で提示**(mode collapse 回避 / ユーザー要望)。**A=output/mock-v8a-fullbleed.html**(カード無し・1枚白面・罫線のみ。Linear/GitHub/Stripe)/ **B=output/mock-v8b-toolbar.html**(カード保持・**検索ツールバーだけ #FAFAFA 帯で差別化・列見出しは素の白**。ユーザー提案 / Polaris・Carbon)/ **C=output/mock-v8c-pageheader.html**(検索を**ページヘッダー(キャンバス上)へ**移し、カードは純粋に表だけ。検索は白+影で地から持上げ。Atlassian PageHeader)。3案とも列見出しはキャンバス色を使わず素の白 or 罫線+書体。 | ユーザー: v7 のヘッダー/検索が分かりにくい。「列見出しは一覧と揃え検索のヘッダーだけ少し変える方が自然」との方針。定石を一次情報で確認し**実物3案**で選択を仰ぐ |

| v9 | **B 採用 + サイドバーをマスタ・ナビへ再設計**(output/mock-v9.html)。サイドバー=**2セクション**(ユーザー管理 / マスタ管理~30件・フラット)。マスタ管理は **絞り込み検索(sticky)+ よく使う(ピン留め3件)+ 五十音フラット一覧**(Salesforce QuickFind / AWS / Stripe Shortcuts の定石)。マスタ項目はテキスト主体・密度高め、**選択中=白16%面 + skyblue 左バー(inset)+ 太字**(色のみ依存しない)。選択でメインの**タイトル+カラム+行が連動**(JS: ユーザー一覧/権限ロール + 30マスタ。商品/取引先/部署は実データ、他はプレースホルダ生成)。行内検索も実装。 | ユーザー要望: 30マスタを切替えて同一画面で一覧表示。回答=フラット/カテゴリ無し・2セクション。定石を一次情報で確認(下記「v9 リサーチ」) |

| v10 (分岐) | **サイドバー選択状態を「左バー無し・角丸塗り」へ + 仕上げ**。「よく使う(ピン留め)」削除。選択中マスタは**インセット角丸塗りハイライト(8px・左バー廃止)**。色違い3案: **neutral=output/mock-v10-neutral.html**(白16%)/ **tinted=mock-v10-tinted.html**(skyblue18%)/ **minimal=mock-v10-minimal.html**(白6%・白太字で示す)。**サイドバー・スクロールバー**を細・半透明白・ホバー出現+`scrollbar-gutter:stable`に。`--sidebar-sel` トークン1行で案を切替。 | ユーザー指摘: 選択の左ライン(skyblueバー)がAIっぽい/スクロールバーが違和感/よく使い不要。定石を一次情報で確認(下記「v10 リサーチ」)→ 左バーは旧型、モダン暗色サイドバーは角丸塗りが既定 |

| v11 (分岐) | **マスタの「表示方法」を再設計、実HTML2案**(ユーザー: サイドバー30件羅列が分かりにくい)。**A=output/mock-v11-hub.html**: 30件を**サイドバーから出し**、メタデータ付き「マスタ管理ハブ画面」(マスタ名/説明/件数/最終更新)で俯瞰→行クリックでそのマスタ一覧へ(パンくず戻り)。Metabase/phpMyAdmin/Salesforce Object Manager の定石。**C=output/mock-v11-switcher.html**: サイドバー最小(マスタ管理1項目)、一覧画面ヘッダーに**マスタ切替コンボボックス**(検索付きポップオーバー)。Airtable⌘J/Salesforce QuickFind。両案ともサイドバー選択状態=①neutral 継承。 | ~30テーブル管理はDB管理/CMSの領域。リサーチ(下記「v11リサーチ」)で**フラット羅列が最弱・ハブ画面が最も明快**と判明。2案を実物で提示し選択を仰ぐ。(D 2ペインは希望時に追加) |

| v13 (3分岐) | **ページネーションのスタイルを3案、実 HTML で提示**(基盤=mock-v8c-hub / ユーザー要望: 一覧下ページャを実サービス定石で洗練)。**carbon=output/mock-v13-pg-carbon.html**(二分割バー: 左=表示件数 select+「全N件中 1–10件」/ 右=「ページ X/Y」+ 前後 seg。数字ボタン無し。IBM Carbon / MUI TablePagination)/ **numbered=output/mock-v13-pg-numbered.html**(数字ページャ: 左=範囲 / 右=数字 pill〔現在=accent 塗り〕+ 前後 chevron + … 省略。Ant / Primer / Atlassian)/ **minimal=output/mock-v13-pg-minimal.html**(prev/next のみ: 範囲+「前へ/次へ」ピル。数字無し。Shopify Polaris / Apple HIG 抑制)。**共通**: ページングを実機能化(共通エンジン: pageSize=10 既定・FILTERED→slice・行内検索は全件フィルタ後に再ページ・rowClick は元 idx を保持)。`<nav aria-label>`+現在 `aria-current="page"`+矢印は装飾 `aria-hidden`(Primer 準拠)。range 文言=「全N件中 1–10件」(en ダッシュ)。3案とも validate.mjs PASS。 | ユーザー: v8c-hub のページャを実サービス正確情報で複数案に。リサーチ(下記「v13リサーチ」)で**有限・総件数既知 → カーソル/load-more 不要、二分割バー or 数字ページャが王道**と確認。3案を実物提示し選択を仰ぐ |

| v12 (4分岐) | **主軸レイアウトを v8b→v8a/v8c に変更し、各に表示方法 A(hub)/C(switcher)を載せた4パターン**(ユーザー指示)。**output/mock-v8a-hub.html**(フルブリード×ハブ)/ **mock-v8a-switcher.html**(フルブリード×スイッチャー)/ **mock-v8c-hub.html**(ページヘッダー×ハブ)/ **mock-v8c-switcher.html**(ページヘッダー×スイッチャー)。v8a=カード無し白面・バー+罫線、検索は fill。v8c=グレーキャンバス+純カード、検索はページヘッダー右に白+影。共通: サイドバー①neutral・スクロールバー・hub/switcher の JS とバグ修正(hidden打ち消し)を継承。 | ユーザー: v8b でなく v8a/v8c を主軸に。hub/switcher 両方を別案として残し評価。v11-hub/v11-switcher(B基盤)も別案として保持 |

### v13 リサーチ出典(データテーブル下のページネーション / 一次情報)
- **構成は4系統**: ①数字付きページャ(Ant `align=end`・現在 active `#1677ff` / Primer 1〜7…10・現在を青塗り白文字 / Atlassian は ellipsis 省略)②前/次のみ(Polaris は数字無し Prev/Next のみ・「25件超のリストに / 下端に配置」/ MUI TablePagination は rows-per-page+範囲+前後アイコン)③二分割バー(Carbon: 左=Items per page+「1–10 of 40 items」/ 右=page X of Y+前後。数字ボタン無し)④カーソル/Load more(Stripe は `has_more` のみで total 非返却 / Linear は Relay カーソル / Notion は「Load N more」)。
- **使い分け(公式)**: Polaris「25件超のみ」/ Carbon「無闇に使わずユーザビリティ・性能のため」/ Ant「全件描画が重い時・ページ送り閲覧」/ NN/g「探す・比較するテーブルは無限スクロールを避けよ」→ **有限・総件数既知の本件はカーソル/load-more 不要**、二分割バー or 数字ページャが王道。
- **per-page**: 既定 10 最多(Ant `[10,20,50,100]` / Carbon 10/20/30/40/50・左端配置 / Stripe API limit 既定10・最大100)。テーブルは 25 も定番。~30件なら 10 が自然。
- **range 文言**: Carbon「1–10 of 40 items」/ MUI「1–5 of 13」(共に en ダッシュ U+2013)。Polaris/Atlassian/Primer は組込 range 無し。日本語化は「全N件中 1–10件」。
- **a11y(Primer が事実上の参照実装)**: `<nav aria-label="Pagination">` + 現在 `aria-current="page"` + 各操作に意味ある aria-label + 矢印は装飾(SR 非公開) + タップ標的 24px 以上。
- **現在ページ強調**: 塗り pill(Primer 青地白文字 / Ant active 色)or セレクタ表示(Carbon/Material は page X of Y で示し pill 無し)。前後は端で disabled(Carbon/MUI/Polaris 共通)。
- URL: ant.design/components/pagination ・ carbondesignsystem.com/components/pagination/usage ・ polaris-react.shopify.com/components/navigation/pagination ・ primer.style/components/pagination(+/accessibility) ・ atlassian.design/components/pagination ・ mui.com/material-ui/react-table ・ m2.material.io/components/data-tables ・ docs.stripe.com/api/pagination ・ linear.app/developers/pagination ・ nngroup.com/articles/infinite-scrolling-tips ・ supabase.com/design-system/docs/ui-patterns/tables

### v11 リサーチ出典(多数テーブルの表示方法 / DB管理・CMS / 一次情報)
- ~30テーブル管理の定石は2系統: ①**サイドバーのテーブル一覧**(Strapi/Directus/Supabase/Webflow/phpMyAdmin)— ただし**必ず**グルーピング/タブ/フィルタ/スイッチャーで補強(Strapiのオーバーフロー不具合が教訓)②**メタデータ付きカタログ/索引ハブ**(Metabase Browse Data=名前+説明 / phpMyAdmin Structure=行数+サイズ / Salesforce Object Manager=検索可能な表)。
- **~30件はハブ索引画面が最も明快**: カタログに余白とメタデータ(件数/更新日/説明)と検索を与えられる。フラット羅列は「30ラベルを詰め込むだけ」で分かりにくい(=ユーザー指摘と一致)。グリッドよりも**表**が高速スキャン・整列に向く(~30、抽象データ)。
- タブは~5-10で限界(Airtable)。2ペインは頻繁な往復時のみ(Directus)。スイッチャー(⌘J/QuickFind)は既知ターゲットへの再入に有効な補助。
- URL: docs.strapi.io/cms/features/content-manager ・ docs.directus.io/user-guide/content-module/content ・ supabase.com/blog/supabase-studio-2.0 ・ support.airtable.com/docs/tables-overview ・ metabase.com/docs/latest/exploration-and-organization/exploration ・ help.salesforce.com(ObjectManager)

### v10 リサーチ出典(暗色サイドバーの選択状態 + スクロールバー / 一次情報)
- **選択状態**: モダン暗色サイドバーの既定は**インセット角丸(8px)塗りハイライト・左バー無し**。Notion(8px角丸)/ Linear / VS Code(`list.activeSelectionBackground`=塗りブロック)/ macOS Finder(アクセント色のtint塗り)/ Supabase。**左アクセントバーは Carbon/Material 系の旧型**で「汎用/AIっぽい」と映る → 廃止。
  - 採用3レシピ: ①tinted=accent(skyblue)を選択面に薄く(Finder/Supabase)②neutral=白オーバーレイ(Notion/VS Code)③minimal=ほぼ塗らず白太字で示す(Vercel)。いずれもバー無し。Discord 流の「先頭ドット/ピル」は別案として保留。
- **スクロールバー**: 細い・track透明・**半透明白サム(rgba(255,255,255,.24)→hover .40)**・**ホバーで出現**が暗色ナビの定石。`scrollbar-width:thin`+`scrollbar-color`+`::-webkit-scrollbar`(8px)。**`scrollbar-gutter:stable` でレイアウトシフト回避**(width指定はオーバーレイを古典型に変え幅を食う点に注意)。代替: `color-scheme:dark` でネイティブ overlay。
- URL: developer.chrome.com/docs/css-ui/scrollbar-styling ・ developer.mozilla.org/.../scrollbar-gutter ・ code.visualstudio.com/api/references/theme-color ・ Notion sidebar UI breakdown ・ supabase-design-system(Sidebar)

### v9 リサーチ出典(多数エンティティのサイドバー / 一次情報)
- ~30件は **フラット一覧が限界、グループ化 or 絞り込みが canonical**。本件はカテゴリ無し→ **sticky な絞り込み(QuickFind)+ ピン留め(よく使う)+ フラット**を採用。
- Salesforce Setup: QuickFind を上部固定・filter-as-you-type / Object Manager は検索可能な一覧。AWS: Unified Search + Favorites。Stripe: Shortcuts(pinned+recent)+ セクション + More。Linear/Notion: 折りたたみ + Favorites + ⌘K。Shopify Polaris: セクション + 全大文字見出し + rollup + badge。
- 選択状態は**塗り pill + accent 左インジケータ**(色のみに依存しない)。マスタ選択がメイン画面を駆動するため選択を明確化。
- 2ペイン/アコーディオンは **~50件超 or 階層が深い場合**に切替(30件では過剰)。
- URL: help.salesforce.com(QuickFind/ObjectManager) ・ docs.aws.amazon.com(search/favorites) ・ docs.stripe.com/dashboard/basics ・ linear.app/changelog(collapsible/personalized) ・ polaris-react.shopify.com(Navigation)

### v7 リサーチ出典(テーブル列見出しの背景色 / 一次情報)
- 列見出し(thead)の背景は **白 or ≤4% 黒の極薄オフホワイト**: Ant `headerBg=#fafafa`(rows/container=#fff)・GitHub Primer `bgColor-muted=#f6f8fa`(rows=#fff)・Carbon は header に専用 layer。Material/Atlassian/Stripe は **fill 無し**で「ミュート書体+下ボーダー」のみ。
- **不変条件**: 見出しは行と同等〜より明るく、**キャンバスより必ず明るい**(3面の中で最暗にしない)。
- **アンチパターン(本件の原因)**: ページキャンバスのグレー(#F2F2F7 級)を見出し背景に使うと、見出しが地に溶けカード上端が消える。どの権威も採用しない。
- 本モックの採用: `--thead-bg:#FAFAFA`(キャンバス #F2F2F7 より明るい)+ 下ヘアライン + ラベル weight600/letter-spacing。Apple HIG の「濃さでなく書体と罫線で見出しを示す」流儀に整合。
- URL: ant.design/components/table ・ v10.carbondesignsystem.com/components/data-table/style ・ primer.style/foundations/color ・ m2.material.io/components/data-tables ・ atlassian.design/components/dynamic-table/examples

## v6 哲学の位置づけ(重要・記録)
- v5 までの「サイドバーもメインも systemGray6」は **Apple/macOS の作法**(System Settings/Finder)。区別は白カード+区切り線のみ=Deference。
  → ユーザーには平板・見にくいと判断された。
- v6 は **Apple をベースに、クローム(サイドバー)だけブランド濃紺へ上書き**(§3.4 範囲限定ハイブリッドの精神)。
  哲学を丸ごと混ぜず、サイドバーゾーンに限定して on-dark の名前空間トークンを与える。本体 Apple トークンは非改変。
- **a11y**: 濃紺 #003a63 上の白系テキストは高コントラスト(AA 余裕)。選択アイコンの skyblue #009fe8 は非テキスト 3:1 を満たす。

## v5 ブランドトークン適用(tmp-mobility.co.jp / 範囲限定ブランド上書き)
> Apple §5「ブランド色があれば 1 箇所差し替え」に従い、**哲学(Apple)は維持**したまま accent をブランド色へ置換。
- **抽出(サイト HTML 実測)**: 濃紺 `#003a63`(主色・最頻) / ブルー `#005fa2` / 明青 `#009fe8` /
  グレー `#959a9b`・`#dbdcdd` / ゴールド `#c89e45` / レッド `#c6000b`。フォント=Montserrat + Noto Sans JP。
- **トークン割当**:
  - `--color-accent: #005fa2`(tmp コーポレートブルー。リンク/選択ナビ tint/フォーカス。白地で AA 可読)。
  - `--color-accent-hover: #003a63`(濃紺=押下で沈む。on-brand)。
  - `--color-accent-tint: rgba(0,95,162,0.12)`(選択ナビの面)。
  - `--brand-navy: #003a63`(ブランドマーク地。見出し的要素)。
  - ステータスは Apple System Colors を維持(機能色。ブランドと競合させない)。`--color-danger` はブランド由来は使わず Apple 赤のまま。
- **フォント**: 単一ファイル自己完結を優先し外部フォントは読み込まない。`Noto Sans JP` を stack に加え(ローカルにあれば使用)、
  Latin は system(SF)へフォールバック。完全一致(Montserrat/Noto を Google Fonts 読込)が必要なら別途追加可能(要相談)。
- **余白**: メイン=systemGray6 キャンバス + `--space-7` の padding、一覧は `--radius-l` + `--shadow-1` の白カードに内包。

---
**ゲート観点(実装前の整合チェック)**
- 詳細の選択が要件と矛盾しないか(高密度・業務効率・a11y)。
- ステータス色が accent(Blue)と競合していないか。
- ロケール(CJK)で可読性・行高が崩れていないか。
