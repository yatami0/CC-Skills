import type { Meta, StoryObj } from "@storybook/react-vite";
import { Fragment } from "react";
import {
  WorkDocView,
  resolveWork,
  type ResolvedWork,
  type Work,
} from "../design-system";

/* =========================================================================
   作った資料を Storybook で見るための「仕組み」。
   works/<名前>/doc.tsx（default export = Work）を import.meta.glob で自動発見し、
   資料ピッカー / セクションピッカーとして並べる。
   → works/<名前>/doc.tsx を足すだけで Storybook に出る。
   ========================================================================= */

const docMods = import.meta.glob("./*/doc.tsx", { eager: true }) as Record<
  string,
  { default: Work }
>;

const workName = (p: string) => p.replace(/^\.\//, "").split("/")[0];

type Built = { name: string; config: Work; work: ResolvedWork };
const works: Built[] = Object.entries(docMods)
  .map(([p, mod]) => ({
    name: workName(p),
    config: mod.default,
    work: resolveWork(mod.default),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

const byName = Object.fromEntries(works.map((w) => [w.name, w]));
const themeOf = (ctx: { globals: { theme?: string } }): "light" | "dark" =>
  ctx.globals.theme === "dark" ? "dark" : "light";

const meta = {
  title: "Works/資料プレビュー",
  parameters: { layout: "fullscreen" },
} satisfies Meta;
export default meta;

/** 資料1本まるごと（mode=page）。ツールバーの Theme で light/dark 切替。 */
export const Document: StoryObj<{ work: string }> = {
  name: "資料全体",
  argTypes: {
    work: {
      control: "select",
      options: works.map((w) => w.name),
      description: "表示する資料",
    },
  },
  args: { work: works[0]?.name },
  render: (args, ctx) => {
    const w = byName[args.work] ?? works[0];
    return (
      <WorkDocView
        work={w.work}
        config={w.config}
        theme={themeOf(ctx)}
        onToggleTheme={() => {}}
      />
    );
  },
};

/** セクション単体（全資料のセクションを横断で選べる）。 */
const sectionOptions = works.flatMap((w) =>
  w.work.tocItems.map((t) => `${w.name}|${t.id}`),
);
const sectionLabels = Object.fromEntries(
  works.flatMap((w) =>
    w.work.tocItems.map((t) => [
      `${w.name}|${t.id}`,
      `${w.name} / ${t.num ? `${t.num} ` : ""}${t.heading}`,
    ]),
  ),
);

export const Section: StoryObj<{ section: string }> = {
  name: "セクション単体",
  parameters: { layout: "padded" },
  argTypes: {
    section: {
      control: "select",
      options: sectionOptions,
      labels: sectionLabels,
      description: "表示するセクション",
    },
  },
  args: { section: sectionOptions[0] },
  render: (args) => {
    const [name, id] = String(args.section).split("|");
    const w = byName[name] ?? works[0];
    const part = w.work.parts.find((p) => p.id === id) ?? w.work.parts[0];
    // 出典の自動集約は resolveWork が part.node に織り込み済み（context 不要）。
    return <Fragment key={part.id}>{part.node}</Fragment>;
  },
};
