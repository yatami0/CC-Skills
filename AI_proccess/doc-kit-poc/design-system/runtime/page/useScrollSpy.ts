import { useEffect, useMemo, useState } from "react";
import type { TocItem } from "../../components/types";
import type { ResolvedPart } from "../resolveWork";

/** parts メタから TOC items を作る（DOM 走査なし＝データ駆動）。 */
export function useTOC(parts: ResolvedPart[]): TocItem[] {
  return useMemo(
    () => parts.map((p) => ({ id: p.id, num: p.num, heading: p.heading })),
    [parts],
  );
}

/**
 * IntersectionObserver で「画面内の最上位 section」を現在地として返す。
 * 交差中の entry を Map で保持し、外れたら削除する
 * （旧実装の「isIntersecting の時しか更新せず解除しない」バグを修正）。
 */
export function useScrollSpy(ids: string[]): string | undefined {
  const [active, setActive] = useState<string>();
  const key = ids.join("|");
  useEffect(() => {
    if (!ids.length) return;
    const tops = new Map<string, number>(); // 交差中の id → 画面上の top
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) tops.set(e.target.id, e.boundingClientRect.top);
          else tops.delete(e.target.id);
        }
        let topId: string | undefined;
        let topVal = Infinity;
        for (const [id, top] of tops) {
          if (top < topVal) {
            topVal = top;
            topId = id;
          }
        }
        if (topId) setActive(topId);
      },
      { rootMargin: "0px 0px -60% 0px", threshold: [0, 1] },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // ids は key で安定化（中身が同じなら再観測しない）。意図的に key のみを依存に置く。
  }, [key]);
  return active;
}
