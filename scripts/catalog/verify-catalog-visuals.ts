/**
 * Verifies customer-facing catalog imagery on disk against the generated catalog
 * (single source of truth). Every cabinet, finish, door style, and collection
 * must resolve to a real asset so nothing renders broken.
 * Run: npm run catalog:visuals:verify
 */

import fs from "node:fs";
import path from "node:path";
import { CABINET_PRODUCTS } from "../../shared/catalog/generated/cabinetProducts";
import { FINISHES } from "../../shared/catalog/generated/finishes";
import { DOOR_STYLES } from "../../shared/catalog/generated/doorStyles";
import { COLLECTIONS } from "../../shared/catalog/generated/collections";
import { getDoorStyleImages } from "../../shared/catalog/entityImages";

const ROOT = path.resolve(import.meta.dirname, "../..");
const PUBLIC = path.join(ROOT, "public");

function exists(rel: string): boolean {
  if (!rel) return false;
  return fs.existsSync(path.join(PUBLIC, rel.replace(/^\//, "")));
}

function fail(msg: string): never {
  console.error(`catalog:visuals:verify FAIL — ${msg}`);
  process.exit(1);
}

function main() {
  const errors: string[] = [];

  // Cabinets: every SKU must have its generated box diagram.
  for (const p of CABINET_PRODUCTS) {
    const box = p.boxImage ?? `/generated/cabinets/${p.slug}.svg`;
    if (!exists(box)) errors.push(`Missing cabinet box diagram: ${box} (${p.slug})`);
  }

  // Finishes: every finish binds to a real swatch or a generated color tile.
  for (const f of FINISHES) {
    if (!f.imagePath) {
      errors.push(`Finish ${f.slug} has no imagePath`);
    } else if (!exists(f.imagePath)) {
      errors.push(`Missing finish image: ${f.imagePath} (${f.slug})`);
    }
    if (f.hexColor === "#888888") errors.push(`Finish ${f.slug} uses placeholder hex #888888`);
  }

  // Door styles: real image or generated profile diagram.
  for (const d of DOOR_STYLES) {
    const { primary } = getDoorStyleImages(d.slug, d.imagePath);
    if (!exists(primary)) errors.push(`Missing door style image: ${primary} (${d.slug})`);
  }

  // Collections hero.
  for (const c of COLLECTIONS) {
    if (c.heroImage && !exists(c.heroImage)) {
      errors.push(`Missing collection hero: ${c.heroImage} (${c.slug})`);
    }
  }

  // Construction diagram.
  if (!exists("/generated/construction.svg")) {
    errors.push("Missing construction diagram: /generated/construction.svg");
  }

  if (errors.length > 0) {
    for (const e of errors.slice(0, 30)) console.error(`  • ${e}`);
    if (errors.length > 30) console.error(`  …and ${errors.length - 30} more`);
    fail(`${errors.length} visual issue(s)`);
  }

  console.log(
    `catalog:visuals:verify OK — ${CABINET_PRODUCTS.length} cabinet diagrams, ${FINISHES.length} finishes, ${DOOR_STYLES.length} doors, ${COLLECTIONS.length} collection(s)`,
  );
}

main();
