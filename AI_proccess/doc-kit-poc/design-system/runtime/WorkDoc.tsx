import { Fragment } from "react";
import { PageDoc } from "../templates/page/PageDoc";
import { useScrollSpy } from "./page/useScrollSpy";
import type { DocConfig } from "../templates/types";
import type { ResolvedWork } from "./resolveWork";

/**
 * 解決済みの資料（ResolvedWork）を page テンプレに流し込んで描く共有ビュー。
 * テーマは props で受ける（stateless）ので、実アプリ（useTheme）でも
 * Storybook（ツールバーの globals）でも同じこの1つで描ける。
 * 出典の自動集約は resolveWork が解決済み（各 part の node に織り込み済み）。
 */
export function WorkDocView({
  work,
  config,
  theme,
  onToggleTheme,
}: {
  work: ResolvedWork;
  config: DocConfig;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}) {
  const activeId = useScrollSpy(work.tocItems.map((t) => t.id));
  return (
    <PageDoc
      eyebrow={config.eyebrow}
      title={config.title}
      lead={config.lead}
      footer={config.footer}
      tocItems={work.tocItems}
      activeId={activeId}
      theme={theme}
      onToggleTheme={onToggleTheme}
    >
      {work.parts.map((p) => (
        <Fragment key={p.id}>{p.node}</Fragment>
      ))}
    </PageDoc>
  );
}
