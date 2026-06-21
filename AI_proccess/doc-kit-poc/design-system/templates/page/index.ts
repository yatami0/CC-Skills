import { Section } from "./Section";
import type { PartTemplate } from "../types";

export { PageDoc } from "./PageDoc";
export { Section } from "./Section";
export * from "./schema";

/** page モードの Part template レジストリ（layout 名 → テンプレ）。 */
export const pageTemplates = {
  Section,
} satisfies Record<string, PartTemplate>;
