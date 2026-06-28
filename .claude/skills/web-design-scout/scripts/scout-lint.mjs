#!/usr/bin/env node
/*
 * web-design-scout 出典・正直さチェッカー (SKILL.md §7 / 設計書 §7)
 *
 * 偵察ギャラリー HTML が「出典と正直さの不変条件」を満たすか機械検証する。
 * 依存ゼロ(Node 標準のみ)。web-design-mock の validate.mjs とは目的が違うので共有しない:
 *   mock = トークン器の不変条件(accent 1 箇所 等)
 *   scout = 出典と正直さ(各カードに出典 / 推定ラベル / 自己完結)
 *
 * 検証する不変条件(違反 = exit 1):
 *   1. 各カード(<section class="card">)に出典リンク(<a href>)がある
 *   2. 各カードに「推定」or「estimated」表示がある(referenced-secondary の正直さ)
 *   3. 自己完結 HTML(外部 CSS フレームワーク/CDN stylesheet を読まない)
 *
 * advisory(warning・exit に影響しない):
 *   - ダミーデータ漏れの疑い: 色系でない実在ドメイン風メール(@*.example 以外)
 *
 * 使い方:  node scripts/scout-lint.mjs <pattern>-shot/gallery.html
 * 終了コード: 0 = PASS(advisory はあってよい) / 1 = 違反あり / 2 = 使い方エラー
 */
import { readFileSync } from "node:fs";

const lineOf = (text, pos) => text.slice(0, pos).split("\n").length;

// <section class="card" ...> ... </section> を素直に抽出(ネストした section は想定しない)
function extractCards(html) {
  const cards = [];
  const re = /<section\b[^>]*class\s*=\s*("|')([^"']*)\1[^>]*>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const classes = m[2].split(/\s+/);
    if (!classes.includes("card")) continue;
    const start = m.index;
    // 対応する </section> を探す(浅いネスト対応)
    let depth = 1;
    const tagRe = /<\/?section\b[^>]*>/gi;
    tagRe.lastIndex = re.lastIndex;
    let t;
    let end = html.length;
    while ((t = tagRe.exec(html)) !== null) {
      if (t[0][1] === "/") depth--;
      else depth++;
      if (depth === 0) { end = tagRe.lastIndex; break; }
    }
    cards.push({ start, end, html: html.slice(start, end), line: lineOf(html, start) });
  }
  return cards;
}

function lint(html) {
  const violations = [];
  const warnings = [];

  // ── 3. 自己完結(外部 stylesheet / CSS フレームワーク CDN を読まない) ──
  const LINK_CSS = /<link\b[^>]*rel\s*=\s*("|')stylesheet\1[^>]*>/gi;
  let lm;
  while ((lm = LINK_CSS.exec(html)) !== null) {
    violations.push([lineOf(html, lm.index), `[自己完結] 外部 stylesheet を読み込んでいる(自己完結 HTML にする): ${lm[0].slice(0, 80)}`]);
  }
  const FRAMEWORK_CDN = /\b(?:cdn\.tailwindcss\.com|bootstrap(?:\.min)?\.css|cdn\.jsdelivr\.net\/npm\/(?:bootstrap|bulma|tailwind))/i;
  const fc = html.match(FRAMEWORK_CDN);
  if (fc) violations.push([lineOf(html, html.indexOf(fc[0])), `[自己完結] CSS フレームワーク CDN を参照(${fc[0]})`]);

  // ── カード単位の検査(1 出典 / 2 推定ラベル) ──
  const cards = extractCards(html);
  if (cards.length === 0) {
    violations.push([1, `[構造] <section class="card"> が 1 つも見つからない(ギャラリーの形になっていない)`]);
  }
  cards.forEach((c, i) => {
    // タイトル(あれば)を採取してメッセージを分かりやすく
    const titleM = c.html.match(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
    const title = titleM ? titleM[1].replace(/<[^>]+>/g, "").trim().slice(0, 40) : `#${i + 1}`;

    // 1. 出典リンク
    if (!/<a\b[^>]*href\s*=\s*("|')https?:\/\//i.test(c.html))
      violations.push([c.line, `[出典] カード「${title}」に出典リンク(<a href="http…">)が無い`]);

    // 2. 推定ラベル
    if (!/推定|estimated/i.test(c.html))
      violations.push([c.line, `[正直さ] カード「${title}」に「推定 / estimated」表示が無い(referenced-secondary の値は推定である旨を明示)`]);
  });

  // ── advisory: ダミーデータ漏れ(実在ドメイン風メール) ──
  const EMAIL = /[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,})/gi;
  let em;
  const seen = new Set();
  while ((em = EMAIL.exec(html)) !== null) {
    const domain = em[1].toLowerCase();
    if (domain.endsWith(".example") || domain.endsWith("example.com")) continue;
    if (seen.has(em[0])) continue;
    seen.add(em[0]);
    warnings.push([lineOf(html, em.index), `[ダミーデータ?] 実在ドメイン風メール '${em[0]}'。架空(@*.example)に置換を検討`]);
  }

  return { violations, warnings };
}

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1) {
    console.error("usage: node scripts/scout-lint.mjs <gallery.html>");
    return 2;
  }
  let html;
  try {
    html = readFileSync(args[0], "utf8");
  } catch (e) {
    console.error(`file error: ${e.message}`);
    return 2;
  }

  const { violations, warnings } = lint(html);

  if (warnings.length) {
    warnings.sort((a, b) => a[0] - b[0]);
    console.log(`advisory(${warnings.length} 件・ブロックしません):`);
    for (const [line, msg] of warnings) console.log(`  L${line}: ${msg}`);
    console.log("");
  }

  if (violations.length === 0) {
    console.log(`PASS  ${args[0]}`);
    console.log("  OK 各カードに出典 + 推定ラベル / 自己完結 HTML");
    return 0;
  }
  violations.sort((a, b) => a[0] - b[0]);
  console.log(`FAIL  ${args[0]}  — ${violations.length} 件の違反`);
  for (const [line, msg] of violations) console.log(`  L${line}: ${msg}`);
  return 1;
}

process.exit(main());
