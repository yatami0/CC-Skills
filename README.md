# web-design — Claude Code スキル（生成 + 蒸留の対）

権威あるデザインシステム（**Apple HIG** / **IBM Carbon** / **Ant Design** / **Material 3**）の原則と正確なデザイントークンから、
一貫した手順で「**自己完結した単一ファイル HTML**」の Web デザインモックを生成する Claude Code スキル。

毎回ゼロから「いい感じに」作らせると見た目も手順も揺れる。哲学の原則とトークンを型に固め、
**4 フェーズ（要件→基本設計→詳細設計→実装）をユーザー検証ゲート付き**で進め、進捗をログファイルに
残してセッションをまたいで再開できる。

2 つの対のスキルで構成する:
- **`web-design-mock`**（生成）— 権威ある哲学 → モック。本 README の中心。
- **`web-design-distill`**（蒸留）— 気に入ったモック → 再利用可能な哲学（逆向き）。→ [後述](#モックから哲学を蒸留するweb-design-distill)。

---

## リポジトリ構成

```
sdd/
├── .claude/skills/                   ← スキル本体(これが配布物。git clone でそのまま使える)
│   ├── web-design-mock/              #  【生成】哲学 → モック
│   │   ├── SKILL.md                  #     親: ルーター + パイプライン + ゲート + 出力ルール
│   │   ├── references/               #     子: 各哲学の原則・正確なトークン・レイアウト規約
│   │   │   ├── apple/apple.md        #       Apple(数値トークン非公開 → パターン+a11y数値で構成)
│   │   │   ├── carbon/carbon.md      #       Carbon(公式トークンをコピー)
│   │   │   ├── ant/ant.md            #       Ant Design v5 + Pro(SaaS 管理画面・ブランド色サイダー)
│   │   │   └── material/material.md  #       Material 3 / Material You(表現的なコンシューマアプリ UI)
│   │   └── scripts/                  #     Node・依存ゼロのユーティリティ
│   │       ├── validate.mjs          #       不変条件チェッカー(色値ハードコード等)
│   │       └── list-projects.mjs     #       再開用: 既存モックの発見(§0 / SessionStart hook)
│   └── web-design-distill/           #  【蒸留】モック → 再利用可能な哲学(逆向き。mock と対)
│       ├── SKILL.md                  #     計測→言語化→草案→汎化検証 の 4 フェーズ + ゲート
│       └── scripts/
│           └── list-distills.mjs     #       再開用: 既存の蒸留作業の発見(§1 / SessionStart hook)
├── evals/                            ← スキル評価(開発用。配布物には含めない)
│   ├── 01-apple-lp.json              #   Apple 風 LP
│   ├── 02-router-carbon.json         #   哲学未指定 → ルーターが Carbon を選ぶ
│   └── 03-fallback.json              #   未実装哲学(Fluent 2)のフォールバック
├── install.sh / install.ps1          ← 2 スキルを対で設置するスクリプト(非破壊)
├── web-design設計.md                 ← 設計書(mock。意思決定の根拠。運用には不要)
├── web-design-distill設計.md         ← 設計書(distill。同上)
└── README.md                         ← 本ファイル
```

> スキルは Claude Code に**自動検出**される。`.claude/skills/<name>/SKILL.md` が置かれていれば
> `/web-design-mock`(生成)/ `/web-design-distill`(蒸留)で起動できる。`references/` `scripts/` も自動で同梱される。
> 2 つは**対のスキル**(distill は mock の `validate.mjs` と `references/` を共有)なので、設置は両方まとめて行う。

---

## 使い方

### このリポジトリで使う
すでにプロジェクトスキルとして配置済み。このリポジトリを開いた Claude Code で:

```
/web-design-mock      # 哲学 → モックを生成
/web-design-distill   # 既存モック → 再利用可能な哲学を蒸留(逆向き)
```

と打つか、「Webデザイン / モック / ランディングページ / 管理画面 を作って」（生成）、
「このモックから哲学を抽出 / デザインシステム化して」（蒸留）と頼めば起動する
（`description` のトリガー語で自動起動もする）。

### 他のリポジトリで使う（プロジェクトに同梱）
このリポジトリを clone し、設置スクリプトを実行して対象リポジトリの `.claude/skills/` にコピーする。
**既存ファイルは壊さない**（同名スキルがあれば `--force` 無しでは中止）。

```bash
git clone <this-repo> sdd && cd sdd

# 対象リポジトリに設置(プロジェクト同梱)
./install.sh /path/to/your-repo          # macOS / Linux / Git Bash
pwsh ./install.ps1 C:\path\to\your-repo  # Windows PowerShell

# 既存を上書きする場合
./install.sh /path/to/your-repo --force
```

設置後、対象リポジトリで Claude Code を起動し（ワークスペースの信頼を承認）`/web-design-mock` /
`/web-design-distill`。両スキルが `.claude/skills/` に入る（distill は単体では動かず mock に依存するため対で設置）。
git に commit すればチーム全員で共有できる。

### 個人用（全プロジェクトで使う）
`~/.claude/skills/` に置くと、どのプロジェクトでも使える。

```bash
./install.sh --user            # → ~/.claude/skills/{web-design-mock, web-design-distill}/
pwsh ./install.ps1 -User
```

---

## スキルの動作

**二層ループ**で動く:

- **外側 = 4 フェーズのウォーターフォール**（要件定義 → 基本設計 → 詳細設計 → 実装）。
  フェーズ間に**検証ゲート**があり、ユーザーが検証・承認するまで次へ進まない（Claude は自己承認しない）。
  進捗は `00-state.md` を起点にプロジェクトフォルダのログファイルへ記録し、セッションをまたいで再開する。
- **内側 = token → layout → HTML パイプライン**。1 枚の HTML を生む高速反復（mock-v1→vN）。
  反復間にゲートは無い。

**哲学は「画面タイプ」で選ぶ**（トーン/好みは二次）:

| 画面タイプ | 哲学 |
|---|---|
| マーケLP / プロダクト紹介 / 静謐なコンシューマ向けUI(余白・低彩度) | **Apple** |
| 工業的・高密度・直角の基幹系 管理画面 / データテーブル | **Carbon** |
| SaaS 管理画面 / ブランド色サイダー付きダッシュボード(白カード+角丸+微細影) | **Ant** |
| 表現的・カラフルなコンシューマアプリUI / フォーム&リスト中心アプリ / PWA | **Material** |

- ユーザーが哲学を明示指定したらそれを優先。2 つを丸ごと混ぜない（範囲限定ハイブリッドのみ可）。
- **未実装の哲学**を指定された場合は値を捏造せず、最も近い実装済み哲学を提案してユーザーに選択を仰ぐ。

**再開（セッション横断）**: モックの状態は作業中ワークスペースの `web-design-mock/<project-slug>/`
に置かれる（スキル本体には書かない）。スキル起動時はまず発見スクリプトで既存モックを洗い出し、
再開するか新規にするかを尋ねる。

```bash
node "${CLAUDE_SKILL_DIR}/scripts/list-projects.mjs"
# 各モックの current_phase / next_action を一覧(0件なら新規へ)。
```

#### （任意）セッション開始時に自動で再開候補を提示する
スキル側からは「起動時に必ず実行」を強制できない（Claude Code にスキル起動イベントは無く、
スキル同梱の `SessionStart` hook は起動時点ではまだ読み込まれない）。常時自動化したい場合は、
**利用側リポの `.claude/settings.json` に SessionStart hook をオプトインで追加**する
（全セッションで発火するためスキルには同梱しない方針）。`--hook` モードは進行中モックがある時だけ
context を注入し、無ければ何も出さない（ノイズ無し）。

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node \"${CLAUDE_PROJECT_DIR}/.claude/skills/web-design-mock/scripts/list-projects.mjs\" --hook \"${CLAUDE_PROJECT_DIR}/web-design-mock\""
          }
        ]
      }
    ]
  }
}
```

> 既存の `settings.json` がある場合は **`hooks` にマージ**する（丸ごと上書きしない）。
> `.claude/skills/` 配下の hook はワークスペースの信頼承認後に有効になる。

**出力の不変条件**（実装フェーズで機械チェック）:
1. ハードコードの色値ゼロ（`:root` 以外に生の色が無い）
2. accent 定義は 1 箇所（`--color-accent`）
3. 全参照が `var(--…)`

```bash
node "${CLAUDE_SKILL_DIR}/scripts/validate.mjs" output/mock-vN.html
# PASS / FAIL(違反は行番号付きで表示)。Node のみ必要(依存ゼロ)。
```

---

## 哲学を追加する

`references/<name>/<name>.md` を作る（`references/apple/apple.md` の構造を踏襲）。
各哲学固有の値はそのファイル内に閉じ込め、他へ漏らさない。最低限:

- §0 ルーター用メタ（得意/不得意な画面タイプ・トーン）
- §1 原則 / §2 トークンの出所（公式コピー or 導出かを明記）
- §3 `:root` トークン / §4 レイアウト規約 / §5 look 報告 / §6 ハイブリッド注意

その後、親 `SKILL.md` §3 のルーター表に 1 行追加する。次の候補: **Fluent 2（MS。生産性アプリ）** / **Spectrum（Adobe。制作ツール）**。

---

## モックから哲学を蒸留する（web-design-distill）

上は Apple/Carbon のような**権威ある（authoritative）哲学**を手で足す道。もう一方の道が
`web-design-distill` で、**気に入った 1 枚のモックに埋め込まれた暗黙のルールを、`references/<name>/<name>.md`
と同じ形の哲学へ逆向きに蒸留**する。生成（mock）と蒸留（distill）でフィードバックループを閉じる。

```
/web-design-distill
```

- **過学習を防ぐ 2 原則**: トークンは**実測**（`:root` を逐語抽出・捏造ゼロ）/ 原則は**推論**（`inferred`
  タグ + 根拠を付け、モック自身が守っているかで反証可能にする）。
- **4 フェーズ + ゲート**: 計測（D1）→ 原則の言語化（D2）→ 草案（D3）→ **汎化検証 / ラウンドトリップ（D4）**。
  D4 は哲学ファイルだけを入力に**別画面を再生成**し、同型で**不足ゼロ**なら `approved` に昇格させる。
- **出力先**: 昇格した哲学は作業中ワークスペースの `web-design-mock/_philosophies/<name>/<name>.md`
  に置く（配布物 `.claude/skills/` は汚さない）。`provenance: empirical` で authoritative と棚を分ける。
- **ループの接続**: 親 `web-design-mock` のルーター（SKILL.md §3.5）が `_philosophies/` を発見し、
  `status: approved` の empirical 哲学を **authoritative と併記**して候補に出す（出自を隠さない）。

設計の根拠は `web-design-distill設計.md` を参照。

---

## 開発（評価）

`evals/*.json` は Anthropic 公式の eval 形式。ドキュメントより先に評価を用意する流儀に従う。
スキル有無のベースライン比較や Haiku/Sonnet/Opus での実走でリグレッションを検出する。

---

## 配布形態の選び方

| 形態 | 方法 | 向き |
|---|---|---|
| **プロジェクト同梱**（採用） | `.claude/skills/<name>/` を git commit / `install.sh` で設置 | チーム共有・リポジトリ単位。手軽 |
| 個人用 | `~/.claude/skills/<name>/`（`install.sh --user`） | 自分の全プロジェクトで使う |
| プラグイン配布 | `.claude-plugin/plugin.json` + marketplace、`/plugin install` | 他人・多数リポジトリへ本格配布。バージョン管理/自動更新が要る場合 |

本リポジトリは**プロジェクト同梱**を採用（clone → `install.sh` で設置）。将来、広く配布するなら
plugin 化（`skills/web-design-mock/` と `skills/web-design-distill/` をそのまま plugin の `skills/` に置き、
`plugin.json` を追加）へ無改造で移行できる。
