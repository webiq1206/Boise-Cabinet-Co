#!/usr/bin/env node
/**
 * Generate in-room finish preview images (kitchen cabinet run with finish color).
 * Usage: node scripts/catalog/generate-finish-in-room-images.mjs [--force]
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const FINISHES_JSON = path.join(ROOT, "data/supplier-catalog/finishes.json");
const OUT_DIR = path.join(ROOT, "public/images/catalog/finishes/in-room");
const force = process.argv.includes("--force");

function parseHex(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex?.trim() ?? "");
  if (!m) return { r: 140, g: 128, b: 115 };
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function inRoomSvg(name, hex, category) {
  const safe = name.replace(/[<>&"]/g, "");
  const isWood = category === "woodgrain";
  const grain = isWood
    ? `<defs><pattern id="g" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(12)">
        <line x1="0" y1="0" x2="0" y2="12" stroke="#00000018" stroke-width="2"/>
      </pattern></defs>`
    : "";
  const doorFill = isWood ? 'fill="url(#g)"' : `fill="${hex}"`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="960" height="600" viewBox="0 0 960 600" role="img" aria-label="${safe} finish on kitchen cabinets">
  ${grain}
  <rect width="960" height="600" fill="#E8E4DE"/>
  <rect x="0" y="380" width="960" height="220" fill="#D4CEC4"/>
  <rect x="40" y="120" width="880" height="48" fill="#C9C3B8" stroke="#8A7B66" stroke-width="1"/>
  <rect x="40" y="200" width="520" height="160" fill="#E0DAD0" stroke="#8A7B66" stroke-width="2"/>
  <rect x="52" y="212" width="118" height="136" rx="2" ${doorFill} stroke="#5A4E3E" stroke-width="1.5"/>
  <rect x="178" y="212" width="118" height="136" rx="2" ${doorFill} stroke="#5A4E3E" stroke-width="1.5"/>
  <rect x="304" y="212" width="118" height="136" rx="2" ${doorFill} stroke="#5A4E3E" stroke-width="1.5"/>
  <rect x="430" y="212" width="118" height="136" rx="2" ${doorFill} stroke="#5A4E3E" stroke-width="1.5"/>
  <rect x="580" y="220" width="320" height="72" rx="3" ${doorFill} stroke="#5A4E3E" stroke-width="1.5" opacity="0.95"/>
  <rect x="600" y="310" width="280" height="50" fill="#B8B2A8" opacity="0.6"/>
  <text x="480" y="560" text-anchor="middle" fill="#5A4E3E" font-family="system-ui,sans-serif" font-size="14" opacity="0.8">${safe} · ${category} finish</text>
</svg>`;
}

async function main() {
  const finishes = JSON.parse(fs.readFileSync(FINISHES_JSON, "utf8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let created = 0;
  let skipped = 0;

  for (const f of finishes) {
    const dest = path.join(OUT_DIR, `${f.slug}.webp`);
    if (!force && fs.existsSync(dest)) {
      skipped++;
      continue;
    }
    const { r, g, b } = parseHex(f.hexColor);
    const hex = `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
    const svg = inRoomSvg(f.name, hex, f.category);
    await sharp(Buffer.from(svg))
      .resize(960, 600)
      .webp({ quality: 86 })
      .toFile(dest);
    created++;
  }

  console.log(
    `In-room finish images: created ${created}, skipped ${skipped}, total ${finishes.length}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
