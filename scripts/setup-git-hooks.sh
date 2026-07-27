#!/bin/sh
# 把 scripts/git-hooks/ 下的 hook 安装到本地 .git/hooks/。
# 只需在每台新电脑上执行一次: bash scripts/setup-git-hooks.sh
set -e

HOOK_DIR="$(dirname "$0")/git-hooks"
GIT_HOOKS_DIR="$(git rev-parse --git-dir)/hooks"

for hook in "$HOOK_DIR"/*; do
  name=$(basename "$hook")
  cp "$hook" "$GIT_HOOKS_DIR/$name"
  chmod +x "$GIT_HOOKS_DIR/$name"
  echo "已安装 hook: $name"
done

echo "以后每次 git commit 都会自动触发 Obsidian 同步。"
