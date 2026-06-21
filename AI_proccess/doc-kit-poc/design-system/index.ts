// =========================================================================
// design-system 公開API（バレル）。成果物（works）はここからだけ import する。
// =========================================================================

// ② Components（役割9カテゴリ）＋ 共有型
export * from "./components";

// ③ Templates（page）＋ contract 型・schema
export { PageDoc, Section, pageTemplates } from "./templates/page";
export {
  sourceItemSchema,
  calloutSchema,
  sectionSchema,
} from "./templates/page/schema";
export type {
  DocConfig,
  RenderedPart,
  PartTemplate,
  PartComponent,
} from "./templates/types";

// 基盤（runtime）
export { resolveWork } from "./runtime/resolveWork";
export type {
  WorkInput,
  ResolvedPart,
  ResolvedWork,
} from "./runtime/resolveWork";
export { useTheme } from "./runtime/page/useTheme";
export type { Theme } from "./runtime/page/useTheme";
export { useTOC, useScrollSpy } from "./runtime/page/useScrollSpy";
export { WorkProvider, useWorkContext } from "./runtime/workContext";
