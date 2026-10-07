#!/usr/bin/env bash
set -euo pipefail

# Use the verified runtime shipped by build.sh. Workspace modules and Nix
# store paths are not guaranteed to exist in Replit's final deployment image.
runtime_node=".next/standalone/runtime/bin/node"
if [[ ! -x "$runtime_node" ]]; then
  echo "[run] Bundled Node 24 is missing; run the deployment build first." >&2
  exit 1
fi
# Probe without inherited options; keep all options for the application itself.
# Leave diagnostic errors visible so a runtime failure is actionable.
major="$(env -u NODE_OPTIONS "$runtime_node" -p 'process.versions.node.split(".")[0]')"
[[ "$major" == "24" ]] || { echo "[run] Bundled runtime must be Node 24." >&2; exit 1; }

echo "[run] Using Node 24: $runtime_node"
export HOSTNAME=0.0.0.0
if (( $# == 0 )); then
  set -- .next/standalone/server.js
fi
exec "$runtime_node" "$@"
