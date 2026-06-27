#!/usr/bin/env node
/*
 * web-design-mock プロジェクト発見スクリプト (SKILL.md §0 / 再開トリガー)
 *
 * 作業中ワークスペースの web-design-mock/<slug>/00-state.md を走査し、
 * 各モックの現フェーズと next_action を一覧する。スキル起動時に最初に実行して
 * 「再開するか / 新規にするか」をユーザーに尋ねる材料にする。依存ゼロ(Node 標準のみ)。
 *
 * 使い方:
 *   node scripts/list-projects.mjs [BASE_DIR]          # 人間可読の一覧(SKILL.md §0 用)
 *   node scripts/list-projects.mjs --hook [BASE_DIR]   # SessionStart hook 用(下記)
 *   BASE_DIR 省略時は CWD 直下の web-design-mock/ を見る。
 *
 * 終了コード(通常モード): 0 = 1件以上発見 / 3 = 0件(新規へ) / 2 = エラー
 * --hook モード: 常に exit 0。プロジェクトがある時だけ Claude Code に渡す JSON
 *   {"additionalContext": "..."} を出力し、無ければ空(=ノイズを出さない)。
 *   利用側リポの .claude/settings.json に SessionStart hook として登録する用途(README 参照)。
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

function collectProjects(base) {
  let entries;
  try {
    entries = readdirSync(base, { withFileTypes: true });
  } catch {
    return null; // base ディレクトリ自体が無い
  }
  const projects = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const statePath = join(base, e.name, "00-state.md");
    try {
      statSync(statePath);
    } catch {
      continue; // 00-state.md が無いフォルダは対象外
    }
    let fm = {};
    try {
      fm = parseFrontMatter(readFileSync(statePath, "utf8"));
    } catch {
      /* 読めなければ空のまま */
    }
    projects.push({ slug: e.name, path: statePath, ...fm });
  }
  return projects;
}

function summarize(projects) {
  const lines = [`再開可能な web-design-mock プロジェクト ${projects.length} 件:`];
  for (const p of projects) {
    lines.push(
      `- ${p.slug} | project: ${p.project ?? "(未記入)"} | phase: ` +
        `${p.current_phase ?? "(未記入)"} | next: ${p.next_action ?? "(未記入)"}`
    );
  }
  lines.push("→ どれを再開するか/新規にするかをユーザーに尋ねる(web-design-mock スキル §0)。");
  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const hookMode = args.includes("--hook");
  const base = args.find((a) => a !== "--hook") || join(process.cwd(), "web-design-mock");
  const projects = collectProjects(base);

  // ── SessionStart hook モード: 常に exit 0。あればだけ context を注入 ──────────
  if (hookMode) {
    if (projects && projects.length > 0) {
      process.stdout.write(JSON.stringify({ additionalContext: summarize(projects) }));
    }
    // 0件 or base 無し → 何も出力しない(ノイズ無し)
    return 0;
  }

  // ── 通常モード(人間可読) ────────────────────────────────────────────────────
  if (projects === null) {
    console.log(`(まだ web-design-mock/ がありません: ${base})`);
    console.log("→ 新規プロジェクトとして開始してください(SKILL.md §0-2)。");
    return 3;
  }
  if (projects.length === 0) {
    console.log(`(web-design-mock/ に再開可能なプロジェクトはありません: ${base})`);
    console.log("→ 新規プロジェクトとして開始してください(SKILL.md §0-2)。");
    return 3;
  }
  console.log(`再開可能なモックプロジェクト ${projects.length} 件 (base: ${base}):\n`);
  for (const p of projects) {
    console.log(`● ${p.slug}`);
    console.log(`    project     : ${p.project ?? "(未記入)"}`);
    console.log(`    current_phase: ${p.current_phase ?? "(未記入)"}`);
    console.log(`    next_action  : ${p.next_action ?? "(未記入)"}`);
    console.log(`    state file   : ${p.path}`);
    console.log("");
  }
  console.log("→ どれを再開するか、または新規にするかをユーザーに尋ねてください(SKILL.md §0-1)。");
  return 0;
}

process.exit(main());
