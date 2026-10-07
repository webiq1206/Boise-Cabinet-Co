#!/usr/bin/env bash
set -euo pipefail

# Ship the runtime with the standalone app: Replit's workspace Node module
# was not present in the final production image. These checksums are pinned
# from https://nodejs.org/download/release/v24.13.0/SHASUMS256.txt.
runtime_version="24.13.0"
case "$(uname -m)" in
  x86_64)
    runtime_arch="x64"
    runtime_checksum="e798599612f4bb71333a3397ab0d095fd62214e115aea45aa858a145fc72d67e"
    ;;
  aarch64|arm64)
    runtime_arch="arm64"
    runtime_checksum="aa881151bd0f9f154a0424dd60a72e9ce10672619121658c278a24327ef46831"
    ;;
  *) echo "[build] Unsupported Node runtime architecture" >&2; exit 1 ;;
esac
[[ "$(uname -s)" == "Linux" ]] || { echo "[build] The deployment runtime requires Linux" >&2; exit 1; }

runtime_archive="node-v${runtime_version}-linux-${runtime_arch}"
runtime_tmp="$(mktemp -d)"
trap 'rm -rf "$runtime_tmp"' EXIT
curl --fail --silent --show-error --location --retry 3 \
  "https://nodejs.org/download/release/v${runtime_version}/${runtime_archive}.tar.xz" \
  --output "$runtime_tmp/node.tar.xz"
printf '%s  %s\n' "$runtime_checksum" "$runtime_tmp/node.tar.xz" | sha256sum --check -
tar -xJf "$runtime_tmp/node.tar.xz" --no-same-owner --strip-components=1 --directory "$runtime_tmp" \
  "$runtime_archive/bin/node" "$runtime_archive/LICENSE"

runtime_dir=".next/standalone/runtime"
mkdir -p "$runtime_dir/bin"
install -m 755 "$runtime_tmp/bin/node" "$runtime_dir/bin/node"
install -m 644 "$runtime_tmp/LICENSE" "$runtime_dir/LICENSE"
[[ "$(env -u NODE_OPTIONS "$runtime_dir/bin/node" --version)" == "v$runtime_version" ]]
echo "[build] Packaged Node $runtime_version ($runtime_arch) with the standalone server"
