import type { DocConfig } from "../../design-system";

/** この資料の宣言（mode と ヘッダ/フッタ）。内容は各 part の原稿.md にある。 */
export const docConfig: DocConfig = {
  mode: "page",
  eyebrow: "アーキテクチャ解説",
  title: "Next.js + TanStack Query のクライアント寄り構成 — 図解",
  lead: "基幹システムのマスタデータ管理サイトを、Next.js を BFF に徹させた「クライアント寄り構成」で作る際の全体像を図解で示す解説ページ（PoC 抜粋: §2〜§5）。",
  footer:
    "このページは旧 index.html の §2〜§5 を doc-kit（design-system: React + Tailwind v4 / 原稿は frontmatter + Markdown）で再構成した PoC です。",
};
