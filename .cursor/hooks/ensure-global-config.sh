#!/usr/bin/env bash
# Auto-installs global Cursor config on session start when missing.
# Works as a project hook (.cursor/hooks/) or user hook (~/.cursor/hooks/).
set -euo pipefail

MARKER="$HOME/.cursor/rules/website-standards.mdc"
if [[ -f "$MARKER" ]]; then
  exit 0
fi

HOOK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE=""

if [[ -t 0 ]] || [[ ! -s /dev/stdin ]]; then
  :
else
  WORKSPACE="$(python3 - <<'PY'
import json, sys
try:
    data = json.load(sys.stdin)
except Exception:
    sys.exit(0)
roots = data.get("workspace_roots") or []
if not roots and data.get("workspace_root"):
    roots = [data["workspace_root"]]
if roots:
    print(roots[0])
PY
)"
fi

try_install() {
  local script="$1"
  if [[ -x "$script" ]]; then
    "$script" >&2
    return 0
  fi
  return 1
}

# 1) Bundled copy inside the open project
if [[ -n "$WORKSPACE" ]]; then
  try_install "$WORKSPACE/.cursor/global-config/install-global.sh" && exit 0
fi

# 2) Relative to this hook when running as a project hook
try_install "$HOOK_DIR/../global-config/install-global.sh" && exit 0

# 3) Standalone repo on this machine
try_install "$HOME/cursor-global-config/global-config/install-global.sh" && exit 0
try_install "$HOME/cursor-global-config/install-global.sh" && exit 0

echo "[cursor-global-config] Global Cursor config is not installed on this machine." >&2
echo "[cursor-global-config] Fix: clone ~/cursor-global-config and run ./install-global.sh" >&2
echo "[cursor-global-config] Or open a website repo that includes .cursor/global-config/ and start a new Cursor chat." >&2
exit 0
