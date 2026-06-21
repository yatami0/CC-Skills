import type { Meta, StoryObj } from "@storybook/react-vite";
import { Callout } from "./Callout";
import { Bullets } from "../datadisplay/Bullets";

const meta = {
  title: "Components/Communication/Callout",
  component: Callout,
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "inline-radio", options: ["note", "info", "warn"] },
  },
  args: {
    tone: "info",
    title: "二重ガードレール",
    children: "本文は children、tone は enum（アクセント色は token）。",
  },
} satisfies Meta<typeof Callout>;
export default meta;

type Story = StoryObj<typeof meta>;

export const Note: Story = { args: { tone: "note" } };
export const Info: Story = {};
export const Warn: Story = { args: { tone: "warn" } };

export const WithBullets: Story = {
  args: { tone: "info", title: "二重ガードレール" },
  render: (args) => (
    <Callout {...args}>
      <Bullets
        items={[
          "ソフトな縛り: AGENTS.md / CLAUDE.md",
          "ハードな縛り: 型チェック・lint・CI",
        ]}
      />
    </Callout>
  ),
};
