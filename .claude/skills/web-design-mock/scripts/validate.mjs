#!/usr/bin/env node
/*
 * web-design-mock 不変条件チェッカー (SKILL.md §7)
 *
 * 自己完結 HTML モックが「器の形」の不変条件を満たすか機械検証する。
 * 依存ゼロ(Node 標準のみ)。
 *
 * 検証する不変条件:
 *   1. ハードコードの色値ゼロ … :root 以外に生の hex / rgb() / hsl() / 名前色が無い
 *   2. accent 定義は 1 箇所  … --color-accent: の宣言が :root 内に 1 つだけ
 *   3. 全参照が var(--…)     … :root 外の色プロパティはトークン参照(= 1 の裏返し)
 *
 * 使い方:  node scripts/validate.mjs output/mock-vN.html
 * 終了コード: 0 = PASS / 1 = 違反あり / 2 = 使い方エラー
 */
import { readFileSync } from "node:fs";

const HEX = /#[0-9a-fA-F]{3,8}\b/g;
const FUNC = /\b(?:rgba?|hsla?)\s*\(/gi;
// 高シグナルな名前色のみ(他用途語と衝突しない語に限定)
const NAMED =
  /(?<![\w-])(?:white|black|red|green|blue|yellow|orange|purple|pink|gray|grey|silver|navy|teal|maroon|olive|lime|aqua|fuchsia|gold|crimson|coral|salmon|indigo|violet|tomato|khaki|magenta|cyan)(?![\w-])/gi;
// 色を取りうる宣言プロパティ
const COLOR_PROP =
  /(?:^|[;{"'])\s*(?:color|background(?:-color)?|border(?:-[a-z]+)?|outline(?:-color)?|fill|stroke|box-shadow|text-shadow|caret-color|accent-color|column-rule(?:-color)?)\s*:/gi;
const ACCENT_DECL = /--color-accent\s*:/gi;
const STYLE_BLOCK = /<style[^>]*>([\s\S]*?)<\/style>/gi;
const INLINE_STYLE = /\bstyle\s*=\s*("|')([\s\S]*?)\1/gi;

function findRootSpans(css, base) {
  const spans = [];
  const re = /:root\b[^{]*\{/g;
  let m;
  while ((m = re.exec(css)) !== null) {
    const open = m.index + m[0].length - 1; // 開き { の位置
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
const lineOf = (text, pos) => text.slice(0, pos).split("\n").length;

function scanSegment(fullText, seg, segOffset, rootSpans, label, violations) {
  for (const rx of [HEX, FUNC]) {
    rx.lastIndex = 0;
    let m;
    while ((m = rx.exec(seg)) !== null) {
      const abs = segOffset + m.index;
      if (inSpans(abs, rootSpans)) continue;
      violations.push([
        lineOf(fullText, abs),
        `[${label}] 色リテラル '${m[0]}' (:root 外。トークン var(--…) を使う)`,
      ]);
    }
  }
  // 名前色: 色系プロパティの値に出たときのみ
  COLOR_PROP.lastIndex = 0;
  let pm;
  while ((pm = COLOR_PROP.exec(seg)) !== null) {
    const valStart = pm.index + pm[0].length;
    let valEnd = seg.length;
    for (let k = valStart; k < seg.length; k++) {
      if (seg[k] === ";" || seg[k] === "}") {
        valEnd = k;
        break;
      }
    }
    const value = seg.slice(valStart, valEnd);
    NAMED.lastIndex = 0;
    let nm;
    while ((nm = NAMED.exec(value)) !== null) {
      const abs = segOffset + valStart + nm.index;
      if (inSpans(abs, rootSpans)) continue;
      violations.push([
        lineOf(fullText, abs),
        `[${label}] 名前色 '${nm[0]}' (:root 外。トークン var(--…) を使う)`,
      ]);
    }
  }
}

function validate(html) {
  const violations = [];
  const rootSpans = [];

  const styleBlocks = [];
  STYLE_BLOCK.lastIndex = 0;
  let sm;
  while ((sm = STYLE_BLOCK.exec(html)) !== null) {
    const offset = sm.index + sm[0].indexOf(sm[1]);
    styleBlocks.push([offset, sm[1]]);
  }
  if (styleBlocks.length === 0)
    violations.push([1, "[構造] <style> ブロックが無い(自己完結 HTML でない可能性)"]);
  for (const [offset, css] of styleBlocks) rootSpans.push(...findRootSpans(css, offset));
  if (rootSpans.length === 0)
    violations.push([1, "[構造] :root トークンブロックが見つからない"]);

  // accent 宣言(:root 内に限る)
  const accentPos = [];
  for (const [offset, css] of styleBlocks) {
    ACCENT_DECL.lastIndex = 0;
    let m;
    while ((m = ACCENT_DECL.exec(css)) !== null) {
      const abs = offset + m.index;
      if (inSpans(abs, rootSpans)) accentPos.push(abs);
    }
  }
  if (accentPos.length === 0)
    violations.push([1, "[accent] --color-accent の宣言が :root に無い"]);
  else if (accentPos.length > 1) {
    const lines = accentPos.map((p) => lineOf(html, p)).join(", ");
    violations.push([1, `[accent] --color-accent の宣言が複数(行 ${lines})。1 箇所だけにする`]);
  }

  // <style> 内(:root 外)
  for (const [offset, css] of styleBlocks)
    scanSegment(html, css, offset, rootSpans, "style", violations);

  // inline style=""(:root には現れないので全対象)
  INLINE_STYLE.lastIndex = 0;
  let im;
  while ((im = INLINE_STYLE.exec(html)) !== null) {
    const valOffset = im.index + im[0].indexOf(im[2], im[1].length + 6);
    scanSegment(html, im[2], valOffset, [], "inline", violations);
  }

  return violations;
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error("usage: node scripts/validate.mjs <html-file>");
    return 2;
  }
  let html;
  try {
    html = readFileSync(args[0], "utf8");
  } catch (e) {
    console.error(`file error: ${e.message}`);
    return 2;
  }

  const violations = validate(html);
  if (violations.length === 0) {
    console.log(`PASS  ${args[0]}`);
    console.log("  OK ハードコード色値ゼロ / accent 定義 1 箇所 / 全参照 var(--…)");
    return 0;
  }
  violations.sort((a, b) => a[0] - b[0]);
  console.log(`FAIL  ${args[0]}  — ${violations.length} 件の違反`);
  for (const [line, msg] of violations) console.log(`  L${line}: ${msg}`);
  return 1;
}

process.exit(main());
