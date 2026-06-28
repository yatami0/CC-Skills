---
name: web-design-scout
description: >-
  実プロダクト(Linear / Stripe / Notion 等)で実際に使われている定石 UI を web 偵察し、出典リンクを
  添えて「複数パターンの自己完結 HTML ギャラリー」として並べ、さらに現行モックとの違和感を統制語彙
  (診断ルーブリック)で言語化する。スコープ→偵察→再現→診断→手渡しのファンアウトで進める。
  生成や哲学化はしない(それは web-design-mock / web-design-distill の責務)。既存スキルとは
  完全に責務分離。Use when the user wants to research / look up real-world or SaaS reference designs,
  see how a UI pattern (table list, filter bar, pricing table, settings screen…) is actually done in
  real products, get multiple design patterns side by side with source citations, diagnose why a mock
  "feels off" but they can't articulate it, or asks for a "実例を調べて / 定石デザイン / 他社のUIを
  参考に / テーブルのデザインを複数 / 出典付きで / 参考デザインを並べて / 違和感の言語化".
---

# web-design-scout

実プロダクトの定石 UI を偵察し、**出典付きで複数パターンを並べ**、現行デザインとの**違和感を
言語化する**。`web-design-mock`(哲学→モック)/ `web-design-distill`(モック→哲学)に並ぶ**第3の入口
= 実例→モック**。狙いは「モックに違和感はあるが明確に指摘できない」を解くこと。

> 設計判断と根拠は `web-design-scout設計.md` を参照(運用には不要)。
> **既存スキルとは完全に責務分離**: 生成も哲学化もしない。本スキルは「偵察・比較・診断」まで。
> 採用したパターンの本体移植は**ユーザーが手で** `web-design-mock` 側へ持ち込む(自動連携なし)。

---

## 0. 最初に必ずやること(セッション開始時)

偵察の状態は**作業中ワークスペース**(Claude Code を起動したリポジトリ/フォルダ)の
`web-design-scout/<pattern>-shot/` に置く(置き場所規約は §6)。**`web-design-mock/` も
スキル本体(`.claude/skills/...`)にも書かない**(責務分離・配布物を汚さない)。

1. **まず発見スクリプトを実行**して既存の偵察を洗い出す(記憶に頼らない):

   ```bash
   node "${CLAUDE_SKILL_DIR}/scripts/list-shots.mjs"
   ```
   - 1件以上(exit 0)なら各 `00-scout-state.md` の `current_phase`/`next_action` を示し、
     **再開 or 新規**を尋ねる。再開なら `next_action` から続ける。
   - 0件(exit 3)なら新規へ。

2. 新規なら **S1 スコープ**(§2)から開始し、`web-design-scout/<pattern>-shot/` を作って
   ログ一式(§6)を起こす。

---

## 1. ループの形(滝ではない / 広さ優先のファンアウト)

`web-design-mock` / `web-design-distill` は 4 フェーズの**ウォーターフォール(深さ)**。
本スキルは **S1→S5 のファンアウト(広さ)**。「1枚を磨く」ではなく「定石を並べて見比べる」。

- **フェーズ間ゲートの作法は引き継ぐ**(各フェーズ後にユーザーが検証・批判。Claude は自己承認しない)。
- ただし S3(再現)内の「カードを1枚ずつ足す」反復に**ゲートは無い**(承認不要の内側反復)。
- 状態は `00-scout-state.md`(薄い baton)に残し、セッションをまたいで再開する。

---

## 2. S1–S5(各フェーズの進め方)

各フェーズ共通: (a) 理解を 2〜4 行で言い換え → (b) 方向を分ける 1〜3 問だけ確認 → (c) 作業して
フェーズファイルに書く → (d) **ゲートで止まる**。

### S1 — スコープ → `00-scout-state.md`
- **パターン**を確定(テーブル/リスト・フィルタバー・課金プラン表・設定画面・ダッシュボード等)。
- **粒度**: コンポーネント単位 or 画面アーキタイプ単位(両対応)。
- **枚数**(既定3)/ **トーンや業種の制約**(あれば一度だけ聞く)。
- **対応するルーブリックを確認**(`_rubrics/<pattern>.md`)。無ければ S4 で起こす(§5)。
- **ゲート観点**: パターン/粒度を取り違えていないか? 比較したい軸は明確か?

