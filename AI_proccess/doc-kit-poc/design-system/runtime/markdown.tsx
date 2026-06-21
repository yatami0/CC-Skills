import Markdown from "react-markdown";
import { Text } from "../components/display/Text";
import { Link } from "../components/action/Link";

/**
 * 本文 prose（原稿.md の Markdown）を design-system 部品にマップして描画する。
 * 構造データ（表・出典）は本文に書かず frontmatter から渡る（ここは段落・強調・リンクのみ）。
 */
export function MarkdownProse({ source }: { source: string }) {
  if (!source.trim()) return null;
  return (
    <Markdown
      components={{
        p: ({ children }) => <Text>{children}</Text>,
        a: ({ href, children }) => (
          <Link href={href ?? "#"} external={/^https?:/i.test(href ?? "")}>
            {children}
          </Link>
        ),
      }}
    >
      {source}
    </Markdown>
  );
}
