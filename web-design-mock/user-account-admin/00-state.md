---
project: User / Account Management 一覧画面
current_phase: detail-design
updated_at: 2026-06-28
next_action: フェーズ3 — v8c-hub を起点にページネーション3案(v13-pg-carbon/numbered/minimal)を提示済み。ユーザーがページャ案を選択 → v8c-hub(及び必要なら他3案)へ反映。並行して2軸4案の絞り込みも未決のまま保持(意図的に並行検討)。
---
# State

| Phase | File | Status |
|---|---|---|
| 1. 要件定義 | 01-requirements.md  | approved    |
| 2. 基本設計 | 02-basic-design.md  | approved    |
| 3. 詳細設計 | 03-detail-design.md | in-review   |
| 4. 実装     | output/             | not-started |

Status: not-started | draft | in-review | approved

## 検討マトリクス(2軸 × 2、現在ぜんぶ生きている = 並行検討中)
- **機能軸(マスタ表示方法)**: `hub`(一覧ハブ→ドリルイン+パンくず) / `switcher`(ヘッダーのコンボボックス切替)— **両方検討**
- **スタイル軸(レイアウト)**: `フラット`(v8a: カード無し・白1面・罫線) / `カード`(v8c: グレー地+純カード・検索は白+影)— **両方検討**

| | hub | switcher |
|---|---|---|
| フラット(v8a) | output/mock-v8a-hub.html | output/mock-v8a-switcher.html |
| カード(v8c)   | output/mock-v8c-hub.html | output/mock-v8c-switcher.html |

- いずれ未決。どれか1組に絞る判断はユーザーが行う(Claude は自己決定しない)。
- 別案として保持(B基盤): output/mock-v11-hub.html(カード+検索ツールバー帯) / output/mock-v11-switcher.html。
- **ページネーション3案(v8c-hub 基盤・選択待ち)**: carbon=二分割バー(表示件数+範囲 / ページ位置+前後) / numbered=数字ページャ(accent 塗り pill+…省略) / minimal=prev/next のみ(Polaris/Apple)。→ output/mock-v13-pg-{carbon,numbered,minimal}.html。全件→ページング実機能化(pageSize=10・検索連動)。選択後に v8c-hub へ反映。出典は 03「v13 リサーチ」。
- 旧スタイル比較(初期分岐): mock-v8a-fullbleed / mock-v8b-toolbar / mock-v8c-pageheader、サイドバー選択3案: mock-v10-neutral(採用)/ tinted / minimal。

## 全案に共通の確定事項(ロック)
- 哲学=Apple HIG + サイドバーのみ濃紺(#003a63)ブランド上書き。accent=tmpコーポレートブルー #005fa2 / skyblue #009fe8。
- サイドバー=2セクション(ユーザー管理 / マスタ管理)。選択状態=**①neutral(白16%角丸塗り・左バー無し)**。ホバー=白6%。スクロールバー=細・半透明白・ホバー出現・`scrollbar-gutter:stable`。
- 列見出し(thead)背景=素の白(キャンバスのグレーは使わない)。検索の置き場はレイアウト軸で変わる(フラット=バー内 / カード=ページヘッダー右・白+影)。
- マスタ=~30件フラット(カテゴリ無し)。「よく使う(ピン留め)」は不採用。
- マスタ選択でメインのタイトル+カラム+行が連動(JS実装済み)。詳細は右スライドシート(ユーザー一覧のみ)。
- 機械チェック(validate.mjs)= 4案 + 別案すべて PASS。各設計判断の出典は 03-detail-design.md の「リサーチ出典」節。

毎セッション §0 の手順で web-design-mock/*/00-state.md を探し、対象の current_phase の
ファイルの next_action を実行。
