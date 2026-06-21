import type { ReactNode } from "react";
import { Heading } from "../../components/display/Heading";
import { Figure } from "../../components/display/Figure";
import { CompareTable } from "../../components/datadisplay/CompareTable";
import { KeyPoints } from "../../components/datadisplay/KeyPoints";
import { Bullets } from "../../components/datadisplay/Bullets";
import { Callout } from "../../components/communication/Callout";
import { Sources } from "../../components/communication/Sources";
import { SourceIndex } from "../../components/communication/SourceIndex";
import type { SourceGroup, SourceItem } from "../../components/types";
import type { CalloutBlock, FigureBlock, TableBlock } from "../types";

/**
 * Section（page）: 番号付き見出し ＋ 本文 ＋（任意の構造ブロック）＋ 出典。
 * content-free のまま「ブロックの有無」で描き分ける（中身は props で受ける）。
 * 本文 prose は runtime が markdown を描画して body に渡す（stateless / 内容を持たない）。
 * id は TOC アンカー / scroll-spy の観測対象（runtime が付与）。
 */
type SectionProps = {
  id: string;
  num?: string;
  heading: string;
  body?: ReactNode;
  figure?: FigureBlock;
  table?: TableBlock;
  keyPointsHeading?: ReactNode;
  keyPoints?: ReactNode[];
  callout?: CalloutBlock;
  /** sourceIndex part 用: runtime が集約した出典グループ（あれば一覧を描く） */
  sourceGroups?: SourceGroup[];
  sources?: SourceItem[];
};

export function Section({
  id,
  num,
  heading,
  body,
  figure,
  table,
  keyPointsHeading,
  keyPoints,
  callout,
  sourceGroups,
  sources,
}: SectionProps) {
  return (
    <section className="ds-section" id={id} data-doc-section>
      <Heading level={2}>
        <span className="ds-section-heading">
          {num && <span className="ds-section-num">{num}</span>}
          {heading}
        </span>
      </Heading>
      {body}
      {figure && (
        <Figure caption={figure.caption} extra={figure.extra}>
          {figure.node}
        </Figure>
      )}
      {table && (
        <CompareTable
          columns={table.columns}
          rows={table.rows}
          highlightColumn={table.highlightColumn}
        />
      )}
      {keyPointsHeading != null && <Heading level={3}>{keyPointsHeading}</Heading>}
      {keyPoints && <KeyPoints items={keyPoints} />}
      {callout && (
        <Callout tone={callout.tone} title={callout.title}>
          <Bullets items={callout.items} />
        </Callout>
      )}
      {sourceGroups && <SourceIndex groups={sourceGroups} />}
      {sources && sources.length > 0 && <Sources items={sources} />}
    </section>
  );
}
