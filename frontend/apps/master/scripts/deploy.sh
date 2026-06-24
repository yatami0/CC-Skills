#!/usr/bin/env bash
# アプリ単位の切り出し → Docker ビルド（設計 §4.2）。
# pnpm deploy は inject-workspace-packages=true 前提（.npmrc で確定）。
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
FRONTEND_ROOT="$(cd "$APP_DIR/../.." && pwd)"
OUT_DIR="${1:-$FRONTEND_ROOT/.deploy/master}"

cd "$FRONTEND_ROOT"

# 1) ビルドコンテキストを 1 アプリ分に切り出す（pnpm 標準。turbo prune は使わない）。
pnpm --filter master deploy "$OUT_DIR"

# 2) standalone ベースの Docker イメージを作る（実体は Dockerfile が standalone をコピー）。
docker build -f apps/master/Dockerfile -t master:local .

echo "done: deploy dir=$OUT_DIR, image=master:local"