### S2 — 偵察(並列 web 研究) → `sources.md`
- **二次(実プロダクト)優先**で集める ― 実在感が主価値(ユーザー選択)。Linear / Stripe / Notion /
  Vercel / Airtable / GitHub 等の実 UI を、デザイン解説記事・公式ドキュメント・スクショから観察。
- **一次(公式デザインシステム)で作法を裏取り**する(Primer / Material / Carbon / Polaris 等)。
  → **二次=モックの見た目 / 一次=診断軸の根拠**(設計 §3 原則3)。
- 各候補に**出典 URL** と「**推定の度合い**」(どの値が観察推定か)を `sources.md` に記録。
- **WebFetch がブロックされる実プロダクト**(ログイン必須/SPA)→ 二次情報(解説記事/公式ブログ/
  Dribbble 等)に退避し、出典をそのまま明示。**目分量で値を捏造しない**(設計 §3 原則1)。
- 偵察を厚くするなら並列エージェントで各プロダクトを分担できるが、**Workflow はユーザーの明示
  opt-in が前提**。既定は逐次。規模が要るときだけ提案する。
- **ゲート観点**: 出典は実在し参照可能か? 二次に偏りすぎず一次の裏取りがあるか?

### S3 — 再現(出典付き HTML カード) → `gallery.html`
- 各候補を**自己完結 HTML カード**にし、**横並び**にする(1ファイル = ギャラリー)。
- **同一ダミーデータで描き分ける**(中身を揃えると作法差だけが際立つ = 純粋比較。設計 §9-4)。
- **各カードに必須**: ① 出典リンク ② `provenance: referenced-secondary`(or primary)
  ③ **`推定 estimated` ラベル**(px/hex は観察推定で、出典の値ではない旨)。
- **値はトークン名前空間に閉じる**(例 `--ln-*` Linear / `--st-*` Stripe)。複数パターンが共存するので
  単一 accent は強制しない(mock とは器の不変条件が違う = §7)。
- **正直さの規律**(設計 §3 原則1): 完全コピーでなく**模写 + 出典明示**。ブランドアセットは転載せず、
  中身はダミーデータ(架空の会社名 / `@*.example` のメール等)に置換する。
- **ゲート観点**: 各カードに出典+推定ラベルがあるか? ダミーデータに置換済みか?

### S4 — 診断(違和感の言語化) → `gallery.html` 内 or `diagnosis.md`
- **現行モックがあれば**、ルーブリック(`_rubrics/<pattern>.md`)で**現行と各実例を同じ軸で値づけ**し、
  **ズレた軸=違和感の正体**を出力する(設計 §5.2 の型)。違和感はたいてい 1〜3 軸に収束する。
- **値を出さず作法で語る**のが鉄則 ―「#fafafa にしろ」ではなく「ゼブラをやめ横罫のみに」。
- **ルーブリックが無ければここで起こす/育てる**(§5)。
- **ゲート観点**: 診断が観察できる作法に基づくか(曖昧な推定値に依存していないか)?

### S5 — 手渡し
- 採用候補を提示。**移植はユーザーが本体 `web-design-mock` 側で**(範囲限定ハイブリッド §6 として)。
- scout は**指摘・比較まで**。mock を自動起動しない(完全責務分離)。

---

## 3. 偵察ルーター(どのプロダクトを当たるか)

パターン別の「定石を持つ実プロダクト」の当たり先。**二次優先 + 一次で裏取り**(設計 §3 原則3)。

| パターン | 二次(実プロダクト・見た目) | 一次(公式 docs・作法の根拠) |
|---|---|---|
| テーブル / リスト | Linear / Stripe Dashboard / Notion / Airtable / Vercel | GitHub Primer DataTable / Carbon Data table |
| フィルタ / 検索バー | Linear / Notion / Amplitude | Material / Polaris |
| 課金プラン表 | Stripe / Vercel / Linear pricing | — |
| 設定画面 | GitHub / Vercel / Stripe settings | Polaris / HIG |
| ダッシュボード | Stripe / Vercel / Datadog | Carbon / Material |

- ユーザーが**特定プロダクトを指定**したらそれを優先。
- **当たれない時**(ログイン必須/SPA)は二次情報に退避し出典を明示(§S2)。**値を捏造しない**。

---

## 4. provenance(出自を隠さない)

| クラス | 出自 | 値の保証 |
|---|---|---|
| `referenced-secondary` | 実プロダクト観察 | **作法は出典 / 値は推定** |
| `referenced-primary` | 公式デザインシステム docs | 作法は明文 / 値は docs 由来 |

