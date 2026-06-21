import {
  CompareTable,
  Section,
  type PartComponent,
  type Row,
  type SourceItem,
} from "../../../../design-system";

/**
 * 固有合成: 汎用 Section に、frontmatter の比較表データを CompareTable として足す。
 * 内容（columns/rows）は原稿.md にあり、ここは部品を組むだけ（content-free）。
 */
const Part: PartComponent = ({ part }) => {
  const { id, num, meta, body } = part;
  return (
    <Section
      id={id}
      num={num}
      heading={meta.heading as string}
      sources={meta.sources as SourceItem[] | undefined}
    >
      {body}
      <CompareTable
        columns={meta.columns as string[]}
        rows={meta.rows as Row[]}
        highlightColumn={meta.highlightColumn as number | undefined}
      />
    </Section>
  );
};

export default Part;
