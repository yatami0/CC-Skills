#!/usr/bin/env bash
#
# web-design-mock スキル インストーラ (POSIX / macOS / Linux / Git Bash)
#
# このリポジトリを clone した後に実行すると、スキルを対象リポジトリ(または個人用)の
# .claude/skills/ にコピーして Claude Code から /web-design-mock で使えるようにする。
# 既存ファイルは壊さない(同名スキルが既にあれば --force 指定が無い限り中止)。
#
# 使い方:
#   ./install.sh [TARGET_REPO_DIR]   # 既定: カレントディレクトリ(プロジェクトに同梱)
#   ./install.sh --user              # 個人用 (~/.claude/skills/。全プロジェクトで使える)
#   ./install.sh /path/to/repo       # 指定リポジトリの .claude/skills/ にコピー
#   ./install.sh /path/to/repo --force  # 既存を上書き
#
set -euo pipefail

SKILL_NAME="web-design-mock"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SOURCE="$SCRIPT_DIR/.claude/skills/$SKILL_NAME"

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

if [ ! -d "$SOURCE" ]; then
  echo "error: スキル本体が見つからない: $SOURCE" >&2
  echo "       このスクリプトはリポジトリ直下から実行してください。" >&2
  exit 1
fi

if [ "$USER_MODE" -eq 1 ]; then
  DEST_ROOT="$HOME/.claude/skills"
else
  if [ ! -d "$TARGET" ]; then
    echo "error: 対象ディレクトリが存在しない: $TARGET" >&2
    exit 1
  fi
  DEST_ROOT="$TARGET/.claude/skills"
fi
DEST="$DEST_ROOT/$SKILL_NAME"

# 自分自身への上書きを防ぐ
if [ "$(cd "$SOURCE" && pwd)" = "$(cd "$DEST" 2>/dev/null && pwd || echo __none__)" ]; then
  echo "ok: 既にこのリポジトリ内のスキルを指しています($DEST)。何もしません。"
  exit 0
fi

if [ -e "$DEST" ] && [ "$FORCE" -eq 0 ]; then
  echo "error: 既に存在します: $DEST" >&2
  echo "       上書きするなら --force を付けてください(既存は置き換えられます)。" >&2
  exit 1
fi

mkdir -p "$DEST_ROOT"
rm -rf "$DEST"
cp -R "$SOURCE" "$DEST"

echo "✓ インストール完了: $DEST"
echo ""
echo "次の手順:"
if [ "$USER_MODE" -eq 1 ]; then
  echo "  - 全プロジェクトで Claude Code を起動し /web-design-mock で利用可能。"
else
  echo "  - 対象リポジトリで Claude Code を起動(ワークスペースの信頼を承認)。"
  echo "  - /web-design-mock で起動。git に commit すればチームで共有できます。"
fi
echo "  - 検証スクリプトは Node が必要: node \"\${CLAUDE_SKILL_DIR}/scripts/validate.mjs\" <html>"
