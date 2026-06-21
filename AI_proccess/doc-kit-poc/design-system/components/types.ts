import type { ReactNode } from "react";

/** Callout / Badge / Tag の tone（境界のある enum → token） */
export type Tone = "note" | "info" | "warn";

/** 余白の用途名（--spacing-* に対応） */
export type Space = "block" | "stack" | "region";

export type Align = "start" | "center" | "end";

export type HeadingLevel = 1 | 2 | 3;

/** 出典1件（原稿.md frontmatter の sources[] がこの形） */
export type SourceItem = {
  tag: string; // "D1"
  href: string; // 参照URL（内容ではなくポインタ）
  text: string; // 表示名
  category?: string; // 集約のキー（既定 "その他"）
};

/** TOC1件（runtime の useTOC が生成して Toc に渡す） */
export type TocItem = { id: string; num?: string; heading: string };

/** 出典のカテゴリ別グループ（runtime が全 part から集約） */
export type SourceGroup = { category: string; entries: SourceItem[] };

/** 表のセル（文字列 or inline ReactNode）と行 */
export type Cell = ReactNode;
export type Row = Cell[];
