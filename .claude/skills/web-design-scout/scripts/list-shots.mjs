#!/usr/bin/env node
/*
 * web-design-scout 偵察発見スクリプト (SKILL.md §0 / 再開トリガー)
 *
 * 作業中ワークスペースの web-design-scout/<pattern>-shot/00-scout-state.md を走査し、
 * 各偵察の現フェーズと next_action を一覧する。スキル起動時に最初に実行して
 * 「再開するか / 新規にするか」をユーザーに尋ねる材料にする。依存ゼロ(Node 標準のみ)。
 * web-design-mock の list-projects.mjs を範に取る(別ベース・別状態ファイル名)。
 *
 * 使い方:
 *   node scripts/list-shots.mjs [BASE_DIR]          # 人間可読の一覧(SKILL.md §0 用)
 *   node scripts/list-shots.mjs --hook [BASE_DIR]   # SessionStart hook 用
 *   BASE_DIR 省略時は CWD 直下の web-design-scout/ を見る。
 *
 * 終了コード(通常モード): 0 = 1件以上発見 / 3 = 0件(新規へ) / 2 = エラー
 * --hook モード: 常に exit 0。偵察がある時だけ {"additionalContext": "..."} を出力。
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

function collectShots(base) {
  let entries;
  try {
    entries = readdirSync(base, { withFileTypes: true });
  } catch {
    return null; // base ディレクトリ自体が無い
  }
  const shots = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    if (e.name.startsWith("_")) continue; // _rubrics 等は偵察ではない
    const statePath = join(base, e.name, "00-scout-state.md");
    try {
      statSync(statePath);
    } catch {
      continue; // 00-scout-state.md が無いフォルダは対象外
    }
    let fm = {};
    try {
      fm = parseFrontMatter(readFileSync(statePath, "utf8"));
    } catch {
      /* 読めなければ空のまま */
    }
    shots.push({ slug: e.name, path: statePath, ...fm });
  }
  return shots;
}

function summarize(shots) {
  const lines = [`再開可能な web-design-scout 偵察 ${shots.length} 件:`];
  for (const s of shots) {
    lines.push(
      `- ${s.slug} | pattern: ${s.pattern ?? "(未記入)"} | phase: ` +
        `${s.current_phase ?? "(未記入)"} | next: ${s.next_action ?? "(未記入)"}`
    );
  }
  lines.push("→ どれを再開するか/新規にするかをユーザーに尋ねる(web-design-scout スキル §0)。");
  return lines.join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const hookMode = args.includes("--hook");
  const base = args.find((a) => a !== "--hook") || join(process.cwd(), "web-design-scout");
  const shots = collectShots(base);

  // ── SessionStart hook モード: 常に exit 0。あればだけ context を注入 ──
  if (hookMode) {
    if (shots && shots.length > 0) {
      process.stdout.write(JSON.stringify({ additionalContext: summarize(shots) }));
    }
    return 0;
  }

  // ── 通常モード(人間可読) ──
  if (shots === null) {
    console.log(`(まだ web-design-scout/ がありません: ${base})`);
    console.log("→ 新規偵察として開始してください(SKILL.md §0-2)。");
    return 3;
  }
  if (shots.length === 0) {
    console.log(`(web-design-scout/ に再開可能な偵察はありません: ${base})`);
    console.log("→ 新規偵察として開始してください(SKILL.md §0-2)。");
    return 3;
  }
  console.log(`再開可能な偵察 ${shots.length} 件 (base: ${base}):\n`);
  for (const s of shots) {
    console.log(`● ${s.slug}`);
    console.log(`    pattern      : ${s.pattern ?? "(未記入)"}`);
    console.log(`    current_phase: ${s.current_phase ?? "(未記入)"}`);
    console.log(`    next_action  : ${s.next_action ?? "(未記入)"}`);
    console.log(`    state file   : ${s.path}`);
    console.log("");
  }
  console.log("→ どれを再開するか、または新規にするかをユーザーに尋ねてください(SKILL.md §0-1)。");
  return 0;
}

process.exit(main());
