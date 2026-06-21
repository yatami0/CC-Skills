# Templates slot 仕様（slot だけ・content-free）

> [資料キット設計.md](資料キット設計.md) ③ Templates 層の確定仕様。[トークン定義雛形.md](トークン定義雛形.md)・[コンポーネントprops仕様.md](コンポーネントprops仕様.md) と対になる。
> テンプレも **content-free / slot だけ**。② Components を組み、① Tokens で見た目を固定する「並べ方の定石」。状態は持たない。

## 0. テンプレは2レベル

| レベル | 役割 | 個数 | page | deck |
| --- | --- | --- | --- | --- |
| **Container template** | 資料1つを包む骨格（ヘッダ・フッタ・ナビ・並び） | 資料に1つ | `PageDoc` | `Deck` |
| **Part template** | part 1つを描く（原稿.md の `layout` で選ぶ） | part ごと | `Section` | `TitleSlide` / `FigureSlide` / … |

- モードで使うテンプレ集が切り替わる（相互変換なし＝[決定1](資料キット設計.md#確定事項)）。
- Container が**並び・ナビ・印刷**を、Part が**1枚の構成**を担う。両方とも内容は持たず slot で受ける。

## 1. テンプレ契約（design-system/templates）

### 解決の型

```ts
import type { ComponentType, ReactNode } from "react";
import type { ZodTypeAny } from "zod";

/** 原稿.md を基盤が parse・正規化した1 part */
export type RenderedPart = {
  id: string;               // "dataflow"（dir名 "03-dataflow" 由来）
  num?: string;             // "03"
  meta: Record<string, unknown>; // frontmatter（layout 等）
  body: ReactNode;          // 本文markdownを描画したもの
  Figure?: ComponentType;   // meta.figure("./Diagram") を解決した固有コンポーネント
};

/** Part template はこの形。frontmatter 検証用に schema を同梱（Zod） */
export type PartTemplate<P = any> = ComponentType<P> & {
  /** この layout が原稿.md frontmatter に要求するスキーマ */
  schema: ZodTypeAny;
};
```

### レジストリ（モード別）

```ts
export const pageTemplates = { Section } satisfies Record<string, PartTemplate>;
export const deckTemplates = {
  TitleSlide, SectionDivider, BulletsSlide, TwoColumn, FigureSlide, CompareSlide, SourcesSlide,
} satisfies Record<string, PartTemplate>;
```

### 解決アルゴリズム（runtime）

```
1. doc.config.ts:  { mode:'page'|'deck', title, eyebrow?, lead?, footer? }
2. import.meta.glob('parts/*/原稿.md')  → frontmatter(meta) + body を取得
3. dir名 "NN-slug" を id / num に分解、NN 昇順でソート
4. 各 part:
   a. dir に Part.tsx があれば最優先（RenderedPart を受け取る固有合成）
   b. 無ければ templates[mode][meta.layout] を引く
      - 見つからなければ build エラー（未知 layout を握りつぶさない）
      - template.schema で meta を検証（不足/誤りは原稿のエラーとして停止）
      - <Template {...meta} num id body={body} Figure={Figure} /> を描画
5. Container でまとめる:
   page: <PageDoc {...config}><Toc/>{parts}</PageDoc>
   deck: <Deck {...config}>{parts}</Deck>
6. 全 part の meta.sources を集約 → SourcesSlide / 出典一覧に渡す
```

- **Part.tsx 優先**＝固有スライドだけ React を書く（既定は原稿.md のみ）。「もっとシンプル」を担保。
- **schema 検証**＝原稿が slot に必要な値を渡しているかを機械チェック（本体の契約駆動と同じ発想）。

## 2. frontmatter → slot マッピングの考え方

- frontmatter の各キー ＝ **Part template の props（slot）への実引数**。
- 原稿の**本文markdown ＝ 既定 slot `body`**（テンプレが lead/説明として使う。使わないテンプレもある）。
- `figure: ./Diagram` ＝ 同フォルダの固有コンポーネントへの**参照**（内容ではない）。基盤が解決して `Figure` で渡す。
- frontmatter の文字列値は必要に応じて inline markdown として描画してよい（例: TwoColumn の `left`/`right`）。

## 3. Container templates

### `PageDoc`（page）

| slot/prop | 由来 | 説明 |
| --- | --- | --- |
| `eyebrow?` `title` `lead?` `footer?` | doc.config | ヘッダ/フッタ |
| `toc` | runtime（`useTOC`/`useScrollSpy`） | `<Toc items activeId>` を受ける |
| `children` | parts（Section群） | 本文＝セクションの縦並び |

使う Components: `Region` `Eyebrow` `Heading` `Text` `Toc` `Link`。器＝連続スクロール（`--container-measure` 幅）。

### `Deck`（deck）

| slot/prop | 由来 | 説明 |
| --- | --- | --- |
| `slides` | parts（Slide群） | スライド配列。**現在の1枚**を表示（印刷時は全枚を縦積み） |
| `current` `total` `onPrev` `onNext` `onJump` | runtime（`useDeckNav`） | ナビ状態 |

使う Components: `PageNumber` `ProgressDots`。器＝固定キャンバス（`--slide-w`×`--slide-h`）を scale-to-fit（runtime の `SlideFrame`）。

## 4. Part templates

凡例: ←FM = frontmatter キー、body = 本文markdown の扱い。

### page

| Template | slots（props） | ←FM | body | 使う Components |
| --- | --- | --- | --- | --- |
| `Section` | `{ num?; heading; sources?; body }` | `heading` `sources[]` | 本文として表示 | `Heading(level=2)` `Text` `Sources` |

### deck

| Template | slots（props） | ←FM | body | 使う Components |
| --- | --- | --- | --- | --- |
| `TitleSlide` | `{ eyebrow?; title; lead? }` | `eyebrow` `title` `lead` | （未使用） | `Region` `Eyebrow` `Heading(1)` `Text` |
| `SectionDivider` | `{ num?; title }` | `title` | （未使用） | `Region` `Heading(1)` |
| `BulletsSlide` | `{ title; bullets[]; sources? }` | `title` `bullets[]` `sources[]` | 補足 lead | `Heading(2)` `Bullets` `Sources` |
| `TwoColumn` | `{ title; left; right; sources? }` | `title` `left` `right` `sources[]` | （未使用） | `Heading(2)` `Columns` `Sources` |
| `FigureSlide` | `{ eyebrow?; title; figure; caption?; sources? }` | `eyebrow` `title` `caption` `sources[]` | lead 説明 | `Eyebrow` `Heading(2)` `Figure` `Sources` |
| `CompareSlide` | `{ title; columns[]; rows[]; highlightColumn?; sources? }` | `title` `columns[]` `rows[]` `highlightColumn` `sources[]` | 補足 lead | `Heading(2)` `CompareTable` `Sources` |
| `SourcesSlide` | `{ title?; groups }` | `title` | （未使用） | `SourceIndex`（groups は runtime 集約） |

### 代表例（FigureSlide の実装イメージ）

```tsx
export const FigureSlide: PartTemplate<FigureSlideProps> = ({ eyebrow, title, caption, sources, body, Figure }) => (
  <Region>
    <Region.Header>{eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}<Heading level={2}>{title}</Heading></Region.Header>
    <Region.Body>
      <Figure caption={caption}>{Figure && <Figure />}</Figure>
      {body}
    </Region.Body>
    <Region.Footer>{sources && <Sources items={sources} />}</Region.Footer>
  </Region>
);
FigureSlide.schema = z.object({
  layout: z.literal("FigureSlide"),
  eyebrow: z.string().optional(),
  title: z.string(),
  figure: z.string().optional(),     // "./Diagram"
  caption: z.string().optional(),
  sources: z.array(sourceItemSchema).optional(),
});
```

## 5. 原稿.md の例（03-dataflow → FigureSlide）

```md
---
layout: FigureSlide
eyebrow: 図1
title: 実行時データフロー
figure: ./Diagram
caption: CRUD の心臓部。useQuery / useMutation を呼ぶだけで層が並ぶ。
sources:
  - { tag: D1, category: データフロー, href: "https://…", text: "Mastering CRUD…" }
---

一覧 → 詳細 → 更新 → 再取得の CRUD ループ。
```

```
03-dataflow/
  原稿.md        ← 上記（内容）
  Diagram.tsx    ← figure: ./Diagram の実体（固有・useId で marker 一意化）
```

これだけで Section/Slide が描ける。Part.tsx は不要（固有合成が要る時だけ足す）。

## 6. ガードレール（テンプレレビュー）

- テンプレ内に**文言・URL・数値（px）が無い**こと（slot と token のみ）。
- テンプレが **② Components 経由で組まれている**こと（生 `<table>` 等を直書きしない）。
- **状態を持たない**こと（`useState`/IO なし。ナビ等は Container が runtime から受けて渡す）。
- 各 Part template が **`schema`（Zod）を同梱**し、未知 layout・不足 frontmatter で停止すること。

## 7. 未確定（実装時に詰める）

- `TwoColumn` の `left`/`right` を frontmatter markdown 文字列にするか、本文を区切りトークンで2分割するか。
- `SourcesSlide` の集約を runtime が全 part から行う範囲（同一 deck 内のみ／参照 part の限定）。
- `Section`（page）に図・比較表を入れたい場合、専用 Part template を増やすか `Part.tsx` に倒すか。
- schema を template 同梱（本仕様）にするか、`contracts/` 的に1か所集約するか。
