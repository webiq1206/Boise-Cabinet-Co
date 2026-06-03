/**
 * Verifies customer-facing catalog imagery on disk.
 * Run: npm run catalog:visuals:verify
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DATA = path.join(ROOT, "data/supplier-catalog");
const PUBLIC = path.join(ROOT, "public");

function exists(rel: string): boolean {
  return fs.existsSync(path.join(PUBLIC, rel.replace(/^\//, "")));
}

function fail(msg: string): never {
  console.error(`catalog:visuals:verify FAIL — ${msg}`);
  process.exit(1);
}

function main() {
  const doorStyles = JSON.parse(
    fs.readFileSync(path.join(DATA, "doorStyles.json"), "utf8"),
  ) as { slug: string; imagePath?: string }[];
  const finishes = JSON.parse(
    fs.readFileSync(path.join(DATA, "finishes.json"), "utf8"),
  ) as { slug: string; imagePath?: string; hexColor: string }[];
  const collections = JSON.parse(
    fs.readFileSync(path.join(DATA, "collections.json"), "utf8"),
  ) as { slug: string; heroImage?: string }[];
  const products = JSON.parse(
    fs.readFileSync(path.join(DATA, "cabinetProducts.json"), "utf8"),
  ) as { slug: string }[];
  const familiesPath = path.join(DATA, "accessoryFamilies.json");
  const families = fs.existsSync(familiesPath)
    ? (JSON.parse(fs.readFileSync(familiesPath, "utf8")) as { slug: string }[])
    : [];

  const errors: string[] = [];

  for (const f of finishes) {
    if (f.hexColor === "#888888") {
      errors.push(`Finish ${f.slug} uses placeholder hex #888888`);
    }
    if (f.imagePath && !exists(f.imagePath)) {
      errors.push(`Missing finish swatch: ${f.imagePath} (${f.slug})`);
    }
    const inRoom = `/images/catalog/finishes/in-room/${f.slug}.webp`;
    if (!exists(inRoom)) {
      errors.push(`Missing in-room finish: ${inRoom}`);
    }
  }

  for (const d of doorStyles) {
    if (d.imagePath && !exists(d.imagePath)) {
      errors.push(`Missing door style image: ${d.imagePath} (${d.slug})`);
    }
  }

  for (const c of collections) {
    if (c.heroImage && !exists(c.heroImage)) {
      errors.push(`Missing collection hero: ${c.heroImage} (${c.slug})`);
    }
  }

  for (const p of products) {
    const hero = `/images/catalog/products/${p.slug}.webp`;
    const thumb = `/images/catalog/products/${p.slug}-thumb.webp`;
    const diagram = `/images/catalog/products/${p.slug}-diagram.webp`;
    if (!exists(hero)) errors.push(`Missing product hero: ${hero}`);
    if (!exists(thumb)) errors.push(`Missing product thumb: ${thumb}`);
    if (!exists(diagram)) errors.push(`Missing product diagram: ${diagram}`);
  }

  for (const family of families) {
    const img = `/images/catalog/accessories/${family.slug}.webp`;
    if (!exists(img)) {
      errors.push(`Missing accessory family image: ${img}`);
    }
  }

  if (errors.length > 0) {
    for (const e of errors.slice(0, 30)) {
      console.error(`  • ${e}`);
    }
    if (errors.length > 30) {
      console.error(`  …and ${errors.length - 30} more`);
    }
    fail(`${errors.length} visual issue(s)`);
  }

  console.log(
    `catalog:visuals:verify OK — ${finishes.length} finishes (swatch+in-room), ${doorStyles.length} doors, ${products.length} products, ${families.length} accessory families`,
  );
}

main();
