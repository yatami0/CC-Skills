import type { ReactNode } from "react";

/**
 * Display: 図カード（SVG/画像 ＋ キャプション）。
 * children に図の実体（固有 Diagram など）を受ける。marker の一意化は子側 useId。
 */
export function Figure({
  caption,
  extra,
  children,
}: {
  caption?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
}) {
  return (
    <figure className="ds-figure">
      <div className="ds-figure-holder">{children}</div>
      {caption && (
        <figcaption className="ds-figure-caption">
          {caption}
          {extra && <span className="ds-figure-extra">{extra}</span>}
        </figcaption>
      )}
    </figure>
  );
}
