import type { ReactNode } from "react";
import { MarkdownProse } from "./markdown";
import { Section } from "../templates/page/Section";
import type { Part, Work } from "../templates/types";
import type { SourceGroup, SourceItem, TocItem } from "../components/types";

/* =========================================================================
   基盤（runtime）: doc.tsx が宣言した Work（メタ＋part配列）を解決する。
   ※ DOM もファイルも走査しない。配列を上から回し、body(markdown) を描画して
     page テンプレ（Section）に流す＝下り一方向。出典はページ内データから自動集約。
   ========================================================================= */

export type ResolvedPart = {
  id: string;
  num?: string;
  heading: string;
  sources: SourceItem[];
  node: ReactNode;
};

export type ResolvedWork = {
  parts: ResolvedPart[];
  tocItems: TocItem[];
  sourceGroups: SourceGroup[];
};

/** 全 part の sources を first-seen 順・重複排除でカテゴリ別に集約 */
function aggregateSources(parts: Part[]): SourceGroup[] {
  const seen = new Set<string>();
  const order: string[] = [];
  const map = new Map<string, SourceItem[]>();
  for (const p of parts) {
    for (const s of p.sources ?? []) {
      const key = s.href || `${s.tag}:${s.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const cat = s.category ?? "その他";
      if (!map.has(cat)) {
        map.set(cat, []);
        order.push(cat);
      }
      map.get(cat)!.push(s);
    }
  }
  return order.map((category) => ({ category, entries: map.get(category)! }));
}

/**
 * Work を解決して page を組み立てる ResolvedWork を返す。
 * - parts は配列順（num は表示ラベル）。
 * - 既定: body(markdown) ＋ 構造ブロックを Section に流し込む（React 不要）。
 * - part.node があれば最優先で丸ごと差し替え（固有 JSX のエスケープハッチ）。
 * - part.sourceIndex なら集約済み sourceGroups を Section に渡し一覧化。
 */
export function resolveWork(work: Work): ResolvedWork {
  const sourceGroups = aggregateSources(work.parts);

  const parts: ResolvedPart[] = work.parts.map((p) => {
    const node = p.node ?? (
      <Section
        id={p.id}
        num={p.num}
        heading={p.heading}
        body={p.body ? <MarkdownProse source={p.body} /> : undefined}
        figure={p.figure}
        table={p.table}
        keyPointsHeading={p.keyPointsHeading}
        keyPoints={p.keyPoints}
        callout={p.callout}
        sourceGroups={p.sourceIndex ? sourceGroups : undefined}
        sources={p.sources}
      />
    );
    return {
      id: p.id,
      num: p.num,
      heading: p.heading,
      sources: p.sources ?? [],
      node,
    };
  });

  const tocItems: TocItem[] = parts.map((p) => ({
    id: p.id,
    num: p.num,
    heading: p.heading,
  }));

  return { parts, tocItems, sourceGroups };
}
