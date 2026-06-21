import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// design-system の token / 構造スタイル（公開順序: tokens → components → diagram）
import "../design-system/tokens/tokens.css";
import "../design-system/components/components.css";
import "../design-system/components/diagram.css";

// 成果物（works）。design-system の公開 API だけに依存する。
import { App } from "../works/nextjs-tanstack/App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
