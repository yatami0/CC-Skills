import type { ComponentType, ReactNode } from "react";
import type { ZodTypeAny } from "zod";

/** doc.config.ts の形（成果物が mode と資料メタを宣言する） */
export type DocConfig = {
  mode: "page" | "deck";
  eyebrow?: string;
  title: string;
  lead?: string;
  footer?: string;
};

/** 原稿.md を基盤が parse・正規化した1 part */
export type RenderedPart = {
  id: string; // "dataflow"（dir名 "03-dataflow" 由来）
  num?: string; // "03"
  meta: Record<string, unknown>; // frontmatter（layout 等）
  body: ReactNode; // 本文 markdown を描画したもの
  Figure?: ComponentType; // meta.figure("./Diagram") を解決した固有コンポーネント
};

/** Part template はこの形。frontmatter 検証用に schema（Zod）を同梱。
 *  レジストリで混在させるため既定型引数は any（runtime が meta を流し込む）。 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PartTemplate<P = any> = ComponentType<P> & {
  schema: ZodTypeAny;
};

/** dir に置く固有合成。基盤が最優先で使う（RenderedPart を受け取る）。 */
export type PartComponent = ComponentType<{ part: RenderedPart }>;
