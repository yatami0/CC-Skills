import type { Meta, StoryObj } from "@storybook/react-vite";
import { Region } from "./Region";
import { Heading } from "../display/Heading";
import { Text } from "../display/Text";
import { Sources } from "../communication/Sources";

const meta = {
  title: "Components/Layout/Region",
  component: Region,
  tags: ["autodocs"],
  argTypes: { children: { control: false } },
  args: {
    // compound: Region.Header / Body / Footer をスロットとして組む
    children: (
      <>
        <Region.Header>
          <Heading level={2}>セクション見出し</Heading>
        </Region.Header>
        <Region.Body>
          <Text>本文スロット。内容も page/deck の別も知らない（container-free）。</Text>
        </Region.Body>
        <Region.Footer>
          <Sources
            items={[
              { tag: "S1", href: "https://example.com", text: "サンプル出典" },
            ]}
          />
        </Region.Footer>
      </>
    ),
  },
} satisfies Meta<typeof Region>;
export default meta;

type Story = StoryObj<typeof meta>;

export const WithSlots: Story = {};
