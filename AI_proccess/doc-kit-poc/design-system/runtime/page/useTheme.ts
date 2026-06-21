import { useEffect, useState } from "react";

const THEME_KEY = "doc-kit-theme";
export type Theme = "light" | "dark";

function readInitial(): Theme {
  if (typeof document !== "undefined" && document.documentElement.dataset.theme) {
    // index.html の blocking script が first paint 前に確定済み（FOUC 対策）
    return document.documentElement.dataset.theme as Theme;
  }
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* private mode 等で localStorage 不可でも続行 */
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * data-theme を <html> に付与し localStorage に永続化する。
 * 初期値は index.html の blocking script が決めた値を引き継ぐ（ちらつき無し）。
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readInitial);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      window.localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* 永続化できなくても表示は維持 */
    }
  }, [theme]);
  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  return { theme, toggle };
}
