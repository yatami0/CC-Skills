#!/usr/bin/env node
/*
 * web-design-mock anti-slop アドバイザリ (設計書 §8.5)
 *
 * 生成済みモックに「AIっぽさ(AI slop)」の tell が無いかを機械チェックする。
 * 思想は validate.mjs と同じ「自己トークン整合(self-conformance)」: per-哲学の正解値を
 * ハードコードせず、生成物が自分で宣言した :root トークンから逸脱したかを見る。
 *
 * validate.mjs(ハード gate, exit 1)とは役割が違う。本スクリプトは **advisory**:
 *   - 検出はすべて warning。**ブロックしない**(常に exit 0)。最終判断は人間ゲート(設計 §3.5)。
 *
 * チェック(設計 §8.5 の表):
 *   T1 フォント       … --font-sans の先頭が逃げフォント / markup の font-family ハードコード
 *   T2 アクセント色相 … --color-accent が indigo/violet レンジ(hue∈[230,300] & sat>0.5) [soft]
 *   T3 グラデ         … *-gradient() の多用 / stop 色が紫レンジ
 *   T4 radius 平坦化  … markup が参照する radius が単一の非ゼロ値に潰れている
 *   T5 影整合(任意)  … --philosophy=carbon 指定時、タイル等に overlay 以外の影
 *
 * 使い方:  node scripts/anti-slop.mjs <html-file> [--philosophy=apple|carbon]
 * 終了コード: 常に 0(advisory)。使い方エラーのみ 2。
 */
import { readFileSync } from "node:fs";

/* ───────────────────────── 低レベル: CSS/色のパース ───────────────────────── */

const STYLE_BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/gi;
const INLINE_STYLE = /\bstyle\s*=\s*("|')([\s\S]*?)\1/gi;
const DECL = /(--[\w-]+)\s*:\s*([^;]+);/g; // :root 内のトークン宣言
const VAR_REF = /var\(\s*(--[\w-]+)\s*\)/g;
const FONT_FAMILY = /font-family\s*:\s*([^;}]+)/gi;
const BORDER_RADIUS = /\bborder-radius\s*:\s*([^;}]+)/gi;
const BOX_SHADOW = /\bbox-shadow\s*:\s*([^;}]+)/gi;
const GRADIENT = /(?:linear|radial|conic)-gradient\s*\(/gi;
const HEX = /#[0-9a-fA-F]{3,8}\b/g;

// 逃げフォント(設計 §8.5 T1)。system-ui / -apple-system は哲学が意図的に使うので除外。
const FONT_BLACKLIST = new Set(["inter", "roboto", "arial", "open sans", "lato"]);

const lineOf = (text, pos) => text.slice(0, pos).split("\n").length;

function findRootSpans(css, base) {
  const spans = [];
  const re = /:root\b[^{]*\{/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const open = m.index + m[0].length - 1;
    let depth = 0;
    for (let j = open; j < css.length; j++) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") {
        depth--;
        if (depth === 0) {
          spans.push([base + m.index, base + j + 1]);
          break;
        }
      }
    }
  }
  return spans;
}
const inSpans = (pos, spans) => spans.some(([s, e]) => pos >= s && pos < e);

// 対応する閉じ括弧までの中身を返す(ネストした括弧に対応)
function extractParen(text, openParenIdx) {
  let depth = 0;
  for (let j = openParenIdx; j < text.length; j++) {
    if (text[j] === "(") depth++;
    else if (text[j] === ")") {
      depth--;
      if (depth === 0) return text.slice(openParenIdx + 1, j);
    }
  }
  return text.slice(openParenIdx + 1);
}

function parseColor(str) {
  const s = str.trim();
  let m = s.match(/^#([0-9a-fA-F]{3,8})\b/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = h.split("").map((c) => c + c).join("");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return { r, g, b };
  }
  m = s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (m) return { r: +m[1], g: +m[2], b: +m[3] };
  return null;
}

function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  return { h, s, l };
}

// 紫(indigo/violet)判定: hue∈[230,300] かつ sat>0.5(設計 §8.5 T2)
function isViolet(color) {
  if (!color) return false;
  const { h, s } = rgbToHsl(color);
  return h >= 230 && h <= 300 && s > 0.5;
}

/* ───────────────────────── 中レベル: 文書モデル ───────────────────────── */

