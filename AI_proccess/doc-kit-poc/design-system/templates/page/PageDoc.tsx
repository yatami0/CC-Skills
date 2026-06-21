import type { ReactNode } from "react";
import { Eyebrow } from "../../components/display/Eyebrow";
import { Text } from "../../components/display/Text";
import { Toc } from "../../components/navigation/Toc";
import type { TocItem } from "../../components/types";

type PageDocProps = {
  // doc.config 由来のヘッダ/フッタ slot
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  footer?: ReactNode;
  // runtime（useTOC / useScrollSpy）から受ける TOC 状態（stateless）
  tocItems: TocItem[];
  activeId?: string;
  onJump?: (id: string) => void;
  // runtime（useTheme）から受けるテーマ状態（stateless）
  theme: "light" | "dark";
  onToggleTheme: () => void;
  // parts（Section 群）
  children: ReactNode;
};

/**
 * Container template（page）: ヘッダ + 2カラム（本文 / Toc）+ フッタ。
 * 状態は持たず、runtime から props で受けて並べるだけ（mode=page を data 属性で宣言）。
 */
export function PageDoc({
  eyebrow,
  title,
  lead,
  footer,
  tocItems,
  activeId,
  onJump,
  theme,
  onToggleTheme,
  children,
}: PageDocProps) {
  return (
    <div className="ds-page-wrap" data-mode="page">
      <button
        type="button"
        className="ds-theme-toggle ds-no-print"
        onClick={onToggleTheme}
        aria-label="テーマ切替"
        aria-pressed={theme === "dark"}
      >
        {theme === "dark" ? "☀" : "☾"}
      </button>

      <header className="ds-page-header">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 className="ds-page-title">{title}</h1>
        {lead && (
          <div className="ds-page-lead">
            <Text tone="muted">{lead}</Text>
          </div>
        )}
      </header>

      <div className="ds-page-layout">
        <main className="ds-page-prose ds-prose">{children}</main>
        <aside className="ds-no-print">
          <Toc items={tocItems} activeId={activeId} onJump={onJump} />
        </aside>
      </div>

      {footer && <footer className="ds-page-footer">{footer}</footer>}
    </div>
  );
}
