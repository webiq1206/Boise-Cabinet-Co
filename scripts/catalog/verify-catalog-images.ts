/**
 * Verifies catalog entities have image paths on disk (warn) or hex fallback (ok).
 * Run: npm run catalog:images:verify
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PUBLIC = path.join(ROOT, "public");

function exists(rel: string): boolean {
  return fs.existsSync(path.join(PUBLIC, rel.replace(/^\//, "")));
}

function main() {
  const doorStyles = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data/supplier-catalog/doorStyles.json"), "utf8"),
  ) as { slug: string; imagePath?: string }[];
  const finishes = JSON.parse(
    fs.readFileSync(path.join(ROOT, "data/supplier-catalog/finishes.json"), "utf8"),
  ) as { slug: string; imagePath?: string; hexColor: string }[];

  let missing = 0;
  for (const d of doorStyles) {
    if (d.imagePath && !exists(d.imagePath)) {
      console.warn(`Missing door image: ${d.imagePath} (${d.slug})`);
      missing++;
    }
  }
  for (const f of finishes) {
    if (f.imagePath && !exists(f.imagePath) && !f.hexColor) {
      console.warn(`Missing finish image: ${f.imagePath} (${f.slug})`);
      missing++;
    }
  }

  if (missing > 0) {
    console.warn(`catalog:images:verify — ${missing} missing files (hex fallback used in UI)`);
  } else {
    console.log("catalog:images:verify OK");
  }
}

main();
