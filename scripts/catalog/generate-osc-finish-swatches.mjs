#!/usr/bin/env node
/**
 * Generate missing OSC catalog finish swatch WebPs from finishes.json hexColor.
 * Skips files that already exist. Does not overwrite marketing textures.
 *
 * Usage: node scripts/catalog/generate-osc-finish-swatches.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const FINISHES_JSON = path.join(ROOT, "data/supplier-catalog/finishes.json");
const PUBLIC = path.join(ROOT, "public");

function parseHex(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex?.trim() ?? "");
  if (!m) return { r: 140, g: 128, b: 115 };
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

async function writeSwatch(destAbs, hex) {
  const { r, g, b } = parseHex(hex);
  const size = 200;
  const buf = Buffer.alloc(size * size * 3);
  for (let i = 0; i < size * size; i++) {
    const o = i * 3;
    buf[o] = r;
    buf[o + 1] = g;
    buf[o + 2] = b;
  }
  await sharp(buf, { raw: { width: size, height: size, channels: 3 } })
    .webp({ quality: 82 })
    .toFile(destAbs);
}

async function main() {
  const finishes = JSON.parse(fs.readFileSync(FINISHES_JSON, "utf8"));
  let created = 0;
  let skipped = 0;

  for (const f of finishes) {
    if (!f.imagePath?.startsWith("/images/catalog/finishes/")) continue;
    const rel = f.imagePath.replace(/^\//, "");
    const dest = path.join(PUBLIC, rel);
    if (fs.existsSync(dest)) {
      skipped++;
      continue;
    }
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    await writeSwatch(dest, f.hexColor);
    created++;
  }

  console.log(
    `OSC finish swatches: created ${created}, skipped ${skipped} (already present), total ${finishes.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
