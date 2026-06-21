# doc-kit — 資料作成キット（design-system + works）

「AI が余白を発明しない／内容と部品が混ざらない」を満たす、**資料（ペライチ解説）を作るためのデザインシステム**と、その実例（成果物）を1つの Vite プロジェクトに同居させた PoC です。

- **`design-system/`** … トークン・部品・テンプレ・基盤。**内容を一切持たない**（content-free）／出力モードに依存しない。
- **`works/`** … 成果物（資料）。`原稿.md`（frontmatter + 本文）に内容を書くだけ。design-system の公開 API だけに依存する。

依存方向は **`works → design-system` の一方向のみ**（ESLint で機械的に強制）。

---

## セットアップ

```bash
pnpm install
```

> パッケージマネージャは **pnpm**。Node は 20+ を推奨。

---

## コマンド早見表

| やりたいこと | コマンド | 開く URL |
| --- | --- | --- |
| **作った資料を見る**（開発サーバ） | `pnpm dev` | http://localhost:5173 |
| **部品カタログ（Storybook）を見る** | `pnpm storybook` | http://localhost:6006 |
| 資料を本番ビルド（型チェック込み） | `pnpm build` | `dist/` に出力 |
| ビルドした資料をプレビュー | `pnpm preview` | http://localhost:4173 |
| Storybook を静的ビルド | `pnpm build-storybook` | `storybook-static/` に出力 |
| Lint（ガードレール検査） | `pnpm lint` | — |
| 資料のスクリーンショット撮影 | `pnpm shots` | `dist-shots/` に出力（要 `pnpm dev` 起動中） |

---

## 1. 作った資料を見る

```bash
pnpm dev
```

ブラウザで **http://localhost:5173** を開くと、`works/nextjs-tanstack/` の資料（「Next.js + TanStack Query のクライアント寄り構成 — 図解」全9セクション）が表示されます。

- 右上の **☾ / ☀ ボタンでライト/ダーク切替**（設定は保存され、リロードしてもちらつきません）。
- 左に**追従する目次**（スクロールで現在地がハイライト）。
- 図・表・出典・注意書きはすべて design-system の部品で描画。図の色もダークに追従します。

PDF 化したいときは `pnpm build` → `pnpm preview` でブラウザの印刷（PDF 保存）。印刷用 CSS で目次・テーマボタンは消え、図・表は途中で割れません。

---

## 2. 部品カタログ（Storybook）を見る

```bash
pnpm storybook
```

ブラウザで **http://localhost:6006**。design-system の部品を役割カテゴリ別に一覧・試用できます。

- 左ナビ: **Foundations**（色/余白/タイポのトークン可視化）, **Components**（役割9カテゴリ）, **Templates**（PageDoc / Section）, **Works**（作った資料のプレビュー）。
- 上部ツールバーの **Theme** で全 story を light / dark 切替。
- **Controls** タブで `tone` / `level` / `highlightColumn` などを変えて即確認。
- **Docs** タブに props 表（型から自動生成）、**Accessibility** タブに axe の a11y チェック。

### 作った資料を Storybook で見る（自動発見）

`Works / 資料プレビュー` に2つの story があります。**`works/` 配下を自動発見**するので、資料を追加すれば自動で増えます（後述）。

- **資料全体** … 資料1本をまるごと表示。Controls の `work` で資料を選択、ツールバー Theme で light/dark。
- **セクション単体** … 全資料のセクションを横断で1つだけ選んで表示（`section` で選択）。

> 仕組み: [works/Works.stories.tsx](works/Works.stories.tsx) が `import.meta.glob` で全 work を解決し、design-system の `WorkDocView` で描画します。資料を足すたびに story を書く必要はありません。

> Storybook の表示が固まった/古いままのときは、一度停止して `node_modules/.cache/storybook` を消してから再起動してください。

---

## ディレクトリ構成

