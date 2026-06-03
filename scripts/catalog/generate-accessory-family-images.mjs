#!/usr/bin/env node
/**
 * Ensure ACCESSORY_FAMILIES have application images (copy from closest legacy asset or generate SVG).
 * Usage: node scripts/catalog/generate-accessory-family-images.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const FAMILIES_JSON = path.join(ROOT, "data/supplier-catalog/accessoryFamilies.json");
const ACC_DIR = path.join(ROOT, "public/images/catalog/accessories");

/** family slug → existing legacy accessory filename (without ext) */
const LEGACY_MAP = {
  "rollout-tray": "pull-out-shelf",
  "trash-pullout": "waste-bin-pullout",
  "lazy-susan": "lazy-susan",
  "blind-corner": "blind-corner-pullout",
  partition: "drawer-organizer-kit",
  "floating-shelf": "floating-shelf",
};

function applicationSvg(name, category) {
  const safe = name.replace(/[<>&"]/g, "");
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
  <rect width="800" height="600" fill="#F3ECDF"/>
  <rect x="80" y="180" width="360" height="280" fill="#E0DAD0" stroke="#8A7B66" stroke-width="2"/>
  <rect x="92" y="320" width="336" height="48" fill="#9F4F2D" stroke="#7E3E22" stroke-width="1.5" opacity="0.9"/>
  <rect x="100" y="200" width="320" height="100" fill="#9F4F2D" stroke="#7E3E22" stroke-width="1.5"/>
  <text x="400" y="520" text-anchor="middle" fill="#5A4E3E" font-family="system-ui,sans-serif" font-size="20">${safe}</text>
  <text x="400" y="548" text-anchor="middle" fill="#5A4E3E" font-size="13" opacity="0.7">${category} · installed in base cabinet</text>
</svg>`;
}

async function copyOrGenerate(family) {
  const dest = path.join(ACC_DIR, `${family.slug}.webp`);
  if (fs.existsSync(dest)) return "exists";

  const legacy = LEGACY_MAP[family.slug];
  if (legacy) {
    for (const ext of [".webp", ".png"]) {
      const src = path.join(ACC_DIR, `${legacy}${ext}`);
      if (fs.existsSync(src)) {
        if (ext === ".png") {
          await sharp(src).webp({ quality: 86 }).toFile(dest);
        } else {
          fs.copyFileSync(src, dest);
        }
        return "copied";
      }
    }
  }

  const svg = applicationSvg(family.name, family.category);
  await sharp(Buffer.from(svg)).webp({ quality: 86 }).toFile(dest);
  return "generated";
}

async function main() {
  const families = JSON.parse(fs.readFileSync(FAMILIES_JSON, "utf8"));
  fs.mkdirSync(ACC_DIR, { recursive: true });
  const stats = { exists: 0, copied: 0, generated: 0 };

  for (const family of families) {
    const r = await copyOrGenerate(family);
    stats[r]++;
  }

  console.log(`Accessory family images: ${JSON.stringify(stats)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
