import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// 単一 Vite プロジェクト。design-system/ と works/ をフォルダ分離し、
// 境界（works → design-system の一方向依存）は ESLint で強制する。
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
