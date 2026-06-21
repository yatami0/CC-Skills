import { createElement, type ComponentType, type ReactNode } from "react";
import yaml from "js-yaml";
import { MarkdownProse } from "./markdown";
import type {
  PartComponent,
  PartTemplate,
  RenderedPart,
} from "../templates/types";
import type { SourceGroup, SourceItem, TocItem } from "../components/types";

/* =========================================================================
   基盤（runtime）: 原稿.md（frontmatter + 本文）を parse・検証・解決する。
   ※ DOM は走査しない。データ（frontmatter）から下り一方向で組み立てる。
   ※ glob は works 側で行い、ここには「解決ロジック」だけを置く
     （design-system → works の参照を作らない＝一方向依存を守る）。
   ========================================================================= */

/** works から渡される素材（works が import.meta.glob で集める） */
export type WorkInput = {
  /** parts/<NN-slug>/原稿.md の「パス → 生テキスト」 */
  rawFiles: Record<string, string>;
  /** parts/<NN-slug>/{Diagram,Part}.tsx の「パス → モジュール」 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modules: Record<string, { default: ComponentType<any> }>;
  /** mode 別の Part template レジストリ（layout 名 → テンプレ） */
  templates: Record<string, PartTemplate>;
};

export type ResolvedPart = {
  id: string;
  num?: string;
  heading: string;
  sources: SourceItem[];
  node: ReactNode;
};

export type ResolvedWork = {
  parts: ResolvedPart[];
  tocItems: TocItem[];
  sourceGroups: SourceGroup[];
};

function parseFrontmatter(raw: string): {
  meta: Record<string, unknown>;
  body: string;
} {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = (yaml.load(m[1]) as Record<string, unknown>) ?? {};
  return { meta, body: m[2] };
}

/** ".../parts/03-dataflow/原稿.md" → { dir, id, num } */
function parseDir(path: string): { dir: string; id: string; num?: string } {
  const m = path.match(/([^/\\]+)[/\\][^/\\]+$/);
  const dir = m ? m[1] : path;
  const nn = dir.match(/^(\d+)-(.+)$/);
  return nn ? { dir, id: nn[2], num: nn[1] } : { dir, id: dir };
}

/** 全 part の sources を first-seen 順・重複排除でカテゴリ別に集約 */
function aggregateSources(parts: { sources: SourceItem[] }[]): SourceGroup[] {
  const seen = new Set<string>();
  const order: string[] = [];
  const map = new Map<string, SourceItem[]>();
  for (const p of parts) {
    for (const s of p.sources) {
      const key = s.href || `${s.tag}:${s.text}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const cat = s.category ?? "その他";
      if (!map.has(cat)) {
        map.set(cat, []);
        order.push(cat);
      }
      map.get(cat)!.push(s);
    }
  }
  return order.map((category) => ({ category, entries: map.get(category)! }));
}

/**
 * 原稿一式を解決して page を組み立てるための ResolvedWork を返す。
 * - dir名 "NN-slug" で昇順ソート
 * - dir に Part.tsx があれば最優先（固有合成）。無ければ templates[layout]
 * - template.schema(Zod) で frontmatter を検証（未知 layout / 不足キーで停止）
 * - figure: "./Diagram" を同 dir の Diagram.tsx に解決
 */
export function resolveWork({
  rawFiles,
  modules,
  templates,
}: WorkInput): ResolvedWork {
  const entries = Object.entries(rawFiles)
    .map(([path, raw]) => ({ path, ...parseDir(path), ...parseFrontmatter(raw) }))
    .sort((a, b) => a.dir.localeCompare(b.dir, undefined, { numeric: true }));

  const findModule = (dir: string, name: string) => {
    const hit = Object.entries(modules).find(([p]) =>
      new RegExp(`[/\\\\]${dir}[/\\\\]${name}\\.tsx$`).test(p),
    );
    return hit?.[1]?.default;
  };

  const parts: ResolvedPart[] = entries.map((e) => {
    const layout = e.meta.layout as string | undefined;
    if (!layout) throw new Error(`[doc-kit] ${e.path}: frontmatter に layout がありません`);
    const Template = templates[layout];
    if (!Template) {
      throw new Error(
        `[doc-kit] ${e.path}: 未知の layout "${layout}"（${Object.keys(templates).join(" / ")} のいずれか）`,
      );
    }
    // frontmatter を機械検証（不足/誤りは原稿のエラーとして停止）
    const parsed = Template.schema.safeParse(e.meta);
    if (!parsed.success) {
      throw new Error(
        `[doc-kit] ${e.path}: frontmatter 検証エラー\n${parsed.error.toString()}`,
      );
    }
    const meta = parsed.data as Record<string, unknown>;

    const Figure = e.meta.figure
      ? (findModule(e.dir, "Diagram") as ComponentType | undefined)
      : undefined;
    const Part = findModule(e.dir, "Part") as PartComponent | undefined;

    const body = <MarkdownProse source={e.body} />;
    const rendered: RenderedPart = { id: e.id, num: e.num, meta, body, Figure };

    const node = Part
      ? createElement(Part, { key: e.id, part: rendered })
      : createElement(
          Template,
          { key: e.id, ...meta, id: e.id, num: e.num, Figure },
          body,
        );

    return {
      id: e.id,
      num: e.num,
      heading: (meta.heading as string) ?? e.id,
      sources: (meta.sources as SourceItem[] | undefined) ?? [],
      node,
    };
  });

  const tocItems: TocItem[] = parts.map((p) => ({
    id: p.id,
    num: p.num,
    heading: p.heading,
  }));
  const sourceGroups = aggregateSources(parts);

  return { parts, tocItems, sourceGroups };
}
