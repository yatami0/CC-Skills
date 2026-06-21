# Components props 仕様（content-free な受け取り口）

> [資料キット設計.md](資料キット設計.md) ② Components 層の確定仕様。[トークン定義雛形.md](トークン定義雛形.md) と対になる。
> [共通コンポーネント.md](../FE_architecture/doc/共通コンポーネント.md) の役割9カテゴリ・フラット分類をそのまま型にする。
> 全部品の鉄則: **content-free（内容を持たない）／ container-free（page か deck かを知らない）／ stateless（状態は hook が持ち props で受ける）**。

## 0. 受け取り口は3種類だけ

部品が外から受け取れるのはこの3つに限る。これ以外（文字列リテラルのベタ書き、px、mode分岐）を部品内に持たせない。

| # | 受け取り口 | 何を渡すか | 例 |
| --- | --- | --- | --- |
| ① children | prose / inline の中身 | 見出し文・本文・ラベル | `<Heading>実行時データフロー</Heading>` |
| ② data props | **構造化データ（配列・オブジェクト）** | 箇条書き・表・出典 | `<Bullets items={…} />` `<CompareTable columns rows />` |
| ③ variant / state props | **境界のある enum ＋ 基盤からの状態** | tone・level・activeId | `<Callout tone="warn">` `<Toc items activeId>` |

> DataDisplay と Communication は **JSX 子で内容を書かず、② data props（配列）で受ける**。これが現行PoC（`<DocSource …>本文</DocSource>` のベタ書き）からの一番の転換。

## 1. 横断ルール

1. **content-free**: 文言・URL・図の内容を部品内に**書かない**。すべて children か data props 経由。
2. **container-free / mode 非依存**: 部品は page/deck を**分岐しない**。モード差（文字スケール等）は `[data-mode]` を見る CSS（runtime層）が当てる。部品は役割の構造（`data-level` 等）だけ出す。
3. **variant は境界のある enum → token**: `tone` `variant` `level` `gap` は固定の文字列ユニオン。任意値・自由数値は受けない（→ lint）。
4. **stateless**: 開閉・現在地・追従などの状態は hook（runtime）が持ち、結果を props で渡す。部品は受け取って描くだけ。
5. **children = inline/prose、data props = 構造**。両者を混ぜない（例: 表の中身を children に書かない）。

## 2. 共有型（design-system/components/types.ts）

```ts
import type { ReactNode } from "react";

export type Tone = "note" | "info" | "warn";          // Callout / Badge / Tag
export type Space = "block" | "stack" | "region";      // --spacing-* に対応
export type Align = "start" | "center" | "end";
export type HeadingLevel = 1 | 2 | 3;

/** 出典1件（原稿.md frontmatter の sources[] がこの形） */
export type SourceItem = {
  tag: string;        // "D1"
  href: string;       // 参照URL（内容ではなくポインタ）
  text: string;       // 表示名
  category?: string;  // 集約のキー（既定 "その他"）
};

/** TOC1件（runtime の useTOC が生成して Toc に渡す） */
export type TocItem = { id: string; num?: string; heading: string };

/** 表の行（セルは文字列 or inline ReactNode） */
export type Cell = ReactNode;
export type Row = Cell[];
```

## 3. カテゴリ別 props 仕様

凡例: 受け取り口 = ①children / ②data / ③variant・state。すべて「consumes」は token 由来ユーティリティのみ（生値なし）。

### Layout（配置・構造）— ①children のみ

| 部品 | props | 受け取り口 | 備考 |
| --- | --- | --- | --- |
| `Region` ＋ `Region.Header/Body/Footer` | `{ children }` | ① | スロット枠。compound。header/body/footer を子に持つ |
| `Stack` | `{ gap?: Space="stack"; align?: Align; children }` | ①③ | 縦リズム |
| `Columns` | `{ gap?: Space="region"; ratio?: number[]; children }` | ①③ | 横分割。`ratio={[2,1]}` 等 |
| `Grid` | `{ cols: number; gap?: Space; children }` | ①③ | |
| `Card` | `{ variant?: "surface"\|"bordered"="surface"; pad?: Space="stack"; children }` | ①③ | |
| `Spacer` | `{ size?: Space }` | ③ | 余白のみ |
| `Divider` | `{ orientation?: "h"\|"v"="h" }` | ③ | |

### Display（表示プリミティブ）

| 部品 | props | 受け取り口 | 備考 |
| --- | --- | --- | --- |
| `Heading` | `{ level: HeadingLevel; children }` | ①③ | サイズは mode CSS が `data-level` で当てる（部品は分岐しない） |
| `Eyebrow` | `{ children }` | ① | 見出し上の小ラベル |
| `Text` | `{ tone?: "default"\|"muted"="default"; children }` | ①③ | |
| `Figure` | `{ caption?: ReactNode; extra?: ReactNode; children }` | ① | children に SVG/Image。marker は子側 `useId()` |
| `Image` | `{ src: string; alt: string; caption?: ReactNode }` | ②(参照) | src/alt は内容でなく**アセットへのポインタ** |
| `Icon` | `{ name: string; size?: "sm"\|"md"\|"lg"="md"; label?: string; decorative?: boolean }` | ②③ | 供給元は **Lucide 既定**（MIT 厳密なら Heroicons/Tabler）。`name` を供給元にマップ。意味を持つ場合 `label`（→`aria-label`）、装飾は `decorative`（→`aria-hidden`）。サイズは `--icon-*` |

### DataDisplay（データ表示）— ②data props が主

