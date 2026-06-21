import {
  Bullets,
  Callout,
  Section,
  type PartComponent,
  type SourceItem,
  type Tone,
} from "../../../../design-system";

type CalloutData = { tone?: Tone; title?: string; items: string[] };

/** 固有合成: 汎用 Section に、frontmatter の callout データを Callout＋Bullets として足す。 */
const Part: PartComponent = ({ part }) => {
  const { id, num, meta, body } = part;
  const c = meta.callout as CalloutData | undefined;
  return (
    <Section
      id={id}
      num={num}
      heading={meta.heading as string}
      sources={meta.sources as SourceItem[] | undefined}
    >
      {body}
      {c && (
        <Callout tone={c.tone} title={c.title}>
          <Bullets items={c.items} />
        </Callout>
      )}
    </Section>
  );
};

export default Part;