function buildModel(html) {
  const styleBlocks = []; // [offset, css]
  STYLE_BLOCK.lastIndex = 0;
  let sm;
  while ((sm = STYLE_BLOCK.exec(html)) !== null) {
    const offset = sm.index + sm[0].indexOf(sm[1]);
    styleBlocks.push([offset, sm[1]]);
  }

  const rootSpans = [];
  for (const [offset, css] of styleBlocks) rootSpans.push(...findRootSpans(css, offset));

  // :root のトークン宣言を name->value で集約
  const tokens = new Map();
  for (const [start, end] of rootSpans) {
    const inner = html.slice(start, end);
    DECL.lastIndex = 0;
    let m;
    while ((m = DECL.exec(inner)) !== null) tokens.set(m[1], m[2].trim());
  }

  // markup セグメント = :root の外の CSS + inline style(:root に現れない)
  // [absOffset, text] の配列。各 text 内オフセット + absOffset で絶対位置になる。
  const markup = [];
  for (const [offset, css] of styleBlocks) {
    // :root スパンを空白で潰して、markup スキャンから除外(インデックスは維持)
    let masked = css.split("");
    for (const [s, e] of rootSpans) {
      for (let j = Math.max(0, s - offset); j < Math.min(css.length, e - offset); j++) masked[j] = " ";
    }
    markup.push([offset, masked.join("")]);
  }
  INLINE_STYLE.lastIndex = 0;
  let im;
  while ((im = INLINE_STYLE.exec(html)) !== null) {
    const valOffset = im.index + im[0].indexOf(im[2], im[1].length + 6);
    markup.push([valOffset, im[2]]);
  }

  return { html, styleBlocks, rootSpans, tokens, markup };
}

// var(--x) を :root トークン値へ解決(浅い再帰)。色/px の生値が出るまで辿る。
function resolve(value, tokens, depth = 0) {
  if (depth > 5 || !value) return value;
  const m = value.match(/^\s*var\(\s*(--[\w-]+)\s*\)\s*$/);
  if (m && tokens.has(m[1])) return resolve(tokens.get(m[1]), tokens, depth + 1);
  return value;
}

