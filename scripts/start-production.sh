#!/usr/bin/env bash
set -euo pipefail

# Publishing must use the same Node major as the configured Replit module.
# An older Nix package previously shadowed Node 24 and rejected an inherited
# NODE_OPTIONS flag before the application could start.
runtime_node=""
path_node="$(command -v node 2>/dev/null || true)"
shopt -s nullglob
for candidate in "$path_node" /nix/store/*nodejs-24*/bin/node; do
  [[ -n "$candidate" && -x "$candidate" ]] || continue
  # Probe the binary without inherited options so an incompatible candidate
  # can be identified. The application itself retains every NODE_OPTIONS flag.
  major="$(env -u NODE_OPTIONS "$candidate" -p 'process.versions.node.split(".")[0]' 2>/dev/null || true)"
  if [[ "$major" == "24" ]]; then
    runtime_node="$candidate"
    break
  fi
done

if [[ -z "$runtime_node" ]]; then
  echo "[run] Node 24 is required; the configured Replit runtime is unavailable." >&2
  exit 1
fi

echo "[run] Using Node 24: $runtime_node"
export HOSTNAME=0.0.0.0
if (( $# == 0 )); then
  set -- .next/standalone/server.js
fi
exec "$runtime_node" "$@"
