import type { SourceGroup } from "../types";

/**
 * Communication: 出典一覧。runtime が全 part の sources を集約して groups で渡す。
 * 部品は DOM を走査しない（データを受けて描くだけ）。
 */
export function SourceIndex({
  groups,
  title = "引用ソース一覧",
}: {
  groups: SourceGroup[];
  title?: string;
}) {
  if (!groups.length) return null;
  return (
    <div className="ds-source-index">
      {title && <p className="ds-sources-title">{title}（自動生成）</p>}
      {groups.map((group) => (
        <div className="ds-src-group" key={group.category}>
          <h3 className="ds-src-group-title">{group.category}</h3>
          <ul>
            {group.entries.map((entry) => (
              <li key={entry.href || entry.tag}>
                <span className="ds-source-tag">[{entry.tag}]</span>
                <a href={entry.href} target="_blank" rel="noopener noreferrer">
                  {entry.text}
                </a>
                {entry.note && <span className="ds-source-note">{entry.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
