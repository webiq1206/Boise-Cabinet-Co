#!/usr/bin/env node
/**
 * Inventory finish placeholder hex (#888888) and missing swatch images.
 * Writes docs/catalog-audit/gaps.md
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const DATA = path.join(ROOT, "data/supplier-catalog");
const PUBLIC = path.join(ROOT, "public");
const OUT_DIR = path.join(ROOT, "docs/catalog-audit");

function exists(rel) {
  return fs.existsSync(path.join(PUBLIC, rel.replace(/^\//, "")));
}

function main() {
  const doorStyles = JSON.parse(fs.readFileSync(path.join(DATA, "doorStyles.json"), "utf8"));
  const finishes = JSON.parse(fs.readFileSync(path.join(DATA, "finishes.json"), "utf8"));
  const collections = JSON.parse(fs.readFileSync(path.join(DATA, "collections.json"), "utf8"));

  const placeholderHex = finishes.filter((f) => f.hexColor === "#888888");
  const missingFinishImages = finishes.filter(
    (f) => f.imagePath && !exists(f.imagePath),
  );
  const missingDoorImages = doorStyles.filter(
    (d) => d.imagePath && !exists(d.imagePath),
  );
  const missingCollectionHeroes = collections.filter(
    (c) => c.heroImage && !exists(c.heroImage),
  );

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const md = `# Catalog visual gaps

Generated: ${new Date().toISOString()}

## Summary

| Issue | Count |
|-------|------:|
| Finishes with placeholder hex (#888888) | ${placeholderHex.length} |
| Missing finish swatch files | ${missingFinishImages.length} |
| Missing door style images | ${missingDoorImages.length} |
| Missing collection hero images | ${missingCollectionHeroes.length} |

## Placeholder hex finishes (${placeholderHex.length})

${placeholderHex.length ? placeholderHex.map((f) => `- \`${f.slug}\` — ${f.name}`).join("\n") : "_None_"}

## Missing finish swatches (${missingFinishImages.length})

${missingFinishImages.length ? missingFinishImages.slice(0, 50).map((f) => `- \`${f.imagePath}\` (${f.slug})`).join("\n") : "_None_"}
${missingFinishImages.length > 50 ? `\n_…and ${missingFinishImages.length - 50} more_` : ""}

## Missing door style images (${missingDoorImages.length})

${missingDoorImages.length ? missingDoorImages.map((d) => `- \`${d.imagePath}\` (${d.slug})`).join("\n") : "_None_"}

## Missing collection heroes (${missingCollectionHeroes.length})

${missingCollectionHeroes.length ? missingCollectionHeroes.map((c) => `- \`${c.heroImage}\` (${c.slug})`).join("\n") : "_None_"}
`;

  fs.writeFileSync(path.join(OUT_DIR, "gaps.md"), md);

  console.log(
    `Catalog gaps: placeholder_hex=${placeholderHex.length} missing_finish_images=${missingFinishImages.length} missing_door_images=${missingDoorImages.length}`,
  );
  console.log(`Wrote docs/catalog-audit/gaps.md`);
}

main();
