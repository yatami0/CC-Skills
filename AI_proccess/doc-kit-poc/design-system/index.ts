// =========================================================================
// design-system 公開API（バレル）。成果物（works）はここからだけ import する。
// =========================================================================

// ② Components（役割9カテゴリ）＋ 共有型
export * from "./components";

// ③ Templates（page）＋ 成果物が書く Work/Part 型
export { PageDoc, Section } from "./templates/page";
export { defineWork } from "./templates/types";
export type {
  DocConfig,
  Work,
  Part,
  FigureBlock,
  TableBlock,
  CalloutBlock,
} from "./templates/types";

// 基盤（runtime）
export { resolveWork } from "./runtime/resolveWork";
export type { ResolvedPart, ResolvedWork } from "./runtime/resolveWork";
export { useTheme } from "./runtime/page/useTheme";
export type { Theme } from "./runtime/page/useTheme";
export { useTOC, useScrollSpy } from "./runtime/page/useScrollSpy";
export { WorkDocView } from "./runtime/WorkDoc";