```
doc-kit-poc/
  design-system/                 ← 共通（内容を持たない）
    tokens/tokens.css            ① Tokens: OKLCH primitive + @theme(semantic) + dark
    components/                  ② Components: 役割9カテゴリ（content-free / stateless）
      layout/ display/ datadisplay/ communication/ navigation/ action/
      components.css  diagram.css  index.ts
    templates/page/              ③ Templates: PageDoc（器）/ Section（part）+ Zod schema
    runtime/                     基盤: resolveWork / useTheme / useTOC / useScrollSpy / markdown
    index.ts                     公開 API（works はここからだけ import）
  works/nextjs-tanstack/         ← 成果物（内容はここに閉じる）
    doc.config.ts                mode・タイトル・ヘッダ/フッタ
    App.tsx                      原稿を解決して PageDoc に流し込む
    parts/NN-slug/
      原稿.md                    内容（frontmatter=データ + 本文=prose）
      Part.tsx                   固有合成が要るときだけ（任意）
      Diagram.tsx                固有の図（任意）。diagram.svg を Image で埋め込む
      diagram.drawio             図の編集用ソース（drawio で作図）
      diagram.svg / diagram.dark.svg  drawio から書き出した図（light / dark）
  .storybook/                    カタログ設定（main.ts / preview.tsx）
```

### データの流れ（内容が部品に混ざらない）

```
原稿.md(frontmatter=データ + 本文)  →  基盤が parse・検証  →  Template(slot) に流し込み
                                                              ↘ Components(props/children) で描画
                                                                 ↘ Tokens で見た目を固定
```

下り一方向。design-system は上流（成果物の内容）を一切 import しません。

---

## 新しいセクションを足す（資料の編集）

`works/<資料名>/parts/` に `NN-slug/` フォルダを作り、`原稿.md` を書くだけ。番号（NN）順に並びます。

```md
---
layout: Section
heading: セクション見出し
sources:
  - { tag: X1, category: カテゴリ名, href: "https://…", text: "出典名", note: "一言メモ" }
---

本文を Markdown で書く。**強調**・`code`・[リンク](https://…) が使えます。
```

- **本文 prose だけのセクション**は `原稿.md` だけで完成（React 不要）。
- 比較表・図・callout など**固有ブロックが要るときだけ**、同フォルダに `Part.tsx` を置いて design-system の部品を組みます（内容は frontmatter から受け取り、Part.tsx は配置だけ）。
- **固有の図**は同フォルダに `Diagram.tsx` を置き、frontmatter で `figure: ./Diagram` と参照。図の実体は **[drawio](https://www.drawio.com/) で作図** し、**SVG を書き出して `Image` で埋め込む**:

  ```tsx
  import { Image } from "../../../../design-system";
  import src from "./diagram.svg";
  import srcDark from "./diagram.dark.svg"; // 任意（ダーク用）
  export default () => <Image src={src} srcDark={srcDark} alt="図の要旨を一文で" />;
  ```

  - 同フォルダに **`diagram.drawio`（編集用ソース）** を置き、drawio で開いて作図する。配置・矢印の経路は drawio で調整する（線が箱に被らないよう手で整えられる）。
  - drawio から **SVG で書き出し**（PNG ではなく SVG＝ベクターで拡大に強い）、`diagram.svg`（ライト）／`diagram.dark.svg`（ダーク）として保存。`Image` の `src` / `srcDark` に渡すと **`data-theme` で light/dark を切り替え**る（`srcDark` 省略時は1枚を両テーマで表示）。
  - PNG など他の画像でも `Image` で同様に埋め込める。`alt` は a11y 必須（図の要旨を一文で）。
  - 図ランプの色（blue/teal/coral/purple/gray/green/amber）の HEX は `tokens.css` の `--ref-dia-*` のコメントを参照して drawio 側の塗り/枠/文字色に合わせる。

frontmatter が不足/誤っていると Zod 検証でビルドが停止します（未知の `layout` も停止）。

### 新しい資料（work）を足す

`works/<新しい資料名>/` を作り、`doc.config.ts`（`export const docConfig`）と `parts/NN-slug/原稿.md` を置くだけ。

- 実ページとして見るには `src/main.tsx` の import 先を切り替えるか、その work の `App.tsx` を用意します。
- **Storybook には何もせず自動で出ます**（`Works / 資料プレビュー` の `work` ドロップダウンに追加）。

---

## ガードレール（`pnpm lint` で機械検査）

- **`design-system` → `works` の import 禁止**（一方向依存）。
- **`works` は `design-system/index.ts`（公開 API）経由のみ** import 可。
- **Tailwind 任意値（`p-[24px]` / `bg-[#fff]`）と生 px/hex を禁止** → トークン由来ユーティリティのみ。

新しい見た目が要るときは **design-system にトークン/部品を足してから**使います（成果物側に直書きしない）。
