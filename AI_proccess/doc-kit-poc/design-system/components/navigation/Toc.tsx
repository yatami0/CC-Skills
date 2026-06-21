import type { TocItem } from "../types";

/**
 * Navigation: 目次。状態は基盤（useTOC / useScrollSpy）が props で渡す（stateless）。
 * 部品は items を描き、activeId を現在地として示すだけ。
 */
export function Toc({
  items,
  activeId,
  onJump,
}: {
  items: TocItem[];
  activeId?: string;
  onJump?: (id: string) => void;
}) {
  if (!items.length) return null;
  return (
    <nav className="ds-toc" aria-label="目次">
      <div className="ds-toc-title">目次</div>
      <ol>
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              // 現在地は aria-current="location"（MDN/W3C: ページ内アンカーの現在位置）
              aria-current={activeId === item.id ? "location" : undefined}
              onClick={onJump ? () => onJump(item.id) : undefined}
            >
              {item.num ? `${item.num}. ` : ""}
              {item.heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