- **このクラスは scout 内に閉じる**(`web-design-mock` の provenance 体系=authoritative/empirical に
  書き戻さない。完全責務分離)。
- 提示時は出自と推定の度合いを必ず併記。最終採用はユーザー。

---

## 5. 診断ルーブリック(本スキルの核)

`web-design-scout/_rubrics/<pattern>.md` = 「違和感を言葉に変える**統制語彙**」。

- **軸 × 値の候補**で構成し、各軸は**観察できる作法だけ**(推定 hex/px に依存しない)。
- 現行と実例を**同じ軸で値づけ**して並べ、ズレた軸を指摘する(設計 §5)。
- **育てる(draft 運用)**: パターンごとに 1 ファイル。実走のたびに新しい値候補を足す。
  初期実装は `table.md`(テーブル12軸)。filter-bar / card / form / pricing-table / nav を実需で追加。
- `provenance: referenced` を付け、各軸の根拠(一次 docs or 観察)を明記。

---

## 6. ログファイル & 置き場所(完全分離)

```
<workspace>/
└── web-design-scout/                  # ← web-design-mock と別ベース(汚さない)
    ├── _rubrics/                       # 診断ルーブリック(パターン別・再利用)
    │   └── <pattern>.md
    └── <pattern>-shot/                 # 1 偵察 = 1 フォルダ
        ├── 00-scout-state.md           # 薄い baton: 現フェーズ/枚数/唯一の next-action/各ファイルへのポインタ
        ├── sources.md                  # 出典台帳(各カードの URL + 推定の度合い)
        ├── gallery.html                # 横並びギャラリー(出典 + 推定ラベル + 診断)
        └── diagnosis.md                # (任意)現行モックとの差分が大きい時に分離
```

- **`_rubrics/` は underscore 前頭**で「shot ではない」signal。
- スキル本体 `.claude/skills/web-design-scout/` には**書かない**(読み取り専用の配布物)。
- 共有/除外は任意。スキルは自動で `.gitignore` を書き換えない。

### `00-scout-state.md` テンプレート
```markdown
---
pattern: <name>
granularity: component   # component | screen
count: 3
current_phase: scope     # scope | recon | reproduce | diagnose | handoff
updated_at: <date>
next_action: <次セッションが最初にやる唯一のこと>
---
# State

| Phase | File | Status |
|---|---|---|
| S1. スコープ | 00-scout-state.md | draft       |
| S2. 偵察     | sources.md        | not-started |
| S3. 再現     | gallery.html      | not-started |
| S4. 診断     | gallery.html      | not-started |

毎セッション §0 の手順で web-design-scout/*-shot/00-scout-state.md を探し、next_action を実行。
```

---

## 7. 機械チェック(自前・軽量 / mock とは目的が違う)

`web-design-mock` の `validate.mjs` は**借りない**(完全分離)。ギャラリーは複数パターンが各自の
トークン名前空間で共存するので「accent 1 箇所」を強制できない。scout が見るのは**出典と正直さ**:

```bash
node "${CLAUDE_SKILL_DIR}/scripts/scout-lint.mjs" <pattern>-shot/gallery.html
```

不変条件(違反は exit 1):
1. **各カードに出典リンクがある**(出典なしカード = 禁止)。
2. **各カードに `推定`/`estimated` 表示がある**(referenced-secondary の正直さ担保)。
3. **自己完結 HTML**(外部 CSS フレームワーク/CDN stylesheet を読まない)。

advisory(warning・ブロックしない):
- ダミーデータ漏れの疑い(`@*.example` でない実在ドメイン風メール等)。**ブランド/実データの
  転載防止は最終的に人間レビュー**(機械では誤検出しやすい ― 出典の社名と本文の社名を区別できない)。

> mock=「トークン器の不変条件」/ scout=「出典と正直さの不変条件」。**目的が違うから共有しない**
> (これも責務分離の現れ)。

---

## 8. 横展開(ルーブリック/プロダクトの追加)

- **ルーブリック追加**: `_rubrics/<pattern>.md` を `table.md` の構造(軸 × 値の候補 + 診断型 + 出典)で
  起こす。実需に応じて filter-bar / card / form / pricing-table / nav を足す。
- **偵察先追加**: §3 ルーターに「パターン → 二次/一次の当たり先」を 1 行足す。
- **接続を作りたくなったら**: 現状は手渡しのみ(設計 §8)。将来 mock と自動連携するなら、distill と
  同じく明示的な接続点を 1 つ足し、本書ではなく設計書を改訂してから実装する。
