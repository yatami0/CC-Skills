# 「AIっぽいWebデザイン」の正体 — 調査レポート

> deep-research ハーネスによる調査（99エージェント / 17ソース / 80主張抽出 → 敵対的検証3票制を通過した17主張に集約）。
> 調査日: 2026-06-27。対象領域: **Web/UIデザイン**（HTML/CSS による LP・管理画面・サイト）。
> 本レポートは `web-design-mock` スキルのプロンプト設計に活かすための根拠資料。設計への落とし込みは `web-design設計.md §8` を参照。

---

## 0. 結論（1行）

整合化された LLM は「**意図的なデザイン選択**」をせず、学習データの統計的"**平均値**"に収束する。
だから出力が互いに似通い、見慣れた既定の見た目に寄り、人が「これはAIだな」と一目で見抜く。
これは感覚論ではなく、査読論文で名前のついた現象（**mode collapse**）である。

---

## 1. なぜAIっぽくなるのか（メカニズム）

### 1.1 mode collapse（モード崩壊）＋ typicality bias — confidence: **high**
- RLHF 等の事後学習が LLM の出力多様性を下げ、高頻度・"分布の中央(on-distribution)"の無難な出力へ収束させる。
- その根っこは選好データの **typicality bias（典型性バイアス）**：アノテーターが「見慣れた/典型的なもの」を無意識に高評価する認知バイアス。これがモデルを「平均的な見た目」へ押しやる。
- Anthropic 自身の Cookbook も同じ説明：「Claude は明示的に促さない限り generic / on-distribution な出力に収束し、これがユーザーの言う *AI slop aesthetic* を生む」「明示的に促さない限り安全な選択にデフォルトする」。
- 出典:
  - arXiv 2510.01171「Verbalized Sampling」(2025/10, 査読系一次) — "Post-training alignment often reduces LLM diversity, leading to a phenomenon known as mode collapse"; 根本原因＝"typicality bias in preference data, whereby annotators systematically favor familiar text"
  - arXiv 2310.06452 / 2505.18949（RLHF/DPO が多様性を下げる）
  - https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics

### 1.2 学習データの構成 — confidence: **medium**
- 制約がないと、Bootstrap テンプレ・量産 SaaS LP・紫→青グラデが支配する"インターネットの平均"を出す。
- さらに **フィードバックループ**：AI 生成サイトが再び学習データに入り、平均を増幅する（※定量的には未実証）。
- 出典: braingrid.ai / 925studios.co（実利関係のあるブログだが、独立した複数声と整合）

> ⚠️ 「LLM は単なるパターンマッチャーだから」式の単純化は **検証で棄却**（1-2）。
> 「紫が学習コーパスで統計的に多いから選ぶ＝客観的に良いからではない」も棄却（1-2）。
> メカニズムの主柱は 1.1（mode collapse / typicality bias）であり、1.2 は補強材料。

---

## 2. 視覚的 tells（AIっぽさを生む具体パターン）— confidence: **high**

検証を通過した tell のカタログ。**色相・フォント・レイアウト・装飾・間隔**にまたがって、驚くほど一貫している。

| 分類 | 典型的な"AIっぽさ" |
|---|---|
| **配色** | indigo/紫アクセント、**紫→青グラデーション**（白背景 or ダーク+紫）。通称 *VibeCode Purple* |
| **フォント** | Inter / Roboto / Arial / system フォントの多用 |
| **レイアウト** | アイコン付き**3カラムのボックスグリッド**、中央寄せヒーロー＋3カード |
| **装飾** | 全要素に角丸、**低不透明度の淡いシャドウ（~0.1）** |
| **間隔/サイズ** | 階層を意図せず**全部同じ**（例: border-radius 16px・padding 24px が一律） |
| **テーマ** | 低コントラストのダークテーマ（本文が WCAG-AA ギリギリのグレー） |

> 注: 「0.1 opacity」「16px/24px」は**例示**であり、測定された普遍定数ではない（検証で明記）。

