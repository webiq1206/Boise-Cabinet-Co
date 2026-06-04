/**
 * Reports how many catalog entities still rely on generated placeholder imagery
 * vs. real photography (Phase 9 tracking). Warn-only; never fails the build.
 * Run: npm run catalog:images:verify
 */

import fs from "node:fs";
import path from "node:path";
import { FINISHES } from "../../shared/catalog/generated/finishes";
import { DOOR_STYLES } from "../../shared/catalog/generated/doorStyles";
import { CABINET_PRODUCTS } from "../../shared/catalog/generated/cabinetProducts";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PUBLIC = path.join(ROOT, "public");

function exists(rel: string): boolean {
  if (!rel) return false;
  return fs.existsSync(path.join(PUBLIC, rel.replace(/^\//, "")));
}

const isGenerated = (p?: string) => Boolean(p && p.startsWith("/generated/"));

function main() {
  const finishPlaceholders = FINISHES.filter((f) => isGenerated(f.imagePath)).length;
  const finishReal = FINISHES.length - finishPlaceholders;
  const doorPlaceholders = DOOR_STYLES.filter((d) => !d.imagePath || !exists(d.imagePath)).length;
  const cabinetPhotos = CABINET_PRODUCTS.filter((p) =>
    exists(`/images/catalog/products/${p.slug}.webp`),
  ).length;

  console.log(
    `catalog:images:verify OK — finishes: ${finishReal} real / ${finishPlaceholders} generated tiles; ` +
      `doors using generated profiles: ${doorPlaceholders}/${DOOR_STYLES.length}; ` +
      `cabinets with optional real photos: ${cabinetPhotos}/${CABINET_PRODUCTS.length} (rest use box diagrams)`,
  );
}

main();
