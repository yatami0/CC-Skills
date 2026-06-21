import { useMemo, type ComponentType } from "react";
import {
  PageDoc,
  WorkProvider,
  pageTemplates,
  resolveWork,
  useScrollSpy,
  useTOC,
  useTheme,
} from "../../design-system";
import { docConfig } from "./doc.config";

// 自分の parts だけを集める（glob は works 側に置く＝design-system は内容を知らない）。
const rawFiles = import.meta.glob("./parts/*/原稿.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const modules = import.meta.glob("./parts/*/*.tsx", { eager: true }) as Record<
  string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { default: ComponentType<any> }
>;

export function App() {
  const work = useMemo(
    () => resolveWork({ rawFiles, modules, templates: pageTemplates }),
    [],
  );
  const { theme, toggle } = useTheme();
  const tocItems = useTOC(work.parts);
  const activeId = useScrollSpy(tocItems.map((t) => t.id));

  return (
    <WorkProvider value={{ sourceGroups: work.sourceGroups }}>
      <PageDoc
        eyebrow={docConfig.eyebrow}
        title={docConfig.title}
        lead={docConfig.lead}
        footer={docConfig.footer}
        tocItems={tocItems}
        activeId={activeId}
        theme={theme}
        onToggleTheme={toggle}
      >
        {work.parts.map((p) => p.node)}
      </PageDoc>
    </WorkProvider>
  );
}