### 紫 tell の確たる出自 — confidence: **high**
Tailwind UI のデフォルトボタン `bg-indigo-500`（約5年前に設定）が、大量のチュートリアル/GitHub コード経由で学習データを汚染した。**作者 Adam Wathan 本人が 2025/8 に公式に"謝罪"**（>100万view）:

> "I'd like to formally apologize for making every button in Tailwind UI bg-indigo-500 five years ago, leading to every AI generated UI on earth also being indigo."
> — https://x.com/adamwathan/status/1953510802159219096

> 注: 「every button / every AI UI on earth」は自虐的な誇張。実際の Tailwind UI は indigo-500/600 を混用。
> 「Tailwind の indigo 既定が唯一の原因」とまでは証明されていないが、広く反復され、最も確度の高い出自説。

- 出典: 上記 Wathan ツイート / prg.sh / developersdigest.tech / dev.to「Blame Tailwind's Indigo-500」

---

## 3. コミュニティの体感 — confidence: **medium**

- 最大の不満は **「全部同じに見える（they all look the same / screams AI / slop）」**。
  Reddit 47サブレ・320万投稿のキーワード分析で、オントピック投稿（46,971件）の **約13%** にこの語が出現。
- 出典: https://github.com/JCarterJohnson/vibecoded-design-tells

> ⚠️ 単一の非査読 GitHub リポジトリ・keyword matching（著者自身が精度を留保）。13%は参考値。
> なお **同リポの「tellランキング」（shadcn既定→AI紫→…の順位付け）は敵対的検証で棄却（0-3 / 1-2）**。
> 順位の根拠としては引用しないこと。

---

## 4. 回避テクニック（プロンプトに組み込める）— confidence: **high** ★最重要

Anthropic Cookbook（一次）と独立技術ブログ(prg.sh)が一致して支持。**効く理由＝サンプリングの確率分布をずらして mode collapse に対抗するから**。

1. **各次元を個別に指示** — typography / color / motion / background を別々に明示誘導
2. **既知デフォルトを名指し禁止** — `Inter / Roboto / Arial / Open Sans / Lato / system font 禁止`、`白背景の紫グラデ禁止`、`3アイコンボックス禁止`
3. **特徴的フォントを指定**:
   - コード系 → JetBrains Mono / Fira Code / Space Grotesk
   - エディトリアル → Playfair Display / Crimson Pro / Fraunces
   - スタートアップ → Clash Display / Satoshi / Cabinet Grotesk
4. **支配色＋鋭いアクセント** — 均等配分の臆病なパレットより、ドミナントカラー＋シャープなアクセント
5. **背景に手をかける** — 単色逃げ禁止、CSS グラデ/幾何パターン/文脈効果を重ねる
6. **具体的インスピレーション参照** — Dribbble を言語化して渡す / IDE テーマ / 文化的美学
7. **役割付与** — 「You are a senior frontend designer」
8. **複数方向を要求** — 3案など異なるデザイン方向を出させる

> ✅ 逆に **「デザイントークン（パレット/スペーシング/例コンポーネント）を渡すだけ」は検証で棄却（0-3）**。
> トークン提供は必要だが**十分ではない**。「既定の名指し禁止 + 次元別誘導 + インスピレーション参照」が支持された組み合わせ。
> → **このスキルへの含意**: 既存の「哲学からトークン導出」パイプライン（必要条件）だけでは AI 臭は消えない。明示的な禁止/特徴付けを上乗せする必要がある。

- 出典: https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics / https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website

---

## 5. 検出（判別の知見）— confidence: **high**

- **Adrian Krebs**: Show HN 1,590 LP を **Playwright で DOM/CSS を決定論的にチェック**（LLM 判定を意図的に排除）。
  - 結果: heavy(4+パターン) **22%** / mild(2-3) **32%** / clean(0-1) **46%**。
  - 単一 tell 最多は **ダークモード 34%**。誤検出 5-10%。
