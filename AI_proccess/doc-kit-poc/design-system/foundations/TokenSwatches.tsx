/**
 * Foundations のトークン可視化ヘルパー（カタログ専用）。
 * semantic / 寸法 / タイポを var(--token) で実描画する。
 */
import type { CSSProperties } from "react";

const cols: CSSProperties = {
  gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
};

const COLORS = [
  "--color-bg",
  "--color-surface",
  "--color-fg",
  "--color-fg-muted",
  "--color-border",
  "--color-accent",
  "--color-accent-contrast",
  "--color-quote",
  "--color-warn",
];

export function ColorSwatches() {
  return (
    <div className="grid gap-stack" style={cols}>
      {COLORS.map((c) => (
        <div
          key={c}
          className="overflow-hidden rounded-card border border-border text-page-small"
        >
          <div className="h-region" style={{ background: `var(${c})` }} />
          <code className="block p-block">{c}</code>
        </div>
      ))}
    </div>
  );
}

const SPACES = [
  "--spacing-block",
  "--spacing-stack",
  "--spacing-region",
  "--spacing-section",
];

export function SpacingScale() {
  return (
    <div className="flex flex-col gap-block">
      {SPACES.map((s) => (
        <div key={s} className="flex items-center gap-stack">
          <code className="text-page-small" style={{ width: "11rem" }}>
            {s}
          </code>
          <div
            className="bg-accent rounded-sm"
            style={{ height: "0.75rem", width: `var(${s})` }}
          />
        </div>
      ))}
    </div>
  );
}

const TEXTS: [string, string][] = [
  ["--text-page-h1", "Aa 見出し1 / Heading 1"],
  ["--text-page-h2", "Aa 見出し2 / Heading 2"],
  ["--text-page-h3", "Aa 見出し3 / Heading 3"],
  ["--text-page-body", "Aa 本文 / Body text"],
  ["--text-page-small", "Aa 小 / Small"],
  ["--text-page-eyebrow", "Aa Eyebrow"],
];

export function TypeScale() {
  return (
    <div className="flex flex-col gap-stack">
      {TEXTS.map(([t, label]) => (
        <div key={t} className="flex items-baseline gap-stack">
          <span style={{ fontSize: `var(${t})` }}>{label}</span>
          <code className="text-page-small text-fg-muted">{t}</code>
        </div>
      ))}
    </div>
  );
}

const RADII = ["--radius-card", "--radius-sm"];

export function RadiusScale() {
  return (
    <div className="flex gap-region">
      {RADII.map((r) => (
        <div key={r} className="flex flex-col items-center gap-block">
          <div
            className="bg-surface border border-border"
            style={{ width: "5rem", height: "5rem", borderRadius: `var(${r})` }}
          />
          <code className="text-page-small">{r}</code>
        </div>
      ))}
    </div>
  );
}
