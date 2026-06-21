import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const url = process.env.URL || "http://localhost:5173/";
const out = "dist-shots";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1280, height: 980 },
  deviceScaleFactor: 1.5,
});
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForSelector(".ds-page-wrap");
await page.waitForTimeout(300);

// light: 上部ビューポート（ヘッダ＋TOC＋§02 比較表）／図クローズアップ
await page.screenshot({ path: `${out}/top-light.png` });
const fig = await page.$(".ds-figure");
if (fig) await fig.screenshot({ path: `${out}/diagram-light.png` });

// dark: トグルをクリック
await page.click(".ds-theme-toggle");
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/top-dark.png` });
if (fig) await fig.screenshot({ path: `${out}/diagram-dark.png` });

// 出典一覧（自動集約）まで全景
await page.screenshot({ path: `${out}/full-dark.png`, fullPage: true });

await browser.close();
console.log("screenshots written to", out);
