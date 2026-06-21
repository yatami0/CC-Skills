import {
  Figure,
  Section,
  type PartComponent,
  type SourceItem,
} from "../../../../design-system";

/**
 * 固有合成: 汎用 Section に、frontmatter で参照された固有図（Diagram）を Figure として足す。
 * 図の中身は同フォルダ Diagram.tsx に閉じる（共通化しない＝決定4）。
 */
const Part: PartComponent = ({ part }) => {
  const { id, num, meta, body, Figure: Diagram } = part;
  return (
    <Section
      id={id}
      num={num}
      heading={meta.heading as string}
      sources={meta.sources as SourceItem[] | undefined}
    >
      {body}
      <Figure
        caption={meta.caption as string}
        extra="※ marker id は useId() で自動ユニーク化。同じ図を複数並べても衝突しない。"
      >
        {Diagram && <Diagram />}
      </Figure>
    </Section>
  );
};

export default Part;
