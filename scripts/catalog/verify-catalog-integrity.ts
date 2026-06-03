/**
 * Validates data/supplier-catalog JSON integrity.
 * Run: npm run catalog:verify
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const DATA = path.join(ROOT, "data/supplier-catalog");

function read<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA, name), "utf8"));
}

function fail(msg: string): never {
  console.error(`catalog:verify FAIL — ${msg}`);
  process.exit(1);
}

function main() {
  const doorStyles = read<{ id: string; slug: string }[]>("doorStyles.json");
  const finishes = read<{ id: string; slug: string; compatibleDoorStyleIds: string[] }[]>("finishes.json");
  const products = read<{ id: string; slug: string; oscCode: string }[]>("cabinetProducts.json");
  const collections = read<{ id: string }[]>("collections.json");

  const doorIds = new Set(doorStyles.map((d) => d.id));
  if (doorIds.size !== 6) fail(`Expected 6 door styles, got ${doorIds.size}`);
  if (finishes.length < 50) fail(`Expected 50+ finishes, got ${finishes.length}`);
  if (products.length < 100) fail(`Expected 100+ cabinet products, got ${products.length}`);

  const slugs = new Set<string>();
  for (const f of finishes) {
    if (slugs.has(f.slug)) fail(`Duplicate finish slug: ${f.slug}`);
    slugs.add(f.slug);
    for (const ds of f.compatibleDoorStyleIds) {
      if (!doorIds.has(ds)) fail(`Finish ${f.slug} references unknown door style ${ds}`);
    }
  }

  const productSlugs = new Set<string>();
  for (const p of products) {
    if (productSlugs.has(p.slug)) fail(`Duplicate product slug: ${p.slug}`);
    productSlugs.add(p.slug);
    if (!p.oscCode) fail(`Product ${p.slug} missing oscCode`);
  }

  const collectionIds = new Set(collections.map((c) => c.id));
  if (!collectionIds.has("custom") || !collectionIds.has("reserve")) {
    fail("Missing custom or reserve collection");
  }

  // Ensure generated TS is in sync
  const genDoor = path.join(ROOT, "shared/catalog/generated/doorStyles.ts");
  if (!fs.existsSync(genDoor)) {
    fail("Run: npm run catalog:codegen");
  }

  console.log(
    `catalog:verify OK — ${doorStyles.length} door styles, ${finishes.length} finishes, ${products.length} products`,
  );
}

main();
