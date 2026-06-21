import { z } from "zod";

/** 出典1件（frontmatter sources[] の検証） */
export const sourceItemSchema = z.object({
  tag: z.string(),
  href: z.string(),
  text: z.string(),
  category: z.string().optional(),
});

/** callout ブロック（Part.tsx が読む固有データ） */
export const calloutSchema = z.object({
  tone: z.enum(["note", "info", "warn"]).optional(),
  title: z.string().optional(),
  items: z.array(z.string()),
});

/**
 * Section（page）の frontmatter スキーマ。
 * 既定テンプレは heading / body / sources を使う。
 * 比較表・図・callout は Part.tsx が読む固有ブロック（任意）。
 */
export const sectionSchema = z.object({
  layout: z.literal("Section"),
  heading: z.string(),
  sources: z.array(sourceItemSchema).optional(),
  // --- 固有ブロック（Part.tsx 用・任意） ---
  figure: z.string().optional(), // "./Diagram"
  caption: z.string().optional(),
  columns: z.array(z.string()).optional(),
  rows: z.array(z.array(z.string())).optional(),
  highlightColumn: z.number().optional(),
  callout: calloutSchema.optional(),
});
