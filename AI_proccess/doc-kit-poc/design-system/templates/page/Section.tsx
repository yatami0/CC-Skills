import type { ReactNode } from "react";
import { Heading } from "../../components/display/Heading";
import { Sources } from "../../components/communication/Sources";
import type { SourceItem } from "../../components/types";
import type { PartTemplate } from "../types";
import { sectionSchema } from "./schema";

type SectionSlots = {
  id: string;
  num?: string;
  heading: string;
  sources?: SourceItem[];
  children?: ReactNode; // 本文 prose ＋（Part.tsx が足す）固有ブロック
};

/**
 * Part template（page）: 番号付き見出し + 本文 + 出典。
 * 比較表・図・callout が要る section は Part.tsx で同じ Section を組み、
 * children に固有ブロックを足す（テンプレは汎用のまま＝content-free）。
 * id は TOC アンカー / scroll-spy の観測対象（runtime が付与）。
 */
export const Section: PartTemplate<SectionSlots> = ({
  id,
  num,
  heading,
  sources,
  children,
}) => (
  <section className="ds-section" id={id} data-doc-section>
    <Heading level={2}>
      <span className="ds-section-heading">
        {num && <span className="ds-section-num">{num}</span>}
        {heading}
      </span>
    </Heading>
    {children}
    {sources && sources.length > 0 && <Sources items={sources} />}
  </section>
);

Section.schema = sectionSchema;
