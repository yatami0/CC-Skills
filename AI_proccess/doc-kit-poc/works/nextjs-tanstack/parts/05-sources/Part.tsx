import {
  Section,
  SourceIndex,
  useWorkContext,
  type PartComponent,
} from "../../../../design-system";

/**
 * 固有合成: 全 part から集約された出典（runtime が WorkContext で配る）を SourceIndex で描く。
 * 部品は DOM を走査せず、データ（sourceGroups）を受けて並べるだけ。
 */
const Part: PartComponent = ({ part }) => {
  const { id, num, meta, body } = part;
  const { sourceGroups } = useWorkContext();
  return (
    <Section id={id} num={num} heading={meta.heading as string}>
      {body}
      <SourceIndex groups={sourceGroups} />
    </Section>
  );
};

export default Part;
