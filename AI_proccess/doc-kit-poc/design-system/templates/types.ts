import type { ReactNode } from "react";
import type { Row, SourceItem, Tone } from "../components/types";

/** doc.tsx の資料メタ（成果物が mode と資料ヘッダ/フッタを宣言する） */
export type DocConfig = {
  mode: "page" | "deck";
  eyebrow?: string;
  title: string;
  lead?: string;
  footer?: string;
};

/**
 * 図ブロック。画像の実体（<Image src={import …}/>）を node にインラインで持たせる。
 * → 固有 Diagram.tsx / figure:"./Diagram" 文字列解決は不要になり、画像も doc.tsx に同居する。
 */
export type FigureBlock = { caption?: ReactNode; extra?: ReactNode; node: ReactNode };

/** 比較表 / key-value 表ブロック（中身は columns / rows のデータで受ける） */
export type TableBlock = { columns: string[]; rows: Row[]; highlightColumn?: number };

/** 注意書きブロック（tone は enum、本文は items 配列） */
export type CalloutBlock = { tone?: Tone; title?: ReactNode; items: ReactNode[] };

/**
 * 1 part の宣言。works が doc.tsx の配列に1要素＝1セクションとして書く。
 * 内容はここに閉じ、design-system は「ブロックの型」だけを知る（content-free）。
 * 通常は body＋構造ブロックを並べるだけで React を書かない。特殊な見た目が要るときだけ
 * `node` に自由な JSX を入れて丸ごと差し替える（その場合 body/ブロックは無視）。
 */
export type Part = {
  /** TOC アンカー / scroll-spy の観測 id（例: "dataflow"） */
  id: string;
  /** 表示用の章番号ラベル（例: "03"）。並び順は配列順で決まる */
  num?: string;
  heading: string;
  /** 本文 prose。markdown 文字列で書く（MarkdownProse で描画） */
  body?: string;
  sources?: SourceItem[];
  // --- 任意の構造ブロック（有無で描き分け。順序は body → 以下の順で固定） ---
  figure?: FigureBlock;
  table?: TableBlock;
  keyPointsHeading?: ReactNode;
  keyPoints?: ReactNode[];
  callout?: CalloutBlock;
  /** true: 全 part の sources をカテゴリ別に自動集約して並べる（引用一覧 part 用） */
  sourceIndex?: boolean;
  /** エスケープハッチ: section 丸ごとを自由 JSX に差し替える */
  node?: ReactNode;
};

/** 資料1本の全内容（メタ＋ part 配列）。works/<name>/doc.tsx が default export する。 */
export type Work = DocConfig & { parts: Part[] };

/** doc.tsx で型補完を効かせるための identity ヘルパ。 */
export function defineWork(work: Work): Work {
  return work;
}
