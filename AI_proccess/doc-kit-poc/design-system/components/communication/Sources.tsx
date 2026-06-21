import type { SourceItem } from "../types";

/**
 * Communication: 出典枠。**配列で受ける**（旧 <DocSource>本文</DocSource> ベタ書きを廃止）。
 * 内容（tag/href/text）は原稿.md frontmatter の sources[] がそのまま入る。
 */
export function Sources({
  title = "出典",
  items,
}: {
  title?: string;
  items: SourceItem[];
}) {
  if (!items.length) return null;
  return (
    <div className="ds-sources">
      <div className="ds-sources-title">{title}</div>
      <ul>
        {items.map((s) => (
          <li key={s.href || s.tag}>
            <span className="ds-source-tag">[{s.tag}]</span>
            <a href={s.href} target="_blank" rel="noopener noreferrer">
              {s.text}
            </a>
            {s.note && <span className="ds-source-note">{s.note}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
