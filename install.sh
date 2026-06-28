#!/usr/bin/env bash
#
# web-design スキル インストーラ (POSIX / macOS / Linux / Git Bash)
#
# このリポジトリを clone した後に実行すると、スキル一式を対象リポジトリ(または個人用)の
# .claude/skills/ にコピーして Claude Code から使えるようにする。
# インストールされるスキル(対になっているので両方入れる):
#   - web-design-mock     哲学 → モック(生成)
#   - web-design-distill  モック → 哲学(蒸留 / 逆向き。mock の validate.mjs と references を共有)
# 既存ファイルは壊さない(同名スキルが既にあれば --force 指定が無い限り中止)。
#
# 使い方:
#   ./install.sh [TARGET_REPO_DIR]   # 既定: カレントディレクトリ(プロジェクトに同梱)
#   ./install.sh --user              # 個人用 (~/.claude/skills/。全プロジェクトで使える)
#   ./install.sh /path/to/repo       # 指定リポジトリの .claude/skills/ にコピー
#   ./install.sh /path/to/repo --force  # 既存を上書き
#
set -euo pipefail

SKILL_NAMES=("web-design-mock" "web-design-distill")
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

USER_MODE=0
FORCE=0
TARGET="$PWD"

for arg in "$@"; do
  case "$arg" in
    --user)  USER_MODE=1 ;;
    --force) FORCE=1 ;;
    -h|--help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) TARGET="$arg" ;;
  esac
done

# ソースが全て揃っているか先に確認 ───────────────────────────────────────────
for name in "${SKILL_NAMES[@]}"; do
  if [ ! -d "$SCRIPT_DIR/.claude/skills/$name" ]; then
    echo "error: スキル本体が見つからない: $SCRIPT_DIR/.claude/skills/$name" >&2
    echo "       このスクリプトはリポジトリ直下から実行してください。" >&2
    exit 1
  fi
done

if [ "$USER_MODE" -eq 1 ]; then
  DEST_ROOT="$HOME/.claude/skills"
else
  if [ ! -d "$TARGET" ]; then
    echo "error: 対象ディレクトリが存在しない: $TARGET" >&2
    exit 1
  fi
  DEST_ROOT="$TARGET/.claude/skills"
fi

# 競合チェック(コピー前に全スキルを検査して、衝突があれば何もせず中止)─────────
SKIP=()  # 自分自身を指していてスキップするスキル
for name in "${SKILL_NAMES[@]}"; do
  src="$SCRIPT_DIR/.claude/skills/$name"
  dest="$DEST_ROOT/$name"
  if [ "$(cd "$src" && pwd)" = "$(cd "$dest" 2>/dev/null && pwd || echo __none__)" ]; then
    SKIP+=("$name")
    continue
  fi
  if [ -e "$dest" ] && [ "$FORCE" -eq 0 ]; then
    echo "error: 既に存在します: $dest" >&2
    echo "       上書きするなら --force を付けてください(既存は置き換えられます)。" >&2
    exit 1
  fi
done

mkdir -p "$DEST_ROOT"
for name in "${SKILL_NAMES[@]}"; do
  src="$SCRIPT_DIR/.claude/skills/$name"
  dest="$DEST_ROOT/$name"
  if printf '%s\n' "${SKIP[@]:-}" | grep -qx "$name"; then
    echo "ok: 既にこのリポジトリ内のスキルを指しています($dest)。スキップ。"
    continue
  fi
  rm -rf "$dest"
  cp -R "$src" "$dest"
  echo "✓ インストール完了: $dest"
done

echo ""
echo "次の手順:"
if [ "$USER_MODE" -eq 1 ]; then
  echo "  - 全プロジェクトで Claude Code を起動し /web-design-mock(生成)/ /web-design-distill(蒸留)で利用可能。"
else
  echo "  - 対象リポジトリで Claude Code を起動(ワークスペースの信頼を承認)。"
  echo "  - /web-design-mock(生成)/ /web-design-distill(蒸留)で起動。git に commit すればチームで共有できます。"
fi
echo "  - 検証スクリプトは Node が必要: node \"\${CLAUDE_SKILL_DIR}/scripts/validate.mjs\" <html>"