const firstFamily = (value) =>
  value.split(",")[0].trim().replace(/^["']|["']$/g, "").toLowerCase();

/* ───────────────────────── 各チェック(T1–T5) ───────────────────────── */

function checkT1Font(model, warn) {
  const { tokens, markup, html } = model;
  // T1a: --font-sans の先頭が逃げフォントか
  const fs = tokens.get("--font-sans");
  if (fs) {
    const first = firstFamily(fs);
    if (FONT_BLACKLIST.has(first))
      warn("T1", null, `--font-sans の先頭が逃げフォント '${first}'。哲学固有フォント(SF/IBM Plex 等)を先頭に`);
  }
  // T1b: markup でハードコード font-family(var() でない)
  for (const [absOff, seg] of markup) {
    FONT_FAMILY.lastIndex = 0;
    let m;
    while ((m = FONT_FAMILY.exec(seg)) !== null) {
      const val = m[1].trim();
      if (/var\(\s*--/.test(val)) continue; // トークン参照は OK
      const abs = absOff + m.index;
      const first = firstFamily(val);
      const extra = FONT_BLACKLIST.has(first) ? `(逃げフォント '${first}')` : "";
      warn("T1", lineOf(html, abs), `font-family がハードコード ${extra}。var(--font-sans) を使う`);
    }
  }
}

function checkT2Accent(model, warn) {
  const { tokens } = model;
  const acc = tokens.get("--color-accent");
  if (!acc) return;
  const color = parseColor(resolve(acc, tokens));
  if (isViolet(color)) {
    const { h } = rgbToHsl(color);
    warn("T2", null, `--color-accent が indigo/violet レンジ(hue≈${Math.round(h)})。意図したブランド色か確認(既定ドリフトでないか) [soft]`);
  }
}

function checkT3Gradient(model, warn) {
  const { tokens, styleBlocks, rootSpans, html } = model;
  let count = 0;
  let violet = 0;
  for (const [offset, css] of styleBlocks) {
    GRADIENT.lastIndex = 0;
    let m;
    while ((m = GRADIENT.exec(css)) !== null) {
      const abs = offset + m.index;
      if (inSpans(abs, rootSpans)) continue; // :root 内のトークン定義は対象外
      count++;
      // stop 色(var 参照 or 生 hex)を解決して紫判定
      const openIdx = m.index + m[0].length - 1;
      const inner = extractParen(css, openIdx);
      const colors = [];
      VAR_REF.lastIndex = 0;
      let vm;
      while ((vm = VAR_REF.exec(inner)) !== null)
        if (tokens.has(vm[1])) colors.push(resolve(tokens.get(vm[1]), tokens));
      HEX.lastIndex = 0;
      let hm;
      while ((hm = HEX.exec(inner)) !== null) colors.push(hm[0]);
      if (colors.some((c) => isViolet(parseColor(c)))) violet++;
    }
  }
  if (violet > 0) warn("T3", null, `紫レンジの色を含むグラデーションが ${violet} 件。紫青グラデは代表的 tell`);
  else if (count >= 3) warn("T3", null, `グラデーションが ${count} 件と多い。単色面/素材表現も検討`);
}

function checkT4RadiusFlatness(model, warn) {
  const { tokens, markup } = model;
  const values = []; // 適用された border-radius の解決後 px(数値)
  for (const [, seg] of markup) {
    BORDER_RADIUS.lastIndex = 0;
    let m;
    while ((m = BORDER_RADIUS.exec(seg)) !== null) {
      const resolved = resolve(m[1].trim(), tokens);
      const num = parseFloat(resolved);
      if (!Number.isNaN(num)) values.push(num);
    }
  }
  const nonzero = values.filter((v) => v > 0);
  const distinct = new Set(nonzero);
  // 定義側スケール(非ゼロ radius トークンの種類)
  const scaleSize = [...tokens.keys()].filter(
    (k) => /radius/.test(k) && parseFloat(resolve(tokens.get(k), tokens)) > 0,
  ).length;
  if (distinct.size === 1 && nonzero.length >= 4 && scaleSize >= 2)
    warn(
      "T4",
      null,
      `角丸が単一値 ${[...distinct][0]}px に潰れている(${nonzero.length}箇所)。:root は ${scaleSize} 段の radius スケールを持つ — 階層に応じ使い分ける`,
    );
}

function checkT5Shadow(model, philosophy, warn) {
  if (philosophy !== "carbon") return; // 任意・Carbon のみ
  const { tokens, markup, html } = model;
  for (const [absOff, seg] of markup) {
    BOX_SHADOW.lastIndex = 0;
    let m;
    while ((m = BOX_SHADOW.exec(seg)) !== null) {
      const val = m[1].trim();
      if (/var\(\s*--shadow-overlay\s*\)/.test(val)) continue; // overlay は許容
      if (/^none$/i.test(val)) continue;
      const abs = absOff + m.index;
      warn("T5", lineOf(html, abs), `box-shadow を使用(Carbon はタイル/カードに影を足さない。面の階層は layer 段差で)`);
    }
  }
}

/* ───────────────────────── メイン ───────────────────────── */

function main() {
  const args = process.argv.slice(2);
  const files = args.filter((a) => !a.startsWith("--"));
  const philFlag = args.find((a) => a.startsWith("--philosophy="));
  const philosophy = philFlag ? philFlag.split("=")[1].toLowerCase() : null;
  if (files.length !== 1) {
    console.error("usage: node scripts/anti-slop.mjs <html-file> [--philosophy=apple|carbon]");
    return 2;
  }
  let html;
  try {
    html = readFileSync(files[0], "utf8");
  } catch (e) {
    console.error(`file error: ${e.message}`);
    return 2;
  }

  const warnings = [];
  const warn = (id, line, msg) => warnings.push({ id, line, msg });
  const model = buildModel(html);

  checkT1Font(model, warn);
  checkT2Accent(model, warn);
  checkT3Gradient(model, warn);
  checkT4RadiusFlatness(model, warn);
  checkT5Shadow(model, philosophy, warn);

  if (warnings.length === 0) {
    console.log(`CLEAN ${files[0]}`);
    console.log("  AI slop の tell は検出されませんでした(T1–T4)。");
  } else {
    console.log(`WARN  ${files[0]}  — ${warnings.length} 件の advisory(ブロックしません)`);
    warnings.sort((a, b) => a.id.localeCompare(b.id) || (a.line ?? 0) - (b.line ?? 0));
    for (const w of warnings) {
      const loc = w.line ? `L${w.line}` : "—";
      console.log(`  [${w.id}] ${loc}: ${w.msg}`);
    }
    console.log("  → これは警告です。人間ゲート(設計 §3.5)で要否を判断してください。");
  }
  return 0; // advisory: 常に 0
}

process.exit(main());
