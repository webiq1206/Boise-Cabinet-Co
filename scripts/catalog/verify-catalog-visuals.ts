/**
 * Fail if customer-facing catalog entities use placeholder hex or missing swatch files.
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
  ) as { slug: string; name: string; imagePath?: string }[];
  const finishes = JSON.parse(
    fs.readFileSync(path.join(DATA, "finishes.json"), "utf8"),
  ) as { slug: string; name: string; imagePath?: string; hexColor: string }[];
  const collections = JSON.parse(
    fs.readFileSync(path.join(DATA, "collections.json"), "utf8"),
  ) as { slug: string; heroImage?: string }[];

  const errors: string[] = [];

  for (const f of finishes) {
    if (f.hexColor === "#888888") {
      errors.push(`Finish ${f.slug} uses placeholder hex #888888`);
    }
    if (f.imagePath && !exists(f.imagePath)) {
      errors.push(`Missing finish swatch: ${f.imagePath} (${f.slug})`);
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
    `catalog:visuals:verify OK — ${finishes.length} finishes, ${doorStyles.length} door styles`,
  );
}

main();
