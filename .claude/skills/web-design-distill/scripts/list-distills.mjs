#!/usr/bin/env node
/*
 * web-design-distill 蒸留作業 発見スクリプト (SKILL.md §1-1 / 再開トリガー)
 *
 * 作業中ワークスペースの web-design-mock/<slug>/distill/00-distill-state.md を走査し、
 * 各蒸留作業の現フェーズと next_action を一覧する。スキル起動時に最初に実行して
 * 「再開するか / 新規にするか」をユーザーに尋ねる材料にする。依存ゼロ(Node 標準のみ)。
 *
 * 親の list-projects.mjs と対をなす。違いは走査するファイルの位置だけ:
 *   親  : web-design-mock/<slug>/00-state.md          (モック本体)
 *   本書: web-design-mock/<slug>/distill/00-distill-state.md  (蒸留作業)
 *
 * 使い方:
 *   node scripts/list-distills.mjs [BASE_DIR]          # 人間可読の一覧(SKILL.md §1-1 用)
 *   node scripts/list-distills.mjs --hook [BASE_DIR]   # SessionStart hook 用(下記)
 *   BASE_DIR 省略時は CWD 直下の web-design-mock/ を見る。
 *
 * 終了コード(通常モード): 0 = 1件以上発見 / 3 = 0件(新規へ) / 2 = エラー
 * --hook モード: 常に exit 0。蒸留作業がある時だけ Claude Code に渡す JSON
 *   {"additionalContext": "..."} を出力し、無ければ空(=ノイズを出さない)。
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

function parseFrontMatter(text) {
  const m = text.match(/^---\s*\n([\s\S]*?)\n---/);
  const out = {};
  if (!m) return out;
  for (const line of m[1].split("\n")) {
    const mm = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!mm) continue;
    let v = mm[2].trim().replace(/\s+#.*$/, ""); // 行末コメント除去
    v = v.replace(/^["']|["']$/g, "");
    out[mm[1]] = v;
  }
  return out;
}

function collectDistills(base) {
  let entries;
  try {
    entries = readdirSync(base, { withFileTypes: true });
  } catch {
    return null; // base ディレクトリ自体が無い
  }
  const distills = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("_")) continue; // _philosophies など underscore 前頭は対象外
    const statePath = join(base, e.name, "distill", "00-distill-state.md");
    try {
      statSync(statePath);
    } catch {
      continue; // distill/00-distill-state.md が無いフォルダは対象外
    }
    let fm = {};
    try {
      fm = parseFrontMatter(readFileSync(statePath, "utf8"));
    } catch {
      /* 読めなければ空のまま */
    }
    distills.push({ slug: e.name, path: statePath, ...fm });
  }
  return distills;
}

function summarize(distills) {
  const lines = [`再開可能な web-design-distill 蒸留作業 ${distills.length} 件:`];
  for (const d of distills) {
    lines.push(
      `- ${d.slug} → ${d.philosophy_name ?? "(哲学名未定)"} | phase: ` +
        `${d.current_phase ?? "(未記入)"} | next: ${d.next_action ?? "(未記入)"}`
    );
  }
  lines.push("→ どれを再開するか/新規にするかをユーザーに尋ねる(web-design-distill スキル §1-1)。");
  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const hookMode = args.includes("--hook");
  const base = args.find((a) => a !== "--hook") || join(process.cwd(), "web-design-mock");
  const distills = collectDistills(base);

  // ── SessionStart hook モード: 常に exit 0。あればだけ context を注入 ──────────
  if (hookMode) {
    if (distills && distills.length > 0) {
      process.stdout.write(JSON.stringify({ additionalContext: summarize(distills) }));
    }
    // 0件 or base 無し → 何も出力しない(ノイズ無し)
    return 0;
  }

  // ── 通常モード(人間可読) ────────────────────────────────────────────────────
  if (distills === null) {
    console.log(`(まだ web-design-mock/ がありません: ${base})`);
    console.log("→ 蒸留するソースモックがありません。先に web-design-mock でモックを作ってください(SKILL.md §1-2)。");
    return 3;
  }
  if (distills.length === 0) {
    console.log(`(web-design-mock/ に再開可能な蒸留作業はありません: ${base})`);
    console.log("→ 新規の蒸留として開始してください(SKILL.md §1-2: ソースモックを選ぶ → D1)。");
    return 3;
  }
  console.log(`再開可能な蒸留作業 ${distills.length} 件 (base: ${base}):\n`);
  for (const d of distills) {
    console.log(`● ${d.slug}  →  ${d.philosophy_name ?? "(哲学名未定)"}`);
    console.log(`    source_mock  : ${d.source_mock ?? "(未記入)"}`);
    console.log(`    kind         : ${d.kind ?? "(未記入)"}`);
    console.log(`    current_phase: ${d.current_phase ?? "(未記入)"}`);
    console.log(`    next_action  : ${d.next_action ?? "(未記入)"}`);
    console.log(`    state file   : ${d.path}`);
    console.log("");
  }
  console.log("→ どれを再開するか、または新規にするかをユーザーに尋ねてください(SKILL.md §1-1)。");
  return 0;
}

process.exit(main());
