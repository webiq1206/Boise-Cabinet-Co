#!/usr/bin/env bash
# Installs global Cursor rules/skills from this bundled copy to ~/.cursor/
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET_RULES="$HOME/.cursor/rules"
TARGET_SKILLS="$HOME/.cursor/skills"
MARKER="$TARGET_RULES/website-standards.mdc"

if [[ -f "$MARKER" ]]; then
  exit 0
fi

mkdir -p "$TARGET_RULES" "$TARGET_SKILLS"

if [[ -d "$SCRIPT_DIR/rules" ]]; then
  rsync -a "$SCRIPT_DIR/rules/" "$TARGET_RULES/"
fi

if [[ -d "$SCRIPT_DIR/skills" ]]; then
  rsync -a "$SCRIPT_DIR/skills/" "$TARGET_SKILLS/"
fi

echo "[cursor-global-config] Installed global rules and skills to ~/.cursor/" >&2
