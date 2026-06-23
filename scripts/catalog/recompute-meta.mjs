#!/usr/bin/env node
/**
 * Recompute data/catalog.json `meta` summary counts directly from the catalog
 * arrays so they can never drift from the real data. Run after any script that
 * adds/removes/edits cabinets or finishes:
 *   node scripts/catalog/recompute-meta.mjs
 *
 * Idempotent: writes only derived counts; never invents data. The
 * `source` and `notes` strings are preserved verbatim.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const CATALOG_PATH = path.join(ROOT, "data/catalog.json");

function countBy(items, key) {
  const out = {};
  for (const it of items) {
    const k = it[key];
    out[k] = (out[k] || 0) + 1;
  }
  return out;
}

const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const prev = catalog.meta || {};

catalog.meta = {
  source: prev.source ?? "Boise Cabinet Co product catalog",
  doorStyles: catalog.doorStyles.length,
  finishes: catalog.finishes.length,
  finishesByCategory: countBy(catalog.finishes, "category"),
  accessories: catalog.accessories.length,
  cabinets: catalog.cabinets.length,
  cabinetsByCategory: countBy(catalog.cabinets, "category"),
  notes: prev.notes ?? "",
};

fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2) + "\n");
console.log(
  `Recomputed meta: ${catalog.meta.cabinets} cabinets, ${catalog.meta.finishes} finishes, ` +
    `${catalog.meta.doorStyles} door styles, ${catalog.meta.accessories} accessories.`,
);