| 部品 | props | 受け取り口 | 備考 |
| --- | --- | --- | --- |
| `Bullets` | `{ items: ReactNode[]; marker?: "disc"\|"none"="disc" }` | ②③ | 箇条書き。中身は配列 |
| `KeyPoints` | `{ items: ReactNode[] }` | ② | 番号丸つき（核心メッセージ） |
| `Table` | `{ columns: string[]; rows: Row[]; caption?: ReactNode }` | ② | 汎用表 |
| `CompareTable` | `{ columns: string[]; rows: Row[]; highlightColumn?: number }` | ②③ | 比較表。中身は JSX で書かない |
| `Tag` | `{ tone?: Tone; children }` | ①③ | `[P1]` 等の短ラベル |
| `Stat` | `{ label: ReactNode; value: ReactNode; unit?: ReactNode }` | ② | 数値ハイライト |

### Communication（伝達・通知）

| 部品 | props | 受け取り口 | 備考 |
| --- | --- | --- | --- |
| `Callout` | `{ tone?: Tone="note"; title?: ReactNode; children }` | ①③ | 本文は children、tone は enum |
| `Sources` | `{ title?: string="出典"; items: SourceItem[] }` | ②③ | **配列で受ける**（旧 `<DocSource>` ベタ書きを廃止） |
| `SourceIndex` | `{ groups: { category: string; entries: SourceItem[] }[]; title?: string }` | ② | runtime が全 part の sources を集約して渡す |
| `Badge` | `{ tone?: Tone; children }` | ①③ | |

### Navigation（ナビ）— ③state を runtime から受ける（stateless）

| 部品 | props | 受け取り口 | 備考 |
| --- | --- | --- | --- |
| `Toc` | `{ items: TocItem[]; activeId?: string; onJump?: (id:string)=>void }` | ②③ | `useTOC`/`useScrollSpy` の結果を受けるだけ |
| `PageNumber` | `{ current: number; total: number }` | ③ | deck |
| `ProgressDots` | `{ current: number; total: number; onJump?: (i:number)=>void }` | ③ | deck |

### Action（操作）

| 部品 | props | 受け取り口 | 備考 |
| --- | --- | --- | --- |
| `Link` | `{ href: string; external?: boolean; children }` | ①②(参照) | href はポインタ。装飾はグローバル |

> TextInput / Selection / Overlay は静的資料では N/A。9カテゴリの枠は維持（将来の画像ライトボックスで Overlay が出る程度）。

## 4. 代表的な interface（抜粋）

```ts
// Communication: Sources — 内容を配列で受ける（content-free の核）
export interface SourcesProps {
  title?: string;          // 既定 "出典"
  items: SourceItem[];     // ← 原稿.md frontmatter の sources[] がそのまま入る
}

// DataDisplay: CompareTable — 表の中身を JSX で書かせない
export interface CompareTableProps {
  columns: string[];           // ["観点","サーバーF","クライアントF"]
  rows: Row[];                 // [["データ取得","…","…"], …]
  highlightColumn?: number;    // 強調列（本構成の列など）
}

// Navigation: Toc — 状態は hook から props で受ける（stateless）
export interface TocProps {
  items: TocItem[];            // useTOC() の結果
  activeId?: string;           // useScrollSpy() の結果
  onJump?: (id: string) => void;
}

// Display: Heading — mode を知らない。サイズは [data-mode] CSS が担当
export interface HeadingProps {
  level: HeadingLevel;
  children: ReactNode;
}
// 出力: <h2 class="ds-heading" data-level={2}>…</h2>
// page.css:  [data-mode="page"] .ds-heading[data-level="2"]{ font-size: var(--text-page-h2) }
// deck.css:  [data-mode="deck"] .ds-heading[data-level="2"]{ font-size: var(--text-slide-h) }
```

## 5. 内容（content）はどこから来るか

```
原稿.md
  frontmatter:                         本文(markdown):
    title:        → Heading children     段落 → Text / 素のp
    bullets: []   → Bullets items=②
    columns/rows  → CompareTable ②
    sources: []   → Sources items=②  /  SourceIndex(runtime集約) ②
    tone/layout   → ③ variant
```

部品は上流（原稿）を一切 import しない。基盤が原稿を読み、テンプレが ①/②/③ の口に流し込む。**下り一方向**は [資料キット設計.md](資料キット設計.md) §データの流れの通り。

## 6. ガードレール（部品レビュー時の機械/人手チェック）

- 部品ファイル内に **文字列リテラルの内容**（日本語文・URL）が無いこと（content-free）。
- **px / 任意値 / 16進カラー**が無いこと（token 由来ユーティリティのみ）。
- **`mode === "deck"` 等の分岐**が無いこと（mode 非依存）。
- **`useState`/開閉ロジック**が無いこと（stateless。状態は hook へ）。
- DataDisplay/Communication が **children で内容を受けていない**こと（② data props で受ける）。

## 7. 未確定（実装時に詰める）

- `Columns` の分割指定を `ratio:number[]` にするか、`cols` テンプレ文字列にするか。
- `Table`/`CompareTable` のセル型 `Cell` をどこまで許すか（inline ReactNode を許すと content がにじむ恐れ→ 文字列＋限定マークのみに絞るか）。
- ~~`Icon` のアイコン供給元~~ → **確定: Lucide 既定**（ISC＝MIT 同等。厳密 MIT 要件なら Heroicons/Tabler）。`Icon` は供給元非依存で `name` をマップ。
- mode 差を `[data-mode]` CSS で当てる方式の最終確認（Heading 以外に Region 余白なども対象になるか）。
