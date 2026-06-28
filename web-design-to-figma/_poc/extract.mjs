// PoC: web-design-to-figma F2 Extract
// 実レンダリング(JS 実行後)の DOM を歩き figma-plan.json を吐く。
// 入力: HTML ファイルパス / 出力: figma-plan.json
// ブラウザは puppeteer(同梱 chromium)→ 失敗時 playwright-core(system chrome)の順に試す。

import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { resolve } from "node:path";

const inPath = process.argv[2];
const outPath = process.argv[3] || "figma-plan.json";
const VIEWPORT_W = Number(process.argv[4] || 1440);
if (!inPath) { console.error("usage: node extract.mjs <html> [out.json] [width]"); process.exit(1); }
const fileUrl = pathToFileURL(resolve(inPath)).href;

// ---- ページ内で実行する抽出関数(文字列化して evaluate に渡す) ----
function pageExtract(viewportW) {
  // --- :root トークン収集 ---
  const rootStyle = getComputedStyle(document.documentElement);
  // 宣言された custom prop 名を styleSheets から拾う
  const names = new Set();
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    for (const r of rules) {
      if (r.selectorText && /:root/.test(r.selectorText) && r.style) {
        for (const p of r.style) if (p.startsWith("--")) names.add(p);
      }
    }
  }
  const rawTokens = {};
  for (const n of names) rawTokens[n] = rootStyle.getPropertyValue(n).trim();

  // var(--x) 参照を解決(1パス・浅い連鎖を数回)
  const resolve1 = (v) => v.replace(/var\((--[\w-]+)\s*(?:,[^)]*)?\)/g, (_, ref) => rawTokens[ref] ?? _);
  const tokens = {};
  for (const [k, v] of Object.entries(rawTokens)) {
    let s = v; for (let i = 0; i < 4 && /var\(/.test(s); i++) s = resolve1(s);
    tokens[k] = s.trim();
  }

  // --- 色の正規化と逆引きマップ ---
  const norm = (c) => {
    if (!c) return null;
    const s = c.trim().toLowerCase();
    if (s === "transparent") return "rgba(0,0,0,0)";
    let m = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/);
    if (m) {
      let h = m[1]; if (h.length === 3) h = h.split("").map((x) => x + x).join("");
      const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
      return `rgba(${r},${g},${b},1)`;
    }
    m = s.match(/^rgba?\(([^)]+)\)$/);
    if (m) {
      const p = m[1].split(",").map((x) => x.trim());
      const r = +p[0], g = +p[1], b = +p[2], a = p[3] === undefined ? 1 : +p[3];
      return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
    }
    return s; // 解析不能はそのまま
  };
  const colorToToken = {};
  for (const [k, v] of Object.entries(tokens)) {
    if (/color|fill|bg|surface|label|separator|accent|brand|navy|sky|success|warning|danger|gray|scrim|sidebar|thead|row|scroll/.test(k)) {
      const nv = norm(v); if (nv && nv !== "rgba(0,0,0,0)") (colorToToken[nv] ??= k);
    }
  }
  const refColor = (cssColor) => {
    const nv = norm(cssColor);
    if (!nv || nv === "rgba(0,0,0,0)") return { ref: null, value: nv };
    return { ref: colorToToken[nv] || null, value: nv };
  };

  // --- DOM ウォーク ---
  const SKIP_TAGS = new Set(["SCRIPT","STYLE","NOSCRIPT","TEMPLATE","HEAD"]);
  let nodeCount = 0;
  const notesGlobal = [];

  function directText(el) {
    let t = "";
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.textContent;
    return t.replace(/\s+/g, " ").trim();
  }
  function isHidden(el, cs, rect) {
    if (cs.display === "none" || cs.visibility === "hidden") return true;
    if (el.hasAttribute && el.hasAttribute("hidden")) return true;
    if (rect.width < 0.5 || rect.height < 0.5) return true;
    // 画面外(off-canvas のシート等)は対象外にし note 化
    if (rect.right <= 0 || rect.bottom <= 0 || rect.left >= viewportW + 4000) return true;
    return false;
  }

  function walk(el, depth) {
    if (SKIP_TAGS.has(el.tagName)) return null;
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    if (isHidden(el, cs, rect)) return null;
    nodeCount++;

    const tag = el.tagName.toLowerCase();
    const geometry = { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) };

    // role 判定
    if (tag === "svg") {
      return { role: "vector", tag, geometry, note: "SVG はベクタとして要 download_assets / 代替矩形" };
    }
    if (tag === "img") {
      const f = refColor(cs.backgroundColor);
      return { role: "image", tag, geometry, src: el.getAttribute("src") };
    }

    const elementChildren = [...el.children].filter((c) => !SKIP_TAGS.has(c.tagName));
    const dtext = directText(el);

    // 葉テキスト: 要素子が無く直接テキストを持つ
    if (elementChildren.length === 0 && dtext) {
      const col = refColor(cs.color);
      return {
        role: "text", tag, geometry,
        text: {
          chars: dtext,
          fontFamily: cs.fontFamily.split(",")[0].replace(/["']/g, "").trim(),
          fontFamilyFull: cs.fontFamily,
          size: parseFloat(cs.fontSize),
          weight: cs.fontWeight,
          lineHeight: cs.lineHeight === "normal" ? null : parseFloat(cs.lineHeight),
          colorRef: col.ref, colorValue: col.value,
          align: cs.textAlign
        }
      };
    }

    // フレーム
    const fill = refColor(cs.backgroundColor);
    const isFlex = cs.display === "flex" || cs.display === "inline-flex";
    const isGrid = cs.display === "grid";
    const layout = isFlex ? {
      mode: "flex",
      dir: (cs.flexDirection.startsWith("row")) ? "HORIZONTAL" : "VERTICAL",
      gap: parseFloat(cs.gap) || parseFloat(cs.columnGap) || 0,
      justify: cs.justifyContent, align: cs.alignItems, wrap: cs.flexWrap
    } : isGrid ? { mode: "grid", note: "CSS grid → auto-layout 入れ子で近似(lossy)" }
      : { mode: "flow" };

    const pad = [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft].map((p) => Math.round(parseFloat(p)) || 0);
    const radius = Math.round(parseFloat(cs.borderTopLeftRadius)) || 0;
    const borderW = Math.round(parseFloat(cs.borderTopWidth)) || 0;
    const node = {
      role: "frame", tag,
      cls: el.getAttribute("class") || undefined,
      geometry,
      layout,
      style: {
        fillRef: fill.ref, fillValue: fill.value,
        pad, radius,
        border: borderW ? { w: borderW, ...((b) => ({ ref: b.ref, value: b.value }))(refColor(cs.borderTopColor)) } : null,
        shadow: cs.boxShadow && cs.boxShadow !== "none" ? cs.boxShadow : null,
        opacity: parseFloat(cs.opacity)
      },
      children: []
    };
    if (isGrid) notesGlobal.push(`grid: ${node.cls || tag} を auto-layout 近似`);
    if (node.style.shadow) notesGlobal.push(`shadow: ${node.cls || tag} の box-shadow を DROP_SHADOW 近似`);

    for (const c of elementChildren) {
      const cn = walk(c, depth + 1);
      if (cn) node.children.push(cn);
    }
    // 子テキストとフレーム化が混在(例: brand に mark + テキスト)→ 直テキストも子に足す
    if (dtext && node.children.length) {
      const col = refColor(cs.color);
      node.children.push({ role: "text", tag: "#text", geometry,
        text: { chars: dtext, fontFamily: cs.fontFamily.split(",")[0].replace(/["']/g,"").trim(),
          size: parseFloat(cs.fontSize), weight: cs.fontWeight,
          lineHeight: cs.lineHeight === "normal" ? null : parseFloat(cs.lineHeight),
          colorRef: col.ref, colorValue: col.value, align: cs.textAlign } });
    }
    return node;
  }

  const bodyCs = getComputedStyle(document.body);
  const tree = walk(document.querySelector(".app") || document.body, 0);

  // 変数を Figma 形式に整形
  const COLOR_RE = /^rgba?\(/;
  const variables = [];
  for (const [css, value] of Object.entries(tokens)) {
    const nv = norm(value);
    if (nv && COLOR_RE.test(nv)) {
      const m = nv.match(/rgba\((\d+),(\d+),(\d+),([\d.]+)\)/);
      variables.push({ css, name: css.replace(/^--/, "").replace(/-/g, "/"), type: "COLOR",
        rgba: m ? { r: +m[1]/255, g: +m[2]/255, b: +m[3]/255, a: +m[4] } : null, raw: value });
    } else if (/^-?\d+(\.\d+)?px$/.test(value)) {
      variables.push({ css, name: css.replace(/^--/, "").replace(/-/g, "/"), type: "FLOAT", value: parseFloat(value), raw: value });
    } else {
      variables.push({ css, name: css.replace(/^--/, "").replace(/-/g, "/"), type: "STRING", raw: value });
    }
  }

  return {
    meta: { viewport: { w: viewportW, h: Math.round(document.body.scrollHeight) },
      bodyBg: refColor(bodyCs.backgroundColor), nodeCount },
    variables, tree, notes: [...new Set(notesGlobal)]
  };
}

// ---- ブラウザ起動(puppeteer → playwright-core フォールバック) ----
async function withPuppeteer() {
  const { default: puppeteer } = await import("puppeteer");
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: VIEWPORT_W, height: 900, deviceScaleFactor: 1 });
  await page.goto(fileUrl, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 400)); // JS 描画待ち
  const plan = await page.evaluate(pageExtract, VIEWPORT_W);
  await page.screenshot({ path: outPath.replace(/\.json$/, ".png"), fullPage: true });
  await browser.close();
  return plan;
}
async function withPlaywright() {
  const { chromium } = await import("playwright-core");
  const browser = await chromium.launch({ channel: "chrome" });
  const page = await browser.newPage({ viewport: { width: VIEWPORT_W, height: 900 } });
  await page.goto(fileUrl, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  const plan = await page.evaluate(pageExtract, VIEWPORT_W);
  await page.screenshot({ path: outPath.replace(/\.json$/, ".png"), fullPage: true });
  await browser.close();
  return plan;
}

let plan, engine;
try { plan = await withPuppeteer(); engine = "puppeteer"; }
catch (e1) {
  console.error("puppeteer failed:", e1.message);
  try { plan = await withPlaywright(); engine = "playwright-core/chrome"; }
  catch (e2) { console.error("playwright failed:", e2.message); process.exit(2); }
}
plan.meta.engine = engine;
writeFileSync(outPath, JSON.stringify(plan, null, 2));
console.log(`OK engine=${engine} nodes=${plan.meta.nodeCount} vars=${plan.variables.length} notes=${plan.notes.length} -> ${outPath}`);
