import { useMemo } from "react";
import { WorkDocView, resolveWork, useTheme } from "../../design-system";
import work from "./doc";

/** 資料は doc.tsx の 1 宣言にまとまっている。基盤で解決して page に描くだけ。 */
export function App() {
  const resolved = useMemo(() => resolveWork(work), []);
  const { theme, toggle } = useTheme();
  return (
    <WorkDocView
      work={resolved}
      config={work}
      theme={theme}
      onToggleTheme={toggle}
    />
  );
}