- → **AI 臭は主観でなく、ルールベースの客観検査（DOM/CSS）で測れる**ことの実証。
  生成後に自動採点（lint）を回す設計に直結する。
- 出典: https://www.adriankrebs.ch/blog/design-slop/ / developersdigest.tech

---

## 6. このスキルへの適用方針（要約）

研究が示す二段構えを、`web-design-mock` の既存アーキテクチャに対応づける（詳細は `web-design設計.md §8`）:

1. **前段＝予防（ルールをスキルに組み込む）**
   - 哲学非依存の**禁止リスト**（Inter/Roboto/Arial・白背景の紫グラデ・3アイコンボックス・一律角丸/padding）→ 親 SKILL.md
   - 哲学固有の**特徴付け**（推奨フォント・支配色＋アクセント）→ 子リファレンス
   - ※トークン導出だけでは不十分（§4の棄却claim）。明示禁止＋次元別誘導を上乗せ。
2. **後段＝検出（生成後にAIチェックを回す）**
   - 既存 `validate.mjs` を拡張した**決定論的 anti-slop lint**（Krebs式）を backbone に。`:root` 集約済みなのでトークン値検査が容易。
   - 任意で **LLM ルーブリック評価**（チェックリストを明示渡し）を second pass に。※自己採点バイアスに注意。

---

## 7. 留意点（caveats）

- **時間依存性が高い領域**: 証拠の大半が 2025/8〜2026/6。既定（indigo / Inter）も対策もモデルベンダの調整で変わりうる。
- **ソース品質はまちまち**: 最強の背骨は mode collapse 論文（一次）＋ Anthropic Cookbook（一次・自己批判）＋ Wathan ツイート（出自の一次）。tells の補強は実務/マーケブログ（個々は弱いが相互に整合）。
- **数値は参考値**: 「13%」「0.1 opacity」「16/24px」は例示・自己留保付き。Krebs の 22/32/46% は決定論的だが一著者の定義・誤検出5-10%。
- **棄却済みで引用しないもの**: vibecoded-design-tells の tell ランキング / 「トークンを渡せば直る」説。

## 8. 未解決の問い（openQuestions）

- 他の主要コード生成モデル（GPT-5 / Gemini / v0 / Cursor 等）も同じ indigo/Inter/角丸カード signature を出すか、tell はモデル固有か。証拠は Claude と Tailwind 由来既定に偏る。
- 各回避策（フォント禁止・次元別・複数案）が実際に slop スコアをどれだけ下げるか、対照測定が無い。
- Krebs 式の手調整 Playwright を超える汎用検出器は作れるか。人間製ミニマル/Tailwind サイト（同じ既定を共有）への誤検出率は。
- フィードバックループ（AI 出力が学習データに再流入し平均を増幅）は実証可能か、2025年以降学習のモデルで収束は強まるか直るか。

---

## 付録: 主要ソース一覧

| 種別 | URL |
|---|---|
| 一次(査読系) | https://arxiv.org/pdf/2510.01171 (Verbalized Sampling / mode collapse) |
| 一次 | https://arxiv.org/abs/2310.06452 / https://arxiv.org/abs/2505.18949 (RLHF/DPO 多様性低下) |
| 一次(ベンダ自己批判) | https://platform.claude.com/cookbook/coding-prompting-for-frontend-aesthetics |
| 一次(出自) | https://x.com/adamwathan/status/1953510802159219096 (Tailwind indigo) |
| 検出(一次) | https://www.adriankrebs.ch/blog/design-slop/ (1,590 LP, Playwright) |
| コミュニティ | https://github.com/JCarterJohnson/vibecoded-design-tells (Reddit分析) |
| 技術ブログ | https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website |
| 技術ブログ | https://dev.to/alanwest/why-every-ai-built-website-looks-the-same-blame-tailwinds-indigo-500-3h2p |
| 実務ブログ | developersdigest.tech / braingrid.ai / 925studios.co / freedesignmd.com（tells 補強） |
